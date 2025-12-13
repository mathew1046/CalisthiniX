import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface GenerateTemplateRequest {
  goal: string;
  level?: "beginner" | "intermediate" | "advanced";
  focusAreas?: string[];
  name?: string;
}

export interface GeneratedTemplateResponse {
  templateId: string;
  templateName: string;
}

export function useCoachGenerateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: GenerateTemplateRequest): Promise<GeneratedTemplateResponse> => {
      const res = await apiRequest("POST", "/api/coach/generate-template", request);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate template");
      }
      
      return res.json();
    },
    onSuccess: () => {
      // Invalidate templates query to show the new template
      queryClient.invalidateQueries({ queryKey: ["workout-templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workout-templates"] });
    },
  });
}
