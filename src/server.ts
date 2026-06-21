import 'dotenv/config';
import { app } from './app';

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor do SaaS rodando em: http://localhost:${PORT}`);
});