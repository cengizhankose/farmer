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
    <div className={`relative z-30 w-full border-b border-[${colors.orange[300]}] bg-[${colors.orange[50] || colors.orange[100]}]/80 backdrop-blur-xl`}>
      <div className={`mx-auto max-w-7xl px-6 py-2 text-sm text-[${colors.orange[700]}]`}>
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
        className={`group relative h-9 w-34 overflow-hidden rounded-md bg-transparent backdrop-blur-[40px] px-3 text-left text-sm font-bold text-[${colors.ui.navText}] duration-500`}
        aria-label="Install Leather"
      >
        Install Leather
      </button>
    );
  }

  if (stxAddress) {
    return (
      <div className="flex items-center gap-2">
        <Badge className={`bg-[${colors.zinc[900]}] text-[${colors.white.DEFAULT}]`}>{short(stxAddress)}</Badge>
        <Button variant="secondary" onClick={disconnect} className="gap-2">
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => void connect()}
      disabled={connecting}
      className="gap-2 bg-black text-white hover:bg-zinc-800"
    >
      {connecting ? "Connecting…" : "Connect Leather"}
    </Button>
  );
};

export const Header = () => {
  useWallet();
  return (
    <header className={`site-header sticky top-0 z-40 w-full border-b border-[${colors.zinc[200]}]/60 bg-[${colors.white.DEFAULT}]/70 backdrop-blur-2xl`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className={`font-semibold tracking-tight text-[${colors.zinc[900]}]`}>
          Stacks Opportunities
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/opportunities"
            className={`text-[${colors.zinc[600]}] hover:text-[${colors.zinc[900]}]`}
          >
            Opportunities
          </Link>
          <Link href="/portfolio" className={`text-[${colors.zinc[600]}] hover:text-[${colors.zinc[900]}]`}>
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
  <footer className="relative mt-0 text-white" style={{ backgroundColor: colors.black.footer }}>
    <div className="pointer-events-none absolute -top-9 left-0 right-0 h-12">
      {/*
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 358"
        preserveAspectRatio="none"
      >
        <polygon points="0,270 100,0 100,300" fill={colors.ui.dividerPolygon} />
      </svg>
      */}
    </div>
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div>
          <div className="font-[Sora] text-xl text-white">
            Stacks Opportunities
          </div>
          <p className="mt-2 max-w-sm text-sm text-white">
            Minimal, luxurious interfaces for yield. Clarity over noise.
          </p>
        </div>
        <div className="text-sm text-white">
          <div className="text-white font-medium">Navigation</div>
          <div className="mt-2 flex flex-col gap-1">
            <Link href="/opportunities" className="text-white hover:text-orange-300">
              Opportunities
            </Link>
            <Link href="/portfolio" className="text-white hover:text-orange-300">
              Portfolio
            </Link>
          </div>
        </div>
        <div className="text-sm text-white">
          <div className="text-white font-medium">Status</div>
          <p className="mt-2 max-w-xs">
            Beta UI, non‑custodial routing. One‑click router coming soon.
          </p>
        </div>
      </div>
      <div className="mt-10 pt-6 text-xs text-white">
        © {new Date().getFullYear()} Stacks Opportunities
      </div>
    </div>
  </footer>
);

export const Layout = ({ children }: React.PropsWithChildren) => {
  // Slow down global scroll 2x; keep it accessible
  useSlowScroll({ factor: 0.5, enabled: true });
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};
