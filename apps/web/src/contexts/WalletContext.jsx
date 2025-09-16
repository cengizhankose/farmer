import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Wallet context implements Leather (Hiro) integration using the injected provider.
// No backend required. Read-only fallback + chain guard included.

const WalletContext = createContext(undefined);

function detectLeather() {
  if (typeof window === "undefined") return false;
  return !!window.LeatherProvider;
}

function parseNetworkFromAddress(stxAddress) {
  if (!stxAddress) return null;
  if (stxAddress.startsWith("SP")) return "mainnet";
  if (stxAddress.startsWith("ST")) return "testnet";
  return null;
}

export const WalletProvider = ({ children, expected = "testnet" }) => {
  const [installed, setInstalled] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [addresses, setAddresses] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setInstalled(detectLeather());
    // restore from localStorage
    try {
      const cache = JSON.parse(localStorage.getItem("leather_addresses") || "null");
      if (cache) setAddresses(cache);
    } catch {}
  }, []);

  const network = useMemo(() => {
    const stx = addresses?.stx?.[0]?.address;
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
      // Leather provider request to get addresses
      const resp = await window.LeatherProvider.request("getAddresses", {});
      if (!resp || !resp.addresses) throw new Error("No addresses returned");
      setAddresses(resp.addresses);
      localStorage.setItem("leather_addresses", JSON.stringify(resp.addresses));
      toast("Wallet connected", { description: "Leather connected successfully" });
    } catch (e) {
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

  const stxAddress = addresses?.stx?.[0]?.address || null;
  const btcAddress = addresses?.btc?.[0]?.address || null;

  const value = useMemo(
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