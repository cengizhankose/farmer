import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { Layout } from "@/components/Layout";
import { WalletProvider } from "@/contexts/WalletContext";
import { Toaster } from "sonner";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider expected="testnet">
      <Layout>
        <Component {...pageProps} />
        <Toaster position="top-center" />
      </Layout>
    </WalletProvider>
  );
}

