export interface Shipment {
  batchId: string;
  medicineName: string;
  dosage: string;
  expiryDate: string;
  destination: string;
  dispatchPin: string;
  blockchainHash: string; // Simulated Ganache Tx Hash
  timestamp: string;
}

// In-memory mock for Firestore "shipments" collection
export const db = {
  shipments: new Map<string, Shipment>(),
};
