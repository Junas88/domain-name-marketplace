// api/auth/logout.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // If using cookies or sessions, you would clear them here
  return res.status(200).json({ message: "Logged out successfully" });
}
