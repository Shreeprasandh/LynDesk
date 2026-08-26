import React from "react";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LynDeskLogo from "./components/LynDeskLogo";
import { ArrowLeft, Compass, Code, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base text-txt-main flex flex-col justify-between selection:bg-accent-main/20">
      <Header />

      <main className="flex-1 flex items-center justify-center p-6 my-12">
        <div className="max-w-lg w-full border border-border-main/70 bg-bg-surface p-8 sm:p-10 rounded-md shadow-2xl flex flex-col items-center text-center gap-6">
          
          <div className="w-16 h-16 rounded-xl bg-bg-card border border-border-main flex items-center justify-center shadow-xs">
            <LynDeskLogo size={36} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-[10px] font-semibold uppercase tracking-wider mx-auto">
              <span>Error 404</span>
              <span>•</span>
              <span>Page Not Found</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-display font-light text-txt-main">
              Desk Out of Range
            </h1>
            
            <p className="text-xs sm:text-sm text-txt-muted font-light leading-relaxed max-w-sm mx-auto">
              The page, workspace, or resource you are looking for has moved, expired, or does not exist.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full pt-2">
            <Link
              href="/event-desk"
              className="h-10 px-3 border border-border-main bg-bg-card hover:border-txt-main text-txt-main font-mono text-xs rounded-sm flex items-center justify-center gap-1.5 transition-colors no-underline font-medium"
            >
              <LayoutDashboard size={13} className="text-accent-main" />
              <span>Event Desk</span>
            </Link>

            <Link
              href="/coding-deck"
              className="h-10 px-3 border border-border-main bg-bg-card hover:border-txt-main text-txt-main font-mono text-xs rounded-sm flex items-center justify-center gap-1.5 transition-colors no-underline font-medium"
            >
              <Code size={13} className="text-accent-main" />
              <span>Coding Deck</span>
            </Link>

            <Link
              href="/explore"
              className="h-10 px-3 border border-border-main bg-bg-card hover:border-txt-main text-txt-main font-mono text-xs rounded-sm flex items-center justify-center gap-1.5 transition-colors no-underline font-medium"
            >
              <Compass size={13} className="text-accent-main" />
              <span>Explore</span>
            </Link>
          </div>

          <Link
            href="/"
            className="text-xs font-mono text-txt-muted hover:text-accent-main flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={12} />
            <span>Return to Landing Page</span>
          </Link>

        </div>
      </main>

      <Footer />
    </div>
  );
}
