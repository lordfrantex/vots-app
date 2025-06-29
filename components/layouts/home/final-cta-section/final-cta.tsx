"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import SectionContainer from "@/components/ui/section-container";
import { useRouter } from "next/navigation";
import React from "react";

export default function FinalCtaSection() {
  const router = useRouter();

  return (
    <SectionContainer className="py-32 relative overflow-hidden">
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0">
        {/* Left Side Geometric Lines */}
        <svg
          className="absolute left-0 top-0 h-full w-1/3 opacity-40"
          viewBox="0 0 400 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 100L150 200L100 300L200 400L150 500L250 600L200 700"
            stroke="url(#leftGradient)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M0 150L100 250L50 350L150 450L100 550L200 650L150 750"
            stroke="url(#leftGradient)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M100 50L200 150L150 250L250 350L200 450L300 550L250 650"
            stroke="url(#leftGradient)"
            strokeWidth="1"
            fill="none"
          />
          <defs>
            <linearGradient
              id="leftGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Right Side Geometric Lines */}
        <svg
          className="absolute right-0 top-0 h-full w-1/3 opacity-40"
          viewBox="0 0 400 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M350 100L250 200L300 300L200 400L250 500L150 600L200 700"
            stroke="url(#rightGradient)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M400 150L300 250L350 350L250 450L300 550L200 650L250 750"
            stroke="url(#rightGradient)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M300 50L200 150L250 250L150 350L200 450L100 550L150 650"
            stroke="url(#rightGradient)"
            strokeWidth="1"
            fill="none"
          />
          <defs>
            <linearGradient
              id="rightGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            Your All-in-One{" "}
            <span className="bg-gradient-to-r from-[#4BA1DA] via-indigo-600 to-purple-800 bg-clip-text text-transparent">
              Voting
            </span>{" "}
            Platform
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Simplify democratic participation with cutting-edge blockchain
            technology designed for everyone—from students to administrators.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {" "}
            <Button
              className="bg-[#EEF2FF] font-bold rounded-full text-neutral-600 bg-gradient-to-tr hover:from-zinc-700 hover:via-55% hover:to-gray-500 hover:text-white text-md p-6 md:text-lg md:p-8 shadow-lg transition-all duration-200 md:w-[15rem] hover:scale-105 cursor-pointer will-change-transform"
              variant="outline"
              onClick={() => router.push("/elections")}
            >
              View Elections
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </SectionContainer>
  );
}
