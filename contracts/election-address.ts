import { sepolia, avalancheFuji } from "wagmi/chains";

export const electionAddress = {
  [sepolia.id]: "0x76544044e5BF1c785614fa2240D5efAD08675f21" as `0x${string}`,
  [avalancheFuji.id]:
    "0xed7eA5221041A1982d9d257c9617B1448032838d" as `0x${string}`,
  // Add more networks as needed
} as const;

export const SUPPORTED_CHAINS = [sepolia.id, avalancheFuji.id] as const;
