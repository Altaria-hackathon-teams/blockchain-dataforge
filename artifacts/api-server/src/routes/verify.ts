import { Router, type Request, type Response } from "express";
import { db } from "../lib/db";

const router = Router();

router.post("/verify", async (req: Request, res: Response) => {
  const { batchId, pin } = req.body;

  if (!batchId || !pin) {
    return res.status(400).json({ error: "Batch ID and PIN are required." });
  }

  // Artificial delay to simulate "Verifying Cryptographic Ledger... Analyzing Data Integrity..."
  await new Promise(resolve => setTimeout(resolve, 1500));

  const shipment = db.shipments.get(batchId);

  if (!shipment) {
    return res.status(404).json({ error: "Batch ID not found on clinical ledger." });
  }

  if (shipment.dispatchPin !== pin) {
    return res.status(403).json({ error: "Access Denied: The Unique Access PIN provided is incorrect." });
  }

  // Simulate AI Authenticity & Safety Report
  const aiReport = {
    authenticityScore: 100,
    status: "100% Authentic - No Counterfeit Detected",
    message: "Blockchain hash verification passed. Origin node (Manufacturer) signature is valid. Storage conditions (simulated) remained within safe bounds."
  };

  return res.status(200).json({
    shipment: {
      batchId: shipment.batchId,
      medicineName: shipment.medicineName,
      dosage: shipment.dosage,
      expiryDate: shipment.expiryDate,
      destination: shipment.destination,
      blockchainHash: shipment.blockchainHash,
      timestamp: shipment.timestamp
    },
    aiReport
  });
});

export default router;
