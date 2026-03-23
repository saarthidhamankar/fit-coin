import { ethers } from 'ethers';

const SEPOLIA_CHAIN_ID = '0xaa36a7';

export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && (window as any).ethereum !== undefined;
};

export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    console.warn('MetaMask not detected. Using Demo Wallet.');
    const mockAddress = "0xDemo" + Math.random().toString(16).slice(2, 10).toUpperCase();
    return mockAddress;
  }
  
  try {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    await switchToSepolia();
    return accounts[0];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to connect wallet');
  }
};

export const switchToSepolia = async () => {
  if (!isMetaMaskInstalled()) return;
  
  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Test Network',
              nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      } catch (addError) {
        throw new Error('Failed to add Sepolia network');
      }
    }
  }
};

/**
 * Wallet simulation synced with backend.
 * While actual tokens would be on-chain, for this app
 * the profile document in Firestore is the source of truth.
 */
export const getBalance = async (address: string) => {
  if (typeof window === 'undefined') return 0;
  // Local cache for instant feedback
  const localBalance = localStorage.getItem(`fitcoin_balance_${address}`);
  return parseFloat(localBalance || "0");
};

export const rewardUser = async (address: string, amount: number) => {
  console.log(`Rewarding ${amount} FIT to ${address}...`);
  const current = await getBalance(address);
  const newBalance = current + amount;
  localStorage.setItem(`fitcoin_balance_${address}`, newBalance.toString());
  return newBalance;
};

export const spendTokens = async (address: string, amount: number) => {
  const current = await getBalance(address);
  const newBalance = Math.max(0, current - amount);
  localStorage.setItem(`fitcoin_balance_${address}`, newBalance.toString());
  return newBalance;
};

export const penalizeUser = async (address: string, amount: number) => {
  console.log(`Penalizing ${amount} FIT from ${address} due to streak break...`);
  return spendTokens(address, amount);
};
