"use client";
import React, { memo } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { blockchainBenefits } from "@/constants/home-page-sections/blockchain-benefits";
import {
  BsFillShieldLockFill,
  BsEyeFill,
  BsCheckCircleFill,
  BsDiagram3Fill,
  BsActivity,
} from "react-icons/bs";
import { useTheme } from "next-themes";
import { MagicCard } from "@/components/ui/magic-card";

// Icon mapping
const iconMap = {
  BsFillShieldLockFill,
  BsEyeFill,
  BsCheckCircleFill,
  BsDiagram3Fill,
  BsActivity,
} as const;

// Animation configuration with proper typing
const cardVariants: Variants = {
  hidden: {
    filter: "blur(10px)",
    transform: "translateY(20%)",
    opacity: 0,
  },
  visible: {
    filter: "blur(0)",
    transform: "translateY(0)",
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const contentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

// Icon glow animation
const iconVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

const BenefitCard = memo(
  ({
    benefit,
    index,
  }: {
    benefit: (typeof blockchainBenefits)[0];
    index: number;
  }) => {
    // Create dynamic variants for the card with delay
    const dynamicCardVariants: Variants = {
      hidden: cardVariants.hidden,
      visible: {
        ...cardVariants.visible,
        transition: {
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1],
          delay: index * 0.1,
        },
      },
    };

    // Create dynamic variants for content with delay
    const dynamicContentVariants: Variants = {
      hidden: contentVariants.hidden,
      visible: {
        ...contentVariants.visible,
        transition: {
          duration: 0.6,
          delay: index * 0.1 + 0.2,
        },
      },
    };

    // Create dynamic variants for icon with delay
    const dynamicIconVariants: Variants = {
      hidden: iconVariants.hidden,
      visible: {
        ...iconVariants.visible,
        transition: {
          duration: 0.6,
          delay: index * 0.1 + 0.4,
          ease: "easeOut",
        },
      },
      hover: iconVariants.hover,
    };

    // Get the appropriate icon component
    const IconComponent = iconMap[benefit.icon as keyof typeof iconMap];

    const { theme } = useTheme();

    return (
      <motion.div
        custom={index}
        initial="hidden"
        whileInView="visible"
        whileHover="hover"
        viewport={{ once: true, amount: 0.2 }}
        variants={dynamicCardVariants}
        className={`glass-panel relative rounded-3xl shadow-xl border-white/20 p-6 md:p-8 flex flex-col justify-between transition-all duration-300 h-[400px] overflow-hidden group cursor-pointer hover:scale-[1.01] will-change-transform ${benefit.className}`}
      >
        <MagicCard
          gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
          className="p-0 inset-0 absolute"
        />
        {/* Background Image */}
        <div
          className={`absolute top-0 blur-[8px] left-0 rounded-full bg-gradient-to-br ${benefit.gradient} opacity-90`}
        />

        {/* Stats Badge */}
        <div className="relative z-10 flex justify-end">
          <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
            <span className="text-sm font-medium text-gray-700 dark:text-white">
              {benefit.stats}
            </span>
          </div>
        </div>

        {/* Icon Container with Glow Effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-20 lg:size-30 z-20 bg-white/10 rounded-full shadow-xl backdrop-blur-md border border-white/30 items-center justify-center text-gray-800 font-semibold flex flex-col will-change-transform p-2">
          <div className="size-full bg-white/10 rounded-full shadow-xl backdrop-blur-sm border border-white/30 items-center justify-center text-gray-800 font-semibold flex flex-col will-change-transform relative">
            {/* Icon with enhanced glow */}
            <motion.div
              variants={dynamicIconVariants}
              className="relative z-10 flex items-center justify-center"
              style={{
                filter: `drop-shadow(0 0 8px ${benefit.iconColor}40) drop-shadow(0 0 16px ${benefit.iconColor}20)`,
              }}
            >
              {IconComponent && (
                <IconComponent
                  className="text-5xl size-[50px] transition-all duration-300 group-hover:scale-110"
                  style={{
                    color: benefit.iconColor,
                    filter: `drop-shadow(0 0 4px ${benefit.iconColor}40)`,
                  }}
                />
              )}
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-end mt-auto"
          variants={dynamicContentVariants}
        >
          <h3 className="text-main dark:text-white text-center text-xl md:text-2xl font-bold mb-3">
            {benefit.title}
          </h3>
          <p className="text-gray-500 text-center text-sm md:text-base leading-relaxed drop-shadow-md">
            {benefit.description}
          </p>
        </motion.div>

        {/* Enhanced Hover Glow Effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-25 transition-opacity duration-500 blur-xl`}
        />

        {/* Additional glow effect that matches the icon color */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl"
          style={{
            background: `radial-gradient(circle at center, ${benefit.iconColor}40 0%, transparent 70%)`,
          }}
        />
      </motion.div>
    );
  },
);

BenefitCard.displayName = "BenefitCard";

export default function WhyBlockchainGrid() {
  return (
    <div className="relative grid grid-cols-1 md:grid-cols-6 gap-6 max-w-7xl mx-auto">
      {blockchainBenefits.map((benefit, index) => (
        <BenefitCard key={benefit.title} benefit={benefit} index={index} />
      ))}
    </div>
  );
}
