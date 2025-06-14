// utils/config.ts
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "wagmi/chains";
import { cookieStorage, createStorage, createConfig, http } from "wagmi";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

// Option 1: Use getDefaultConfig (simpler, recommended)
export const getConfig = () =>
  getDefaultConfig({
    appName: "Vots Engine App",
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
    chains: [mainnet, sepolia, polygon, optimism, arbitrum, base],
    ssr: true,
  });

// Option 2: Use createConfig for full control (if you need specific connectors)
export const getConfigCustom = () =>
  createConfig({
    chains: [mainnet, sepolia, polygon, optimism, arbitrum, base],
    connectors: [
      injected(),
      coinbaseWallet({
        appName: "Vots Engine App",
      }),
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
      }),
    ],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [polygon.id]: http(),
      [optimism.id]: http(),
      [arbitrum.id]: http(),
      [base.id]: http(),
    },
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
  });

// Type declaration
declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
