// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContractPayload {
  contract_id: string;
  version: string;
  writer?: { message_count: number; message_frequency_hz: number };
  reader?: { message_count: number; message_frequency_hz: number };
}

export interface ProductionPayload {
  production_id: string;
  contracts: ContractPayload[];
}

export interface SimulationRunMessage {
  event: 'simulation.run';
  run_id: string;
  simulation_config_id: string;
  scenario_name: string;
  triggered_at: string;
  productions: ProductionPayload[];
}

// ─── Builder ──────────────────────────────────────────────────────────────────

export function buildSimulationRunMessage(simulation: any, runId: string): SimulationRunMessage {
  const productions: ProductionPayload[] = (simulation.productions ?? []).map(
    (prod: any, prodIdx: number) => ({
      production_id: prod.production_config_id ?? `prod-${prodIdx}`,
      contracts: (prod.contracts ?? []).map((c: any, cIdx: number): ContractPayload => ({
        contract_id: c.contract_config_id ?? `contract-${prodIdx}-${cIdx}`,
        version: c.version ?? '1.0.0',
        ...(c.dataWriter && {
          writer: {
            message_count: c.dataWriter.message_count,
            message_frequency_hz: c.dataWriter.message_frequency_hz,
          },
        }),
        ...(c.dataReader && {
          reader: {
            message_count: c.dataReader.message_count,
            message_frequency_hz: c.dataReader.message_frequency_hz,
          },
        }),
      })),
    })
  );

  return {
    event: 'simulation.run',
    run_id: runId,
    simulation_config_id: simulation.simulation_config_id,
    scenario_name: simulation.scenario_name,
    triggered_at: new Date().toISOString(),
    productions,
  };
}
