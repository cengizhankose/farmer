import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { Layout } from "@/components/Layout";
import { WalletProvider } from "@/contexts/WalletContext";
import { CompareProvider } from "@/components/opportunity/CompareBar";
import { Toaster } from "sonner";
import { inter } from "@/fonts";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <div className={`${inter.variable} min-h-full`}>
        <WalletProvider expected="testnet">
          <CompareProvider>
            <Layout>
              <Component {...pageProps} />
              <Toaster position="top-center" />
            </Layout>
          </CompareProvider>
        </WalletProvider>
      </div>
    </ErrorBoundary>
  );
}
