"use client";
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { useEffect } from 'react';

// 声明 OKX 钱包类型
declare global {
  interface Window {
    okxwallet?: {
      solana?: any;
      ethereum?: any;
    };
  }
}

export default function PrivyProviders({ children }: { children: React.ReactNode }) {
	// 检测并处理 OKX 钱包环境
	useEffect(() => {
		if (typeof window !== 'undefined' && window.okxwallet) {
			// 如果在 OKX 钱包环境中，尝试切换到 Solana
			if (window.okxwallet.solana) {
				console.log('OKX Solana wallet detected in provider');
			}
		}
	}, []);

	return (
		<PrivyProvider
			appId="cmbuaflbr00e0jv0mgokwch00"
			config={{
				"appearance": {
					accentColor: "#FCD535",
					theme: "#100c15",
					"showWalletLoginFirst": false,
					logo: "https://newgame.mypinata.cloud/ipfs/bafkreie4d7r3rzbdlr4chhwsfkhdcu5mgqrrae2h7wg2ya44vmdyj3mthu",
					walletChainType: "solana-only",
					"walletList": [
						"okx_wallet",
						"phantom",
					]
				},
				"loginMethods": ["wallet"],
				"fundingMethodConfig": {
					"moonpay": {
						"useSandbox": true
					}
				},
				"embeddedWallets": {
					"showWalletUIs": false,
					"solana": {
						"createOnLogin": "all-users"
					}
				},
				"mfa": {
					"noPromptOnMfaRequired": false
				},
				externalWallets: {
					solana: { connectors: toSolanaWalletConnectors() },
				},
				supportedChains: [],
			}}
		>
			{children}
		</PrivyProvider>
	);
}