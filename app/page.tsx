"use client";
import { useLogin, usePrivy, WalletWithMetadata } from "@privy-io/react-auth";
import { useWallets, useSignMessage } from '@privy-io/react-auth/solana';
import bs58 from 'bs58';


export default function Home() {
  const { ready, logout } = usePrivy();
  const { wallets } = useWallets();
  const { signMessage } = useSignMessage();
  const { login: toLogin } = useLogin({
    onComplete: async ({ user, isNewUser, wasAlreadyAuthenticated, loginMethod, loginAccount }) => {
      console.log("✅ Login successful:", { user, isNewUser, wasAlreadyAuthenticated, loginMethod, loginAccount });
      if (typeof window !== 'undefined' && !localStorage.getItem("walletAddress")) {
        localStorage.setItem("walletAddress", (loginAccount as WalletWithMetadata)?.address || "");
      }
    },
    onError: (error) => {
      console.error("❌ Login failed:", error);
    },
  });
  console.log(wallets)
  const walletAddress = typeof window !== 'undefined' ? localStorage.getItem("walletAddress") : null;
  console.log(walletAddress, '=====')
  const desiredWallet = wallets.find((wallet) => wallet.address === walletAddress);
  console.log(desiredWallet, '====desiredWallet=')
  if (!ready) {
    return <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">Loading...</div>;
  }

  const handleSignMessage = async () => {
    if (!desiredWallet) {
      console.error("No wallet connected");
      return;
    }

    const message = 'Hello world';
    try {
      const signatureUint8Array = (
        await signMessage({
          message: new TextEncoder().encode(message),
          wallet: desiredWallet,
          options: {
            uiOptions: {
              title: 'Sign this message'
            }
          }
        })
      ).signature;
      const signature = bs58.encode(signatureUint8Array);
      console.log("Signature:", signature);
      alert(`Message signed! Signature: ${signature}`);
    } catch (error) {
      console.error("Failed to sign message:", error);
      alert("Failed to sign message");
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black gap-4">
      <div>Privy is ready!</div>
      {
        desiredWallet ? <div onClick={() => { logout(); if (typeof window !== 'undefined') localStorage.removeItem("walletAddress"); }}>logout</div> : <div onClick={toLogin}>login</div>
      }
      <div>{desiredWallet ? `Logged in with ${desiredWallet?.address}` : "No wallet connected"}</div>
      {desiredWallet && (
        <button 
          onClick={handleSignMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          签名消息
        </button>
      )}
    </div>
  );
}
