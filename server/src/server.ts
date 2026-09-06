import { app } from './app.js';
import { env } from './config/env.js';

const PORT = parseInt(env.PORT, 10) || 5000;

app.listen(PORT, () => {
  console.log(`🚀 ResumeAI Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`🧠 AI Provider: ${env.AI_PROVIDER}`);
});
