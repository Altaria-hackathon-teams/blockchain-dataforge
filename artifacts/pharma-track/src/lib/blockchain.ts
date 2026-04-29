export type EventType = "MANUFACTURED" | "SHIPPED_TO_DISTRIBUTOR" | "RECEIVED_DISTRIBUTOR" | "SHIPPED_TO_PHARMACY" | "RECEIVED_PHARMACY";

export interface BlockData {
  index: number;
  timestamp: string; // ISO string
  batchId: string;
  event: EventType;
  location: string;
  handler: string;
  previousHash: string;
}

export interface Block extends BlockData {
  hash: string;
}

export async function calculateHash(data: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createBlock(data: BlockData): Promise<Block> {
  const hashStr = `${data.index}${data.timestamp}${data.batchId}${data.event}${data.location}${data.handler}${data.previousHash}`;
  const hash = await calculateHash(hashStr);
  return { ...data, hash };
}

export async function addBlock(chain: Block[], eventData: Omit<BlockData, "index" | "previousHash">): Promise<Block[]> {
  const previousBlock = chain[chain.length - 1];
  const previousHash = previousBlock ? previousBlock.hash : "0000000000000000000000000000000000000000000000000000000000000000";
  const index = previousBlock ? previousBlock.index + 1 : 0;
  
  const newBlock = await createBlock({
    ...eventData,
    index,
    previousHash
  });
  
  return [...chain, newBlock];
}

export async function verifyChain(chain: Block[]): Promise<boolean> {
  for (let i = 0; i < chain.length; i++) {
    const block = chain[i];
    const hashStr = `${block.index}${block.timestamp}${block.batchId}${block.event}${block.location}${block.handler}${block.previousHash}`;
    const calculatedHash = await calculateHash(hashStr);
    
    if (block.hash !== calculatedHash) return false;
    
    if (i > 0) {
      const previousBlock = chain[i - 1];
      if (block.previousHash !== previousBlock.hash) return false;
    }
  }
  return true;
}
