import { PublicKey } from "@solana/web3.js";
import { apiRequest } from "./queryClient";

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      signMessage: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>;
      request?: (args: { method: string; params: any }) => Promise<any>;
      publicKey?: PublicKey;
      isConnected?: boolean;
    };
    solflare?: {
      isSolflare?: boolean;
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      signMessage: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>;
      publicKey?: PublicKey;
      isConnected?: boolean;
    };
  }
}

export type WalletProvider = "phantom" | "solflare";

export function getAvailableWallets(): WalletProvider[] {
  const wallets: WalletProvider[] = [];
  if (window.solana?.isPhantom) wallets.push("phantom");
  if (window.solflare?.isSolflare) wallets.push("solflare");
  return wallets;
}

export function getWallet(provider: WalletProvider) {
  if (provider === "phantom" && window.solana?.isPhantom) {
    return window.solana;
  }
  if (provider === "solflare" && window.solflare?.isSolflare) {
    return window.solflare;
  }
  return null;
}

export async function connectWallet(provider: WalletProvider): Promise<string | null> {
  const wallet = getWallet(provider);
  if (!wallet) {
    window.open(
      provider === "phantom" 
        ? "https://phantom.app/" 
        : "https://solflare.com/",
      "_blank"
    );
    return null;
  }

  try {
    const response = await wallet.connect();
    return response.publicKey.toBase58();
  } catch (error) {
    console.error("Wallet connect error:", error);
    return null;
  }
}

export async function disconnectWallet(provider: WalletProvider): Promise<void> {
  const wallet = getWallet(provider);
  if (wallet) {
    try {
      await wallet.disconnect();
    } catch (error) {
      console.error("Wallet disconnect error:", error);
    }
  }
}

export async function signMessage(
  provider: WalletProvider,
  message: string
): Promise<{ signature: string; publicKey: string } | null> {
  const wallet = getWallet(provider);
  if (!wallet || !wallet.publicKey) {
    console.error("Sign message error: wallet not connected or no publicKey");
    return null;
  }

  try {
    const messageBytes = new TextEncoder().encode(message);
    let signature: Uint8Array;
    
    if (provider === "phantom" && wallet.request) {
      const response = await wallet.request({
        method: "signMessage",
        params: {
          message: messageBytes,
          display: "utf8",
        },
      });
      signature = response.signature;
    } else {
      const result = await wallet.signMessage(messageBytes, "utf8");
      signature = result.signature;
    }
    
    return {
      signature: Buffer.from(signature).toString("base64"),
      publicKey: Buffer.from(wallet.publicKey.toBytes()).toString("base64"),
    };
  } catch (error: any) {
    console.error("Sign message error:", error?.message || error);
    return null;
  }
}

export async function authenticateWithWallet(
  provider: WalletProvider
): Promise<{ user: any; token: string } | null> {
  try {
    const walletAddress = await connectWallet(provider);
    if (!walletAddress) return null;

    const challengeRes = await apiRequest("POST", "/api/auth/wallet/challenge", {
      walletAddress,
    });
    const { challenge } = await challengeRes.json();

    const signResult = await signMessage(provider, challenge);
    if (!signResult) return null;

    const verifyRes = await apiRequest("POST", "/api/auth/wallet/verify", {
      walletAddress,
      challenge,
      signature: signResult.signature,
      publicKey: signResult.publicKey,
    });

    if (!verifyRes.ok) {
      throw new Error("Verification failed");
    }

    return verifyRes.json();
  } catch (error) {
    console.error("Wallet authentication error:", error);
    return null;
  }
}
