"use client";
import { memo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import SectionContainer from "@/components/ui/section-container";
import {
  AudienceProps,
  audiences,
} from "@/constants/home-page-sections/who-is-it-for";
import Image from "next/image";

// Utility function to get theme-appropriate image source
const getThemeImageSrc = (basePath: string, theme: string | undefined) => {
  if (!theme || theme === "system") {
    // Default to dark theme if system or undefined
    return basePath.replace(/\/(light|dark)-/, "/dark-");
  }

  // Replace any existing theme prefix with the current theme
  return basePath.replace(/\/(light|dark)-/, `/${theme}-`);
};

// Memoized card component for better performance
const AudienceCard = memo(
  ({ audience, index }: { audience: AudienceProps; index: number }) => {
    const IconComponent = audience.icon;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ scale: 1.02 }}
        className="group cursor-pointer"
      >
        <div className="rounded-2xl p-8 h-full transition-all duration-200 group-hover:shadow-xl">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${audience.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}
          >
            <IconComponent
              className={`w-8 h-8 bg-gradient-to-br ${audience.color} bg-clip-text text-transparent`}
            />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            {audience.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {audience.description}
          </p>
        </div>
      </motion.div>
    );
  },
);

AudienceCard.displayName = "AudienceCard";

export default function WhoIsItForSection() {
  const { theme, resolvedTheme } = useTheme();

  // Use resolvedTheme for more accurate theme detection, fallback to theme
  const currentTheme = resolvedTheme || theme;

  // Get the appropriate image source based on current theme
  const imageSrc = getThemeImageSrc(
    "/images/home/who-is-it-for/dark-election.png",
    currentTheme,
  );

  return (
    <SectionContainer className="py-24 relative">
      <div className="blur-[12rem] h-52 w-52 bg-indigo-400 absolute top-1/2 left-0 -z-1" />
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-700 dark:text-white/90"
        >
          Who Is It For?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="text-lg text-gray-500 max-w-2xl mx-auto"
        >
          Built for educational institutions and democratic organizations
        </motion.p>
      </div>

      <div className="flex flex-col xl:flex-row gap-10 max-w-full mx-auto mr-0">
        {/* 2x2 Grid Layout */}
        {/*Audience*/}
        <div className="xl:w-[60%] xl:flex-none mb-10 flex flex-col justify-center items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {audiences.map((audience, index) => (
              <AudienceCard
                key={audience.title}
                audience={audience}
                index={index}
              />
            ))}
          </div>
        </div>

        <div className="mb-10 max-md:hidden">
          <div className="bg-gray-700/10 shadow-xl backdrop-blur-sm border border-white/20 items-center justify-center relative w-[966px] h-auto rounded-xl mask-b-from-40%">
            <div className="relative rounded-3xl px-6 pb-6 pt-14">
              <Image
                src={imageSrc}
                width={855}
                height={655}
                alt="Screenshot of the voting platform"
                className="rounded-xl transition-opacity duration-300 mask-b-from-40%"
                key={currentTheme} // Force re-render when theme changes
                priority // Since this is likely above the fold
              />
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
