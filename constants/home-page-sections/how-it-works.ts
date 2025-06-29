import { Wallet, UserCheck, Vote, BarChart3 } from "lucide-react";
import { IconType } from "react-icons";

export interface HowItWorksStepProps {
  icon: IconType;
  title: string;
  description: string;
  size: "large" | "medium";
  glowColor: string;
  bgGlow: string;
  iconGlow: string;
}

export const howItWorksSteps: HowItWorksStepProps[] = [
  {
    icon: Wallet,
    title: "Connect Wallet",
    description:
      "Securely connect your Web3 wallet to participate in elections",
    size: "large",
    glowColor: "from-blue-400 to-cyan-400",
    bgGlow: "bg-blue-500/10",
    iconGlow: "shadow-blue-500/50",
  },
  {
    icon: UserCheck,
    title: "Accreditation",
    description: "Verify your identity and eligibility to vote",
    size: "medium",
    glowColor: "from-purple-400 to-pink-400",
    bgGlow: "bg-purple-500/10",
    iconGlow: "shadow-purple-500/50",
  },
  {
    icon: Vote,
    title: "Cast Vote",
    description: "Make your choice with complete transparency",
    size: "medium",
    glowColor: "from-green-400 to-emerald-400",
    bgGlow: "bg-green-500/10",
    iconGlow: "shadow-green-500/50",
  },
  {
    icon: BarChart3,
    title: "View Results",
    description: "Real-time, verifiable election results",
    size: "large",
    glowColor: "from-orange-400 to-red-400",
    bgGlow: "bg-orange-500/10",
    iconGlow: "shadow-orange-500/50",
  },
];
