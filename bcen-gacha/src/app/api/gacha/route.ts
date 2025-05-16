// pages/api/gacha.ts
// import type { NextApiRequest, NextApiResponse } from 'next';                 // Next.js API types :contentReference[oaicite:11]{index=11}
import { Gacha, PullResult } from '@/lib/gacha';                             // Import your simulator

type GachaResponse = {                                                     
    results: PullResult[];                                                   
};

// export default function handler(
//     req: NextApiRequest,
//     res: NextApiResponse<GachaResponse | { error: string }>
// ) {
//     try {
//         // 1. Extract and validate query params
//         const eventKey = String(req.query.eventKey ?? '0');                    // Default eventKey :contentReference[oaicite:12]{index=12}
//         const seed     = String(req.query.seed ?? Date.now().toString());      
//         const countRaw = req.query.count as string | undefined;               
//         const countNum = countRaw !== undefined                                 
//         ? Number.parseInt(countRaw, 10)                                       // Convert to integer :contentReference[oaicite:13]{index=13}
//         : 10;                                                                  
//         if (Number.isNaN(countNum) || countNum < 1) {                          
//         return res.status(400).json({ error: 'Invalid count parameter' });    // Bad request on invalid count :contentReference[oaicite:14]{index=14}
//         }

//         // 2. Run simulator
//         const sim = new Gacha(eventKey, seed);                                 // Initialize with eventKey & seed :contentReference[oaicite:15]{index=15}
//         const results = sim.draw(countNum);                                     

//         // 3. Respond with results
//         return res.status(200).json({ results });                               // 200 OK with JSON payload :contentReference[oaicite:16]{index=16}
//     } catch (err: any) {
//         console.error(err);
//         return res.status(500).json({ error: err.message || 'Internal Server Error' }); // 500 on exception :contentReference[oaicite:17]{index=17}
//     }
// }

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const eventKey = url.searchParams.get('eventKey') ?? '0';
    const seed     = url.searchParams.get('seed')     ?? Date.now().toString();
    const countStr = url.searchParams.get('count')    ?? '10';
    const count    = Number.parseInt(countStr, 10);
    if (Number.isNaN(count) || count < 1) {
    return NextResponse.json({ error: 'Invalid count' }, { status: 400 });
    }
    try {
        // Parse params (as above)…
        const sim = new Gacha(eventKey, Number(seed));
        const results = sim.draw(count);
        return NextResponse.json({ results });  // 200 OK with JSON :contentReference[oaicite:6]{index=6}
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
