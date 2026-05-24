import amqplib from 'amqplib';
import { getChannel } from './connection.js';
import { EXCHANGE, QUEUES } from './config.js';
import { buildCodeGeneratorMessage, buildConfigurationGeneratorMessage } from './builders/simulationBuilder.js';
import { BaseRabbitMessage, CodeGeneratorPayload, ConfigurationGeneratorPayload, SimulatedSystem } from '../rabbitmq/types.js';

export async function publishMessage <T> (routingKey: string, messageBody: BaseRabbitMessage<T>): Promise<BaseRabbitMessage<T>> {
  const channel = getChannel() as amqplib.ConfirmChannel; 
  const payload = Buffer.from(JSON.stringify(messageBody));

  return new Promise((resolve, reject) => {
    channel.publish(
      EXCHANGE.name,
      routingKey,
      payload,
      {
        persistent: true,
        contentType: 'application/json',
        messageId: messageBody.message_id,
        timestamp: Date.now(),
      },
      (err: any) => {
        if (err) {
          console.error(`[RabbitMQ] Message NACK/Rejected by Broker! id=${messageBody.message_id}`);
          reject(err);
        } else {
          console.log(`[RabbitMQ] Safe ACK Received from Broker for id=${messageBody.message_id}`);
          resolve(messageBody);
        }
      }
    );
  });
}

export async function publishCodeGeneration(runId: string, target: string, messageCount: number ): Promise<void> {
  const message = buildCodeGeneratorMessage(runId, target, messageCount);
  await publishMessage(QUEUES.code_generator_queue.routingKey, message);
  console.log(`[RabbitMQ] Published CODE generation request for runId=${runId}`);
}

export async function publishConfigurationGeneration(runId: string, simulatedSystems: any[]): Promise<void> {
  const message = buildConfigurationGeneratorMessage(runId, simulatedSystems);
  await publishMessage(QUEUES.configuration_generator_queue.routingKey, message);
  console.log(`[RabbitMQ] Published YAML generation request for runId=${runId}`);
}
