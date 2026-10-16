"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export function Page({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6", className)}
    >
      {children}
    </motion.div>
  );
}
