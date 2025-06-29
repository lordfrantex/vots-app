"use client";
import { motion } from "framer-motion";
import SectionContainer from "@/components/ui/section-container";
import WhyBlockchainGrid from "@/components/layouts/home/why-blockchain-section/why-blockchain-grid";
import React from "react";

export default function WhyBlockchainSection() {
  return (
    <SectionContainer className="py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-2xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-pink-600/10 rounded-full blur-2xl" />

      {/*  Decorative Element*/}
      <div className="size-10 lg:size-18 rounded-full bg-gradient-to-br from-blue-200 via-purple-400/15 to-purple-900/10 absolute top-0 left-[10%] will-change-transform" />

      <div className="relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-700 dark:text-white/90"
          >
            Why Blockchain Voting?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="text-lg text-gray-500 max-w-3xl mx-auto"
          >
            Traditional voting systems have limitations. Blockchain technology
            solves them all with unprecedented security and transparency.
          </motion.p>
        </div>

        <WhyBlockchainGrid />
      </div>
    </SectionContainer>
  );
}
