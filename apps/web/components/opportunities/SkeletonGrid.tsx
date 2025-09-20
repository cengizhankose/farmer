"use client";
import React from "react";
import { Card } from "@/components/ui/primitives";

const SkeletonCard = () => (
  <Card className="animate-pulse border-white/40 bg-white/60 p-5 backdrop-blur-2xl">
    <div className="h-4 w-24 rounded bg-zinc-200/80" />
    <div className="mt-2 h-5 w-40 rounded bg-zinc-200/80" />
    <div className="mt-5 grid grid-cols-3 gap-4">
      <div className="h-10 rounded bg-zinc-200/70" />
      <div className="h-10 rounded bg-zinc-200/70" />
      <div className="h-10 rounded bg-zinc-200/70" />
    </div>
    <div className="mt-5 h-9 w-full rounded bg-zinc-200/80" />
  </Card>
);

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

