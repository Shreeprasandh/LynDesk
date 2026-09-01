"use client";

import React, { useRef } from "react";
import { Code2, RotateCcw, Copy, Check } from "lucide-react";

interface CodeIDEEditorProps {
  value: string;
  onChange: (val: string) => void;
  language?: string;
  placeholder?: string;
  disabled?: boolean;
  initialCode?: string;
}

export default function CodeIDEEditor({
  value,
  onChange,
  language = "code",
  placeholder = "// Write your code solution here...",
  disabled = false,
  initialCode = ""
}: CodeIDEEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Smart language detection from code contents or prompt keywords
  const activeLanguage = React.useMemo(() => {
    const combined = (language + " " + value + " " + (placeholder || "")).toLowerCase();
    if (combined.includes("java") && !combined.includes("javascript")) return "java";
    if (combined.includes("python") || combined.includes("def ")) return "python";
    if (combined.includes("c++") || combined.includes("cpp") || combined.includes("#include")) return "c++";
    if (combined.includes("sql") || combined.includes("select ")) return "sql";
    if (combined.includes("javascript") || combined.includes("js")) return "javascript";
    return language && language !== "code" ? language : "java";
  }, [language, value, placeholder]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    const target = e.currentTarget;
    const { selectionStart, selectionEnd, value: currentVal } = target;

    // Handle Tab key (indent 2 spaces)
    if (e.key === "Tab") {
      e.preventDefault();
      const updated = currentVal.substring(0, selectionStart) + "  " + currentVal.substring(selectionEnd);
      onChange(updated);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = selectionStart + 2;
          textareaRef.current.selectionEnd = selectionStart + 2;
        }
      }, 0);
      return;
    }

    // Handle Auto-Closing Brackets & Quotes: {}, (), [], "", ''
    const pairs: Record<string, string> = {
      "{": "}",
      "(": ")",
      "[": "]",
      '"': '"',
      "'": "'"
    };

    if (pairs[e.key]) {
      const closing = pairs[e.key];
      // Only auto-close quotes if not immediately preceding a word char
      if ((e.key === '"' || e.key === "'") && selectionStart < currentVal.length && /\w/.test(currentVal[selectionStart])) {
        return;
      }
      e.preventDefault();
      const updated = currentVal.substring(0, selectionStart) + e.key + closing + currentVal.substring(selectionEnd);
      onChange(updated);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = selectionStart + 1;
          textareaRef.current.selectionEnd = selectionStart + 1;
        }
      }, 0);
      return;
    }

    // Handle Enter key auto-indentation
    if (e.key === "Enter") {
      e.preventDefault();
      const lineStart = currentVal.lastIndexOf("\n", selectionStart - 1) + 1;
      const currentLine = currentVal.substring(lineStart, selectionStart);
      const indentMatch = currentLine.match(/^(\s*)/);
      let indent = indentMatch ? indentMatch[1] : "";

      // If line ends with '{', add 2 spaces extra indent
      if (currentLine.trim().endsWith("{")) {
        indent += "  ";
      }

      const updated = currentVal.substring(0, selectionStart) + "\n" + indent + currentVal.substring(selectionEnd);
      onChange(updated);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = selectionStart + 1 + indent.length;
          textareaRef.current.selectionEnd = selectionStart + 1 + indent.length;
        }
      }, 0);
      return;
    }
  };

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lineCount = Math.max(5, value.split("\n").length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="w-full border border-border-main/80 rounded-md bg-bg-surface overflow-hidden shadow-md font-mono">
      {/* IDE Header Bar */}
      <div className="px-4 py-2 bg-bg-card border-b border-border-main/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-txt-sub">
          <Code2 size={14} className="text-accent-main" />
          <span className="font-semibold uppercase text-[10px] text-txt-main">
            Interactive Code IDE ({activeLanguage})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {initialCode && !disabled && (
            <button
              type="button"
              onClick={() => onChange(initialCode)}
              className="px-2.5 py-1 rounded bg-bg-card hover:bg-border-main/40 text-[10px] text-txt-sub hover:text-txt-main flex items-center gap-1 cursor-pointer transition-colors"
              aria-label="Reset Code Template"
            >
              <RotateCcw size={11} /> Reset Template
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded bg-bg-card hover:bg-border-main/40 text-[10px] text-txt-sub hover:text-txt-main flex items-center gap-1 cursor-pointer transition-colors"
          >
            {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="flex relative min-h-[160px] text-xs">
        {/* Line Numbers Sidebar */}
        <div className="w-10 py-3 bg-bg-card/50 text-txt-muted select-none text-right pr-3 border-r border-border-main/30 font-mono text-[11px] leading-relaxed shrink-0">
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Textarea Code Canvas */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="none"
          autoComplete="off"
          rows={lineCount}
          className="w-full py-3 px-4 bg-transparent text-[#c9d1d9] font-mono text-xs focus:outline-none resize-none leading-relaxed placeholder:text-[#484f58]"
        />
      </div>
    </div>
  );
}
