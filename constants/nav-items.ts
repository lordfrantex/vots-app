import React from "react";
import { Plus, Users, Vote } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export const navListItems: NavItem[] = [
  { label: "Elections", href: "/elections", icon: Vote },
  { label: "Create Election", href: "/create-election", icon: Plus },
  { label: "Polling Officer", href: "/polling-officer", icon: Users },
];
