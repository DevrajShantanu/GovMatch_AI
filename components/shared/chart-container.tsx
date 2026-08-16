"use client";

import { useEffect, useState, ReactNode } from "react";
import { Skeleton } from "../ui/skeleton";

interface ChartContainerProps {
  children: ReactNode;
  height?: number;
}

export function ChartContainer({ children, height = 300 }: ChartContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="w-full rounded-xl" style={{ height }} />;
  }

  return (
    <div style={{ width: "100%", height }}>
      {children}
    </div>
  );
}
