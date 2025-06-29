interface blockchainBenefitProps {
  title: string;
  description: string;
  image: string;
  stats: string;
  className: string;
  gradient: string;
  icon: string; // New property for icon component name
  iconColor: string; // New property for icon color
}

export const blockchainBenefits: blockchainBenefitProps[] = [
  {
    title: "Immutable Records",
    description:
      "Every vote is permanently recorded on the blockchain, ensuring complete transparency and preventing any form of tampering or manipulation.",
    image: "/images/why-blockchain/immutable-records.svg",
    stats: "100% Secure",
    className: "col-span-full lg:col-span-3", // Takes 3/6 of the grid width
    gradient: "from-blue-500/20 to-cyan-500/20 mask-t-from-10%",
    icon: "BsFillShieldLockFill",
    iconColor: "#3B82F6", // Blue
  },
  {
    title: "Verifiable Results",
    description:
      "Anyone can independently verify election results using blockchain explorers, ensuring complete transparency in the democratic process.",
    image: "/placeholder.svg?height=400&width=600",
    stats: "Full Transparency",
    className: "col-span-full lg:col-span-3", // Takes 3/6 of the grid width
    gradient: "from-green-500/20 to-emerald-500/20",
    icon: "BsEyeFill",
    iconColor: "#10B981", // Green
  },
  {
    title: "No Double Voting",
    description:
      "Smart contracts automatically prevent duplicate votes, maintaining election integrity through automated verification.",
    image: "/placeholder.svg?height=400&width=600",
    stats: "Zero Fraud",
    className: "col-span-full lg:col-span-2", // Takes 2/6 of the grid width
    gradient: "from-purple-500/20 to-pink-500/20",
    icon: "BsCheckCircleFill",
    iconColor: "#8B5CF6", // Purple
  },
  {
    title: "Decentralized Governance",
    description:
      "No single point of failure or control, ensuring true democratic principles with distributed consensus.",
    image: "/placeholder.svg?height=400&width=600",
    stats: "Truly Democratic",
    className: "col-span-full lg:col-span-2", // Takes 2/6 of the grid width
    gradient: "from-orange-500/20 to-red-500/20",
    icon: "BsDiagram3Fill",
    iconColor: "#F97316", // Orange
  },
  {
    title: "Real-time Auditing",
    description:
      "Continuous monitoring and instant verification of all voting activities with complete audit trails.",
    image: "/placeholder.svg?height=400&width=600",
    stats: "Live Monitoring",
    className: "col-span-full lg:col-span-2", // Takes 2/6 of the grid width
    gradient: "from-indigo-500/20 to-purple-500/20",
    icon: "BsActivity",
    iconColor: "#6366F1", // Indigo
  },
];
