"use client";
import React from "react";
import Link from "next/link";
import { useWallet } from "@/contexts/WalletContext";
import { useSlowScroll } from "@/hooks/useSlowScroll";
import { colors, buttonColors } from "../lib/colors";

function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "outline" | "secondary" | "default";
  }
) {
  const { className = "", variant = "default", ...rest } = props;
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2";
  const variants: Record<string, string> = {
    default: `bg-[${buttonColors.default.bg}] text-[${buttonColors.default.text}] hover:bg-[${buttonColors.default.hover}]`,
    outline: `border border-[${buttonColors.outline.border}] bg-[${buttonColors.outline.bg}] hover:bg-[${buttonColors.outline.hover}]`,
    secondary: `bg-[${buttonColors.secondary.bg}] text-[${buttonColors.secondary.text}] hover:bg-[${buttonColors.secondary.hover}]`,
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest} />
  );
}

function Badge(
  props: React.HTMLAttributes<HTMLSpanElement> & {
    variant?: "outline" | "default";
  }
) {
  const { className = "", variant = "default", ...rest } = props;
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-xs";
  const variants: Record<string, string> = {
    default: `bg-[${colors.zinc[900]}] text-[${colors.white.DEFAULT}]`,
    outline: `border border-[${colors.zinc[300]}] text-[${colors.zinc[700]}]`,
  };
  return (
    <span className={`${base} ${variants[variant]} ${className}`} {...rest} />
  );
}

export const ChainGuardBanner = () => {
  const { networkMismatch, network, expected } = useWallet();
  if (!networkMismatch) return null;
  return (
    <div
      className={`relative z-30 w-full border-b border-[${
        colors.orange[300]
      }] bg-[${colors.orange[50] || colors.orange[100]}]/80 backdrop-blur-xl`}
    >
      <div
        className={`mx-auto max-w-7xl px-6 py-2 text-sm text-[${colors.orange[700]}]`}
      >
        Network mismatch: Wallet on <strong>{network}</strong> but app expects{" "}
        <strong>{expected}</strong>. Open Leather &gt; Settings &gt; Network and
        switch. Refresh after switching.
      </div>
    </div>
  );
};

const ConnectButton = () => {
  const { installed, connecting, stxAddress, connect, disconnect } =
    useWallet();
  const short = (a?: string | null) =>
    a ? `${a.slice(0, 5)}…${a.slice(-4)}` : "";

  if (!installed) {
    return (
      <button
        onClick={() => window.open("https://leather.io", "_blank")}
        className="group relative h-9 w-34 overflow-hidden rounded-md bg-white/20 backdrop-blur-[40px] px-3 text-left text-sm font-bold text-white duration-500 hover:bg-white/30"
        aria-label="Install Leather"
      >
        Install Leather
      </button>
    );
  }

  if (stxAddress) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-white/20 text-white backdrop-blur">
          {short(stxAddress)}
        </Badge>
        <Button
          variant="secondary"
          onClick={disconnect}
          className="gap-2 bg-white/20 text-white hover:bg-white/30 backdrop-blur"
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => void connect()}
      disabled={connecting}
      className="gap-2 bg-white/20 text-white hover:bg-white/30 backdrop-blur"
    >
      {connecting ? "Connecting…" : "Connect Leather"}
    </Button>
  );
};

export const Header = () => {
  useWallet();
  return (
    <header
      className="site-header sticky top-0 z-40 w-full backdrop-blur-2xl"
      style={{
        background: colors.gradients.orangeToBlack,
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="font-semibold tracking-tight text-white">
          Stacks Opportunities
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/opportunities"
            className="text-white/80 hover:text-white transition-colors"
          >
            Opportunities
          </Link>
          <Link
            href="/portfolio"
            className="text-white/80 hover:text-white transition-colors"
          >
            Portfolio
          </Link>
          <ConnectButton />
        </nav>
      </div>
      <ChainGuardBanner />
    </header>
  );
};

export const Footer = () => (
  <footer
    className="relative mt-0 text-white border-t border-white/5"
    style={{ 
      background: `linear-gradient(to bottom, ${colors.black.footer}, #000000)`
    }}
  >
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-xl text-white mb-3">
            Stacks Opportunities
          </div>
          <p className="text-sm text-white/70 max-w-md leading-relaxed">
            Production-grade yield tooling on Stacks. Built with security, 
            transparency and user control at the forefront.
          </p>
          <div className="mt-4 flex gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/10 text-white/80 rounded-full backdrop-blur-sm border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Audited
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/10 text-white/80 rounded-full backdrop-blur-sm border border-white/20">
              Non-custodial
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/10 text-white/80 rounded-full backdrop-blur-sm border border-white/20">
              Per-tx cap
            </span>
          </div>
        </div>
        
        <div>
          <div className="text-white font-semibold text-sm mb-3">Quick Links</div>
          <div className="flex flex-col gap-2">
            <Link
              href="/opportunities"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Explore Opportunities
            </Link>
            <Link
              href="/portfolio"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              View Portfolio
            </Link>
            <a
              href="#"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Documentation
            </a>
            <a
              href="#"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Smart Contract Audit
            </a>
          </div>
        </div>
        
        <div>
          <div className="text-white font-semibold text-sm mb-3">Legal</div>
          <div className="flex flex-col gap-2">
            <a
              href="#"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Security Disclosures
            </a>
            <a
              href="#"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Report an Issue
            </a>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-xs text-white/50">
          © 2025 Stacks Opportunities. Built on Stacks. All rights reserved.
        </div>
        <div className="flex gap-6 text-xs text-white/50">
          <span>Non-custodial</span>
          <span>•</span>
          <span>0.3% protocol fee + gas</span>
          <span>•</span>
          <span>No hidden charges</span>
        </div>
      </div>
    </div>
  </footer>
);

export const Layout = ({ children }: React.PropsWithChildren) => {
  // Disable slow scroll to fix browser native scrolling issues
  useSlowScroll({ factor: 0.5, enabled: false });
  return (
    <div className="min-h-full flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
