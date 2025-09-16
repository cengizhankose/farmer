"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Addresses = any;

type WalletCtx = {
  installed: boolean;
  connecting: boolean;
  addresses: Addresses | null;
  stxAddress: string | null;
  btcAddress: string | null;
  connect: () => Promise<void> | void;
  disconnect: () => void;
  network: "mainnet" | "testnet" | null;
  expected: "mainnet" | "testnet";
  networkMismatch: boolean;
  error: string | null;
};

const WalletContext = createContext<WalletCtx | undefined>(undefined);

function detectLeather() {
  if (typeof window === "undefined") return false;
  return !!(window as any).LeatherProvider;
}

function parseNetworkFromAddress(stxAddress?: string | null) {
  if (!stxAddress) return null;
  if (stxAddress.startsWith("SP")) return "mainnet" as const;
  if (stxAddress.startsWith("ST")) return "testnet" as const;
  return null;
}

export const WalletProvider = ({ children, expected = "testnet" as const }: React.PropsWithChildren<{ expected?: "mainnet" | "testnet" }>) => {
  const [installed, setInstalled] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [addresses, setAddresses] = useState<Addresses | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInstalled(detectLeather());
    try {
      const cache = JSON.parse(localStorage.getItem("leather_addresses") || "null");
      if (cache) setAddresses(cache);
    } catch {}
  }, []);

  const network = useMemo(() => {
    const stx = (addresses as any)?.stx?.[0]?.address as string | undefined;
    return parseNetworkFromAddress(stx);
  }, [addresses]);

  const networkMismatch = useMemo(() => {
    return !!network && expected && network !== expected;
  }, [network, expected]);

  const connect = useCallback(async () => {
    if (!installed) {
      toast("Leather not found", { description: "Install Leather wallet to connect" });
      window.open("https://leather.io", "_blank");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const resp = await (window as any).LeatherProvider.request("getAddresses", {});
      if (!resp || !resp.addresses) throw new Error("No addresses returned");
      setAddresses(resp.addresses);
      localStorage.setItem("leather_addresses", JSON.stringify(resp.addresses));
      toast("Wallet connected", { description: "Leather connected successfully" });
    } catch (e: any) {
      console.error("Leather connect error", e);
      setError(e?.message || "Failed to connect");
      toast("Connection failed", { description: e?.message || "Unknown error" });
    } finally {
      setConnecting(false);
    }
  }, [installed]);

  const disconnect = useCallback(() => {
    setAddresses(null);
    localStorage.removeItem("leather_addresses");
    toast("Disconnected", { description: "Wallet session cleared" });
  }, []);

  const stxAddress = (addresses as any)?.stx?.[0]?.address || null;
  const btcAddress = (addresses as any)?.btc?.[0]?.address || null;

  const value = useMemo<WalletCtx>(
    () => ({
      installed,
      connecting,
      addresses,
      stxAddress,
      btcAddress,
      connect,
      disconnect,
      network,
      expected,
      networkMismatch,
      error,
    }),
    [installed, connecting, addresses, stxAddress, btcAddress, connect, disconnect, network, expected, networkMismatch, error]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
};

