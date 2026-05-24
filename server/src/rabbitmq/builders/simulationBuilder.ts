import { BaseRabbitMessage,
         DataWriterPayload,
         DataReaderPayload,
         CodeGeneratorPayload,
         ConfigurationGeneratorPayload,
         SimulatedSystem } from '../types.js';

export function buildCodeGeneratorMessage(
  runId: string,
  target: string,
  messageCount: number
  // dataWritersArray: DataWriterPayload[],
  // dataReadersArray: DataReaderPayload[] 
): BaseRabbitMessage<CodeGeneratorPayload> {
  
  return {
    event: 'simulation.run.code',
    message_id: runId, // מזהה ההרצה משמש גם כמזהה ההודעה למעקב
    triggered_at: new Date().toISOString(),
    payload: {
      target: target, messageCount
      // data_writers: dataWritersArray,
      // data_readers: dataReadersArray
    },
  };
}

export function buildConfigurationGeneratorMessage(
  runId: string,
  simulatedSystemsArray: SimulatedSystem[]
): BaseRabbitMessage<ConfigurationGeneratorPayload> {
  
  return {
    event: 'simulation.run.config',
    message_id: runId,
    triggered_at: new Date().toISOString(),
    payload: {
      run_id: runId,
      simulated_systems: simulatedSystemsArray
    },
  };
}