import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";

// For development only - create an in-memory mock user
const mockUser = {
  id: "local-user-123",
  email: "dev@example.com",
  displayName: "Developer",
  picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=dev",
};

// Flag to track if we've initialized the dev user in DB
let devUserInitialized = false;

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      displayName: string;
      picture?: string;
    }
    interface Request {
      user?: User;
    }
  }
}

export function setupLocalAuth(app: Express) {
  const MemStoreInstance = MemoryStore(session);
  
  app.use(
    session({
      store: new MemStoreInstance({
        checkPeriod: 86400000, // 24 hours
      }),
      secret: process.env.SESSION_SECRET || "dev-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Allow non-HTTPS in development
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      },
    })
  );

  // Middleware to automatically set mock user
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    // Ensure the dev user exists in the database (run once)
    if (!devUserInitialized) {
      try {
        await storage.upsertUser({
          id: mockUser.id,
          email: mockUser.email,
          firstName: "Developer",
          lastName: "User",
          profileImageUrl: mockUser.picture,
        });
        devUserInitialized = true;
        console.log("Local dev user initialized in database");
      } catch (error) {
        console.error("Failed to initialize dev user:", error);
      }
    }

    if (!req.session.user) {
      req.session.user = mockUser;
    }
    req.user = req.session.user;
    next();
  });

  // Login route (instant for local dev)
  app.get("/api/login", (req: Request, res: Response) => {
    req.session.user = mockUser;
    res.redirect("/");
  });

  // Logout route
  app.get("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Logout failed");
      }
      res.redirect("/");
    });
  });

  // Get current user endpoint
  app.get("/api/auth/user", (req: Request, res: Response) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
}
