"use client"; // Ensures this runs in the browser

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
// Import the styles

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    }, 500); // Ensures a smooth transition

    return () => clearTimeout(timer);
  }, [pathname, searchParams]); // Re-run when route changes

  return null; // This component doesn't render anything
}
