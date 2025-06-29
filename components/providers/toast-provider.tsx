"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "next-themes";

export const ToastProvider = () => {
  const { theme } = useTheme();

  const glassLightTheme = {
    background: "rgba(255, 255, 255, 0.25)",
    color: "#1f2937",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
    borderRadius: "12px",
  };

  const glassDarkTheme = {
    background: "rgba(30, 41, 59, 0.3)",
    color: "#f8fafc",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
    borderRadius: "12px",
  };

  const currentTheme = theme === "dark" ? glassDarkTheme : glassLightTheme;

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: currentTheme,
        success: {
          style: {
            ...currentTheme,
            background:
              theme === "dark"
                ? "rgba(5, 46, 22, 0.4)"
                : "rgba(240, 253, 244, 0.4)",
            border:
              theme === "dark"
                ? "1px solid rgba(34, 197, 94, 0.3)"
                : "1px solid rgba(34, 197, 94, 0.2)",
            color: theme === "dark" ? "#4ade80" : "#15803d",
          },
        },
        error: {
          style: {
            ...currentTheme,
            background:
              theme === "dark"
                ? "rgba(69, 10, 10, 0.4)"
                : "rgba(254, 242, 242, 0.4)",
            border:
              theme === "dark"
                ? "1px solid rgba(239, 68, 68, 0.3)"
                : "1px solid rgba(239, 68, 68, 0.2)",
            color: theme === "dark" ? "#f87171" : "#dc2626",
          },
        },
        loading: {
          style: {
            ...currentTheme,
            background:
              theme === "dark"
                ? "rgba(30, 58, 138, 0.4)"
                : "rgba(239, 246, 255, 0.4)",
            border:
              theme === "dark"
                ? "1px solid rgba(59, 130, 246, 0.3)"
                : "1px solid rgba(59, 130, 246, 0.2)",
            color: theme === "dark" ? "#60a5fa" : "#1d4ed8",
          },
        },
      }}
    />
  );
};
