
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Placeholder for actual deployment
const CONTRACT_ABI: any[] = []; // Standard ERC20 ABI would go here

const SEPOLIA_CHAIN_ID = '0xaa36a7';

export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && (window as any).ethereum !== undefined;
};

export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
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
    // This error code indicates that the chain has not been added to MetaMask.
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
  // Simulating blockchain fetch for FIT tokens
  // In a real app, we'd use ethers to call the contract:
  // const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  // return await contract.balanceOf(address);
  const localBalance = localStorage.getItem(`fitcoin_balance_${address}`);
  return parseFloat(localBalance || "0");
};

export const rewardUser = async (address: string, amount: number) => {
  // Simulating on-chain transaction
  console.log(`Rewarding ${amount} FIT to ${address} on Sepolia...`);
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
  
  const current = await getBalance(address);
  const newBalance = current + amount;
  localStorage.setItem(`fitcoin_balance_${address}`, newBalance.toString());
  
  // Track activity
  const activity = JSON.parse(localStorage.getItem(`fitcoin_activity_${address}`) || "[]");
  activity.unshift({
    type: 'Workout Reward',
    amount: amount,
    date: new Date().toISOString(),
    txHash: '0x' + Math.random().toString(16).slice(2, 66)
  });
  localStorage.setItem(`fitcoin_activity_${address}`, JSON.stringify(activity.slice(0, 10)));
  
  return newBalance;
};

export const spendTokens = async (address: string, amount: number) => {
  const current = await getBalance(address);
  if (current < amount) throw new Error("Insufficient balance");
  
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate tx
  
  const newBalance = current - amount;
  localStorage.setItem(`fitcoin_balance_${address}`, newBalance.toString());
  
  // Track activity
  const activity = JSON.parse(localStorage.getItem(`fitcoin_activity_${address}`) || "[]");
  activity.unshift({
    type: 'Shop Purchase',
    amount: -amount,
    date: new Date().toISOString(),
    txHash: '0x' + Math.random().toString(16).slice(2, 66)
  });
  localStorage.setItem(`fitcoin_activity_${address}`, JSON.stringify(activity.slice(0, 10)));
  
  return newBalance;
};
