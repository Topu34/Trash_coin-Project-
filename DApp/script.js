/*
 * TrashCoin DApp JavaScript
 * This script enables interaction with the TrashCoin smart contract using the Ethers.js library. It allows
 * users to connect their MetaMask wallet, verify waste and mint tokens as a verifier, redeem tokens,
 * and view their current balance.
 */

// Replace this with the actual deployed TrashCoin contract address after deployment
const contractAddress = "0xYourContractAddressHere";

// Minimal ABI required to interact with the contract
const contractABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "string", "name": "wasteType", "type": "string" }
    ],
    "name": "verifyAndMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "verifier", "type": "address" }
    ],
    "name": "addVerifier",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "verifier", "type": "address" }
    ],
    "name": "removeVerifier",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [ { "internalType": "string", "name": "", "type": "string" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [ { "internalType": "string", "name": "", "type": "string" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ],
    "name": "redeem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ],
    "name": "balanceOf",
    "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

let provider;
let signer;
let contract;

// Connect the user's wallet using MetaMask and initialize the provider and contract
async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    alert('MetaMask is required to use this DApp. Please install MetaMask and try again.');
    return;
  }
  try {
    // Request account access if needed
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    const account = await signer.getAddress();
    document.getElementById('accountAddress').innerText = account;
    document.getElementById('connectButton').style.display = 'none';
    document.getElementById('accountArea').style.display = 'block';
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    await updateBalance();
  } catch (err) {
    console.error(err);
    alert('Could not connect wallet.');
  }
}

// Update the displayed balance for the connected account
async function updateBalance() {
  if (!contract || !signer) return;
  try {
    const account = await signer.getAddress();
    const balance = await contract.balanceOf(account);
    document.getElementById('balance').innerText = balance.toString();
  } catch (err) {
    console.error(err);
  }
}

// Handler for verifying waste and minting tokens
async function verifyAndMint() {
  const userAddr = document.getElementById('userAddress').value.trim();
  const amount = parseInt(document.getElementById('amount').value, 10);
  const waste = document.getElementById('wasteType').value.trim();
  if (!ethers.utils.isAddress(userAddr)) {
    alert('Please enter a valid Ethereum address for the user.');
    return;
  }
  if (!amount || amount <= 0) {
    alert('Please enter a valid number of items.');
    return;
  }
  if (!waste) {
    alert('Please specify the waste type.');
    return;
  }
  try {
    const tx = await contract.verifyAndMint(userAddr, amount, waste);
    await tx.wait();
    alert('Verification successful and tokens minted!');
    await updateBalance();
  } catch (err) {
    console.error(err);
    const errMsg = err.data && err.data.message ? err.data.message : err.message;
    alert('Transaction failed: ' + errMsg);
  }
}

// Handler for redeeming (burning) tokens
async function redeemTokens() {
  const amount = parseInt(document.getElementById('redeemAmount').value, 10);
  if (!amount || amount <= 0) {
    alert('Please enter a valid amount to redeem.');
    return;
  }
  try {
    const tx = await contract.redeem(amount);
    await tx.wait();
    alert('Tokens redeemed successfully!');
    await updateBalance();
  } catch (err) {
    console.error(err);
    const errMsg = err.data && err.data.message ? err.data.message : err.message;
    alert('Redeem failed: ' + errMsg);
  }
}

// Event listeners
document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('verifyButton').addEventListener('click', verifyAndMint);
document.getElementById('redeemButton').addEventListener('click', redeemTokens);