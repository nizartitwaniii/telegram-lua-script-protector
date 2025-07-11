import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { telegramBot } from "./services/telegram-bot";

export async function registerRoutes(app: Express): Promise<Server> {
  // Start Telegram bot
  telegramBot.start();

  // API Routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      const allScripts = await storage.getAllScripts();
      const totalAccessCount = allScripts.reduce((sum, script) => sum + (script.accessCount || 0), 0);
      
      res.json({
        ...stats,
        totalRequests: totalAccessCount,
        botStatus: telegramBot.getStatus(),
        recentScripts: allScripts.slice(0, 10).map(script => ({
          id: script.scriptId,
          username: script.username,
          createdAt: script.createdAt,
          accessCount: script.accessCount || 0,
        })),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/scripts", async (req, res) => {
    try {
      const scripts = await storage.getAllScripts();
      res.json(scripts.map(script => ({
        id: script.scriptId,
        username: script.username,
        createdAt: script.createdAt,
        accessCount: script.accessCount || 0,
        preview: script.content.substring(0, 100) + (script.content.length > 100 ? '...' : ''),
      })));
    } catch (error) {
      console.error("Error fetching scripts:", error);
      res.status(500).json({ error: "Failed to fetch scripts" });
    }
  });

  // Script serving endpoint (for Roblox)
  app.get("/s/:id", async (req, res) => {
    const scriptId = req.params.id;
    const userAgent = req.get('User-Agent') || '';
    
    // Check if request is from Roblox
    if (!userAgent.includes('Roblox')) {
      return res.status(403).json({ 
        error: "Access denied. This endpoint is only accessible from Roblox games." 
      });
    }

    try {
      const script = await storage.getScript(scriptId);
      
      if (!script) {
        return res.status(404).json({ error: "Script not found" });
      }

      // Increment access count
      await storage.incrementAccessCount(scriptId);
      
      // Return the Lua script content
      res.set('Content-Type', 'text/plain');
      res.send(script.content);
      
    } catch (error) {
      console.error("Error serving script:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      botStatus: telegramBot.getStatus(),
      timestamp: new Date().toISOString(),
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
