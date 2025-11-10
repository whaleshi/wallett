"use client";
import { useEffect, useState } from 'react';
import { OKXUniversalProvider } from "@okxconnect/universal-provider";


export function useOKXSolana() {
  const [okxProvider, setOkxProvider] = useState<any>(null);
  const [isOKXEnvironment, setIsOKXEnvironment] = useState(false);
  const [isForceReady, setIsForceReady] = useState(false);

  useEffect(() => {
    const initOKX = async () => {
      if (typeof window === 'undefined') return;

      // 检测 OKX 环境
      const isOKX = /OKApp/i.test(navigator.userAgent) || (window as any).okxwallet;
      setIsOKXEnvironment(isOKX);

      if (isOKX) {
        console.log('🔍 Detected OKX wallet environment');
        
        try {
          // 强制延迟确保页面完全加载
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 初始化 OKX Universal Provider
          const provider = await OKXUniversalProvider.init({
            dappMetaData: {
              name: "Solana Wallet App",
              icon: "https://newgame.mypinata.cloud/ipfs/bafkreie4d7r3rzbdlr4chhwsfkhdcu5mgqrrae2h7wg2ya44vmdyj3mthu"
            },
          });
          
          setOkxProvider(provider);
          console.log('✅ OKX Universal Provider initialized');

          // 强制等待和重试机制
          let attempts = 0;
          const maxAttempts = 20;
          
          const forceCheck = async () => {
            while (attempts < maxAttempts) {
              attempts++;
              console.log(`🔄 Attempt ${attempts}/${maxAttempts} - Checking OKX Solana wallet`);
              
              if ((window as any).okxwallet?.solana) {
                console.log('✅ OKX Solana wallet found!');
                setIsForceReady(true);
                return;
              }
              
              // 尝试刷新页面来强制重新检测
              if (attempts === 10 && !(window as any).okxwallet?.solana) {
                console.warn('⚠️ OKX Solana wallet not found after 10 attempts, trying page refresh...');
                window.location.reload();
                return;
              }
              
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            console.error('❌ Failed to detect OKX Solana wallet after all attempts');
            setIsForceReady(true); // 继续执行，但显示错误
          };

          await forceCheck();
          
        } catch (error) {
          console.error('❌ Error initializing OKX:', error);
          setIsForceReady(true);
        }
      } else {
        setIsForceReady(true);
      }
    };

    initOKX();
  }, []);

  return {
    okxProvider,
    isOKXEnvironment,
    isForceReady,
    hasSolanaWallet: isOKXEnvironment && (window as any)?.okxwallet?.solana
  };
}