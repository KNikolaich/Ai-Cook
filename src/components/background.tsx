"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function Background() {
  const [elements, setElements] = useState<{
    width: number;
    height: number;
    left: string;
    top: string;
    duration: number;
    x: number[];
    y: number[];
  }[]>([]);

  useEffect(() => {
    const newElements = [...Array(6)].map(() => ({
      width: Math.random() * 300 + 100,
      height: Math.random() * 300 + 100,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 10 + 10,
      x: [0, Math.random() * 100 - 50, 0],
      y: [0, Math.random() * 100 - 50, 0],
    }));
    setElements(newElements);
  }, []);

  return (
    <div className="animated-bg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      {/* Subtle floating elements */}
      {elements.map((el, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10 blur-3xl"
          style={{
            width: el.width,
            height: el.height,
            left: el.left,
            top: el.top,
          }}
          animate={{
            x: el.x,
            y: el.y,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
