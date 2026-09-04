import { GemAppAgent } from '@google/gemini-agent-node';

export const config = {
  runtime: 'nodejs20',
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Basic AI Agent Configuration for Rose Bakery Shop
    return res.status(200).json({ status: "success", message: "AI Agent is ready" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
