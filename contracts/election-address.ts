import { sepolia, avalancheFuji } from "wagmi/chains";

export const electionAddress = {
  [sepolia.id]: "0xa08970f08D8C19b546A57c207600261e77b8f644" as `0x${string}`,
  [avalancheFuji.id]:
    "0xed7eA5221041A1982d9d257c9617B1448032838d" as `0x${string}`,
  // Add more networks as needed
} as const;

export const SUPPORTED_CHAINS = [sepolia.id, avalancheFuji.id] as const;
