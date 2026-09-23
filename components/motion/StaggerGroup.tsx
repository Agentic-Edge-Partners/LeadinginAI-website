"use client";

import { motion, type Variants } from "motion/react";
import { DURATION, EASE, REVEAL_DISTANCE, STAGGER, STAGGER_CAP } from "@/lib/motion";
import { cx } from "@/lib/cx";

const group: Variants = {
  hidden: {},
  show: (n: number = 0) => ({
    transition: { staggerChildren: n > STAGGER_CAP ? (STAGGER * STAGGER_CAP) / n : STAGGER },
  }),
};

const item: Variants = {
  hidden: { opacity: 0, y: REVEAL_DISTANCE },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.entrance, ease: EASE } },
};

type GroupProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol" | "section";
  /** Number of children, used to cap the total stagger at 8 items' worth. */
  count?: number;
  amount?: number;
};

/** Parent for staggered reveals. Wrap each child in <StaggerItem>. */
export function StaggerGroup({
  children,
  className,
  as = "div",
  count,
  amount = 0.15,
}: GroupProps) {
  const Tag = motion[as];
  return (
    <Tag
      className={cx(className)}
      variants={group}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      custom={count}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const Tag = motion[as];
  return (
    <Tag className={cx(className)} variants={item}>
      {children}
    </Tag>
  );
}
