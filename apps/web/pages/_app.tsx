import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { Layout } from "@/components/Layout";
import { WalletProvider } from "@/contexts/WalletContext";
import { Toaster } from "sonner";
import { inter } from "@/fonts";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.variable}`}>
      <WalletProvider expected="testnet">
        <Layout>
          <Component {...pageProps} />
          <Toaster position="top-center" />
        </Layout>
      </WalletProvider>
    </div>
  );
}

