import React from "react";
import { Plus, Vote } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export const navListItems: NavItem[] = [
  { label: "Elections", href: "/elections", icon: Vote },
  { label: "Create Election", href: "/create-election", icon: Plus },
];
