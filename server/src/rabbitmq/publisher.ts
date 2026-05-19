import amqplib from 'amqplib';
import { getChannel } from './connection.js';
import { EXCHANGE, QUEUES } from './config.js';
import { buildGeneratorCodeMessage, buildGeneratorYamlMessage } from './builders/simulationBuilder.js';
import {  BaseRabbitMessage,  GeneratorCodePayload,  GeneratorYamlPayload,
          DataWriterPayload, DataReaderPayload,SimulatedSystem } from '../rabbitmq/types.js';

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

export async function publishSimulationRun(
    runId: string,
    ipAddress: string,
    dataWritersArray: DataWriterPayload[], 
    dataReadersArray: DataReaderPayload[],
    simulatedSystemsArray: SimulatedSystem[]
  ): Promise<void> {
    
    const codeMessage = buildGeneratorCodeMessage(
      runId, 
      ipAddress, 
      dataWritersArray, 
      dataReadersArray
    );

    const yamlMessage = buildGeneratorYamlMessage(
      runId, 
      simulatedSystemsArray
    );
    
    try {
      await Promise.all([
        publishMessage<GeneratorCodePayload>(QUEUES.generator_code_queue.routingKey, codeMessage),
        publishMessage<GeneratorYamlPayload>(QUEUES.generator_yaml_queue.routingKey, yamlMessage)
      ]);
      console.log(`[RabbitMQ] Successfully published code & yaml messages for runId=${runId}`);
    } catch (err) {
      console.error(`[RabbitMQ] Failed to publish simulation run messages for runId=${runId}`, err);
      throw err; 
    }
}