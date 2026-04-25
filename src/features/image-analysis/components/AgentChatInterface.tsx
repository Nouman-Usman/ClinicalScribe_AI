import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, ChevronDown, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Finding, AnalysisResult } from '@/services/imageAnalysis';

interface AgentChatInterfaceProps {
    findings?: Finding[];
    analysisResult?: AnalysisResult | null;
    onHighlightFinding?: (id: string) => void;
}

interface Message {
    id: string;
    role: 'system' | 'user' | 'agent';
    content: string;
    reasoning?: string[];
    timestamp: Date;
}

export function AgentChatInterface({ findings, analysisResult, onHighlightFinding }: AgentChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initialize with analysis summary
    useEffect(() => {
        if (analysisResult && messages.length === 0) {
            const summary = generateAnalysisSummary(analysisResult);
            setMessages([{
                id: '0',
                role: 'agent',
                content: summary,
                reasoning: ['Analyzing clinical findings...', 'Generating diagnostic summary...'],
                timestamp: new Date()
            }]);
        }
    }, [analysisResult]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [messages]);

    const generateAnalysisSummary = (result: AnalysisResult): string => {
        if (!result.findings || result.findings.length === 0) {
            return 'No significant findings detected in the analysis.';
        }

        const highConfidence = result.findings.filter(f => f.confidence > 0.7);
        const text = highConfidence.map(f => `${f.label} (${(f.confidence * 100).toFixed(0)}%)`).join(', ');

        return `Analysis complete. Key findings: ${text}. Model: ${result.modelUsed}. Confidence: ${(result.confidence * 100).toFixed(1)}%.`;
    };

    const toggleReasoning = (msgId: string) => {
        setExpandedReasoning(prev => ({ ...prev, [msgId]: !prev[msgId] }));
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await getAgentResponse(input, findings || [], analysisResult);

            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: response.content,
                reasoning: response.reasoning,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, agentMsg]);
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: 'Error processing request. Try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-card/50">
            <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold text-sm">AI Consultation</h3>
                <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                    Groq
                </span>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                msg.role === 'agent' ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                                {msg.role === 'agent' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>

                            <div className={cn("flex-1 max-w-[85%]", msg.role === 'user' ? "text-right" : "")}>
                                <div className={cn(
                                    "rounded-lg p-3 text-sm inline-block text-left prose prose-sm dark:prose-invert max-w-none",
                                    msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted/50 border border-border"
                                )}>
                                    {msg.role === 'agent' ? (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                                                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                                                li: ({node, ...props}) => <li className="ml-2" {...props} />,
                                                code: ({node, inline, ...props}) =>
                                                    inline ?
                                                    <code className="bg-black/20 px-1.5 py-0.5 rounded text-xs font-mono" {...props} /> :
                                                    <code className="block bg-black/20 p-2 rounded mb-2 text-xs font-mono overflow-x-auto" {...props} />,
                                                pre: ({node, ...props}) => <pre className="mb-2" {...props} />,
                                                strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                                em: ({node, ...props}) => <em className="italic" {...props} />,
                                                h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                                                h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                                                h3: ({node, ...props}) => <h3 className="font-bold mb-1" {...props} />,
                                                blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary/50 pl-2 italic mb-2" {...props} />,
                                                table: ({node, ...props}) => <div className="overflow-x-auto mb-2"><table className="min-w-full border-collapse border border-slate-300 text-xs" {...props} /></div>,
                                                thead: ({node, ...props}) => <thead className="bg-slate-100" {...props} />,
                                                tbody: ({node, ...props}) => <tbody {...props} />,
                                                tr: ({node, ...props}) => <tr className="border border-slate-300" {...props} />,
                                                th: ({node, ...props}) => <th className="border border-slate-300 px-2 py-1 font-semibold text-left" {...props} />,
                                                td: ({node, ...props}) => <td className="border border-slate-300 px-2 py-1" {...props} />,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    ) : (
                                        msg.content
                                    )}
                                </div>

                                {msg.role === 'agent' && msg.reasoning && (
                                    <div className="mt-2 text-left">
                                        <button
                                            onClick={() => toggleReasoning(msg.id)}
                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {expandedReasoning[msg.id] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                            Reasoning
                                        </button>

                                        {expandedReasoning[msg.id] && (
                                            <div className="pl-2 border-l-2 border-primary/20 space-y-1 py-1">
                                                {msg.reasoning.map((step, idx) => (
                                                    <div key={idx} className="text-[11px] text-muted-foreground font-mono">
                                                        • {step}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {msg.role === 'agent' && findings && findings.length > 0 && msg.id === '0' && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {findings.map(f => (
                                            <button
                                                key={f.id}
                                                onClick={() => onHighlightFinding?.(f.id)}
                                                className="text-xs px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors"
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/20 text-primary">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <div className="rounded-lg p-3 bg-muted/50 border border-border">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border bg-card/30">
                <div className="relative">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        placeholder="Ask about findings..."
                        disabled={isLoading}
                        className="pr-10"
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1 h-8 w-8 text-primary"
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

async function getAgentResponse(
    userMessage: string,
    findings: Finding[],
    analysisResult?: AnalysisResult | null
): Promise<{ content: string; reasoning: string[] }> {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
        console.warn('[Agent] VITE_GROQ_API_KEY not configured, using fallback');
        return generateFallbackResponse(userMessage, findings, analysisResult);
    }

    try {
        const systemPrompt = `You are a clinical diagnostic assistant specializing in chest X-ray analysis.
You have access to AI-generated analysis results and should help clinicians interpret findings.
Provide clear, evidence-based responses grounded in the analysis results provided.
Always recommend clinical correlation and specialist evaluation where appropriate.`;

        const commonFindingsStr = analysisResult?.metadata?.commonFindings?.length
            ? `\n- Common Findings (both models): ${analysisResult.metadata.commonFindings.join(', ')}`
            : '';

        const uncommonFindingsStr = analysisResult?.metadata?.uncommonFindings?.length
            ? `\n- Uncommon Findings (single model): ${analysisResult.metadata.uncommonFindings.join(', ')}`
            : '';

        const userPrompt = `
Medical Analysis Context:
${analysisResult ? `- Model Used: ${analysisResult.modelUsed}
- Confidence: ${(analysisResult.confidence * 100).toFixed(1)}%
- Findings: ${analysisResult.findings.map(f => `${f.label} (${(f.confidence * 100).toFixed(0)}%)`).join(', ')}${commonFindingsStr}${uncommonFindingsStr}` : 'No analysis results available'}

User Question: ${userMessage}
`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.warn('[Agent] Groq API error:', response.status, errorData);
            return generateFallbackResponse(userMessage, findings, analysisResult);
        }

        const data = await response.json();
        return {
            content: data.choices?.[0]?.message?.content || 'Unable to process response',
            reasoning: ['Analyzing clinical context...', 'Formulating diagnostic response...']
        };
    } catch (error) {
        console.error('[Agent] Groq API error:', error);
        return generateFallbackResponse(userMessage, findings, analysisResult);
    }
}

function generateFallbackResponse(
    question: string,
    findings: Finding[],
    analysisResult?: AnalysisResult | null
): { content: string; reasoning: string[] } {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('differential') || lowerQuestion.includes('rule out')) {
        const topFindings = findings.slice(0, 2).map(f => f.label).join(' and ');
        return {
            content: `Based on the radiographic findings, the differential diagnosis includes ${topFindings}. Clinical correlation with patient history and symptoms is essential for definitive diagnosis.`,
            reasoning: ['Analyzing clinical presentation...', 'Generating differential diagnosis...']
        };
    }

    if (lowerQuestion.includes('severity') || lowerQuestion.includes('urgent')) {
        const highConfidence = findings.filter(f => f.confidence > 0.7);
        return {
            content: `The analysis shows ${highConfidence.length} significant findings with high confidence. Clinical assessment and specialist evaluation are recommended.`,
            reasoning: ['Evaluating severity...', 'Assessing clinical urgency...']
        };
    }

    if (findings.length > 0) {
        const finding = findings[0];
        return {
            content: `The primary finding is ${finding.label} with ${(finding.confidence * 100).toFixed(0)}% confidence. ${finding.description} Further clinical evaluation is recommended.`,
            reasoning: ['Analyzing key findings...', 'Contextualizing results...']
        };
    }

    return {
        content: 'Based on the analysis, no significant pathological findings were detected. Clinical correlation recommended.',
        reasoning: ['Reviewing results...', 'Generating assessment...']
    };
}
