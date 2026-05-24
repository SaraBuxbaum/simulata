import { getChannel } from './connection.js';
import { QUEUES } from './config.js';
import { publishConfigurationGeneration } from './publisher.js';
import { CodeCompletedPayload } from './types.js';
import { readData, writeData } from '../utils/readWriteData.js';

export async function consumeQueue <T> (queueName: string, messageHandler: (payload: T) => Promise<void>): Promise<void> {
  
  const channel = getChannel();
  console.log(`[RabbitMQ] Starting generic consumer on queue: ${queueName}`);

  await channel.consume(queueName, async (msg) => {
    if (!msg) return;

    try {
      const content = JSON.parse(msg.content.toString()) as T;
      await messageHandler(content);
      channel.ack(msg);

    } catch (error) {
      console.error(`[RabbitMQ] Error processing message from queue ${queueName}:`, error);
      channel.nack(msg, false, true); //requeue
    }
  });
}

export async function startCodeCompletedConsumer(): Promise<void> {
  
  await consumeQueue<CodeCompletedPayload>( QUEUES.code_completed_queue.name, async (payload) => {
      console.log(`[RabbitMQ Consumer] Received completion message from Python:`, payload);
      const { run_id: runId, status } = payload;
      const runs = await readData('simulationRuns');
      const runIndex = runs.findIndex((r: any) => r.simulation_run_id === runId);

      if (status === 'success') {

        if (runIndex !== -1) {
          const runDetails = runs[runIndex];
          //Now we can send the message to the second queue - Yaml Generator
          await publishConfigurationGeneration(runId, runDetails.simulated_systems);
          console.log(`[RabbitMQ Consumer] Transitioned runId=${runId} to YAML generation.`);
        
        } else {
          console.warn(`[RabbitMQ Consumer] Run ID ${runId} not found in DB. Cannot proceed to YAML.`);
        }
      } else {
        console.error(`[RabbitMQ Consumer] Python reported a failure for runId=${runId}. Status: ${payload.status}`);
        // TODO 
        // לעדכן בעתיד שההרצה נכשלה במובן של הרמת התשתית וכו
      }
    }
  );
}

export async function registerAllConsumers(): Promise<void> {
    await startCodeCompletedConsumer();
}