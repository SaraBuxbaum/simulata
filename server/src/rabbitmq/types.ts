// מעטפת הודעה גנרית לכל המערכת
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

export interface SimulationRunPayload {
  simulation_config_id: string;
  scenario_name: string;
  system1_name: string;
  system2_name: string;
  data_writers: DataWriterPayload[]; 
  data_readers: DataReaderPayload[];
}