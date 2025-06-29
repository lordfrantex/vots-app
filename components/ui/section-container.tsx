import type React from "react";
import { cn } from "@/lib/utils";

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionContainer({
  children,
  className,
}: SectionContainerProps) {
  return (
    <section className={cn("relative", className)}>
      <div className="container mx-auto px-4">{children}</div>
    </section>
  );
}
