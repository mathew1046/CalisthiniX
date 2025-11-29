import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// Type definition for the user profile response
export const userMeSchema = z.object({
  id: z.string(),
  email: z.string().optional(),
  displayName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
  currentLevel: z.number(),
  levelProgress: z.number(),
  streak: z.number(),
  weight: z.number().nullable().optional(),
  lastWorkoutDate: z.string().nullable().optional(),
  workoutCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserMe = z.infer<typeof userMeSchema>;

export function useMe() {
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["/api/users/me"],
    queryFn: async () => {
      const response = await fetch("/api/users/me", {
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }

      const data = await response.json();
      
      // Validate response data with Zod
      const validated = userMeSchema.parse(data);
      return validated;
    },
    retry: true,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  return {
    user,
    isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch,
  };
}
