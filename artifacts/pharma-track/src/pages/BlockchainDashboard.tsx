import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getPharmaContract, checkRole, getWeb3Provider } from "@/lib/web3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export function BlockchainDashboard() {
  const [account, setAccount] = useState<string | null>(null);
  const [role, setRole] = useState<string>("Unknown");
  
  // Manufacturer State
  const [batchId, setBatchId] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [fluCases, setFluCases] = useState("100");
  const [histCases, setHistCases] = useState("80");
  
  // Distributor / Shop State
  const [scanBatchId, setScanBatchId] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const connectWallet = async () => {
    setErrorMsg(null);
    try {
      const provider = await getWeb3Provider();
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      const userRole = await checkRole(address);
      setRole(userRole);
      toast.success("Wallet connected!");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to connect wallet.");
      toast.error("Failed to connect wallet: " + err.message);
    }
  };

  const registerRole = async (selectedRole: string) => {
    try {
      const contract = await getPharmaContract();
      const tx = await contract.registerRole(selectedRole);
      await tx.wait();
      setRole(selectedRole);
      toast.success(`Registered as ${selectedRole}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to register role: " + err.message);
    }
  };

  const handleMint = async () => {
    try {
      // 1. Get AI Prediction
      const backendUrl = import.meta.env.VITE_AI_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/v1/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region_code: regionCode,
          flu_cases_reported: parseInt(fluCases),
          antibiotic_resistance_level: 0.5,
          historical_avg_cases: parseInt(histCases)
        })
      });
      const aiData = await response.json();
      
      // 2. Mint on Blockchain
      const contract = await getPharmaContract();
      const tx = await contract.mintBatch(batchId, aiData.demand_score, aiData.suggested_route_hash);
      await tx.wait();
      toast.success(`Batch minted! AI Score: ${aiData.demand_score}`);
    } catch (err: any) {
      toast.error("Minting failed: " + err.message);
    }
  };

  const handleUpdateTransit = async () => {
    try {
      const contract = await getPharmaContract();
      const tx = await contract.updateTransit(scanBatchId);
      await tx.wait();
      toast.success("Transit updated successfully!");
    } catch (err: any) {
      toast.error("Update transit failed: " + err.message);
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      const contract = await getPharmaContract();
      const tx = await contract.confirmDelivery(scanBatchId);
      await tx.wait();
      toast.success("Delivery confirmed successfully!");
    } catch (err: any) {
      toast.error("Confirm delivery failed: " + err.message);
    }
  };

  if (!account) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>Connect your MetaMask to access the Pharma-Chain.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive border border-destructive/30">
                {errorMsg}
                {errorMsg.includes("MetaMask is not installed") && (
                  <p className="mt-2 text-xs">
                    Please install the MetaMask extension for your browser or use a Web3-enabled browser.
                  </p>
                )}
              </div>
            )}
            <Button className="w-full" onClick={connectWallet}>Connect MetaMask</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (role === "Unknown") {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Register Role</CardTitle>
            <CardDescription>Your address is not registered. Choose a role for this demo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => registerRole("Manufacturer")}>Register as Manufacturer</Button>
            <Button className="w-full" onClick={() => registerRole("Distributor")}>Register as Distributor</Button>
            <Button className="w-full" onClick={() => registerRole("LocalShop")}>Register as Local Shop</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {role}</h1>
        <p className="text-muted-foreground">Account: {account}</p>
      </div>

      {role === "Manufacturer" && (
        <Card>
          <CardHeader>
            <CardTitle>Mint New Batch</CardTitle>
            <CardDescription>Generate an AI prediction and register the batch on-chain.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Batch ID</label>
                <Input placeholder="e.g. BATCH-001" value={batchId} onChange={e => setBatchId(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Region Code</label>
                <Input placeholder="e.g. NY-10001" value={regionCode} onChange={e => setRegionCode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Flu Cases</label>
                <Input type="number" value={fluCases} onChange={e => setFluCases(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Historical Avg Cases</label>
                <Input type="number" value={histCases} onChange={e => setHistCases(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleMint} className="w-full">Get AI Prediction & Mint Batch</Button>
          </CardContent>
        </Card>
      )}

      {role === "Distributor" && (
        <Card>
          <CardHeader>
            <CardTitle>Scan & Update Transit</CardTitle>
            <CardDescription>Scan QR (enter Batch ID for demo) to mark as In-Transit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Batch ID from QR" value={scanBatchId} onChange={e => setScanBatchId(e.target.value)} />
            <Button onClick={handleUpdateTransit} className="w-full">Update to In-Transit</Button>
          </CardContent>
        </Card>
      )}

      {role === "LocalShop" && (
        <Card>
          <CardHeader>
            <CardTitle>Receive Shipment</CardTitle>
            <CardDescription>Scan QR to mark the batch as Delivered.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Batch ID from QR" value={scanBatchId} onChange={e => setScanBatchId(e.target.value)} />
            <Button onClick={handleConfirmDelivery} className="w-full">Confirm Delivery</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
