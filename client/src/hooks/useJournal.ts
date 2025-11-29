import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type JournalEntry, type InsertJournalEntry } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useJournal() {
  const queryClient = useQueryClient();

  const { data: entries, isLoading, error } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal"],
  });

  const createEntry = useMutation({
    mutationFn: async (entry: InsertJournalEntry) => {
      const res = await apiRequest("POST", "/api/journal", entry);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
    },
  });

  return { entries, isLoading, error, createEntry };
}
