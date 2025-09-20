"use client";
import React from "react";
import { colors } from "@/lib/colors";
import { Card, Button } from "@/components/ui/primitives";

export const EmptyState: React.FC<{ onReset?: () => void }>
  = ({ onReset }) => (
    <Card className="mt-6 border-white/40 bg-white/70 p-6 backdrop-blur-2xl">
      <h3 className={`text-lg font-medium text-[${colors.zinc[900]}]`}>No results</h3>
      <p className={`mt-1 text-sm text-[${colors.zinc[600]}]`}>Try adjusting filters or clearing the search to see all opportunities.</p>
      {onReset && (
        <Button onClick={onReset} variant="outline" className="mt-4">Clear filters</Button>
      )}
    </Card>
  );

