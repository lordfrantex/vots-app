import { Building2, Code, GraduationCap, Users } from "lucide-react";
import { IconType } from "react-icons";

export interface AudienceProps {
  icon: IconType;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

export const audiences: AudienceProps[] = [
  {
    icon: GraduationCap,
    title: "Universities",
    description:
      "Student government elections, faculty voting, and academic decisions",
    color: "from-blue-500 to-indigo-600",
    bgColor: "from-blue-500/10 to-indigo-600/10",
  },
  {
    icon: Building2,
    title: "Election Boards",
    description: "Official institutional elections with complete transparency",
    color: "from-purple-500 to-pink-600",
    bgColor: "from-purple-500/10 to-pink-600/10",
  },
  {
    icon: Users,
    title: "Student Unions",
    description: "Democratic decision-making for student organizations",
    color: "from-green-500 to-emerald-600",
    bgColor: "from-green-500/10 to-emerald-600/10",
  },
  {
    icon: Code,
    title: "Developers",
    description: "Open-source contributors and blockchain auditors",
    color: "from-orange-500 to-red-600",
    bgColor: "from-orange-500/10 to-red-600/10",
  },
];
