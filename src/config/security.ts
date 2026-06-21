import helmet from 'helmet'
import cors from 'cors'

// ========================
// HELMET
// ========================
export const helmetConfig = helmet({
  contentSecurityPolicy: false,
})

// ========================
// CORS
// ========================
export const corsConfig = cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  credentials: true,
})