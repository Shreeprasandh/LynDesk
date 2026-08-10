"use client";

import React, { useState } from "react";
import { StudyPath, DepthMode, UploadMode, SourceFile, Section } from "../../study-desk/types";
import { 
  Upload, 
  X, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  FileText,
  PenTool,
  Check,
  Zap,
  BookOpen,
  Compass,
  Code2
} from "lucide-react";

interface AIPathStudioModalProps {
  onClose: () => void;
  onPathCreated: (newPath: StudyPath) => void;
}

export default function AIPathStudioModal({ onClose, onPathCreated }: AIPathStudioModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [creationMode, setCreationMode] = useState<"prompt" | "materials">("prompt");

  const [pathTitle, setPathTitle] = useState("");
  const [pathDescription, setPathDescription] = useState("");
  const [subtopics, setSubtopics] = useState("");
  const [depthMode, setDepthMode] = useState<DepthMode>("standard");
  const [learningStyle, setLearningStyle] = useState<"balanced" | "coding">("balanced");
  const [uploadMode] = useState<UploadMode>("unified");

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [parsedSourceFiles, setParsedSourceFiles] = useState<SourceFile[]>([]);
  const [isParsingFiles, setIsParsingFiles] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSections, setGeneratedSections] = useState<Section[]>([]);
  const [finalTitle, setFinalTitle] = useState("");
  const [finalDescription, setFinalDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProceedToGenerate = async () => {
    setErrorMsg(null);

    if (creationMode === "prompt" && !pathTitle.trim()) {
      setErrorMsg("Please enter a title for your Learning Path.");
      return;
    }

    if (creationMode === "materials" && uploadedFiles.length === 0) {
      setErrorMsg("Please upload at least one PDF or document file.");
      return;
    }

    let filesToUse: SourceFile[] = [];

    if (creationMode === "materials" && uploadedFiles.length > 0) {
      setIsParsingFiles(true);
      try {
        const formData = new FormData();
        uploadedFiles.forEach((file) => formData.append("files", file));

        const res = await fetch("/api/study/parse-files", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success && Array.isArray(data.files)) {
          filesToUse = data.files;
          setParsedSourceFiles(data.files);
        } else {
          throw new Error(data.error || "Failed to parse uploaded files.");
        }
      } catch (err: unknown) {
        console.warn("Parsing files fallback:", err);
        filesToUse = uploadedFiles.map((f) => ({
          id: "file_" + Math.random().toString(36).substring(2, 9),
          name: f.name,
          type: f.name.endsWith(".pdf") ? "pdf" : f.name.endsWith(".docx") ? "docx" : "txt",
          size: f.size,
          uploadedAt: new Date().toISOString(),
        }));
        setParsedSourceFiles(filesToUse);
      } finally {
        setIsParsingFiles(false);
      }
    }

    handleGenerateLessons(filesToUse);
  };

  const handleGenerateLessons = async (filesToUse: SourceFile[]) => {
    setStep(2);
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/study/generate-lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pathTitle,
          pathDescription,
          subtopics,
          depthMode,
          learningStyle,
          creationMode,
          files: filesToUse,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.sections) && data.sections.length > 0) {
        setGeneratedSections(data.sections);
        setFinalTitle(data.title || pathTitle || "Structured Study Path");
        setFinalDescription(data.description || pathDescription || "Adaptive AI learning curriculum.");
        setStep(3);
      } else {
        throw new Error(data.error || "Failed to generate lesson structure.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed.";
      setErrorMsg(message);
      setStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePath = () => {
    let totalLessonsCount = 0;
    generatedSections.forEach((sec) => {
      totalLessonsCount += sec.lessons?.length || 0;
    });

    const newPath: StudyPath = {
      id: "path_" + Math.random().toString(36).substring(2, 9),
      userId: "",
      title: finalTitle || pathTitle || "Learning Path",
      description: finalDescription || pathDescription || "",
      depthMode,
      uploadMode,
      sourceFiles: parsedSourceFiles,
      sections: generatedSections,
      totalLessons: totalLessonsCount,
      completedLessons: 0,
      xpEarned: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastStudiedAt: new Date().toISOString(),
    };

    onPathCreated(newPath);
  };

  return (
    <div className="fixed inset-0 bg-bg-base/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-bg-surface rounded-md max-w-xl w-full border border-border-main/80 shadow-2xl overflow-hidden text-txt-main">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-border-main/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent-main" />
            <h3 className="font-display text-base font-light">AI Learning Path Studio</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded bg-bg-card hover:bg-border-main/30 text-txt-muted flex items-center justify-center cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Mode Selection & Input Form */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Creation Mode Tabs */}
              <div>
                <label className="font-mono text-[9px] uppercase tracking-widest text-txt-muted block mb-2">
                  1. Select Creation Mode *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCreationMode("materials");
                      setErrorMsg(null);
                    }}
                    className={`p-3 rounded border text-left cursor-pointer transition-all flex flex-col gap-1 ${
                      creationMode === "materials"
                        ? "bg-accent-main/10 border-accent-main text-accent-main"
                        : "bg-bg-card border-border-main/60 text-txt-sub hover:border-border-main"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xs font-bold flex items-center gap-1.5">
                        <FileText size={14} /> With Materials
                      </div>
                      {creationMode === "materials" && <Check size={14} />}
                    </div>
                    <div className="text-[10px] text-txt-muted leading-tight">
                      Upload PDFs/Notes. AI extracts topic & auto-structures lessons.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCreationMode("prompt");
                      setErrorMsg(null);
                    }}
                    className={`p-3 rounded border text-left cursor-pointer transition-all flex flex-col gap-1 ${
                      creationMode === "prompt"
                        ? "bg-accent-main/10 border-accent-main text-accent-main"
                        : "bg-bg-card border-border-main/60 text-txt-sub hover:border-border-main"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xs font-bold flex items-center gap-1.5">
                        <PenTool size={14} /> Without Materials
                      </div>
                      {creationMode === "prompt" && <Check size={14} />}
                    </div>
                    <div className="text-[10px] text-txt-muted leading-tight">
                      Enter Topic & optional Subtopics. AI builds complete path.
                    </div>
                  </button>
                </div>
              </div>

              {/* Mode-Specific Input Fields */}
              {creationMode === "materials" ? (
                <div className="space-y-4">
                  {/* File Upload Box */}
                  <div>
                    <label className="font-mono text-[9px] uppercase tracking-widest text-txt-muted block mb-1.5">
                      Upload Study Materials (PDF, DOCX, TXT) *
                    </label>
                    <div className="border-2 border-dashed border-border-main/80 bg-bg-base/40 p-5 rounded text-center space-y-1.5 relative">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.docx,.txt,.csv,.xlsx"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload size={22} className="mx-auto text-accent-main" />
                      <div className="text-xs font-medium text-txt-main">Drop PDFs, lecture slides, or notes here</div>
                      <div className="text-[9px] font-mono text-txt-muted">PDF, DOCX, TXT (Max 10 files)</div>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 mt-2">
                        <span className="font-mono text-[9px] uppercase text-txt-muted block">
                          Attached Files ({uploadedFiles.length})
                        </span>
                        {uploadedFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="p-2 border border-border-main/60 bg-bg-card rounded flex items-center justify-between text-xs"
                          >
                            <span className="truncate max-w-[320px] font-mono text-[11px] text-txt-main">{file.name}</span>
                            <button
                              onClick={() => handleRemoveFile(idx)}
                              className="text-txt-muted hover:text-rose-400 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-mono text-[9px] uppercase tracking-widest text-txt-muted block mb-1">
                      Custom Title Override (Optional — Auto-extracted if empty)
                    </label>
                    <input
                      type="text"
                      value={pathTitle}
                      onChange={(e) => setPathTitle(e.target.value)}
                      placeholder="e.g. Advanced Linear Algebra, Operating Systems..."
                      className="w-full h-9 px-3 border border-border-main/80 bg-bg-base text-xs font-mono text-txt-main rounded focus:outline-none focus:border-accent-main"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="font-mono text-[9px] uppercase tracking-widest text-txt-muted block mb-1">
                      Path Topic / Title *
                    </label>
                    <input
                      type="text"
                      value={pathTitle}
                      onChange={(e) => setPathTitle(e.target.value)}
                      placeholder="e.g. Arrays & Hashing, System Design, Quantum Computing..."
                      className="w-full h-9 px-3 border border-border-main/80 bg-bg-base text-xs font-mono text-txt-main rounded focus:outline-none focus:border-accent-main"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[9px] uppercase tracking-widest text-txt-muted block mb-1">
                      Subtopics & Expectations (Optional)
                    </label>
                    <textarea
                      value={subtopics}
                      onChange={(e) => setSubtopics(e.target.value)}
                      placeholder="Specify subtopics (e.g., Two Pointers, Sliding Window, Prefix Sum). If left blank, AI generates comprehensive coverage."
                      rows={2.5}
                      className="w-full p-2.5 border border-border-main/80 bg-bg-base text-xs font-light text-txt-main rounded focus:outline-none focus:border-accent-main"
                    />
                  </div>
                </div>
              )}

              {/* Learning Style Focus Select */}
              <div>
                <label className="font-mono text-[9px] uppercase tracking-widest text-txt-muted block mb-1.5">
                  Course Track Focus
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLearningStyle("balanced")}
                    className={`h-9 px-3 rounded border font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      learningStyle === "balanced"
                        ? "bg-accent-main/10 border-accent-main text-accent-main font-bold"
                        : "bg-bg-card border-border-main/60 text-txt-sub hover:border-border-main"
                    }`}
                  >
                    <BookOpen size={12} />
                    <span>Balanced Theory</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLearningStyle("coding")}
                    className={`h-9 px-3 rounded border font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      learningStyle === "coding"
                        ? "bg-accent-main/10 border-accent-main text-accent-main font-bold"
                        : "bg-bg-card border-border-main/60 text-txt-sub hover:border-border-main"
                    }`}
                  >
                    <Code2 size={12} />
                    <span>Hands-On Code</span>
                  </button>
                </div>
              </div>

              {/* Depth Mode Select */}
              <div>
                <label className="font-mono text-[9px] uppercase tracking-widest text-txt-muted block mb-1.5">
                  Depth & Pace Mode *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepthMode("sprint")}
                    className={`p-2.5 rounded border text-left cursor-pointer transition-all ${
                      depthMode === "sprint"
                        ? "bg-accent-main/10 border-accent-main text-accent-main"
                        : "bg-bg-card border-border-main/60 text-txt-sub hover:border-border-main"
                    }`}
                  >
                    <div className="font-mono text-xs font-bold flex items-center gap-1">
                      <Zap size={12} /> Sprint
                    </div>
                    <div className="text-[10px] text-txt-muted">5 Lessons</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepthMode("standard")}
                    className={`p-2.5 rounded border text-left cursor-pointer transition-all ${
                      depthMode === "standard"
                        ? "bg-accent-main/10 border-accent-main text-accent-main"
                        : "bg-bg-card border-border-main/60 text-txt-sub hover:border-border-main"
                    }`}
                  >
                    <div className="font-mono text-xs font-bold flex items-center gap-1">
                      <BookOpen size={12} /> Standard
                    </div>
                    <div className="text-[10px] text-txt-muted">15-20 Lessons</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepthMode("deep")}
                    className={`p-2.5 rounded border text-left cursor-pointer transition-all ${
                      depthMode === "deep"
                        ? "bg-accent-main/10 border-accent-main text-accent-main"
                        : "bg-bg-card border-border-main/60 text-txt-sub hover:border-border-main"
                    }`}
                  >
                    <div className="font-mono text-xs font-bold flex items-center gap-1">
                      <Compass size={12} /> Deep Dive
                    </div>
                    <div className="text-[10px] text-txt-muted">25-50 Lessons</div>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToGenerate}
                disabled={isParsingFiles}
                className="w-full py-3 bg-accent-main hover:opacity-90 disabled:opacity-40 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity flex items-center justify-center gap-2"
              >
                {isParsingFiles ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Parsing Materials...</span>
                  </>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} /> Generate AI Learning Path
                  </span>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: Loading AI Generation */}
          {step === 2 && (
            <div className="py-12 text-center space-y-4">
              <Loader2 size={36} className="text-accent-main animate-spin mx-auto" />
              <div>
                <h4 className="font-display text-lg font-light text-txt-main">Generating Learning Path...</h4>
                <p className="text-xs text-txt-sub font-light mt-1">
                  Structuring lessons, key takeaways, and practice questions for &quot;{pathTitle || "your learning path"}&quot;.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Path Preview & Save */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-bg-base border border-border-main/70 p-4 rounded space-y-2 text-left">
                <span className="font-mono text-[9px] uppercase text-accent-main font-bold">Path Ready!</span>
                <h4 className="font-display text-lg font-light text-txt-main">{finalTitle}</h4>
                {finalDescription && <p className="text-xs text-txt-sub font-light">{finalDescription}</p>}
                <div className="text-xs font-mono text-txt-muted pt-1">
                  {generatedSections.length} Sections •{" "}
                  {generatedSections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)} Total Lessons
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-left">
                {generatedSections.map((sec, idx) => (
                  <div key={idx} className="p-3 border border-border-main/60 bg-bg-card rounded space-y-1">
                    <div className="font-mono text-xs text-txt-main font-semibold">{sec.title}</div>
                    <div className="text-[11px] text-txt-muted">{sec.lessons?.length || 0} Lessons</div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSavePath}
                className="w-full py-3 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity"
              >
                Save & Start Learning →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
