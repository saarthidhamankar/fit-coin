"use client";

import { useEffect, useState } from "react";
import { useMotionValue, useMotionValueEvent, useTransform, animate } from "framer-motion";

interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

/**
 * A component that animates a numeric value from 0 to a target number.
 * Fixes the "Objects are not valid as a React child" error by using a string state
 * instead of rendering a MotionValue directly.
 */
export default function CountUp({ value, duration = 2, prefix = "", suffix = "" }: CountUpProps) {
  const [display, setDisplay] = useState("0");
  const count = useMotionValue(0);
  
  // Transform the raw number into a formatted string
  const rounded = useTransform(count, (latest) => 
    Math.floor(latest).toLocaleString()
  );

  // Sync the formatted string to React state so it can be rendered as a text node
  useMotionValueEvent(rounded, "change", (latest) => {
    setDisplay(latest);
  });

  useEffect(() => {
    // Animate from the current count to the target value
    const controls = animate(count, value, { 
      duration: duration,
      ease: "easeOut" 
    });
    return () => controls.stop();
  }, [value, duration, count]);

  return (
    <span>
      {prefix}{display}{suffix}
    </span>
  );
}
