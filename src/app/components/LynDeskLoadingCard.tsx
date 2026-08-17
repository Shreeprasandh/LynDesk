"use client";

import React from "react";
import { motion } from "framer-motion";
import LynDeskLogo from "./LynDeskLogo";

interface LynDeskLoadingCardProps {
  message?: string;
  subtext?: string;
  minHeight?: string;
}

export default function LynDeskLoadingCard({
  message = "Syncing LynDesk Session...",
  subtext = "Authenticating network credentials & workspace registries",
  minHeight = "min-h-[340px]"
}: LynDeskLoadingCardProps) {
  return (
    <div className={`w-full flex-1 flex items-center justify-center p-6 ${minHeight}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="max-w-md w-full border border-border-main/80 bg-bg-surface p-8 rounded-md shadow-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden select-none"
      >
        {/* Glowing Background Radial */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-accent-main/10 rounded-full blur-2xl pointer-events-none" />

        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.85, 1, 0.85]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative flex items-center justify-center p-3.5 bg-bg-card border border-border-main/80 rounded-md shadow-xs"
        >
          <LynDeskLogo size={36} />
        </motion.div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <h3 className="font-display text-base font-medium tracking-tight text-txt-main">
            {message}
          </h3>
          <p className="text-xs text-txt-muted font-light leading-relaxed">
            {subtext}
          </p>
        </div>

        {/* Subtle Animated Progress Shimmer */}
        <div className="w-48 h-1 bg-bg-card border border-border-main/50 rounded-full overflow-hidden relative mt-1">
          <motion.div
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-1/2 h-full bg-txt-main rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
