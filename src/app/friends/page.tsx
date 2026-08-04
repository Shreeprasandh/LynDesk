"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FriendsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/explore?tab=friends");
  }, [router]);

  return (
    <div className="min-h-screen bg-bg-base text-txt-main flex items-center justify-center font-mono text-xs">
      Redirecting to Explore → Friends & Network...
    </div>
  );
}
