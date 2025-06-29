import React from "react";
import Link from "next/link";
import { Github } from "lucide-react";
import Logo from "@/components/ui/logo";

const Footer = () => {
  return (
    <footer className="relative bg-gray-100 dark:bg-gray-900 h-[400px] border-t border-border overflow-hidden">
      <div className="blur-[12rem] h-52 w-52 bg-indigo-400 absolute top-4 left-0 opacity-60" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Logo />
              </div>
              <span className="text-xl font-bold text-foreground">Vots</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              © 2024 Vots. All rights reserved.
            </p>
          </div>

          {/* Pages Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Pages</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/election"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Election
                </Link>
              </li>
              <li>
                <Link
                  href="/create-election"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Create Election
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Social</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom border line */}
        <div className="mt-12 pt-8 border-t border-border"></div>
      </div>
      <div className="flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="text-[12rem] md:text-[16rem] lg:text-[20rem] font-bold opacity-20 dark:opacity-10 select-none whitespace-nowrap py-0 -mt-35 mask-t-from-5%">
          Vots
        </div>
      </div>
    </footer>
  );
};

export default Footer;
