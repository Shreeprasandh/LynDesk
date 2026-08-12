"use client";

import React, { useState, useRef } from "react";
import { ZoomIn, ZoomOut, Move, Check, X, RotateCcw } from "lucide-react";

interface AvatarCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

export default function AvatarCropModal({
  imageSrc,
  onCropComplete,
  onCancel,
}: AvatarCropModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleCropSave = () => {
    if (!imgRef.current) return;

    const canvas = document.createElement("canvas");
    const outputSize = 300; // 300x300 square crop output
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imgRef.current;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    // Viewport size in modal (240x240)
    const viewportSize = 240;

    // Calculate crop parameters
    const scale = (Math.min(naturalWidth, naturalHeight) / viewportSize) / zoom;
    
    // Draw cropped square region to 300x300 canvas
    ctx.fillStyle = "#0D0F12";
    ctx.fillRect(0, 0, outputSize, outputSize);

    // Save context state & apply circular clip test
    ctx.save();
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Source image dimensions calculation
    const sourceCropSize = Math.min(naturalWidth, naturalHeight) / zoom;
    const centerX = naturalWidth / 2 - (position.x * scale);
    const centerY = naturalHeight / 2 - (position.y * scale);
    const sourceX = Math.max(0, Math.min(naturalWidth - sourceCropSize, centerX - sourceCropSize / 2));
    const sourceY = Math.max(0, Math.min(naturalHeight - sourceCropSize, centerY - sourceCropSize / 2));

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceCropSize,
      sourceCropSize,
      0,
      0,
      outputSize,
      outputSize
    );
    ctx.restore();

    const croppedResult = canvas.toDataURL("image/jpeg", 0.9);
    onCropComplete(croppedResult);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-md bg-bg-surface border border-border-main/80 rounded-md p-6 flex flex-col gap-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-main/50 pb-3">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-txt-main" />
            <h3 className="text-sm font-bold text-txt-main uppercase tracking-wide">
              Crop &amp; Position Avatar
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-sm text-txt-muted hover:text-txt-main hover:bg-bg-card transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-txt-muted leading-relaxed">
          Drag the image to position your profile photo inside the circle preview, and adjust the zoom slider below.
        </p>

        {/* Interactive Crop Viewport */}
        <div className="flex justify-center items-center my-2">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative w60 h-60 w-[240px] h-[240px] rounded-full border-2 border-txt-main/80 overflow-hidden bg-bg-base cursor-move shadow-inner select-none flex items-center justify-center ring-4 ring-border-main/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              draggable={false}
              className="max-w-none transition-transform duration-75 pointer-events-none select-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex flex-col gap-2 bg-bg-card p-3 rounded-sm border border-border-main/50">
          <div className="flex items-center justify-between text-[11px] text-txt-muted">
            <span className="flex items-center gap-1">
              <ZoomOut className="w-3.5 h-3.5" />
              Zoom Level
            </span>
            <span className="font-bold text-txt-main">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-txt-main"
            />
            <button
              onClick={handleReset}
              title="Reset Position & Zoom"
              className="p-1.5 rounded bg-bg-surface border border-border-main/60 text-txt-muted hover:text-txt-main transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs text-txt-muted hover:text-txt-main transition-colors border border-border-main/60 rounded-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleCropSave}
            className="px-5 py-2 text-xs font-bold text-bg-base bg-txt-main hover:bg-txt-main/90 transition-colors rounded-sm flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Save Square Avatar
          </button>
        </div>
      </div>
    </div>
  );
}
