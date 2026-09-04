import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateText } from 'ai';
import { z } from 'zod';
import { bakeryAgent } from '../lib/agent';

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(4000),
  })).min(1).max(20),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid agent request.' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'The bakery concierge is not configured yet.' });

  try {
    const result = await generateText({
      model: bakeryAgent.model,
      system: bakeryAgent.system,
      messages: parsed.data.messages,
      tools: bakeryAgent.tools,
      maxSteps: 3,
    });
    return res.status(200).json({ text: result.text });
  } catch (error) {
    console.error('agent_request_failed', error);
    return res.status(500).json({ error: 'The concierge is resting for a moment. Please try again.' });
  }
}