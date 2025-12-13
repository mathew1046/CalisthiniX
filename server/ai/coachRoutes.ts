import { Express, Request, Response } from "express";
import { geminiModel, COACH_SYSTEM_PROMPT } from "./geminiClient";
import { sql } from "../db";
import { z } from "zod";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

interface CoachChatRequest {
  message: string;
  history: ChatMessage[];
}

interface CoachChatResponse {
  reply: string;
  suggestedFollowUps: string[];
}

// Schemas for template generation
const generateTemplateRequestSchema = z.object({
  goal: z.string().min(1, "Goal is required"),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  focusAreas: z.array(z.string()).optional(),
  name: z.string().optional(),
});

const generatedTemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.enum(["push", "pull", "legs", "core", "full_body"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  exercises: z.array(z.object({
    exerciseSlug: z.string(),
    sets: z.number().min(1).max(10),
    reps: z.number().min(1).max(100),
    restSeconds: z.number().min(0).max(300),
    notes: z.string().optional(),
  })).min(1).max(12),
});

type GenerateTemplateRequest = z.infer<typeof generateTemplateRequestSchema>;
type GeneratedTemplate = z.infer<typeof generatedTemplateSchema>;

// Helper to get user ID from request (works with local auth pattern)
function getUserId(req: Request): string | null {
  // req.user is set by localAuth middleware
  if (req.user?.id) {
    return req.user.id;
  }
  return null;
}

// Build user context from database
async function buildUserContext(userId: string): Promise<string> {
  try {
    // Get user profile
    const userResult = await sql`
      SELECT id, display_name, current_level, streak, created_at 
      FROM users 
      WHERE id = ${userId}
    `;
    const user = userResult[0];

    if (!user) {
      return "User profile not found.";
    }

    // Get recent workouts (last 7)
    const workoutsResult = await sql`
      SELECT id, name, date, duration, total_volume, notes
      FROM workouts
      WHERE user_id = ${userId}
      ORDER BY date DESC
      LIMIT 7
    `;

    // Get exercises from recent workouts
    let exercisesContext = "";
    if (workoutsResult.length > 0) {
      const workoutIds = workoutsResult.map((w: any) => w.id);
      const exercisesResult = await sql`
        SELECT e.workout_id, e.name, e.sets, e."order"
        FROM exercises e
        WHERE e.workout_id = ANY(${workoutIds})
        ORDER BY e.workout_id, e."order"
      `;

      // Group exercises by workout
      const exercisesByWorkout = exercisesResult.reduce((acc: any, ex: any) => {
        if (!acc[ex.workout_id]) acc[ex.workout_id] = [];
        acc[ex.workout_id].push(ex);
        return acc;
      }, {});

      exercisesContext = workoutsResult.map((w: any) => {
        const exs = exercisesByWorkout[w.id] || [];
        const exList = exs.map((e: any) => {
          // sets is a JSONB array like [{reps: 10, weight: 0, rpe: 7, completed: false}, ...]
          const setsArr = e.sets || [];
          const setCount = setsArr.length;
          const avgReps = setsArr.length > 0 
            ? Math.round(setsArr.reduce((sum: number, s: any) => sum + (s.reps || 0), 0) / setsArr.length)
            : 0;
          const weight = setsArr[0]?.weight || 0;
          return `  - ${e.name}: ${setCount} sets x ${avgReps} reps${weight > 0 ? ` @ ${weight}kg` : ""}`;
        }).join("\n");
        return `${w.name} (${new Date(w.date).toLocaleDateString()}): ${w.duration ? `${w.duration} min` : ""}${w.total_volume ? `, Volume: ${w.total_volume}` : ""}\n${exList}`;
      }).join("\n\n");
    }

    // Get workout templates
    const templatesResult = await sql`
      SELECT id, name, description
      FROM workout_templates
      WHERE user_id = ${userId}
      LIMIT 5
    `;

    // Get personal records
    const prsResult = await sql`
      SELECT exercise_name, value, achieved_at
      FROM personal_records
      WHERE user_id = ${userId}
      ORDER BY achieved_at DESC
      LIMIT 10
    `;

    // Build context string
    let context = `## User Profile
- Display Name: ${user.display_name || "Not set"}
- Current Level: ${user.current_level || "Beginner"}
- Current Streak: ${user.streak || 0} days
- Member since: ${new Date(user.created_at).toLocaleDateString()}

`;

    if (workoutsResult.length > 0) {
      context += `## Recent Workouts (Last ${workoutsResult.length})
${exercisesContext}

`;
    } else {
      context += `## Recent Workouts
No workouts recorded yet.

`;
    }

    if (templatesResult.length > 0) {
      context += `## Saved Workout Templates
${templatesResult.map((t: any) => `- ${t.name}${t.description ? `: ${t.description}` : ""}`).join("\n")}

`;
    }

    if (prsResult.length > 0) {
      context += `## Personal Records
${prsResult.map((pr: any) => `- ${pr.exercise_name}: ${pr.value}`).join("\n")}
`;
    }

    return context;
  } catch (error) {
    console.error("Error building user context:", error);
    return "Unable to retrieve user data.";
  }
}

// Extract suggested follow-up questions from the response
function extractSuggestedFollowUps(reply: string, userMessage: string): string[] {
  const suggestions: string[] = [];
  
  // Generate contextual follow-ups based on the conversation
  if (userMessage.toLowerCase().includes("workout") || userMessage.toLowerCase().includes("exercise")) {
    suggestions.push("What's the best progression for this exercise?");
    suggestions.push("How often should I train this?");
  }
  
  if (userMessage.toLowerCase().includes("form") || userMessage.toLowerCase().includes("technique")) {
    suggestions.push("What are common mistakes to avoid?");
    suggestions.push("Can you suggest some drills to improve my form?");
  }
  
  if (userMessage.toLowerCase().includes("goal") || userMessage.toLowerCase().includes("progress")) {
    suggestions.push("Create a weekly training plan for me");
    suggestions.push("What milestones should I aim for?");
  }

  // Default suggestions if none match
  if (suggestions.length === 0) {
    suggestions.push("What should I focus on next?");
    suggestions.push("Can you analyze my recent workouts?");
    suggestions.push("Suggest a workout for today");
  }

  return suggestions.slice(0, 3);
}

export function registerCoachRoutes(app: Express): void {
  // POST /api/coach/chat - Send message to AI coach
  app.post("/api/coach/chat", async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: "AI Coach is not configured. Please set GEMINI_API_KEY." });
      }

      const { message, history = [] }: CoachChatRequest = req.body;

      if (!message || typeof message !== "string" || message.trim().length === 0) {
        return res.status(400).json({ error: "Message is required and cannot be empty" });
      }

      // Limit message length to prevent abuse
      if (message.length > 5000) {
        return res.status(400).json({ error: "Message too long (max 5000 characters)" });
      }

      // Limit history length to prevent token overflow
      const trimmedHistory = history.slice(-10); // Keep last 10 messages

      // Build user context
      const userContext = await buildUserContext(userId);

      // Build the full prompt with system context
      const systemContext = `${COACH_SYSTEM_PROMPT}

## Current User Context
${userContext}`;

      // Build Gemini contents array
      const contents = [];

      // Add system prompt as first user message (Gemini doesn't have a system role)
      contents.push({
        role: "user",
        parts: [{ text: `[System Instructions]\n${systemContext}\n\n[End System Instructions]\n\nPlease acknowledge these instructions briefly and be ready to help.` }]
      });
      contents.push({
        role: "model",
        parts: [{ text: "I understand! I'm Calyxpert Coach, your personal calisthenics and fitness assistant. I've reviewed your profile and workout history, and I'm ready to help you with personalized advice, workout planning, and progression strategies. What would you like to work on today?" }]
      });

      // Add conversation history
      for (const msg of trimmedHistory) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      }

      // Add current message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      // Call Gemini API
      const result = await geminiModel.generateContent({ contents });
      const response = result.response;
      const reply = response.text();

      // Generate suggested follow-ups
      const suggestedFollowUps = extractSuggestedFollowUps(reply, message);

      const responseData: CoachChatResponse = {
        reply,
        suggestedFollowUps
      };

      res.json(responseData);
    } catch (error: any) {
      console.error("Coach chat error:", error);
      
      // Handle specific Gemini API errors
      if (error.message?.includes("API key")) {
        return res.status(503).json({ error: "AI Coach configuration error. Please check GEMINI_API_KEY." });
      }
      
      if (error.message?.includes("RATE_LIMIT") || error.message?.includes("quota")) {
        return res.status(429).json({ error: "AI Coach is temporarily overloaded. Please try again in a moment." });
      }
      
      if (error.message?.includes("SAFETY")) {
        return res.status(400).json({ error: "Your message couldn't be processed. Please rephrase and try again." });
      }
      
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // GET /api/coach/suggestions - Get initial conversation starters
  app.get("/api/coach/suggestions", async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Check if user has workouts
      const workoutCount = await sql`
        SELECT COUNT(*) as count FROM workouts WHERE user_id = ${userId}
      `;
      const hasWorkouts = parseInt(workoutCount[0].count) > 0;

      const suggestions = hasWorkouts
        ? [
            "Analyze my recent workouts and suggest improvements",
            "What should I focus on in my next workout?",
            "Help me create a weekly training plan",
            "What progressions should I work on?"
          ]
        : [
            "I'm new to calisthenics, where should I start?",
            "What's a good beginner workout routine?",
            "How do I do a proper push-up?",
            "What equipment do I need for calisthenics?"
          ];

      res.json({ suggestions });
    } catch (error) {
      console.error("Error getting suggestions:", error);
      res.status(500).json({ error: "Failed to get suggestions" });
    }
  });

  // POST /api/coach/generate-template - Generate a workout template using AI
  app.post("/api/coach/generate-template", async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: "AI Coach is not configured. Please set GEMINI_API_KEY." });
      }

      // Validate request body
      const parseResult = generateTemplateRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: parseResult.error.errors 
        });
      }

      const { goal, level = "intermediate", focusAreas, name: customName } = parseResult.data;

      // Fetch available exercises from exercise_library
      const exercisesResult = await sql`
        SELECT id, slug, name, category, difficulty
        FROM exercise_library
        ORDER BY category, difficulty, name
      `;

      if (exercisesResult.length === 0) {
        return res.status(500).json({ error: "No exercises available in the library" });
      }

      // Build exercise list for the prompt
      const exerciseList = exercisesResult.map((e: any) => 
        `- ${e.slug} (${e.name}, ${e.category}, ${e.difficulty})`
      ).join("\n");

      // Build the prompt for Gemini
      const templatePrompt = `You are a workout template generator. Generate a workout template as JSON based on the user's requirements.

AVAILABLE EXERCISES (use ONLY these exerciseSlug values):
${exerciseList}

REQUIREMENTS:
- Goal: ${goal}
- Fitness Level: ${level}
${focusAreas && focusAreas.length > 0 ? `- Focus Areas: ${focusAreas.join(", ")}` : ""}

INSTRUCTIONS:
1. Select 4-8 exercises that match the goal, level, and focus areas
2. Use ONLY exerciseSlug values from the list above
3. Assign appropriate sets (2-5), reps (5-20), and rest seconds (30-120)
4. Choose the most appropriate category based on exercises selected
5. Return ONLY valid JSON, no prose or explanations

OUTPUT FORMAT (strict JSON, no markdown):
{
  "name": "Template Name",
  "description": "Brief description of the workout",
  "category": "push" | "pull" | "legs" | "core" | "full_body",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "exercises": [
    {
      "exerciseSlug": "exercise-slug-from-list",
      "sets": 3,
      "reps": 10,
      "restSeconds": 60,
      "notes": "Optional form tip"
    }
  ]
}`;

      // Call Gemini API
      const result = await geminiModel.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: templatePrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more deterministic JSON
          maxOutputTokens: 2048,
        }
      });

      const responseText = result.response.text();
      
      // Clean the response - remove markdown code blocks if present
      let jsonText = responseText.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.slice(7);
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.slice(3);
      }
      if (jsonText.endsWith("```")) {
        jsonText = jsonText.slice(0, -3);
      }
      jsonText = jsonText.trim();

      // Parse and validate JSON
      let generatedTemplate: GeneratedTemplate;
      try {
        const parsed = JSON.parse(jsonText);
        const validated = generatedTemplateSchema.safeParse(parsed);
        
        if (!validated.success) {
          console.error("Template validation failed:", validated.error);
          return res.status(500).json({ 
            error: "AI generated an invalid template structure",
            details: validated.error.errors
          });
        }
        
        generatedTemplate = validated.data;
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "Raw:", jsonText);
        return res.status(500).json({ error: "AI response was not valid JSON" });
      }

      // Verify all exercise slugs exist and get their IDs
      const exerciseSlugToId = new Map<string, string>();
      for (const ex of exercisesResult) {
        exerciseSlugToId.set(ex.slug, ex.id);
      }

      const invalidSlugs: string[] = [];
      for (const ex of generatedTemplate.exercises) {
        if (!exerciseSlugToId.has(ex.exerciseSlug)) {
          invalidSlugs.push(ex.exerciseSlug);
        }
      }

      if (invalidSlugs.length > 0) {
        return res.status(500).json({ 
          error: "AI used invalid exercise slugs",
          invalidSlugs 
        });
      }

      // Save template to database
      const finalName = customName || generatedTemplate.name;
      
      // Insert workout_templates
      const templateResult = await sql`
        INSERT INTO workout_templates (user_id, name, description, difficulty, category, is_public)
        VALUES (${userId}, ${finalName}, ${generatedTemplate.description}, ${generatedTemplate.difficulty}, ${generatedTemplate.category}, false)
        RETURNING id
      `;
      
      const templateId = templateResult[0].id;

      // Insert workout_template_exercises
      for (let i = 0; i < generatedTemplate.exercises.length; i++) {
        const ex = generatedTemplate.exercises[i];
        const exerciseId = exerciseSlugToId.get(ex.exerciseSlug)!;
        const notes = ex.notes || null;
        
        await sql`
          INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
          VALUES (${templateId}, ${exerciseId}, ${i}, ${ex.sets}, ${ex.reps}, ${ex.restSeconds}, ${notes})
        `;
      }

      res.json({
        templateId,
        templateName: finalName,
      });

    } catch (error: any) {
      console.error("Generate template error:", error);
      
      if (error.message?.includes("API key")) {
        return res.status(503).json({ error: "AI Coach configuration error" });
      }
      
      res.status(500).json({ error: "Failed to generate template" });
    }
  });
}
