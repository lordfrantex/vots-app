import React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { navListItems } from "@/constants/nav-items";
import { cn } from "@/lib/utils";

const MainNavigationMenu = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem className="flex flex-row gap-4">
          {navListItems.map((item) => (
            <div key={item.label}>
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent hover:bg-indigo-300/15",
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </NavigationMenuLink>
            </div>
          ))}
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
export default MainNavigationMenu;
