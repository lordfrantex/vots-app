"use client";
import React, { useState, useEffect } from "react";
import Logo from "@/components/ui/logo";
import MainNavigationMenu from "@/components/navbar/navigation-menu";
import GlassSearchInput from "@/components/ui/glass-search-input";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        "flex items-center justify-between p-4 shadow-none z-40 fixed top-0 w-full transition-all duration-300",
        isScrolled &&
          "backdrop-blur-md bg-background/40 border-b border-border/40",
      )}
    >
      <div className="flex items-center justify-center gap-4">
        {/*  LEFT SIDE*/}
        <Logo />
        <MainNavigationMenu />
      </div>

      {/*    RIGHT SIDE*/}
      <div className="flex items-center gap-4">
        {/*    Search Button*/}
        <GlassSearchInput />
        <ModeToggle />
        {/*    Connect Wallet*/}
        <Button className="bg-foreground">Connect Wallet</Button>
      </div>
    </div>
  );
};

export default Navbar;
