import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bot, Send, Sparkles, Loader2, Wand2, CheckCircle2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCoachChat, useCoachSuggestions, ChatMessage } from "@/hooks/use-coach-chat";
import { useCoachGenerateTemplate } from "@/hooks/use-coach-generate-template";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DisplayMessage {
  role: "user" | "model";
  content: string;
}

export default function Coach() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Template generation dialog state
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateGoal, setTemplateGoal] = useState("");
  const [templateLevel, setTemplateLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [templateName, setTemplateName] = useState("");
  
  const { mutate: sendMessage, isPending, error } = useCoachChat();
  const { data: initialSuggestions, isLoading: suggestionsLoading } = useCoachSuggestions();
  const generateTemplate = useCoachGenerateTemplate();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isPending]);

  const handleSend = (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isPending) return;
    
    // Add user message to display
    const userMessage: DisplayMessage = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setSuggestedFollowUps([]);

    // Build history for API (exclude the message we're sending)
    const history: ChatMessage[] = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    sendMessage(
      { message: text, history },
      {
        onSuccess: (response) => {
          // Add AI response
          const aiMessage: DisplayMessage = { role: "model", content: response.reply };
          setMessages(prev => [...prev, aiMessage]);
          setSuggestedFollowUps(response.suggestedFollowUps);
        },
        onError: (err) => {
          // Add error message
          const errorMessage: DisplayMessage = { 
            role: "model", 
            content: `Sorry, I encountered an error: ${err.message}. Please try again.` 
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      }
    );
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  // Show initial suggestions or follow-ups
  const displaySuggestions = suggestedFollowUps.length > 0 
    ? suggestedFollowUps 
    : (messages.length === 0 ? initialSuggestions : []);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] max-w-4xl mx-auto border border-border rounded-xl overflow-hidden bg-card shadow-2xl">
      {/* Header */}
      <div className="bg-sidebar border-b border-border p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary))]">
          <Bot className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-lg tracking-wide">Calyxpert Coach</h2>
          <p className="text-xs text-primary flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Online
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 space-y-4">
        <div className="space-y-6 pb-4">
          {/* Welcome message when no messages */}
          {messages.length === 0 && (
            <div className="flex gap-3 flex-row">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center mt-1 border border-primary/20">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed bg-secondary/50 border border-border text-foreground rounded-tl-none">
                Hey there! 👋 I'm your Calyxpert Coach, here to help you with your calisthenics journey. 
                I can analyze your workouts, suggest progressions, help with form, and create personalized training plans.
                What would you like to work on today?
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'model' ? (
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center mt-1 border border-primary/20">
                   <Bot className="w-4 h-4 text-primary" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center mt-1">
                  <div className="w-full h-full rounded overflow-hidden bg-muted flex items-center justify-center text-xs font-bold">ME</div>
                </div>
              )}
              
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-none whitespace-pre-wrap' 
                  : 'bg-secondary/50 border border-border text-foreground rounded-tl-none'
              }`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5 [&_p]:my-2 [&_strong]:text-primary [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isPending && (
            <div className="flex gap-3 flex-row">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center mt-1 border border-primary/20">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed bg-secondary/50 border border-border text-foreground rounded-tl-none">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-sidebar border-t border-border">
        {/* Generate Template Button */}
        <div className="flex gap-2 mb-4">
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="border-primary/30 hover:bg-primary/10 hover:border-primary hover:text-primary"
                onClick={() => {
                  // Pre-fill with last user message as goal if available
                  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                  if (lastUserMsg) {
                    setTemplateGoal(lastUserMsg.content);
                  }
                }}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Workout Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-heading uppercase">Generate AI Template</DialogTitle>
                <DialogDescription>
                  Describe your workout goals and the AI will create a personalized template for you.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="goal">What's your goal?</Label>
                  <Textarea
                    id="goal"
                    placeholder="e.g., Build upper body strength, focus on pull exercises, 3x per week..."
                    value={templateGoal}
                    onChange={(e) => setTemplateGoal(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="level">Fitness Level</Label>
                  <Select value={templateLevel} onValueChange={(v: any) => setTemplateLevel(v)}>
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Template Name (optional)</Label>
                  <Input
                    id="name"
                    placeholder="Leave blank for AI-generated name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowTemplateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!templateGoal.trim()) {
                      toast({
                        title: "Goal required",
                        description: "Please describe your workout goal.",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    generateTemplate.mutate(
                      {
                        goal: templateGoal,
                        level: templateLevel,
                        name: templateName || undefined,
                      },
                      {
                        onSuccess: (data) => {
                          setShowTemplateDialog(false);
                          setTemplateGoal("");
                          setTemplateName("");
                          toast({
                            title: (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Template Created!</span>
                              </div>
                            ),
                            description: (
                              <div className="flex flex-col gap-2">
                                <span>"{data.templateName}" is ready to use.</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setLocation("/templates")}
                                  className="w-fit"
                                >
                                  View in Templates
                                </Button>
                              </div>
                            ),
                          });
                        },
                        onError: (error) => {
                          toast({
                            title: "Generation Failed",
                            description: error.message,
                            variant: "destructive",
                          });
                        },
                      }
                    );
                  }}
                  disabled={generateTemplate.isPending || !templateGoal.trim()}
                >
                  {generateTemplate.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Suggested Prompts / Follow-ups */}
        {displaySuggestions && displaySuggestions.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
            {displaySuggestions.map((suggestion, idx) => (
              <button 
                key={idx} 
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isPending}
                className="whitespace-nowrap px-3 py-1.5 rounded-full border border-border bg-background/50 text-xs font-medium hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3 h-3" /> {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask Calyxpert Coach..." 
            disabled={isPending}
            className="bg-background border-border focus:border-primary disabled:opacity-50"
          />
          <Button 
            onClick={() => handleSend()} 
            size="icon" 
            disabled={isPending || !input.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
