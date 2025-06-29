"use client";

import React, { useState, useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import HeroImage from "@/components/ui/hero-image";
import { useRouter } from "next/navigation";
import HowItWorksSection from "@/components/layouts/home/how-it-works-section/how-it-works";
import WhoIsItForSection from "@/components/layouts/home/who-is-it-for-section/who-is-it-for";
import WhyBlockchainSection from "@/components/layouts/home/why-blockchain-section/why-blockchain";

export default function HeroSection() {
  const [, setHasAnimated] = useState(false);
  const [, setInitialState] = useState("hidden");

  const router = useRouter();

  // Memoize the headline text processing
  const { words } = useMemo(() => {
    const text = "Vote Securely. Transparently. Decentralized.";
    return {
      headlineText: text,
      words: text.split(" "),
    };
  }, []);

  // Optimize the animation trigger
  useEffect(() => {
    // Use requestAnimationFrame for better performance
    const animationFrame = requestAnimationFrame(() => {
      setInitialState("visible");
      setHasAnimated(true);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <section className="justify-center items-center  relative pt-[11rem] lg:pt-[15rem] -mt-20 pb-10">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] mask-radial-at-center mask-radial-from-100% opacity-40 mask-b-from-50%",
        )}
      />

      {/* Optimized background elements with will-change for GPU acceleration */}
      <div
        className="blur-[12rem] h-52 w-52 bg-blue-200 absolute top-[20%] right-[5%] will-change-transform"
        style={{ transform: "translateZ(0)" }} // Force GPU layer
      />
      <div
        className="blur-[12rem] h-52 w-52 bg-purple-500 absolute top-[60%] left-[5%] will-change-transform"
        style={{ transform: "translateZ(0)" }}
      />

      <div className="container mx-auto flex flex-col overflow-hidden">
        {/* Optimized decorative elements */}
        <div className="size-10 lg:size-18 rounded-full bg-gradient-to-br from-white to-zinc-900/15 absolute top-52 right-[10%] will-change-transform" />

        <div className="size-10 lg:size-18 rounded-full bg-gradient-to-br from-blue-200 via-purple-400/15 to-purple-900/10 absolute top-[30rem] md:top-96 left-[10%] will-change-transform" />

        <div className="flex flex-col justify-center items-center relative">
          {/* Main headline - optimized for LCP */}
          <div className="max-w-7xl px-4">
            <h1 className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] leading-[1.1] lg:leading-none font-extrabold tracking-tight mb-6 pt-8 text-gray-700 dark:text-white/90">
              {words.map((word, index) => (
                <React.Fragment key={index}>
                  <span className="inline-block will-change-transform">
                    {word}
                  </span>
                  {index < words.length - 1 && " "}
                </React.Fragment>
              ))}
            </h1>

            <p className="text-gray-500 text-lg font-medium mb-8 max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto text-center">
              A blockchain-based voting platform for universities and colleges.
            </p>
          </div>

          {/* CTA Button - optimized */}
          <div>
            <Button
              className="bg-[#EEF2FF] font-bold rounded-full text-neutral-600 hover:bg-gradient-to-tr hover:from-zinc-700 hover:via-55% hover:to-gray-500 hover:text-white text-md p-6 md:text-lg md:p-8 shadow-lg transition-all duration-200 md:w-[15rem] hover:scale-105 cursor-pointer will-change-transform"
              variant="outline"
              onClick={() => router.push("/elections")}
            >
              View Elections
            </Button>
          </div>

          {/* Hero image section - Critical for LCP */}
          <HeroImage />
        </div>
      </div>
    </section>
  );
}
