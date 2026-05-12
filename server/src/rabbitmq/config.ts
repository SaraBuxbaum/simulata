// ─── RabbitMQ Configuration ───────────────────────────────────────────────────

export const RABBITMQ_CONFIG = {
  url: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
  reconnectDelayMs: 5000,
} as const;

// Exchange: one direct exchange for all simulation commands
export const EXCHANGE = {
  name: 'simulata.exchange',
  type: 'direct',
  options: { durable: true },
} as const;

// Queue consumed by the Python service
export const QUEUES = {
  simulationRun: {
    name: 'simulata.simulation.run',
    routingKey: 'simulation.run',
    options: { durable: true },
  },
} as const;
