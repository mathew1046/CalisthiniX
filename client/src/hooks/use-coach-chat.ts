import { useMutation, useQuery } from "@tanstack/react-query";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

interface CoachChatResponse {
  reply: string;
  suggestedFollowUps: string[];
}

interface CoachSuggestionsResponse {
  suggestions: string[];
}

export function useCoachChat() {
  return useMutation({
    mutationFn: async ({
      message,
      history,
    }: {
      message: string;
      history: ChatMessage[];
    }): Promise<CoachChatResponse> => {
      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ message, history }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send message");
      }

      return response.json();
    },
  });
}

export function useCoachSuggestions() {
  return useQuery({
    queryKey: ["coach", "suggestions"],
    queryFn: async (): Promise<string[]> => {
      const response = await fetch("/api/coach/suggestions", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data: CoachSuggestionsResponse = await response.json();
      return data.suggestions;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export type { ChatMessage, CoachChatResponse };
