"use client";
import { memo } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

import SectionContainer from "@/components/ui/section-container";
import { TestimonialMarquee } from "@/components/layouts/home/testimonials-section/testimonial-marquee";
import Image from "next/image";

const reviews = [
  {
    name: "Dr. Sarah Johnson",
    username: "@sarahjohnson",
    body: "Votes has revolutionized our student elections. The transparency and security it provides has increased student participation by 40%.",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
  },
  {
    name: "Michael Chen",
    username: "@michaelchen",
    body: "As someone who's experienced traditional voting systems, the difference is night and day. Students trust the process completely now.",
    img: "https://randomuser.me/api/portraits/men/52.jpg",
    rating: 5,
  },
  {
    name: "Prof. Emily Rodriguez",
    username: "@emilyrodriguez",
    body: "The smart contract implementation is flawless. We've audited the code and can confidently say it's the most secure voting system we've seen.",
    img: "https://randomuser.me/api/portraits/women/32.jpg",
    rating: 5,
  },
  {
    name: "David Kim",
    username: "@davidkim",
    body: "Setting up elections is incredibly intuitive. The real-time results and audit trails give us complete confidence in the process.",
    img: "https://randomuser.me/api/portraits/men/20.jpg",
    rating: 5,
  },
  {
    name: "Lisa Thompson",
    username: "@lisathompson",
    body: "Our students love the transparency. Being able to verify their votes on the blockchain has eliminated all trust issues.",
    img: "https://randomuser.me/api/portraits/women/14.jpg",
    rating: 5,
  },
  {
    name: "James Wilson",
    username: "@jameswilson",
    body: "The fraud prevention is remarkable. We've had zero incidents since implementing Votes for our university elections.",
    img: "https://randomuser.me/api/portraits/men/60.jpg",
    rating: 5,
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = memo(
  ({
    img,
    name,
    username,
    body,
    rating,
  }: {
    img: string;
    name: string;
    username: string;
    body: string;
    rating: number;
  }) => {
    return (
      <figure
        className={cn(
          "relative h-full w-96 cursor-pointer overflow-hidden rounded-xl border p-4",
          // light styles
          "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
          // dark styles
          "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
        )}
      >
        <div className="flex flex-row items-center gap-2">
          <Image
            className="rounded-full"
            width={32}
            height={32}
            alt=""
            src={img || "/placeholder.svg"}
          />
          <div className="flex flex-col">
            <figcaption className="text-sm font-medium dark:text-white">
              {name}
            </figcaption>
            <p className="text-xs font-medium dark:text-white/40">{username}</p>
          </div>
        </div>

        {/* Star Rating */}
        <div className="flex mt-2 mb-2">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-gray-400 fill-current" />
          ))}
        </div>

        <blockquote className="text-sm">{body}</blockquote>
      </figure>
    );
  },
);

ReviewCard.displayName = "ReviewCard";

export default function TestimonialsSection() {
  return (
    <SectionContainer className="py-24 relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/5 to-purple-600/5 rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-700 dark:text-white/90"
          >
            Trusted by Institutions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto"
          >
            See what educators and students are saying about Votes
          </motion.p>
        </div>

        {/* Marquee Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative flex w-full flex-col items-center justify-center overflow-hidden mask-x-from-90% mask-x-to-100%"
        >
          <TestimonialMarquee pauseOnHover className="[--duration:20s]">
            {firstRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </TestimonialMarquee>
          <TestimonialMarquee reverse pauseOnHover className="[--duration:20s]">
            {secondRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </TestimonialMarquee>
        </motion.div>
      </div>
    </SectionContainer>
  );
}
