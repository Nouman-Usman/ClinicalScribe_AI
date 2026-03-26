
import { useState, useRef, useEffect } from 'react';
import {
    Bot, User, Sparkles, ChevronDown, ChevronRight,
    Send, FileText, AlertTriangle
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Finding } from '@/services/imageAnalysis';

interface AgentChatInterfaceProps {
    findings?: Finding[];
    onHighlightFinding?: (id: string) => void;
}

interface Message {
    id: string;
    role: 'system' | 'user' | 'agent';
    content: string;
    reasoning?: string[]; // Chain of thought steps
    relatedFindingIds?: string[];
    timestamp: Date;
}

export function AgentChatInterface({ findings, onHighlightFinding }: AgentChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'agent',
            content: 'I have analyzed the image using the DenseNet121 model. I detected potential consolidation in the lower right lobe and some cardiac enlargement.',
            reasoning: [
                'Checking pixel intensity distribution in lower quadrants...',
                'Identified opacity > 0.75 threshold in Right Lower Lobe (RLL).',
                'Comparing cardiac diameter to thoracic width (CTR > 0.5 detected).'
            ],
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({ '1': true });
    const scrollRef = useRef<HTMLDivElement>(null);

    const toggleReasoning = (msgId: string) => {
        setExpandedReasoning(prev => ({ ...prev, [msgId]: !prev[msgId] }));
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate agent response
        setTimeout(() => {
            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: "The opacity seems consistent with bacterial pneumonia, given the consolidation pattern. However, viral etiology cannot be ruled out without rapid testing.",
                reasoning: [
                    "Querying medical knowledge base for 'RLL consolidation differential diagnosis'...",
                    "Matching visual pattern 'lobar opacity' vs 'interstitial infiltrates'..."
                ],
                timestamp: new Date()
            };
            setMessages(prev => [...prev, agentMsg]);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-card/50">
            <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Agent Consultation
                </h3>
                <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                    MODEL: GPT-4o-Med
                </span>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn(
                            "flex gap-3",
                            msg.role === 'user' ? "flex-row-reverse" : ""
                        )}>
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                msg.role === 'agent' ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                                {msg.role === 'agent' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>

                            <div className={cn(
                                "flex-1 max-w-[85%]",
                                msg.role === 'user' ? "text-right" : ""
                            )}>
                                <div className={cn(
                                    "rounded-lg p-3 text-sm inline-block text-left",
                                    msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted/50 border border-border"
                                )}>
                                    {msg.content}
                                </div>

                                {/* Reasoning Block for Agent */}
                                {msg.role === 'agent' && msg.reasoning && (
                                    <div className="mt-2 text-left">
                                        <button
                                            onClick={() => toggleReasoning(msg.id)}
                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"
                                        >
                                            {expandedReasoning[msg.id] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                            Chain of Thought
                                        </button>

                                        {expandedReasoning[msg.id] && (
                                            <div className="pl-2 border-l-2 border-primary/20 space-y-1 py-1">
                                                {msg.reasoning.map((step, idx) => (
                                                    <div key={idx} className="text-[11px] text-muted-foreground font-mono flex items-start gap-2">
                                                        <div className="w-1 h-1 rounded-full bg-primary/40 mt-1.5" />
                                                        {step}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Findings Actions */}
                                {msg.role === 'agent' && findings && findings.length > 0 && msg.id === '1' && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {findings.map(f => (
                                            <button
                                                key={f.id}
                                                onClick={() => onHighlightFinding?.(f.id)}
                                                className="text-xs flex items-center gap-1.5 px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors"
                                            >
                                                <AlertTriangle className="w-3 h-3" />
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border bg-card/30">
                <div className="relative">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about specific findings..."
                        className="pr-10"
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1 h-8 w-8 text-primary"
                        onClick={handleSend}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
