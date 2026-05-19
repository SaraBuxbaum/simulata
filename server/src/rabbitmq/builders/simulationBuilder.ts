import { 
  BaseRabbitMessage, 
  GeneratorCodePayload, 
  GeneratorYamlPayload, 
  DataWriterPayload, 
  DataReaderPayload, 
  SimulatedSystem 
} from '../../rabbitmq/types.js';

export function buildGeneratorCodeMessage(
  runId: string,
  ipAddress: string,
  dataWritersArray: DataWriterPayload[],
  dataReadersArray: DataReaderPayload[] 
): BaseRabbitMessage<GeneratorCodePayload> {
  
  return {
    event: 'simulation.run.code',
    message_id: runId, // מזהה ההרצה משמש גם כמזהה ההודעה למעקב
    triggered_at: new Date().toISOString(),
    payload: {
      ip_address: ipAddress,
      data_writers: dataWritersArray,
      data_readers: dataReadersArray
    },
  };
}

export function buildGeneratorYamlMessage(
  runId: string,
  simulatedSystemsArray: SimulatedSystem[]
): BaseRabbitMessage<GeneratorYamlPayload> {
  
  return {
    event: 'simulation.run.yaml',
    message_id: runId,
    triggered_at: new Date().toISOString(),
    payload: {
      run_id: runId,
      simulated_systems: simulatedSystemsArray
    },
  };
}