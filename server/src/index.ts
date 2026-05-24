import 'dotenv/config';
import app from './app.js';
import { connect, disconnect } from './rabbitmq/index.js';
import { registerAllConsumers } from './rabbitmq/consumer.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`)
  try {
    await connect();
    await registerAllConsumers();
  } catch (error) {
    console.error(' Failed to initialize RabbitMQ or start consumers:', error);
  }
});

// Neat cleanup when the server goes down
process.on('SIGINT', async () => { await disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await disconnect(); process.exit(0); });
