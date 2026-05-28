"use client";

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
}

export default function TextReveal({ children, className, delay = 0 }: TextRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  // Split text into words for staggered animation
  const words = children.split(" ");

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-1 mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: "100%" }}
            animate={isInView ? { y: 0 } : { y: "100%" }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1], // Custom cinematic ease
              delay: delay + i * 0.05,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
