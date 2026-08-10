"use client";

import React from "react";
import { ArrowDown, CheckCircle, ArrowRight } from "lucide-react";

interface MermaidVisualRendererProps {
  code: string;
}

interface DiagramNode {
  id: string;
  label: string;
}

export default function MermaidVisualRenderer({ code }: MermaidVisualRendererProps) {
  // Parse nodes from Mermaid code syntax (e.g. "A[Input Concept] --> B[Process Execution]")
  const parseNodes = (mermaidText: string): DiagramNode[] => {
    const nodes: DiagramNode[] = [];
    const regex = /([A-Z0-9_-]+)\[(.*?)\]/g;
    let match;

    while ((match = regex.exec(mermaidText)) !== null) {
      const id = match[1];
      const label = match[2].trim();
      if (!nodes.some((n) => n.id === id)) {
        nodes.push({ id, label });
      }
    }

    if (nodes.length === 0) {
      // Fallback nodes if code parsing format varies
      return [
        { id: "A", label: "Input State & Parameters" },
        { id: "B", label: "Core Processing Execution" },
        { id: "C", label: "Verify Boundary Conditions" },
        { id: "D", label: "Target State & Output" },
      ];
    }

    return nodes;
  };

  const nodes = parseNodes(code);

  return (
    <div className="w-full border border-border-main/70 bg-bg-surface p-5 rounded-md space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border-main/40 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-main animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent-main font-bold">
            Visual Architecture Diagram
          </span>
        </div>
        <span className="font-mono text-[9px] text-txt-muted uppercase">
          {nodes.length} Flow Nodes
        </span>
      </div>

      {/* Visual Graphical Flowchart */}
      <div className="flex flex-col items-center justify-center gap-2 py-2">
        {nodes.map((node, index) => {
          const isFirst = index === 0;
          const isLast = index === nodes.length - 1;

          return (
            <React.Fragment key={node.id}>
              {/* Node Card */}
              <div
                className={`w-full max-w-lg p-3.5 rounded-md border flex items-center gap-3 transition-all ${
                  isFirst
                    ? "bg-accent-main/10 border-accent-main/50 text-accent-main"
                    : isLast
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
                    : "bg-bg-card/70 border-border-main/80 text-txt-main"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full border flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                    isFirst
                      ? "bg-accent-main text-bg-base border-accent-main"
                      : isLast
                      ? "bg-emerald-500 text-bg-base border-emerald-500"
                      : "bg-bg-surface text-txt-muted border-border-main/60"
                  }`}
                >
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0 font-mono text-xs">
                  <span className="text-[9px] uppercase tracking-wider text-txt-muted block font-semibold">
                    {isFirst ? "Step 1 • Entrance" : isLast ? `Step ${index + 1} • Output` : `Step ${index + 1}`}
                  </span>
                  <span className="font-medium truncate block mt-0.5">{node.label}</span>
                </div>

                {isLast && <CheckCircle size={16} className="text-emerald-400 shrink-0" />}
              </div>

              {/* Connecting Arrow */}
              {!isLast && (
                <div className="flex flex-col items-center justify-center my-0.5 text-accent-main/70">
                  <ArrowDown size={16} className="animate-bounce" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
