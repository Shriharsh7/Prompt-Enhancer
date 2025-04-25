import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePrompt, refinePrompt, testPrompt } from './gemini';
import { 
  generatePromptSchema, 
  refinePromptSchema, 
  testPromptSchema 
} from '@shared/schema';
import { State } from './types';

// In-memory rate limiting
interface RateLimitRecord {
  userId: string;
  timestamp: number;
  count: number;
}

const rateLimits: Map<string, RateLimitRecord> = new Map();
const DAILY_LIMIT = 25;

// Check daily calls and update rate limit
function checkAndUpdateRateLimit(userId: string): boolean {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const oneDayAgo = now - oneDay;
  
  // Get or create rate limit record
  let record = rateLimits.get(userId);
  if (!record) {
    record = { userId, timestamp: now, count: 0 };
    rateLimits.set(userId, record);
  }
  
  // Reset counter if it's been more than a day
  if (record.timestamp < oneDayAgo) {
    record.timestamp = now;
    record.count = 0;
  }
  
  // Check if limit reached
  if (record.count >= DAILY_LIMIT) {
    return false;
  }
  
  // Update count and return true
  record.count += 1;
  return true;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();
  
  // Generate prompt endpoint
  router.post('/generate', async (req, res) => {
    try {
      const userId = req.ip || 'anonymous';
      
      // Check rate limit
      if (!checkAndUpdateRateLimit(userId)) {
        return res.status(429).json({ 
          error: 'Daily limit of 25 calls reached. Try again tomorrow.' 
        });
      }
      
      // Validate request body
      const validation = generatePromptSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid request body', 
          details: validation.error.format() 
        });
      }
      
      const { prompt, template } = validation.data;
      const state: State = { prompt, refinement_count: 0 };
      
      // Generate prompt
      const result = await generatePrompt(state, template);
      
      return res.json({
        prompt: result.prompt,
        refinement_count: result.refinement_count
      });
    } catch (error) {
      console.error('Error in generate endpoint:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  });
  
  // Refine prompt endpoint
  router.post('/refine', async (req, res) => {
    try {
      const userId = req.ip || 'anonymous';
      
      // Check rate limit
      if (!checkAndUpdateRateLimit(userId)) {
        return res.status(429).json({ 
          error: 'Daily limit of 25 calls reached. Try again tomorrow.' 
        });
      }
      
      // Validate request body
      const validation = refinePromptSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid request body', 
          details: validation.error.format() 
        });
      }
      
      const { prompt, additional_input, refinement_count } = validation.data;
      
      // Check if maximum refinements reached
      if (refinement_count >= 3) {
        return res.status(400).json({ 
          error: 'Maximum refinements (3) reached' 
        });
      }
      
      const state: State = { prompt, refinement_count };
      
      // Refine prompt
      const result = await refinePrompt(state, additional_input);
      
      return res.json({
        refined_prompt: result.prompt,
        refinement_count: result.refinement_count
      });
    } catch (error) {
      console.error('Error in refine endpoint:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  });
  
  // Test prompt endpoint
  router.post('/test', async (req, res) => {
    try {
      const userId = req.ip || 'anonymous';
      
      // Check rate limit
      if (!checkAndUpdateRateLimit(userId)) {
        return res.status(429).json({ 
          error: 'Daily limit of 25 calls reached. Try again tomorrow.' 
        });
      }
      
      // Validate request body
      const validation = testPromptSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid request body', 
          details: validation.error.format() 
        });
      }
      
      const { prompt } = validation.data;
      
      // Test prompt
      const response = await testPrompt(prompt);
      
      return res.json({ response });
    } catch (error) {
      console.error('Error in test endpoint:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  });
  
  // Register API routes
  app.use('/api', router);
  
  // Health check endpoint
  app.get('/api/health', (_, res) => {
    res.json({ status: 'ok' });
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
