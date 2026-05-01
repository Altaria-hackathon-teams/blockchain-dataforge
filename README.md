# 💊 PharmaTrace: Predictive Pharmaceutical Tracking & Provenance

**PharmaTrace** is a next-generation supply chain solution that combines **Blockchain Immutability** and **AI-Driven Analytics** to secure the pharmaceutical lifecycle. It ensures that every medicine batch is authentic, optimized for delivery, and transparently tracked from manufacturer to patient.

---

## 🚀 Key Features

- **Immutable Blockchain Ledger:** Every handoff is cryptographically signed and recorded on an Ethereum-compatible ledger, preventing counterfeiting and data tampering.
- **AI Route Optimization:** A Python-based AI engine calculates demand scores and suggests optimal delivery routes based on regional health crises and flu outbreaks.
- **Real-Time Supply Chain Visibility:** A high-performance, glassmorphic dashboard for Manufacturers, Distributors, and Local Shops to manage inventory in real-time.
- **Smart QR Verification:** Patients and regulators can instantly verify the entire provenance of a medicine batch by scanning a QR code.
- **Role-Based Access Control (RBAC):** Secure identity management using MetaMask and Web3 authentication.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS + Framer Motion (Animations)
- **Icons:** Lucide React
- **Web3:** Ethers.js + MetaMask

### Blockchain
- **Language:** Solidity
- **Framework:** Hardhat
- **Network:** Localhost (Hardhat Node)

### AI Backend
- **Framework:** FastAPI (Python)
- **Core Logic:** Predictive analysis for regional health demand and routing.

---

## 📂 Project Structure

```text
├── artifacts/
│   ├── pharma-track/      # React Frontend
│   ├── blockchain/        # Solidity Smart Contracts & Hardhat Config
│   ├── ai-backend/        # Python AI API
│   └── api-server/        # Node.js synchronization layer
└── package.json           # Workspace configuration
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python 3.9+](https://www.python.org/)
- [MetaMask Extension](https://metamask.io/) installed in your browser.

### 2. Blockchain Setup
In a new terminal:
```bash
cd artifacts/blockchain
npm install
npx hardhat node
```
In another terminal, deploy the contracts:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 3. AI Backend Setup
In a new terminal:
```bash
cd artifacts/ai-backend
pip install -r requirements.txt
python main.py
```

### 4. Frontend Setup
In a new terminal:
```bash
cd artifacts/pharma-track
npm install
npm run dev
```

---

## 🛡️ Security & Provenance
PharmaTrace uses a "Proof of Custody" model. When a package moves from a Manufacturer to a Distributor, a **Web3 transaction** is triggered. This creates a permanent, undeniable record of who had the package and when, making it impossible to slip counterfeit drugs into the system without detection.

## 🏆 Hackathon Submission
Created for the **Altaria Hackathon**. Focused on solving **Real-World Supply Chain Transparency** and **Public Health Crisis Management**.
