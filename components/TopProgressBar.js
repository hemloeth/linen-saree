"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function TopProgressBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  // Adjust state on prop/route change directly during render (official React pattern)
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setLoading(false);
  }

  useEffect(() => {
    function handleClick(e) {
      const link = e.target.closest("a");
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href) return;
      if (
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !link.getAttribute("target") &&
        !link.getAttribute("download") &&
        href !== pathname
      ) {
        setLoading(true);
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [pathname]);

  if (!loading) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-transparent pointer-events-none"
    >
      <div className="h-full w-full bg-gradient-to-r from-pine-900 via-emerald-600 to-pine-900 animate-[topProgress_1.5s_ease-in-out_infinite]" />
      <style jsx>{`
        @keyframes topProgress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
