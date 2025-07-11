import { scripts, botStats, type Script, type InsertScript, type BotStats, type InsertBotStats } from "@shared/schema";

export interface IStorage {
  // Script operations
  createScript(script: InsertScript): Promise<Script>;
  getScript(scriptId: string): Promise<Script | undefined>;
  getScriptsByUser(userId: string): Promise<Script[]>;
  getAllScripts(): Promise<Script[]>;
  incrementAccessCount(scriptId: string): Promise<void>;
  
  // Stats operations
  getStats(): Promise<BotStats | undefined>;
  updateStats(stats: Partial<InsertBotStats>): Promise<BotStats>;
}

export class MemStorage implements IStorage {
  private scripts: Map<string, Script>;
  private stats: BotStats;
  private currentScriptId: number;

  constructor() {
    this.scripts = new Map();
    this.currentScriptId = 1;
    this.stats = {
      id: 1,
      totalScripts: 0,
      totalUsers: 0,
      totalRequests: 0,
      lastUpdated: new Date(),
    };
  }

  async createScript(insertScript: InsertScript): Promise<Script> {
    const id = this.currentScriptId++;
    const script: Script = {
      ...insertScript,
      id,
      createdAt: new Date(),
      accessCount: 0,
    };
    
    this.scripts.set(insertScript.scriptId, script);
    
    // Update stats
    this.stats.totalScripts = this.scripts.size;
    this.stats.totalUsers = new Set(Array.from(this.scripts.values()).map(s => s.userId)).size;
    this.stats.lastUpdated = new Date();
    
    return script;
  }

  async getScript(scriptId: string): Promise<Script | undefined> {
    return this.scripts.get(scriptId);
  }

  async getScriptsByUser(userId: string): Promise<Script[]> {
    return Array.from(this.scripts.values()).filter(script => script.userId === userId);
  }

  async getAllScripts(): Promise<Script[]> {
    return Array.from(this.scripts.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async incrementAccessCount(scriptId: string): Promise<void> {
    const script = this.scripts.get(scriptId);
    if (script) {
      script.accessCount = (script.accessCount || 0) + 1;
      this.scripts.set(scriptId, script);
      
      // Update total requests
      this.stats.totalRequests = (this.stats.totalRequests || 0) + 1;
      this.stats.lastUpdated = new Date();
    }
  }

  async getStats(): Promise<BotStats | undefined> {
    return this.stats;
  }

  async updateStats(statsUpdate: Partial<InsertBotStats>): Promise<BotStats> {
    this.stats = {
      ...this.stats,
      ...statsUpdate,
      lastUpdated: new Date(),
    };
    return this.stats;
  }
}

export const storage = new MemStorage();
