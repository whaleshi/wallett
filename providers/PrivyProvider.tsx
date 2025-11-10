"use client";
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

export default function PrivyProviders({ children }: { children: React.ReactNode }) {
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
						"detected_solana_wallets",
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
			}}
		>
			{children}
		</PrivyProvider>
	);
}