"use client";
import { useLogin, usePrivy, WalletWithMetadata } from "@privy-io/react-auth";
import { useWallets, useSignMessage } from '@privy-io/react-auth/solana';
import bs58 from 'bs58';
import { useEffect, useState } from 'react';
import { OKXUniversalProvider } from "@okxconnect/universal-provider";

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
  const [okxProvider, setOkxProvider] = useState<any>(null);

  // 初始化 OKX Universal Provider
  useEffect(() => {
    const initOKXProvider = async () => {
      if (typeof window !== 'undefined') {
        // 检查是否在 OKX 钱包环境
        const isOKX = /OKApp/i.test(navigator.userAgent) || window.okxwallet;
        
        if (isOKX) {
          console.log('Detected OKX wallet environment');
          
          try {
            // 初始化 OKX Universal Provider
            const okxUniversalProvider = await OKXUniversalProvider.init({
              dappMetaData: {
                name: "Solana Wallet App",
                icon: "https://newgame.mypinata.cloud/ipfs/bafkreie4d7r3rzbdlr4chhwsfkhdcu5mgqrrae2h7wg2ya44vmdyj3mthu"
              },
            });
            
            setOkxProvider(okxUniversalProvider);
            console.log('OKX Universal Provider initialized');
            
            // 等待 OKX 钱包完全加载
            const waitForOKXWallet = () => {
              return new Promise((resolve) => {
                if (window.okxwallet?.solana) {
                  resolve(window.okxwallet.solana);
                  return;
                }
                
                let attempts = 0;
                const interval = setInterval(() => {
                  attempts++;
                  if (window.okxwallet?.solana || attempts > 50) {
                    clearInterval(interval);
                    resolve(window.okxwallet?.solana);
                  }
                }, 100);
              });
            };
            
            const solanaWallet = await waitForOKXWallet();
            if (solanaWallet) {
              console.log('OKX Solana wallet ready');
            } else {
              console.warn('OKX Solana wallet not found, user may need to switch manually');
            }
            
          } catch (error) {
            console.error('Error initializing OKX Universal Provider:', error);
          }
        }
      }
    };
    
    initOKXProvider();
  }, []);
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
  
  if (!ready || !walletsReady) {
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
      
      {/* OKX 用户提示 */}
      {typeof window !== 'undefined' && (/OKApp/i.test(navigator.userAgent) || window.okxwallet) && !desiredWallet && (
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
