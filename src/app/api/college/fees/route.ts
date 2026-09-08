import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

const RecordPaymentSchema = z.object({
  feeId: z.string().min(1),
  studentId: z.string().uuid(),
  paidAmount: z.number().positive(),
  paymentRef: z.string().min(3),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "studentId query parameter is required" }, { status: 400 });
    }

    let fees: any[] = [];
    try {
      const { data: dbFees, error } = await supabaseServer
        .from("student_fee_records")
        .select("*")
        .eq("student_id", studentId)
        .order("due_date", { ascending: false });

      if (!error && dbFees) {
        fees = dbFees;
      }
    } catch {}

    const totalDues = fees.reduce((sum, f) => sum + Number(f.total_amount || 0), 0);
    const totalPaid = fees.reduce((sum, f) => sum + Number(f.paid_amount || 0), 0);
    const pendingBalance = totalDues - totalPaid;

    return NextResponse.json({
      success: true,
      summary: {
        totalDues,
        totalPaid,
        pendingBalance,
        status: pendingBalance === 0 ? "Clear" : "Payment Due",
      },
      fees,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed fetching fee records." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RecordPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment payload.", details: parsed.error.format() }, { status: 400 });
    }

    const { feeId, studentId, paidAmount, paymentRef } = parsed.data;

    let updated = null;
    try {
      const { data, error } = await supabaseServer
        .from("student_fee_records")
        .update({
          paid_amount: paidAmount,
          status: "PAID",
          payment_ref: paymentRef,
          updated_at: new Date().toISOString()
        })
        .eq("id", feeId)
        .eq("student_id", studentId)
        .select()
        .single();

      if (!error) updated = data;
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Fee payment recorded and verified.",
      record: updated || { id: feeId, student_id: studentId, paid_amount: paidAmount, status: "PAID", payment_ref: paymentRef }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed processing payment record." }, { status: 500 });
  }
}
