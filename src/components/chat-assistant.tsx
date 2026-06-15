"use client";

import * as React from "react";
import { MessageSquare, Send, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import { useAssistantContext } from "@/lib/assistant-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

const SUGGESTIONS = [
  "Why is Outlook breaking this?",
  "Improve accessibility.",
  "Improve deliverability.",
  "Convert this CTA to VML.",
  "Generate an AMPscript version.",
  "How can I improve CTR?",
];

export function ChatAssistant() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const context = useAssistantContext();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const send = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const nextMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: trimmed },
      ];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages, context }),
        });
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.reply ??
              "Something went wrong reaching the assistant. Please try again.",
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Network error reaching the assistant. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, context],
  );

  return (
    <>
      <Button
        onClick={() => setOpen((v) => !v)}
        size="lg"
        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg"
        aria-label={open ? "Close EmailForge assistant" : "Open EmailForge assistant"}
        aria-expanded={open}
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">Ask EmailForge</span>
      </Button>

      <aside
        aria-label="Ask EmailForge assistant"
        aria-hidden={!open}
        className={cn(
          "fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-2xl transition-transform duration-300 sm:bottom-6 sm:right-6 sm:top-auto sm:h-[640px] sm:max-h-[85vh] sm:rounded-2xl sm:border",
          open ? "translate-x-0" : "translate-x-[110%]",
        )}
      >
        <header className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-semi-header leading-tight">Ask EmailForge</p>
              <p className="text-xs text-muted-foreground">
                {context.page
                  ? `Context: ${context.page} analysis`
                  : "Email development assistant"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </header>

        <ScrollArea className="flex-1">
          <div ref={scrollRef} className="flex flex-col gap-4 p-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-body text-muted-foreground">
                  Ask anything about your HTML email. I have access to your
                  current project analysis context.
                </p>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-lg border border-border px-3 py-2 text-left text-body transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-body",
                    m.role === "user"
                      ? "self-end bg-primary text-primary-foreground"
                      : "self-start bg-muted",
                  )}
                >
                  {m.content}
                </div>
              ))
            )}
            {loading ? (
              <div className="self-start rounded-2xl bg-muted px-4 py-2.5 text-body text-muted-foreground">
                Thinking…
              </div>
            ) : null}
          </div>
        </ScrollArea>

        <form
          className="flex items-end gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about Outlook, accessibility, AMPscript…"
            className="min-h-[44px] max-h-32 resize-none"
            aria-label="Message EmailForge assistant"
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
      </aside>
    </>
  );
}
