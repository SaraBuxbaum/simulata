export const RABBITMQ_CONFIG = {
  url: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
  reconnectDelayMs: 5000,
} as const;

export const EXCHANGE = {
  name: 'simulata.exchange',
  type: 'topic',
  options: { durable: true },
} as const;

export const QUEUES = {
  code_generator_queue: {
    name: 'code_generator_queue',
    routingKey: 'code_generator_key',
    options: { durable: true },
  },
  configuration_generator_queue: {
    name: 'configuration_generator_queue',
    routingKey: 'configuration_generator_key',
    options: { durable: true },
  },
  code_completed_queue: {
    name: 'code_completed_queue',
    routingKey: 'code_completed_key',
    options: { durable: true },
  }
} as const;