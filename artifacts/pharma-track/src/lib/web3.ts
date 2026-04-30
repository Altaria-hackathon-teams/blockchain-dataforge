import { BrowserProvider, JsonRpcProvider, Contract, ethers } from 'ethers';

// You will need to replace this with your deployed contract address
export const PHARMA_CHAIN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Default hardhat address for first deploy

// ABI for the PharmaChain contract
export const PHARMA_CHAIN_ABI = [
  "function registerRole(string memory _role) public",
  "function mintBatch(string memory _batchId, uint256 _predictedDemandScore, string memory _suggestedRouteHash) public",
  "function updateTransit(string memory _batchId) public",
  "function confirmDelivery(string memory _batchId) public",
  "function medications(string memory) public view returns (string batchId, address manufacturer, address currentHolder, uint8 status, uint256 predictedDemandScore, string suggestedRouteHash)",
  "function isManufacturer(address) public view returns (bool)",
  "function isDistributor(address) public view returns (bool)",
  "function isLocalShop(address) public view returns (bool)",
  "event BatchMinted(string batchId, address indexed manufacturer, uint256 demandScore, string routeHash)",
  "event TransitUpdated(string batchId, address indexed distributor)",
  "event DeliveryConfirmed(string batchId, address indexed shop)",
  "event RoleRegistered(address indexed account, string role)"
];

export const getWeb3Provider = async () => {
  if (window.ethereum) {
    const provider = new BrowserProvider(window.ethereum);
    
    // Automatically switch or add the Hardhat local network
    try {
      await provider.send("wallet_switchEthereumChain", [{ chainId: "0x7A69" }]); // 31337
    } catch (error: any) {
      if (error.code === 4902) {
        await provider.send("wallet_addEthereumChain", [
          {
            chainId: "0x7A69",
            chainName: "Hardhat Local",
            rpcUrls: ["http://127.0.0.1:8545/"],
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          },
        ]);
      } else {
        console.error("Failed to switch network", error);
      }
    }

    await provider.send("eth_requestAccounts", []);
    return provider;
  }
  
  // FALLBACK for Hackathon Demo: If MetaMask is missing, use local Hardhat directly
  console.warn("MetaMask not found. Falling back to local Hardhat Node for demo purposes.");
  try {
    const provider = new JsonRpcProvider("http://127.0.0.1:8545/");
    await provider.getNetwork(); // Test connection
    return provider;
  } catch (err) {
    throw new Error("MetaMask is not installed, and local Hardhat node is not running on port 8545.");
  }
};

export const getPharmaContract = async () => {
  const provider = await getWeb3Provider();
  const signer = await provider.getSigner();
  return new Contract(PHARMA_CHAIN_ADDRESS, PHARMA_CHAIN_ABI, signer);
};

export const checkRole = async (address: string) => {
  try {
    const contract = await getPharmaContract();
    const isMan = await contract.isManufacturer(address);
    if (isMan) return "Manufacturer";
    const isDist = await contract.isDistributor(address);
    if (isDist) return "Distributor";
    const isShop = await contract.isLocalShop(address);
    if (isShop) return "LocalShop";
    return "Unknown";
  } catch (error) {
    console.error("Error checking role:", error);
    return "Unknown";
  }
};
