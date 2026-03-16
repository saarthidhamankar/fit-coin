"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: "hover" | "view";
  revealDirection?: "start" | "end" | "center";
  sequential?: boolean;
  useOriginalCharsOnly?: boolean;
  clickMode?: "once" | "toggle";
}

/**
 * DecryptedText - A high-end text decryption animation component.
 * Animates text from random characters to the final revealed content.
 */
export default function DecryptedText({
  text,
  speed = 40,
  maxIterations = 10,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  revealDirection = "start",
  sequential = false,
  useOriginalCharsOnly = false,
  clickMode,
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  const isAnimating = animateOn === "view" ? isInView : isHovering || isClicked;

  useEffect(() => {
    if (!isAnimating) {
      setDisplayText(text);
      return;
    }

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText((prevText) =>
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            if (char === " ") return " ";
            
            const charSet = useOriginalCharsOnly ? text : characters;
            return charSet[Math.floor(Math.random() * charSet.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / maxIterations;
    }, speed);

    return () => clearInterval(interval);
  }, [isAnimating, text, speed, maxIterations, characters, useOriginalCharsOnly]);

  return (
    <motion.span
      ref={containerRef}
      onMouseEnter={() => animateOn === "hover" && setIsHovering(true)}
      onMouseLeave={() => animateOn === "hover" && setIsHovering(false)}
      onClick={() => {
        if (clickMode === "once") setIsClicked(true);
        if (clickMode === "toggle") setIsClicked(!isClicked);
      }}
      className={parentClassName}
    >
      <span className={className}>{displayText}</span>
    </motion.span>
  );
}
