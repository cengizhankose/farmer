"use client";
import * as React from "react";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = "", ...props }) => (
  <div className={`rounded-xl border p-5 ${className}`} {...props} />
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={`h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 ${className}`} {...props} />
  )
);
Input.displayName = "Input";

export const Table = ({ className = "", ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <table className={`w-full text-sm ${className}`} {...props} />
);
export const TableHeader = (p: React.HTMLAttributes<HTMLTableSectionElement>) => <thead {...p} />;
export const TableBody = (p: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...p} />;
export const TableRow = (p: React.HTMLAttributes<HTMLTableRowElement>) => <tr className="border-b last:border-0" {...p} />;
export const TableHead = (p: React.ThHTMLAttributes<HTMLTableCellElement>) => <th className="text-left p-2 font-medium text-zinc-600" {...p} />;
export const TableCell = (p: React.TdHTMLAttributes<HTMLTableCellElement>) => <td className="p-2" {...p} />;
export const TableCaption = (p: React.TableHTMLAttributes<HTMLTableCaptionElement>) => <caption {...p} />;

export function Badge({ className = "", variant = "default", ...rest }: React.HTMLAttributes<HTMLSpanElement> & { variant?: "outline" | "default" }) {
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-xs";
  const variants: Record<string, string> = {
    default: "bg-zinc-900 text-white",
    outline: "border border-zinc-300 text-zinc-700"
  };
  return <span className={`${base} ${variants[variant]} ${className}`} {...rest} />;
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "outline" | "secondary" | "default" }
) {
  const { className = "", variant = "default", ...rest } = props;
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2";
  const variants: Record<string, string> = {
    default: "bg-zinc-900 text-white hover:bg-black",
    outline: "border border-zinc-300 bg-white hover:bg-zinc-50",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...rest} />;
}

export function Tooltip({ children }: { children: React.ReactNode }) { return <>{children}</>; }
export function TooltipProvider({ children }: { children: React.ReactNode }) { return <>{children}</>; }
export function TooltipTrigger({ children }: { children: React.ReactNode }) { return <>{children}</>; }
export function TooltipContent({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 inline-block rounded-md border bg-white px-2 py-1 text-xs text-zinc-700 shadow-sm">{children}</div>;
}

export const Slider: React.FC<{ value: number[]; onValueChange: (v: number[]) => void; min?: number; max?: number; step?: number; className?: string }>
  = ({ value, onValueChange, min = 0, max = 100, step = 1, className = "" }) => (
    <input type="range" value={value[0]} onChange={(e) => onValueChange([Number(e.target.value)])} min={min} max={max} step={step} className={`w-full ${className}`} />
  );

export function Tabs({ children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) {
  return <div>{children}</div>;
}
export function TabsList({ children }: { children: React.ReactNode }) {
  return <div className="inline-flex rounded-md border bg-white p-1">{children}</div>;
}
export function TabsTrigger({ value, onSelect, children }: { value: string; onSelect?: (v: string) => void; children: React.ReactNode }) {
  return (
    <button onClick={() => onSelect && onSelect(value)} className="rounded-sm px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-50">
      {children}
    </button>
  );
}

export function Select(props: { value: string; children: React.ReactNode }) {
  const { value, children } = props;
  return <div data-value={value}>{children}</div>;
}
export function SelectTrigger({ className = "", children, onClick }: React.HTMLAttributes<HTMLDivElement> & { className?: string }) {
  return <div className={`h-9 w-full cursor-default rounded-md border border-zinc-300 bg-white px-3 text-sm ${className}`} onClick={onClick}>{children as React.ReactNode}</div>;
}
export function SelectValue({ placeholder }: { placeholder?: string }) { return <span className="text-zinc-500">{placeholder}</span>; }
export function SelectContent({ children }: { children: React.ReactNode }) { return <div className="mt-2 rounded-md border bg-white p-1 text-sm shadow-sm">{children}</div>; }
export function SelectItem({ value, children, onSelect }: { value: string; children: React.ReactNode; onSelect?: (v: string) => void }) {
  return <div className="cursor-pointer rounded px-2 py-1 hover:bg-zinc-50" onClick={() => onSelect?.(value)}>{children}</div>;
}
