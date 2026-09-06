import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { verifyInstitutionalToken, INSTITUTIONAL_COOKIE_NAMES } from "@/app/lib/institutionalAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

const CreatePostSchema = z.object({
  department: z.string().min(1),
  academicYear: z.string().min(1),
  section: z.string().min(1),
  postType: z.enum(["assignment", "material", "notice", "discussion"]),
  title: z.string().min(3).max(200),
  content: z.string().min(5),
  attachmentUrl: z.string().optional().nullable(),
  attachmentName: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  subjectId: z.string().optional().nullable(),
});

const SubmitAssignmentSchema = z.object({
  postId: z.string().min(1),
  studentId: z.string().uuid(),
  submissionUrl: z.string().optional().nullable(),
  submissionText: z.string().optional().nullable(),
  workspaceId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department") || "Computer Science";
    const academicYear = searchParams.get("academicYear") || "3rd Year";
    const section = searchParams.get("section") || "A";
    const studentId = searchParams.get("studentId");

    // 1. Fetch posts from database
    const { data: dbPosts } = await supabaseServer
      .from("classroom_posts")
      .select("*")
      .eq("department", department)
      .order("created_at", { ascending: false });

    // Fallback standard posts for rich presentation
    const posts = dbPosts && dbPosts.length > 0 ? dbPosts : [
      {
        id: "post-1",
        post_type: "assignment",
        title: "Assignment 3: Turing Machine Simulator Implementation",
        content: "Design and implement a deterministic Single-Tape Turing Machine in Python or C++ to decide the language L = {a^n b^n c^n | n >= 1}. Submit your source repository or create a workspace directly.",
        author_name: "Dr. K. Raman (Theory of Computation)",
        author_role: "faculty",
        attachment_name: "Turing_Machine_Specification_Doc.pdf",
        attachment_url: "/docs/assignment3_turing_spec.pdf",
        due_date: new Date(Date.now() + 86400000 * 4).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "post-2",
        post_type: "material",
        title: "Lecture Notes: Sliding Window Protocol & TCP Flow Control",
        content: "Attached are the complete slide decks, packet capture analysis diagrams, and Wireshark trace examples for Unit 3: Transport Layer Protocols.",
        author_name: "Prof. S. Divya (Computer Networks)",
        author_role: "faculty",
        attachment_name: "Unit3_Transport_Layer_Slides.pdf",
        attachment_url: "/docs/unit3_transport_layer.pdf",
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: "post-3",
        post_type: "notice",
        title: "Model Exam Lab Schedule Announcement",
        content: "The upcoming Networks & Security Laboratory Model Examinations will be conducted in Slot 4 & 5 this Thursday. All students must bring their verified record notebooks.",
        author_name: "Department Academic Coordinator",
        author_role: "coordinator",
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: "post-4",
        post_type: "discussion",
        title: "Discussion: Microservices vs Monolithic Architecture Trade-offs",
        content: "Share your architectural perspectives on when a start-up should transition from a monolithic Next.js backend to distributed microservices. Include latency considerations.",
        author_name: "Dr. M. Arvind (OOAD)",
        author_role: "faculty",
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      }
    ];

    // 2. Fetch submissions for this student
    let submissions: any[] = [];
    if (studentId) {
      const { data: dbSubs } = await supabaseServer
        .from("classroom_submissions")
        .select("*")
        .eq("student_id", studentId);

      submissions = dbSubs || [];
    }

    const enrichedPosts = posts.map((p: any) => {
      const sub = submissions.find((s: any) => s.post_id === p.id);
      return {
        ...p,
        submission: sub ? {
          id: sub.id,
          status: sub.status,
          submissionUrl: sub.submission_url,
          submissionText: sub.submission_text,
          workspaceId: sub.workspace_id,
          grade: sub.grade,
          feedback: sub.feedback,
          submittedAt: sub.submitted_at,
        } : null,
      };
    });

    return NextResponse.json({
      success: true,
      posts: enrichedPosts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed fetching classroom feed." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "create_post";

    if (action === "submit_assignment") {
      const parsed = SubmitAssignmentSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid submission data", details: parsed.error.format() }, { status: 400 });
      }

      const { postId, studentId, submissionUrl, submissionText, workspaceId } = parsed.data;

      const { data, error } = await supabaseServer
        .from("classroom_submissions")
        .upsert({
          post_id: postId,
          student_id: studentId,
          submission_url: submissionUrl || null,
          submission_text: submissionText || null,
          workspace_id: workspaceId || null,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        }, { onConflict: "post_id,student_id" })
        .select()
        .single();

      if (error) {
        console.error("Assignment submission error:", error);
        return NextResponse.json({ error: "Failed to record submission." }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Assignment submitted successfully!",
        submission: data,
      });
    }

    // Default: Create Classroom Post (Faculty / Staff)
    const token = req.cookies.get(INSTITUTIONAL_COOKIE_NAMES.STAFF)?.value;
    const staff = token ? await verifyInstitutionalToken(token) : null;

    const parsedPost = CreatePostSchema.safeParse(body);
    if (!parsedPost.success) {
      return NextResponse.json({ error: "Invalid post data", details: parsedPost.error.format() }, { status: 400 });
    }

    const { department, academicYear, section, postType, title, content, attachmentUrl, attachmentName, dueDate, subjectId } = parsedPost.data;

    const authorName = staff?.name || body.authorName || "Faculty Instructor";
    const authorId = staff?.sub || body.authorId || "00000000-0000-0000-0000-000000000000";

    const { data: createdPost, error: createError } = await supabaseServer
      .from("classroom_posts")
      .insert({
        department,
        academic_year: academicYear,
        section,
        post_type: postType,
        title,
        content,
        attachment_url: attachmentUrl || null,
        attachment_name: attachmentName || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        subject_id: subjectId || null,
        author_id: authorId,
        author_name: authorName,
        author_role: staff?.role || "faculty",
      })
      .select()
      .single();

    if (createError) {
      console.error("Classroom post creation error:", createError);
      return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Classroom post published successfully.",
      post: createdPost,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Classroom operation failed." }, { status: 500 });
  }
}
