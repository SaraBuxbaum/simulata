import { getChannel } from './connection.js';
import { EXCHANGE, QUEUES } from './config.js';
import { buildSimulationRunMessage, type SimulationRunMessage } from './messageBuilder.js';

// ─── Publish ──────────────────────────────────────────────────────────────────

export function publishSimulationRun(simulation: any, runId: string): SimulationRunMessage {
  const channel = getChannel();
  const message = buildSimulationRunMessage(simulation, runId);

  const payload = Buffer.from(JSON.stringify(message));

  channel.publish(
    EXCHANGE.name,
    QUEUES.simulationRun.routingKey,
    payload,
    {
      persistent: true,           // survives broker restart
      contentType: 'application/json',
      messageId: runId,
      timestamp: Date.now(),
    }
  );

  console.log(`[RabbitMQ] Published simulation.run → run_id=${runId}, scenario="${simulation.scenario_name}"`);
  return message;
}
