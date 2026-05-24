export interface BaseRabbitMessage<T> {
  event: string;
  message_id: string;
  triggered_at: string;
  payload: T;
}

export interface DataWriterPayload {
  data_writer_id: string;
  name: string;
  message_count: number;
  message_frequency_hz: number;
}

export interface DataReaderPayload {
  data_reader_id: string;
  name: string;
  message_count: number;
  message_frequency_hz: number;
}

export interface SimulatedSystem {
  name: string;
  ostemplatename: string;
}

export interface CodeGeneratorPayload {
  target: string;
  messageCount: number;
}


export interface ConfigurationGeneratorPayload {
  run_id: string;
  simulated_systems: SimulatedSystem[];
}

//----Consumer-----

export interface CodeCompletedPayload {
  run_id: string;
  status: string;
}