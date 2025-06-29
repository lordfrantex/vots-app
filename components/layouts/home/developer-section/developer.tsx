"use client";
import React, { memo } from "react";
import { motion } from "framer-motion";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionContainer from "@/components/ui/section-container";
import Image from "next/image";
import { GrGithub } from "react-icons/gr";

const FeatureCard = memo(
  ({ icon: Icon, title, description, gradient }: any) => {
    return (
      <div className="text-center">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mx-auto mb-4`}
        >
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="font-bold text-gray-800 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>
    );
  },
);

FeatureCard.displayName = "FeatureCard";

export default function DeveloperSection() {
  return (
    <SectionContainer className="py-24 mt-[5rem] lg:mt-[10rem]">
      <div className="max-w-4xl mx-auto">
        <div className="blur-[12rem] h-52 w-52 bg-indigo-400 absolute top-4 left-1/2 -translate-x-1/2 -z-1" />

        <div className="size-10 lg:size-18 rounded-full bg-gradient-to-br from-white to-zinc-900/15 absolute top-52 right-[10%] will-change-transform" />

        <div className="pointer-events-none absolute -top-16 left-[calc(50%-480px)] -z-5 mx-auto w-[960px]">
          <Image
            src="/images/home/open-sourced/bg-outlines.svg"
            width={960}
            height={380}
            alt="outline"
            className="relative z-2"
            loading="lazy"
          />
          <Image
            src="/images/home/open-sourced/bg-outlines-fill.png"
            width={960}
            height={380}
            alt="outline"
            className="absolute inset-0 opacity-5 mix-blend-soft-light"
            loading="lazy"
          />
        </div>
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-700 dark:text-white/90"
          >
            Open Source Prototype
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto"
          >
            Built with transparency in mind. Explore our code, contribute, and
            verify our security.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass-panel rounded-3xl p-8 md:p-12"
        >
          {/* Code Preview */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-8 overflow-x-auto">
            <div className="flex items-center mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="ml-4 text-gray-400 text-sm">
                VotingContract.sol
              </span>
            </div>
            <pre className="text-green-400 text-sm leading-relaxed">
              <code>{`// Secure voting smart contract
contract SecureVoting {
    mapping(address => bool) public hasVoted;
    mapping(uint => uint) public votes;
    
    function vote(uint candidateId) external {
        require(!hasVoted[msg.sender], "Already voted");
        hasVoted[msg.sender] = true;
        votes[candidateId]++;
        emit VoteCast(msg.sender, candidateId);
    }
}`}</code>
            </pre>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <FeatureCard
              icon={GrGithub}
              title="Open Source"
              description="Full source code available on GitHub"
              gradient="from-blue-500/20 to-indigo-600/20"
            />

            <FeatureCard
              icon={FileText}
              title="Documented"
              description="Comprehensive documentation available"
              gradient="from-green-500/20 to-emerald-600/20"
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="bg-transparent border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <GrGithub className="w-4 h-4 mr-2" />
              View on GitHub
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Testnet Warning */}
          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-center text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Note:</strong> This app currently runs on Sepolia testnet
              for demo purposes only.
            </p>
          </div>
        </motion.div>
      </div>
    </SectionContainer>
  );
}
