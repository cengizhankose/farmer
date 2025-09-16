"use client";
import React from "react";
import Link from "next/link";
import { useWallet } from "@/contexts/WalletContext";

function Button(
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

function Badge(
  props: React.HTMLAttributes<HTMLSpanElement> & { variant?: "outline" | "default" }
) {
  const { className = "", variant = "default", ...rest } = props;
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-xs";
  const variants: Record<string, string> = {
    default: "bg-zinc-900 text-white",
    outline: "border border-zinc-300 text-zinc-700"
  };
  return <span className={`${base} ${variants[variant]} ${className}`} {...rest} />;
}

export const ChainGuardBanner = () => {
  const { networkMismatch, network, expected } = useWallet();
  if (!networkMismatch) return null;
  return (
    <div className="relative z-30 w-full border-b border-orange-300 bg-orange-50/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-2 text-sm text-orange-900">
        Network mismatch: Wallet on <strong>{network}</strong> but app expects <strong>{expected}</strong>. Open Leather &gt; Settings &gt; Network and switch. Refresh after switching.
      </div>
    </div>
  );
};

const ConnectButton = () => {
  const { installed, connecting, stxAddress, connect, disconnect } = useWallet();
  const short = (a?: string | null) => (a ? `${a.slice(0, 5)}…${a.slice(-4)}` : "");

  if (!installed) {
    return (
      <Button variant="outline" onClick={() => window.open("https://leather.io", "_blank")} className="border-orange-300 text-zinc-800 hover:bg-orange-50">
        Install Leather
      </Button>
    );
  }

  if (stxAddress) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-zinc-900 text-white">{short(stxAddress)}</Badge>
        <Button variant="secondary" onClick={disconnect} className="gap-2">
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => void connect()} disabled={connecting} className="gap-2 bg-zinc-900 text-white hover:bg-black">
      {connecting ? "Connecting…" : "Connect Leather"}
    </Button>
  );
};

export const Header = () => {
  const { network } = useWallet();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/60 bg-white/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="font-semibold tracking-tight text-zinc-900">
          Stacks Opportunities
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/opportunities" className="text-zinc-600 hover:text-zinc-900">Opportunities</Link>
          <Link href="/portfolio" className="text-zinc-600 hover:text-zinc-900">Portfolio</Link>
          <Badge variant="outline" className="cursor-default border-zinc-300 text-zinc-700">{network || "—"}</Badge>
          <ConnectButton />
        </nav>
      </div>
      <ChainGuardBanner />
    </header>
  );
};

export const Footer = () => (
  <footer className="relative mt-28 bg-zinc-950 text-zinc-200">
    <div className="pointer-events-none absolute -top-10 left-0 right-0 h-10">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="0,100 100,0 100,100" fill="#0a0a0a" />
      </svg>
    </div>
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div>
          <div className="font-[Sora] text-xl text-white">Stacks Opportunities</div>
          <p className="mt-2 max-w-sm text-sm text-zinc-400">Minimal, luxurious interfaces for yield. Clarity over noise.</p>
        </div>
        <div className="text-sm text-zinc-400">
          <div className="text-zinc-300">Navigation</div>
          <div className="mt-2 flex flex-col gap-1">
            <Link href="/opportunities" className="hover:text-white">Opportunities</Link>
            <Link href="/portfolio" className="hover:text-white">Portfolio</Link>
          </div>
        </div>
        <div className="text-sm text-zinc-400">
          <div className="text-zinc-300">Status</div>
          <p className="mt-2 max-w-xs">Beta UI, non‑custodial routing. One‑click router coming soon.</p>
        </div>
      </div>
      <div className="mt-10 border-t border-white/10 pt-6 text-xs text-zinc-500">© {new Date().getFullYear()} Stacks Opportunities</div>
    </div>
  </footer>
);

export const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};
