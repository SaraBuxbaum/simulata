import client from './client';

export interface SimulationConfig {
  simulation_config_id: string;
  scenario_name: string;
  created_at: string;
  productions: ProductionConfig[];
}

export interface ProductionConfig {
  production_config_id: string;
  contracts: ContractConfig[];
}

export interface ContractConfig {
  contract_config_id: string;
  version: string;
  dataReader?: { message_count: number; message_frequency_hz: number };
  dataWriter?: { message_count: number; message_frequency_hz: number };
}

export interface CreateSimulationPayload {
  simulation_config_id?: string;
  scenario_name: string;
  productions: {
    contracts: {
      version: string;
      dataWriter?: { message_count: number; message_frequency_hz: number };
      dataReader?: { message_count: number; message_frequency_hz: number };
    }[];
  }[];
}

export async function getAllSimulations(): Promise<SimulationConfig[]> {
  const { data } = await client.get('/simulations');
  return data;
}

export async function getSimulationById(id: string): Promise<SimulationConfig> {
  const { data } = await client.get(`/simulations/${id}`);
  return data;
}

export async function createSimulation(payload: CreateSimulationPayload): Promise<SimulationConfig> {
  const { data } = await client.post('/simulations', payload);
  return data;
}

export async function updateSimulation(id: string, payload: Partial<CreateSimulationPayload>): Promise<SimulationConfig> {
  const { data } = await client.put(`/simulations/${id}`, payload);
  return data;
}

export async function deleteSimulation(id: string): Promise<void> {
  await client.delete(`/simulations/${id}`);
}

export async function runSimulation(id: string): Promise<{ run_id: string; status: string }> {
  const { data } = await client.post(`/simulations/${id}/run`);
  return data;
}
