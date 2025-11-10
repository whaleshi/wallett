"use client";
import { useLogin, usePrivy, WalletWithMetadata } from "@privy-io/react-auth";
import { useWallets, useSignMessage } from '@privy-io/react-auth/solana';
import bs58 from 'bs58';
import { useEffect, useState } from 'react';
import { useOKXSolana } from '@/hooks/useOKXSolana';

// 声明 OKX 钱包类型
declare global {
  interface Window {
    okxwallet?: {
      solana?: any;
      ethereum?: any;
    };
  }
}

export default function Home() {
  const { ready, logout } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { signMessage } = useSignMessage();
  const { okxProvider, isOKXEnvironment, isForceReady, hasSolanaWallet } = useOKXSolana();

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
  
  if (!ready || !walletsReady || (isOKXEnvironment && !isForceReady)) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black gap-4">
        <div>Loading...</div>
        <div className="text-sm text-gray-600">
          Ready: {ready ? '✅' : '⏳'} | Wallets: {walletsReady ? '✅' : '⏳'} | OKX Ready: {isForceReady ? '✅' : '⏳'}
        </div>
        {isOKXEnvironment && (
          <div className="text-xs text-blue-600">
            🔄 正在强制初始化 OKX Solana 钱包...
            {hasSolanaWallet && <div className="text-green-600">✅ 检测到 Solana 钱包</div>}
          </div>
        )}
      </div>
    );
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
      
      {/* OKX 用户提示 */}
      {isOKXEnvironment && !desiredWallet && (
        <div className="text-center p-4 bg-yellow-100 rounded-lg text-yellow-800 max-w-md">
          <p className="text-sm">
            🚀 在 OKX 钱包中使用此应用，请确保已切换到 <strong>Solana</strong> 网络
          </p>
          <p className="text-xs mt-2">
            如果默认连接了以太坊，请在 OKX 钱包设置中切换到 Solana 网络
          </p>
          {okxProvider && (
            <p className="text-xs mt-2 text-green-600">
              ✅ OKX Universal Provider 已初始化
            </p>
          )}
          {!hasSolanaWallet && (
            <p className="text-xs mt-2 text-red-600">
              ⚠️ 未检测到 Solana 钱包，如果问题持续请尝试刷新页面
            </p>
          )}
        </div>
      )}
      
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
