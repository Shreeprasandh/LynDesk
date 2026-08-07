"use client";

import React, { useState } from "react";
import { StudyPath, DepthMode, UploadMode, SourceFile, Section } from "../../study-desk/types";
import { 
  Upload, 
  X, 
  Sparkles, 
  Loader2, 
  AlertCircle 
} from "lucide-react";

interface AIPathStudioModalProps {
  onClose: () => void;
  onPathCreated: (newPath: StudyPath) => void;
}

export default function AIPathStudioModal({ onClose, onPathCreated }: AIPathStudioModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [pathTitle, setPathTitle] = useState("");
  const [pathDescription, setPathDescription] = useState("");
  const [depthMode, setDepthMode] = useState<DepthMode>("standard");
  const [uploadMode, setUploadMode] = useState<UploadMode>("unified");

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [parsedSourceFiles, setParsedSourceFiles] = useState<SourceFile[]>([]);
  const [isParsingFiles, setIsParsingFiles] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSections, setGeneratedSections] = useState<Section[]>([]);
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

  const handleParseAndProceed = async () => {
    if (!pathTitle.trim()) {
      setErrorMsg("Please enter a title for your Learning Path.");
      return;
    }
    setErrorMsg(null);

    if (uploadedFiles.length === 0) {
      // Proceed directly to AI generation using title/description
      handleGenerateLessons([]);
      return;
    }

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
        setParsedSourceFiles(data.files);
        handleGenerateLessons(data.files);
      } else {
        throw new Error(data.error || "Failed to parse uploaded files.");
      }
    } catch (err: unknown) {
      console.warn("Parsing files fallback:", err);
      // Create fallback source file objects
      const fallbackFiles: SourceFile[] = uploadedFiles.map((f) => ({
        id: "file_" + Math.random().toString(36).substring(2, 9),
        name: f.name,
        type: f.name.endsWith(".pdf") ? "pdf" : f.name.endsWith(".docx") ? "docx" : "txt",
        size: f.size,
        uploadedAt: new Date().toISOString(),
      }));
      setParsedSourceFiles(fallbackFiles);
      handleGenerateLessons(fallbackFiles);
    } finally {
      setIsParsingFiles(false);
    }
  };

  const handleGenerateLessons = async (filesToUse: SourceFile[]) => {
    setStep(3);
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/study/generate-lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pathTitle,
          pathDescription,
          depthMode,
          uploadMode,
          files: filesToUse,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.sections) && data.sections.length > 0) {
        setGeneratedSections(data.sections);
        setStep(4);
      } else {
        throw new Error(data.error || "Failed to generate lesson structure.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed.";
      setErrorMsg(message);
      setStep(2);
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
      title: pathTitle,
      description: pathDescription,
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
      <div className="bg-bg-surface rounded-md max-w-lg w-full border border-border-main/80 shadow-2xl overflow-hidden text-txt-main">
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

          {/* STEP 1: Basic Config */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[9px] uppercase tracking-widest text-txt-muted block mb-1">
                  Path Title *
                </label>
                <input
                  type="text"
                  value={pathTitle}
                  onChange={(e) => setPathTitle(e.target.value)}
                  placeholder="e.g. Binary Search Trees & Heaps, React 19 Hooks..."
                  className="w-full h-10 px-3.5 border border-border-main/80 bg-bg-base text-xs font-mono text-txt-main rounded focus:outline-none focus:border-accent-main"
                />
              </div>

              <div>
                <label className="font-mono text-[9px] uppercase tracking-widest text-txt-muted block mb-1">
                  Description / Topic Focus (Optional)
                </label>
                <textarea
                  value={pathDescription}
                  onChange={(e) => setPathDescription(e.target.value)}
                  placeholder="Core concepts, key exam topics, or lecture module goals..."
                  rows={2}
                  className="w-full p-3 border border-border-main/80 bg-bg-base text-xs font-light text-txt-main rounded focus:outline-none focus:border-accent-main"
                />
              </div>

              {/* Depth Mode Select */}
              <div>
                <label className="font-mono text-[9px] uppercase tracking-widest text-txt-muted block mb-1.5">
                  Depth & Pace Mode
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
                    <div className="font-mono text-xs font-bold">⚡ Sprint</div>
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
                    <div className="font-mono text-xs font-bold">📘 Standard</div>
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
                    <div className="font-mono text-xs font-bold">🔬 Deep Dive</div>
                    <div className="text-[10px] text-txt-muted">25-50 Lessons</div>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity"
              >
                Next: Add Study Notes →
              </button>
            </div>
          )}

          {/* STEP 2: Upload Files */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border-main/80 bg-bg-base/40 p-6 rounded text-center space-y-2 relative">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.csv,.xlsx"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload size={24} className="mx-auto text-accent-main" />
                <div className="text-xs font-medium text-txt-main">Drop notes, PDFs, or slides here</div>
                <div className="text-[10px] font-mono text-txt-muted">PDF, DOCX, TXT, CSV, XLSX (Max 10 files)</div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  <span className="font-mono text-[9px] uppercase text-txt-muted block">
                    Attached Files ({uploadedFiles.length})
                  </span>
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-2 border border-border-main/60 bg-bg-card rounded flex items-center justify-between text-xs"
                    >
                      <span className="truncate max-w-[300px] font-mono text-[11px] text-txt-main">{file.name}</span>
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

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-10 px-4 border border-border-main/80 text-txt-sub font-mono text-xs uppercase rounded cursor-pointer"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={handleParseAndProceed}
                  disabled={isParsingFiles}
                  className="flex-1 h-10 bg-accent-main hover:opacity-90 disabled:opacity-40 text-bg-base font-mono text-xs uppercase tracking-wider font-semibold rounded cursor-pointer transition-opacity flex items-center justify-center gap-2"
                >
                  {isParsingFiles ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Parsing Notes...</span>
                    </>
                  ) : (
                    <span>Generate AI Path ✨</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Loading AI Generation */}
          {step === 3 && (
            <div className="py-12 text-center space-y-4">
              <Loader2 size={36} className="text-accent-main animate-spin mx-auto" />
              <div>
                <h4 className="font-display text-lg font-light text-txt-main">Generating Learning Path...</h4>
                <p className="text-xs text-txt-sub font-light mt-1">
                  Structuring lessons, key takeaways, and practice questions for &quot;{pathTitle}&quot;.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Path Preview & Save */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-bg-base border border-border-main/70 p-4 rounded space-y-2">
                <span className="font-mono text-[9px] uppercase text-accent-main font-bold">Path Ready!</span>
                <h4 className="font-display text-lg font-light text-txt-main">{pathTitle}</h4>
                <div className="text-xs font-mono text-txt-sub">
                  {generatedSections.length} Sections •{" "}
                  {generatedSections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)} Total Lessons
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
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
