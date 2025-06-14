"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import MainNavigationMenu from "@/components/navbar/navigation-menu";
import GlassSearchInput from "@/components/ui/glass-search-input";
import { ModeToggle } from "@/components/utilities/mode-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { navListItems } from "@/constants/nav-items";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CustomConnectButton } from "@/components/ui/custom-connect-button";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 shadow-none z-40 fixed top-0 w-full transition-all duration-300 min-h-[64px]",
        isScrolled &&
          "backdrop-blur-lg bg-background/40 border-b border-border/40",
      )}
    >
      {/* LEFT SIDE - Logo and Navigation */}
      <div className="flex items-center gap-8 flex-shrink-0">
        <div className="flex items-center">
          <Logo />
        </div>

        {/* DESKTOP NAVIGATION - Hidden on mobile */}
        <div className="hidden xl:flex items-center">
          <MainNavigationMenu />
        </div>
      </div>

      {/* RIGHT SIDE - Desktop */}
      <div className="hidden xl:flex items-center gap-4 flex-shrink-0 min-w-0">
        {/* Search Input - with flexible width but min width */}
        <div className="w-64 min-w-[200px] max-w-[300px] flex-shrink">
          <GlassSearchInput />
        </div>

        {/* Mode Toggle */}
        <div className="flex-shrink-0">
          <ModeToggle />
        </div>

        {/* Connect Button - with min width to prevent squishing */}
        <div className="min-w-[140px] flex-shrink-0">
          <CustomConnectButton />
        </div>
      </div>

      {/* MOBILE RIGHT SIDE - Mode toggle and hamburger */}
      <div className="flex xl:hidden items-center gap-2 flex-shrink-0">
        <ModeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-80 dark:[background-image:var(--gradient-dark-bg)]"
          >
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col px-6 mt-6 gap-6">
              {/* Navigation Menu in mobile */}
              <div className="flex flex-col gap-2">
                <MobileNavigationMenu />
              </div>

              {/* Search Input in mobile menu */}
              <div className="flex flex-col gap-2">
                <GlassSearchInput />
              </div>

              {/* Connect Wallet Button - Full width wrapper */}
              <div className="flex flex-col gap-2">
                <SheetClose asChild>
                  <div className="w-full flex items-center justify-center [&>div]:w-full [&>div>button]:w-full [&>div>button]:justify-center [&>div>button]:items-center">
                    <ConnectButton showBalance={false} chainStatus="none" />
                  </div>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

// Mobile Navigation Menu Component
const MobileNavigationMenu = () => {
  return (
    <div className="flex flex-col gap-2">
      {navListItems.map((item) => (
        <SheetClose asChild key={item.label}>
          <Link
            href={item.href}
            className="flex items-center py-3 px-4 text-sm font-medium rounded-md hover:bg-indigo-300/15 hover:text-accent-foreground transition-colors"
          >
            {item.label}
          </Link>
        </SheetClose>
      ))}
    </div>
  );
};

export default Navbar;
