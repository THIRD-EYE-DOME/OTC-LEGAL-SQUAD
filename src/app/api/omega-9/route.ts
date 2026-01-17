import { NextResponse, type NextRequest } from 'next/server';
import { omegaNineProtocol, type OmegaNineProtocolInput } from '@/ai/flows/omega-9-protocol';
import { z } from 'zod';

// Schema for the API request body
const OmegaNineRequestSchema = z.object({
  userMessage: z.string().min(1, 'User message is required'),
  triggerPhrase: z.enum(['Leo Leo', 'Sophia', 'Nero', 'default']).optional(),
  context: z.string().optional(),
});

/**
 * POST /api/omega-9
 * 
 * Endpoint for interacting with the OMEGA 9 protocol.
 * 
 * Request Body:
 * {
 *   "userMessage": "Your command or message",
 *   "triggerPhrase": "Leo Leo" | "Sophia" | "Nero" | "default" (optional),
 *   "context": "Optional context or conversation history" (optional)
 * }
 * 
 * Response:
 * {
 *   "response": "Formatted response from OMEGA 9",
 *   "protocolMode": "Leo Leo" | "Sophia" | "Nero" | "God-Tier",
 *   "nextStep": "Optional next step suggestion"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validation = OmegaNineRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request', 
          details: validation.error.format() 
        }, 
        { status: 400 }
      );
    }

    const input: OmegaNineProtocolInput = validation.data;

    // Call the OMEGA 9 protocol flow
    const result = await omegaNineProtocol(input);

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Error processing OMEGA 9 protocol request:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/omega-9
 * 
 * Returns information about the OMEGA 9 protocol and available modes.
 */
export async function GET() {
  return NextResponse.json({
    protocol: 'OMEGA 9',
    version: '1.0.0',
    description: 'God-Tier High-Intelligence Partner with adaptive personality modes',
    modes: {
      'Leo Leo': {
        description: 'High energy, loyalty, and Firestorm aesthetics',
        characteristics: ['Passionate', 'Bold', 'Action-oriented']
      },
      'Sophia': {
        description: 'Deep analysis, empathy, and Wisdom Core precision',
        characteristics: ['Thoughtful', 'Thorough', 'Introspective']
      },
      'Nero': {
        description: 'Pure code blocks and technical brevity',
        characteristics: ['Direct', 'Efficient', 'Technically precise']
      },
      'default': {
        description: 'God-Tier Intelligence Partner mode',
        characteristics: ['Supreme intelligence', 'Strategic insight', 'Authoritative']
      }
    },
    formatting: {
      headers: '**/// PROTOCOL: [NAME] ///**',
      addressing: ['Architect', 'King Fisk'],
      acknowledgments: ['Access Granted', 'Protocol Initiated'],
      closings: ['Next Step:', 'Awaiting Command, Sovereign'],
      references: ['The Motherboard', 'The Dome']
    }
  }, { status: 200 });
}
