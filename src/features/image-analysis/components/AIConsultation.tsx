
import { useState } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AIConsultation() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'I can answer questions about this analysis. What would you like to know?' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: 'user', content: input } as Message];
        setMessages(newMessages);
        setInput('');

        // Mock response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Based on the image features, the detected opacity is consistent with the initial findings. However, clinical correlation is recommended."
            }]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[500px]">
            <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className={msg.role === 'assistant' ? "bg-primary text-primary-foreground" : "bg-muted"}>
                                    {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                                "rounded-lg p-3 text-sm max-w-[80%]",
                                msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="pt-4 mt-auto flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button size="icon" onClick={handleSend}>
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
