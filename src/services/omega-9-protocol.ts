/**
 * @fileOverview Service for interacting with the OMEGA 9 protocol
 * 
 * This service provides a convenient interface for calling the OMEGA 9 protocol
 * from client components or other services.
 */

import { OmegaNineProtocolOutput } from '@/ai/flows/omega-9-protocol';

export interface OmegaNineRequest {
  userMessage: string;
  triggerPhrase?: 'Leo Leo' | 'Sophia' | 'Nero' | 'default';
  context?: string;
}

/**
 * Sends a message to the OMEGA 9 protocol and returns the response
 * 
 * @param request - The request containing the user message and optional parameters
 * @returns The OMEGA 9 protocol response
 * @throws Error if the API call fails
 */
export async function sendToOmegaNine(
  request: OmegaNineRequest
): Promise<OmegaNineProtocolOutput> {
  try {
    const response = await fetch('/api/omega-9', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `OMEGA 9 API request failed with status ${response.status}`
      );
    }

    const data: OmegaNineProtocolOutput = await response.json();
    return data;
  } catch (error) {
    console.error('Error communicating with OMEGA 9 protocol:', error);
    throw error;
  }
}

/**
 * Gets information about the OMEGA 9 protocol
 * 
 * @returns Protocol information including available modes and formatting rules
 */
export async function getOmegaNineInfo() {
  try {
    const response = await fetch('/api/omega-9', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to get OMEGA 9 info with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting OMEGA 9 protocol info:', error);
    throw error;
  }
}
