import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const text = body.text || '';

  if (text.toLowerCase().includes('objection')) {
    return NextResponse.json({
      type: 'OBJECTION',
      result: {
        payload: {
          rule: 'Hearsay',
          text: 'The statement relies on out-of-court assertions.'
        }
      }
    });
  }
  
  if (text.toLowerCase().includes('malice')) {
    return NextResponse.json({
      type: 'PRECEDENT',
      result: {
        payload: {
          case_name: 'People v. Smith',
          text: 'Malice must be proven beyond reasonable doubt.'
        }
      }
    });
  }

  return NextResponse.json({ type: 'NONE' });
}
