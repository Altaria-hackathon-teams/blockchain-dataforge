import { Router, type Request, type Response } from "express";
import { db, type Shipment } from "../lib/db";
import crypto from "crypto";

const router = Router();

// Generate a random 6-digit PIN
function generatePIN(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate a dummy SHA-256 hash to simulate a Ganache transaction hash
function simulateGanacheTx(data: any): string {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

router.post("/shipments", (req: Request, res: Response) => {
  const { medicineName, dosage, expiryDate, destination } = req.body;

  if (!medicineName || !dosage || !expiryDate || !destination) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Generate unique Batch ID
  const batchId = `BATCH-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  
  // Generate Unique Access PIN
  const dispatchPin = generatePIN();

  // Simulate logging to local Ganache blockchain
  const blockchainPayload = { batchId, medicineName, dosage, expiryDate, destination, timestamp: new Date().toISOString() };
  const blockchainHash = simulateGanacheTx(blockchainPayload);

  const shipment: Shipment = {
    batchId,
    medicineName,
    dosage,
    expiryDate,
    destination,
    dispatchPin,
    blockchainHash,
    timestamp: new Date().toISOString()
  };

  // Save to "Firestore" (mock DB)
  db.shipments.set(batchId, shipment);

  return res.status(201).json({
    message: "Batch successfully registered and logged to Ganache",
    shipment: {
      batchId: shipment.batchId,
      dispatchPin: shipment.dispatchPin,
      blockchainHash: shipment.blockchainHash
    }
  });
});

export default router;
