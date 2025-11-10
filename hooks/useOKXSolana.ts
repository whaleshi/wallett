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

      // 检测 OKX 环境和平台
      const isOKX = /OKApp/i.test(navigator.userAgent) || (window as any).okxwallet;
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      setIsOKXEnvironment(isOKX);

      if (isOKX) {
        console.log('🔍 Detected OKX wallet environment');
        console.log('📱 Platform:', isIOS ? 'iOS' : isAndroid ? 'Android' : 'Unknown');
        
        try {
          // iOS 需要更长的延迟
          const initialDelay = isIOS ? 2000 : 1000;
          await new Promise(resolve => setTimeout(resolve, initialDelay));
          
          // 初始化 OKX Universal Provider
          const provider = await OKXUniversalProvider.init({
            dappMetaData: {
              name: "Solana Wallet App",
              icon: "https://newgame.mypinata.cloud/ipfs/bafkreie4d7r3rzbdlr4chhwsfkhdcu5mgqrrae2h7wg2ya44vmdyj3mthu"
            },
          });
          
          setOkxProvider(provider);
          console.log('✅ OKX Universal Provider initialized');

          // iOS 和 Android 使用不同的重试策略
          let attempts = 0;
          const maxAttempts = isIOS ? 30 : 20; // iOS 更多尝试次数
          const retryDelay = isIOS ? 800 : 500; // iOS 更长间隔
          const refreshAttempt = isIOS ? 15 : 10; // iOS 更晚刷新
          
          const forceCheck = async () => {
            while (attempts < maxAttempts) {
              attempts++;
              console.log(`🔄 [${isIOS ? 'iOS' : 'Android'}] Attempt ${attempts}/${maxAttempts} - Checking OKX Solana wallet`);
              
              if ((window as any).okxwallet?.solana) {
                console.log('✅ OKX Solana wallet found!');
                setIsForceReady(true);
                return;
              }
              
              // iOS 需要特殊处理
              if (isIOS && attempts === 5) {
                console.log('🍎 iOS: 尝试手动触发钱包检测...');
                // 触发一个用户交互来唤醒钱包
                try {
                  document.body.click();
                } catch (e) {
                  console.log('无法触发点击事件');
                }
              }
              
              // 尝试刷新页面来强制重新检测
              if (attempts === refreshAttempt && !(window as any).okxwallet?.solana) {
                console.warn(`⚠️ OKX Solana wallet not found after ${refreshAttempt} attempts, trying page refresh...`);
                window.location.reload();
                return;
              }
              
              await new Promise(resolve => setTimeout(resolve, retryDelay));
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