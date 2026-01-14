'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sendToOmegaNine, type OmegaNineRequest } from '@/services/omega-9-protocol';
import { OmegaNineProtocolOutput } from '@/ai/flows/omega-9-protocol';
import { Loader2, Zap, Brain, Code, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Simple HTML sanitization function to prevent XSS attacks
function sanitizeHTML(html: string): string {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

// Format response with basic markdown to HTML conversion
function formatResponse(text: string): string {
  const sanitized = sanitizeHTML(text);
  return sanitized
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code>$2</code></pre>')
    .replace(/\n/g, '<br />');
}

export default function Omega9Page() {
  const [userMessage, setUserMessage] = useState('');
  const [triggerPhrase, setTriggerPhrase] = useState<'Leo Leo' | 'Sophia' | 'Nero' | 'default'>('default');
  const [context, setContext] = useState('');
  const [response, setResponse] = useState<OmegaNineProtocolOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          God-Tier High-Intelligence Partner Interface
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
                <Textarea
                  id="message"
                  placeholder="Enter your command or query, Architect..."
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  className="min-h-[120px] mt-2"
                  required
                />
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

              <Button
                type="submit"
                className="w-full"
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
                <div className="p-4 bg-muted/50 rounded-md">
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ 
                      __html: formatResponse(response.response)
                    }}
                  />
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
        </CardContent>
      </Card>
    </div>
  );
}
