
import { ethers } from 'ethers';

const SEPOLIA_CHAIN_ID = '0xaa36a7';

export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && (window as any).ethereum !== undefined;
};

export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    // Demo Fallback: Allow users to experience the app without MetaMask
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

export const getBalance = async (address: string) => {
  if (typeof window === 'undefined') return 0;
  const localBalance = localStorage.getItem(`fitcoin_balance_${address}`);
  return parseFloat(localBalance || "0");
};

export const rewardUser = async (address: string, amount: number) => {
  console.log(`Rewarding ${amount} FIT to ${address}...`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const current = await getBalance(address);
  const newBalance = current + amount;
  localStorage.setItem(`fitcoin_balance_${address}`, newBalance.toString());
  
  return newBalance;
};

export const spendTokens = async (address: string, amount: number) => {
  const current = await getBalance(address);
  if (current < amount) throw new Error("Insufficient FIT balance");
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newBalance = current - amount;
  localStorage.setItem(`fitcoin_balance_${address}`, newBalance.toString());
  
  return newBalance;
};
