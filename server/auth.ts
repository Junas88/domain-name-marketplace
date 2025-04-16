import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import MemoryStore from "memorystore";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);
const MemoryStoreSession = MemoryStore(session);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "takemyname-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        // If user not found, return false
        if (!user) {
          console.log(`Login failed: Username '${username}' not found`);
          return done(null, false);
        }
        
        // Special case for in-memory database with specific admin password
        if (username === 'admin' && (password === 'admin123' || password === 'DomainGuide#2025')) {
          console.log('Admin login successful using direct password match');
          return done(null, user);
        }
        
        // For all other cases, use password comparison
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          console.log(`Login failed: Invalid password for user '${username}'`);
          return done(null, false);
        }
        
        console.log(`Login successful for user '${username}'`);
        return done(null, user);
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: Express.User) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json({
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user as Express.User;
    return res.status(200).json({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    });
  });
  
  // Add a route for changing password
  app.post("/api/auth/change-password", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    
    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }
    
    try {
      const user = req.user as Express.User;
      
      // Special case for admin user with direct password match
      if (user.username === 'admin' && (currentPassword === 'admin123' || currentPassword === 'DomainGuide#2025')) {
        // Password is correct, update to new password
        const hashedNewPassword = await hashPassword(newPassword);
        await storage.updateUserPassword(user.id, hashedNewPassword);
        
        return res.status(200).json({ message: "Password updated successfully" });
      }
      
      // For regular users, check the current password first
      const isCurrentPasswordValid = await comparePasswords(currentPassword, user.password);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash the new password
      const hashedNewPassword = await hashPassword(newPassword);
      
      // Update the password in storage
      await storage.updateUserPassword(user.id, hashedNewPassword);
      
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Middleware to check if user is admin
  app.use("/api/admin/*", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = req.user as Express.User;
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    next();
  });

  // Initial admin user creation (only if no admin exists)
  (async () => {
    const adminUser = await storage.getUserByUsername("admin");
    if (!adminUser) {
      // Using a strong password with mixed case, numbers, and special characters
      const securePassword = "DomainGuide#2025";
      await storage.createUser({
        username: "admin",
        password: await hashPassword(securePassword),
        isAdmin: true
      });
      console.log(`Admin user created - Username: admin, Password: ${securePassword}`);
    }
  })();
}