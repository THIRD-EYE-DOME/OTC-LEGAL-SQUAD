'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sendToOmegaNine, type OmegaNineRequest } from '@/services/omega-9-protocol';
import { OmegaNineProtocolOutput } from '@/ai/flows/omega-9-protocol';
import { Loader2, Zap, Brain, Code, Crown, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Web Speech API types
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

// Component to safely render markdown-like text without HTML injection
function MarkdownRenderer({ text }: { text: string }) {
  // Split by code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);
  
  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        // Check if this is a code block
        if (part.startsWith('```')) {
          const codeContent = part.replace(/```\w*\n?/g, '').replace(/```$/g, '');
          return (
            <pre key={index} className="bg-muted p-3 rounded overflow-x-auto">
              <code className="text-sm">{codeContent}</code>
            </pre>
          );
        }
        
        // Process regular text for bold markers
        const textParts = part.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={index}>
            {textParts.map((textPart, textIndex) => {
              if (textPart.startsWith('**') && textPart.endsWith('**')) {
                return <strong key={textIndex}>{textPart.slice(2, -2)}</strong>;
              }
              // Split by line breaks and render each line
              return textPart.split('\n').map((line, lineIndex, arr) => (
                <React.Fragment key={`${textIndex}-${lineIndex}`}>
                  {line}
                  {lineIndex < arr.length - 1 && <br />}
                </React.Fragment>
              ));
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function Omega9Page() {
  const [userMessage, setUserMessage] = useState('');
  const [triggerPhrase, setTriggerPhrase] = useState<'Leo Leo' | 'Sophia' | 'Nero' | 'default'>('default');
  const [context, setContext] = useState('');
  const [response, setResponse] = useState<OmegaNineProtocolOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const { toast } = useToast();

  // Constants
  const AUTO_SPEECH_DELAY = 500; // Delay before auto-speaking response

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for speech recognition support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setUserMessage(prev => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({
            title: 'Voice Input Error',
            description: `Failed to recognize speech: ${event.error}`,
            variant: 'destructive',
          });
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }

      // Check for speech synthesis support
      if (window.speechSynthesis) {
        synthRef.current = window.speechSynthesis;
        setSpeechSupported(true);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [toast]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast({
          title: 'Voice Input Active',
          description: 'Listening... Speak your command, Architect.',
        });
      } catch (err) {
        console.error('Error starting recognition:', err);
        toast({
          title: 'Voice Input Error',
          description: 'Failed to start voice recognition.',
          variant: 'destructive',
        });
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current || !voiceEnabled) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    // Clean up text for better speech
    const cleanText = text
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold markers
      .replace(/```[\s\S]*?```/g, 'code block') // Replace code blocks
      .replace(/\n/g, ' '); // Replace newlines with spaces

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Configure voice based on mode
    const voices = synthRef.current.getVoices();
    
    // Wait for voices to load if not available yet
    if (voices.length === 0) {
      synthRef.current.addEventListener('voiceschanged', () => {
        const loadedVoices = synthRef.current?.getVoices();
        if (loadedVoices && loadedVoices.length > 0) {
          utterance.voice = loadedVoices[0];
        }
      }, { once: true });
    } else {
      utterance.voice = voices[0];
    }
    
    // Try to select appropriate voice based on mode
    if (triggerPhrase === 'Leo Leo') {
      utterance.rate = 1.1; // Faster, more energetic
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
    } else if (triggerPhrase === 'Sophia') {
      utterance.rate = 0.9; // Slower, more thoughtful
      utterance.pitch = 0.95;
      utterance.volume = 0.9;
    } else if (triggerPhrase === 'Nero') {
      utterance.rate = 1.0; // Standard technical
      utterance.pitch = 0.9;
      utterance.volume = 0.85;
    } else {
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const request: OmegaNineRequest = {
        userMessage,
        triggerPhrase,
        context: context || undefined,
      };
      
      const result = await sendToOmegaNine(request);
      setResponse(result);
      
      // Auto-speak response if voice is enabled
      if (voiceEnabled && result.response) {
        setTimeout(() => speakResponse(result.response), AUTO_SPEECH_DELAY);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'Leo Leo':
        return <Zap className="h-4 w-4" />;
      case 'Sophia':
        return <Brain className="h-4 w-4" />;
      case 'Nero':
        return <Code className="h-4 w-4" />;
      default:
        return <Crown className="h-4 w-4" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'Leo Leo':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Sophia':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Nero':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
          **/// PROTOCOL: OMEGA 9 ///**
        </h1>
        <p className="text-muted-foreground text-lg">
          God-Tier High-Intelligence Partner Interface with Voice Intelligence
        </p>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <Badge variant="outline" className="bg-primary/10">
            <Crown className="h-3 w-3 mr-1" /> Architect Mode
          </Badge>
          <Badge variant="outline" className="bg-accent/10">
            The Motherboard
          </Badge>
          <Badge variant="outline" className="bg-secondary/10">
            Adaptive Intelligence
          </Badge>
          {speechSupported && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
              <Volume2 className="h-3 w-3 mr-1" /> Voice Enabled
            </Badge>
          )}
          {isListening && (
            <Badge variant="outline" className="bg-red-500/10 text-red-500 animate-pulse">
              <Mic className="h-3 w-3 mr-1" /> Listening...
            </Badge>
          )}
          {isSpeaking && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 animate-pulse">
              <Volume2 className="h-3 w-3 mr-1" /> Speaking...
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Command Interface</CardTitle>
            <CardDescription>
              Enter your message and select a protocol mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="message">User Message</Label>
                <div className="relative mt-2">
                  <Textarea
                    id="message"
                    placeholder="Enter your command or query, Architect... (or use voice input)"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    className="min-h-[120px] pr-12"
                    required
                  />
                  {speechSupported && (
                    <Button
                      type="button"
                      size="sm"
                      variant={isListening ? "destructive" : "secondary"}
                      className="absolute right-2 top-2"
                      onClick={isListening ? stopListening : startListening}
                      disabled={loading}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="h-4 w-4 mr-1" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-1" />
                          Voice
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="mode">Protocol Mode</Label>
                <Select value={triggerPhrase} onValueChange={(value) => setTriggerPhrase(value as any)}>
                  <SelectTrigger id="mode" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        God-Tier (Default)
                      </div>
                    </SelectItem>
                    <SelectItem value="Leo Leo">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Leo Leo (Firestorm)
                      </div>
                    </SelectItem>
                    <SelectItem value="Sophia">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Sophia (Wisdom Core)
                      </div>
                    </SelectItem>
                    <SelectItem value="Nero">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Nero (Technical)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="context">Context (Optional)</Label>
                <Textarea
                  id="context"
                  placeholder="Previous conversation history or additional context..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="min-h-[80px] mt-2"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || !userMessage.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Protocol...
                    </>
                  ) : (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      Initiate Protocol
                    </>
                  )}
                </Button>
                {speechSupported && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    title={voiceEnabled ? "Disable voice output" : "Enable voice output"}
                  >
                    {voiceEnabled ? (
                      <Volume2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Response Panel */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Protocol Response</CardTitle>
            <CardDescription>
              {response ? (
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getModeColor(response.protocolMode)}>
                    {getModeIcon(response.protocolMode)}
                    <span className="ml-1">{response.protocolMode}</span>
                  </Badge>
                </div>
              ) : (
                'Awaiting Command, Sovereign...'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-4 mb-4 border border-destructive/50 bg-destructive/10 rounded-md">
                <p className="text-sm text-destructive">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            {response && !error && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-muted-foreground">
                    Response from {response.protocolMode} mode
                  </div>
                  {speechSupported && response.response && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => speakResponse(response.response)}
                        disabled={isSpeaking}
                      >
                        {isSpeaking ? (
                          <>
                            <Volume2 className="h-3 w-3 mr-1 animate-pulse" />
                            Speaking...
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3 mr-1" />
                            Speak
                          </>
                        )}
                      </Button>
                      {isSpeaking && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={stopSpeaking}
                        >
                          <VolumeX className="h-3 w-3 mr-1" />
                          Stop
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-muted/50 rounded-md">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <MarkdownRenderer text={response.response} />
                  </div>
                </div>

                {response.nextStep && (
                  <div className="p-3 border-l-4 border-primary bg-primary/5 rounded">
                    <p className="text-sm font-semibold mb-1">Next Step:</p>
                    <p className="text-sm">{response.nextStep}</p>
                  </div>
                )}
              </div>
            )}

            {!response && !error && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Crown className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-center">
                  Protocol standing by for your command...
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  Processing with OMEGA 9 intelligence...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Protocol Information */}
      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle>Protocol Specifications</CardTitle>
          <CardDescription>OMEGA 9 Protocol Guidelines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                Leo Leo - Firestorm Mode
              </h4>
              <p className="text-sm text-muted-foreground">
                High energy responses with loyalty and passion. Action-oriented with fire/energy metaphors.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-500" />
                Sophia - Wisdom Core Mode
              </h4>
              <p className="text-sm text-muted-foreground">
                Deep analytical responses with empathy. Thoughtful, thorough, and introspective insights.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Code className="h-4 w-4 text-green-500" />
                Nero - Technical Mode
              </h4>
              <p className="text-sm text-muted-foreground">
                Pure code blocks with minimal explanation. Direct, efficient, and technically precise.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Crown className="h-4 w-4 text-purple-500" />
                God-Tier Mode
              </h4>
              <p className="text-sm text-muted-foreground">
                Supreme intelligence with strategic insight. Authoritative yet respectful, comprehensive solutions.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-2">Formatting Standards</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Bold headers: **/// PROTOCOL: [NAME] ///**</li>
              <li>Code blocks for technical instructions</li>
              <li>Lists and tables for data organization</li>
              <li>References: "The Motherboard" or "The Dome"</li>
              <li>Addressing: "Architect" or "King Fisk"</li>
              <li>Acknowledgments: "Access Granted" or "Protocol Initiated"</li>
            </ul>
          </div>

          {speechSupported && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-green-500" />
                Voice Intelligence Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Mic className="h-4 w-4 text-primary mt-1" />
                    <div>
                      <p className="text-sm font-medium">Voice Input</p>
                      <p className="text-xs text-muted-foreground">
                        Click the microphone button to speak your command instead of typing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Volume2 className="h-4 w-4 text-primary mt-1" />
                    <div>
                      <p className="text-sm font-medium">Voice Output</p>
                      <p className="text-xs text-muted-foreground">
                        Responses are automatically spoken when voice is enabled
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-orange-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Adaptive Voice</p>
                      <p className="text-xs text-muted-foreground">
                        Voice characteristics adapt to each protocol mode (speed, pitch, volume)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Crown className="h-4 w-4 text-purple-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Hands-Free Operation</p>
                      <p className="text-xs text-muted-foreground">
                        Fully voice-controlled interaction reduces text stressing for the Architect
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
