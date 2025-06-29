"use client";
import { memo } from "react";
import { motion } from "framer-motion";

import SectionContainer from "@/components/ui/section-container";
import {
  HowItWorksStepProps,
  howItWorksSteps,
} from "@/constants/home-page-sections/how-it-works";

// Memoized card component for better performance
const StepCard = memo(
  ({ step, index }: { step: HowItWorksStepProps; index: number }) => {
    const IconComponent = step.icon;
    const stepNumber = String(index + 1).padStart(2, "0");

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className="col-span-12 md:col-span-6 row-span-4 group cursor-pointer"
      >
        <div className="glass-panel rounded-3xl p-8 h-full relative overflow-hidden hover:scale-[1.02] transition-all duration-500">
          {/* Glowing background effect */}
          <div
            className={`absolute inset-0 ${step.bgGlow} opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-xl`}
          />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.glowColor} p-4 shadow-2xl ${step.iconGlow} group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500`}
              >
                <IconComponent className="w-full h-full text-white" />
              </div>
              <span className="text-6xl font-bold text-gray-500 dark:text-gray-700">
                {stepNumber}
              </span>
            </div>

            <div className="flex-1">
              <h3 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Decorative glowing orb - different positions for variety */}
            <div
              className={`absolute ${
                index % 2 === 0
                  ? "-bottom-8 -right-8 w-32 h-32"
                  : index === 1
                    ? "-top-8 -left-8 w-24 h-24"
                    : index === 2
                      ? "-bottom-4 -right-4 w-20 h-20"
                      : "-top-12 -right-12 w-40 h-40"
              } bg-gradient-to-br ${step.glowColor} rounded-full ${
                index === 2
                  ? "opacity-30"
                  : index === 3
                    ? "opacity-15"
                    : "opacity-20"
              } ${
                index === 3 ? "blur-3xl" : index === 2 ? "blur-xl" : "blur-2xl"
              } group-hover:opacity-${
                index === 2 ? "50" : index === 3 ? "30" : "40"
              } transition-opacity duration-500`}
            />
          </div>
        </div>
      </motion.div>
    );
  },
);

StepCard.displayName = "StepCard";

export default function HowItWorksSection() {
  return (
    <SectionContainer className="py-24">
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-700 dark:text-white/90"
        >
          How It Works
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="text-lg text-gray-500 max-w-2xl mx-auto"
        >
          Four simple steps to secure, transparent voting
        </motion.p>
      </div>

      {/* True Bento Grid Layout with Glowing Effects */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 grid-rows-8 gap-4 h-[800px] md:h-[600px]">
          {howItWorksSteps.map((step, index) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
