"use client";
import { useEffect, useState } from 'react';
import { OKXUniversalProvider } from "@okxconnect/universal-provider";


export function useOKXSolana() {
  const [okxProvider, setOkxProvider] = useState<any>(null);
  const [isOKXEnvironment, setIsOKXEnvironment] = useState(false);
  const [isForceReady, setIsForceReady] = useState(false);
  const [hasRefreshed, setHasRefreshed] = useState(false);

  useEffect(() => {
    const initOKX = async () => {
      if (typeof window === 'undefined') return;

      // 检测 OKX 环境和平台
      const isOKX = /OKApp/i.test(navigator.userAgent) || (window as any).okxwallet;
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      // 检查是否已经刷新过
      const refreshKey = 'okx_ios_refreshed';
      const hasAlreadyRefreshed = localStorage.getItem(refreshKey) === 'true';
      setHasRefreshed(hasAlreadyRefreshed);
      
      setIsOKXEnvironment(isOKX);

      if (isOKX) {
        console.log('🔍 Detected OKX wallet environment');
        console.log('📱 Platform:', isIOS ? 'iOS' : isAndroid ? 'Android' : 'Unknown');
        console.log('🔄 Has refreshed:', hasAlreadyRefreshed);
        
        // 如果是 iOS 且没有刷新过，先快速检测一次
        if (isIOS && !hasAlreadyRefreshed) {
          console.log('🍎 iOS 首次加载，快速检测 Solana 钱包...');
          
          // 快速检测
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (!(window as any).okxwallet?.solana) {
            console.log('🔄 iOS 未检测到 Solana 钱包，执行无感刷新...');
            localStorage.setItem(refreshKey, 'true');
            localStorage.setItem(`${refreshKey}_time`, Date.now().toString());
            // 清除其他可能的缓存
            localStorage.removeItem('walletAddress');
            window.location.reload();
            return;
          } else {
            console.log('✅ iOS 首次检测到 Solana 钱包');
            // 如果检测到了，清除刷新标记
            localStorage.removeItem(refreshKey);
          }
        }
        
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
          const maxAttempts = isIOS ? (hasAlreadyRefreshed ? 15 : 30) : 20; // iOS 刷新后减少重试
          const retryDelay = isIOS ? 800 : 500; // iOS 更长间隔
          const refreshAttempt = isIOS ? (hasAlreadyRefreshed ? 999 : 15) : 10; // iOS 刷新后不再刷新
          
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
    
    // 清理过期的刷新标记 (5分钟后)
    const cleanupRefreshFlag = () => {
      const refreshKey = 'okx_ios_refreshed';
      const refreshTime = localStorage.getItem(`${refreshKey}_time`);
      if (refreshTime) {
        const now = Date.now();
        const elapsed = now - parseInt(refreshTime);
        if (elapsed > 5 * 60 * 1000) { // 5分钟
          localStorage.removeItem(refreshKey);
          localStorage.removeItem(`${refreshKey}_time`);
        }
      }
    };
    
    cleanupRefreshFlag();
  }, []);

  return {
    okxProvider,
    isOKXEnvironment,
    isForceReady,
    hasSolanaWallet: isOKXEnvironment && (window as any)?.okxwallet?.solana
  };
}