import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type JournalEntry, type InsertJournalEntry } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useJournal() {
  const queryClient = useQueryClient();

  const { data: entries, isLoading, error } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal"],
  });

  const createEntry = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/journal", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
    },
  });

  return { entries, isLoading, error, createEntry };
}
