# OMEGA 9 Protocol Implementation

## Overview

The OMEGA 9 Protocol is a sophisticated AI assistant system that provides adaptive personality modes based on trigger phrases. It is integrated into the Fisk Dimension Suite as a "God-Tier" High-Intelligence Partner with full voice intelligence capabilities.

## Features

### Adaptive Personality Modes

1. **Leo Leo (Firestorm Mode)**
   - High energy, loyalty, and passion
   - Action-oriented responses with fire/energy metaphors
   - Bold and powerful communication style
   - Voice: Faster rate (1.1x), higher pitch, maximum volume

2. **Sophia (Wisdom Core Mode)**
   - Deep analysis and empathy
   - Thoughtful, thorough, and introspective responses
   - Nuanced perspectives with detailed explanations
   - Voice: Slower rate (0.9x), lower pitch, calm delivery

3. **Nero (Technical Mode)**
   - Pure code blocks with minimal explanation
   - Direct, efficient, and technically precise
   - Focus on implementation details
   - Voice: Standard rate, lower pitch, moderate volume

4. **God-Tier Mode (Default)**
   - Supreme intelligence with strategic insight
   - Authoritative yet respectful
   - Comprehensive solutions with deep understanding
   - Voice: Standard settings, balanced delivery

### Voice Intelligence Features

**NEW: Voice Input & Output**
- **Speech Recognition**: Click the microphone button to speak commands instead of typing
- **Text-to-Speech**: Automatic voice responses when enabled
- **Adaptive Voice**: Voice characteristics (speed, pitch, volume) adapt to each protocol mode
- **Hands-Free Operation**: Fully voice-controlled interaction reduces text stressing
- **Browser-Native**: Uses Web Speech API (no additional dependencies)

### Formatting Standards

- **Headers**: `**/// PROTOCOL: [NAME] ///**`
- **Code Blocks**: All technical instructions in code blocks
- **Organization**: Lists and Markdown tables (Panels) for data
- **References**: "The Motherboard" or "The Dome" for phone/terminal
- **Addressing**: "Architect" or "King Fisk"
- **Acknowledgments**: "Access Granted" or "Protocol Initiated"
- **Closings**: "Next Step:" or "Awaiting Command, Sovereign"

## Architecture

### File Structure

```
src/
├── ai/
│   └── flows/
│       └── omega-9-protocol.ts      # Main AI flow implementation
├── app/
│   ├── api/
│   │   └── omega-9/
│   │       └── route.ts             # API endpoint
│   └── omega-9/
│       └── page.tsx                 # UI interface
└── services/
    └── omega-9-protocol.ts          # Service layer
```

### Components

#### 1. AI Flow (`src/ai/flows/omega-9-protocol.ts`)

The core AI logic that:
- Defines input/output schemas using Zod
- Implements system prompts for each personality mode
- Uses Google's Gemini AI model for intelligent responses
- Ensures consistent formatting and tone

**Key Functions:**
- `omegaNineProtocol()`: Main entry point for the protocol
- `getSystemPrompt()`: Generates mode-specific system prompts
- `omegaNineProtocolFlow`: Genkit flow definition

#### 2. API Endpoint (`src/app/api/omega-9/route.ts`)

RESTful API with two endpoints:

**POST /api/omega-9**
- Accepts user messages and optional parameters
- Returns formatted AI responses
- Request body:
  ```json
  {
    "userMessage": "Your command or message",
    "triggerPhrase": "Leo Leo" | "Sophia" | "Nero" | "default",
    "context": "Optional context"
  }
  ```
- Response:
  ```json
  {
    "response": "Formatted AI response",
    "protocolMode": "Leo Leo" | "Sophia" | "Nero" | "God-Tier",
    "nextStep": "Optional next step suggestion"
  }
  ```

**GET /api/omega-9**
- Returns protocol information and capabilities
- Provides mode descriptions and formatting rules

#### 3. Service Layer (`src/services/omega-9-protocol.ts`)

Convenient interface for calling the OMEGA 9 protocol:
- `sendToOmegaNine()`: Sends messages to the protocol
- `getOmegaNineInfo()`: Retrieves protocol information

#### 4. UI Interface (`src/app/omega-9/page.tsx`)

Interactive web interface featuring:
- Command input with mode selection
- **Voice input button for hands-free commands**
- **Voice output with adaptive characteristics per mode**
- **Voice enable/disable toggle**
- **Speaking controls (speak/stop)**
- Real-time response display
- Protocol specifications panel
- Visual mode indicators
- Formatted response rendering

## Usage

### Voice Usage (NEW)

**Voice Input:**
1. Navigate to `/omega-9` in your browser
2. Click the microphone button in the message input area
3. Speak your command clearly
4. The transcribed text will appear in the input field
5. Submit the command as normal

**Voice Output:**
1. Ensure voice output is enabled (speaker icon should be highlighted)
2. Submit a command through text or voice
3. The response will be automatically spoken
4. Use the "Speak" button to replay a response
5. Use the "Stop" button to interrupt speech

**Voice Settings by Mode:**
- **Leo Leo**: Fast, energetic delivery (1.1x speed, higher pitch)
- **Sophia**: Slow, thoughtful delivery (0.9x speed, lower pitch)
- **Nero**: Standard technical delivery (1.0x speed, lower pitch)
- **God-Tier**: Balanced, authoritative delivery

### API Usage

```typescript
import { sendToOmegaNine } from '@/services/omega-9-protocol';

// Send a message in Firestorm mode
const response = await sendToOmegaNine({
  userMessage: "Show me the system status",
  triggerPhrase: "Leo Leo"
});

console.log(response.response);
console.log(response.nextStep);
```

### Direct API Call

```bash
curl -X POST http://localhost:9002/api/omega-9 \
  -H "Content-Type: application/json" \
  -d '{
    "userMessage": "Analyze the blockchain architecture",
    "triggerPhrase": "Sophia"
  }'
```

### Web Interface

Navigate to `/omega-9` in your browser to access the interactive interface.

## Configuration

The protocol uses the Gemini 2.0 Flash model configured in `src/ai/genkit.ts`:

```typescript
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
```

### Environment Variables

Required environment variables (set in `.env`):
- `GOOGLE_GENAI_API_KEY`: Google AI API key for Gemini model

### Browser Compatibility (Voice Features)

Voice features use the Web Speech API, which is supported in:
- **Chrome/Edge**: Full support (recommended)
- **Safari**: Speech synthesis supported, recognition limited
- **Firefox**: Limited support
- **Mobile browsers**: Varies by platform and browser

If voice features are not available, the UI will gracefully hide voice controls and operate in text-only mode.

## Integration

### Adding to Existing Flows

```typescript
import { omegaNineProtocol } from '@/ai/flows/omega-9-protocol';

// Use in your code
const result = await omegaNineProtocol({
  userMessage: "Your message here",
  triggerPhrase: "Sophia"
});
```

### Custom Integration

The protocol can be integrated into any part of the application by:
1. Importing the service layer function
2. Calling it with appropriate parameters
3. Rendering or processing the response

## Development

### Running Genkit Dev Server

```bash
npm run genkit:dev
```

This starts the Genkit development interface for testing flows.

### Testing Different Modes

```bash
# Test Leo Leo mode
curl -X POST http://localhost:9002/api/omega-9 \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "Execute system diagnostics", "triggerPhrase": "Leo Leo"}'

# Test Sophia mode
curl -X POST http://localhost:9002/api/omega-9 \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "Explain the quantum architecture", "triggerPhrase": "Sophia"}'

# Test Nero mode
curl -X POST http://localhost:9002/api/omega-9 \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "Write a function to validate transactions", "triggerPhrase": "Nero"}'
```

## Security Considerations

1. **API Access**: The endpoint is currently open. Consider adding authentication for production.
2. **Rate Limiting**: Implement rate limiting to prevent abuse.
3. **Input Validation**: All inputs are validated using Zod schemas.
4. **Context Handling**: Be cautious with context data to avoid prompt injection.

## Future Enhancements

1. **Conversation History**: Store and retrieve conversation context
2. **User Preferences**: Save preferred modes per user
3. **Custom Modes**: Allow users to define custom personality modes
4. **Analytics**: Track usage patterns and popular modes
5. **Voice Integration**: Add text-to-speech for responses
6. **Multi-language Support**: Extend to support multiple languages

## Troubleshooting

### Common Issues

**Issue**: AI responses are inconsistent
- **Solution**: Check that `GOOGLE_GENAI_API_KEY` is properly set

**Issue**: API returns 500 errors
- **Solution**: Check Genkit server logs and ensure all dependencies are installed

**Issue**: Formatting is not preserved in UI
- **Solution**: Verify that `dangerouslySetInnerHTML` is rendering markdown correctly

## Support

For issues or questions about the OMEGA 9 Protocol implementation, refer to the main repository documentation or create an issue in the GitHub repository.
