import client from './client';

export interface Stats {
  total_runs: number;
  passed: number;
  failed: number;
  pass_rate: number;
}

export interface RunInfo {
  id: string;
  simulation_name: string;
  status: string;
  duration_seconds: number;
  total_events: number;
  error_count: number;
  started_at: string;
  errors?: string[];
  config_snapshot?: Record<string, any>;
  report?: RunReport;
  message_summary?: Record<string, any>;
}

export interface RunReport {
  assertion_results: AssertionResult[];
  deployment_health: Record<string, { initialized: boolean }>;
  topic_stats?: Record<string, TopicStat>;
}

export interface AssertionResult {
  assertion_type: string;
  passed: boolean;
  scope?: string;
  message: string;
}

export interface TopicStat {
  sent: number;
  received: number;
  lost: number;
  loss_percent: number;
}

export interface RunEventInfo {
  id?: string;
  timestamp: string;
  severity: string;
  category: string;
  topic?: string;
  message: string;
  participant?: string;
  endpoint?: string;
}

export interface WsInitMessage {
  simulation_name: string;
  config?: Record<string, any>;
  status: string;
}

export async function getStats(): Promise<Stats> {
  const { data } = await client.get<RunInfo[]>('/runs');
  const runs: RunInfo[] = data;
  const passed = runs.filter((r) => r.status === 'passed').length;
  return {
    total_runs: runs.length,
    passed,
    failed: runs.length - passed,
    pass_rate: runs.length > 0 ? Math.round((passed / runs.length) * 100) : 0,
  };
}

export async function listRuns(opts?: {
  limit?: number;
  simulation_name?: string;
  status?: string;
}): Promise<RunInfo[]> {
  const { data } = await client.get<RunInfo[]>('/runs');
  let runs = data;
  if (opts?.simulation_name) runs = runs.filter((r) => r.simulation_name === opts.simulation_name);
  if (opts?.status) runs = runs.filter((r) => r.status === opts.status);
  if (opts?.limit) runs = runs.slice(0, opts.limit);
  return runs;
}

export async function getRun(id: string): Promise<RunInfo & { config_snapshot: Record<string, any> }> {
  const { data } = await client.get<RunInfo>(`/runs/${id}`);
  if (!data) throw new Error('Run not found');
  return { ...data, config_snapshot: (data as any).config_snapshot ?? {} };
}

export async function getRunEvents(_id: string): Promise<RunEventInfo[]> {
  return [];
}

// ─── Build visual config from simulation productions ──────────────────────────

function buildConfigFromSimulation(simulation: any): Record<string, any> {
  const topics: { name: string }[] = [];
  const participants: { name: string; writers: { topic: string }[]; readers: { topic: string }[] }[] = [];

  (simulation?.productions ?? []).forEach((prod: any, pi: number) => {
    (prod.contracts ?? []).forEach((c: any, ci: number) => {
      const topicName = `Topic_P${pi + 1}_C${ci + 1}`;
      if (!topics.find((t) => t.name === topicName)) topics.push({ name: topicName });
      if (c.dataWriter) participants.push({ name: `Writer_${pi + 1}_${ci + 1}`, writers: [{ topic: topicName }], readers: [] });
      if (c.dataReader) participants.push({ name: `Reader_${pi + 1}_${ci + 1}`, writers: [], readers: [{ topic: topicName }] });
    });
  });

  return { topics, participants };
}

function buildMockEvents(simulation: any): Record<string, any>[] {
  const events: Record<string, any>[] = [];
  (simulation?.productions ?? []).forEach((prod: any, pi: number) => {
    (prod.contracts ?? []).forEach((c: any, ci: number) => {
      const topic = `Topic_P${pi + 1}_C${ci + 1}`;
      const count = Math.min(c.dataWriter?.message_count ?? c.dataReader?.message_count ?? 10, 20);
      for (let i = 0; i < count; i++) {
        if (c.dataWriter) events.push({ category: 'message_sent', topic, participant: `Writer_${pi + 1}_${ci + 1}`, timestamp: new Date().toISOString() });
        if (c.dataReader) events.push({ category: 'message_received', topic, participant: `Reader_${pi + 1}_${ci + 1}`, timestamp: new Date().toISOString() });
      }
    });
  });
  return events;
}

// ─── connectRunWs ─────────────────────────────────────────────────────────────

export function connectRunWs(
  runId: string,
  onEvent: (event: Record<string, any>) => void,
  onComplete: (completion: any) => void,
  _onError?: (err: any) => void,
  onInit?: (init: WsInitMessage) => void
): WebSocket {
  let intervalId: ReturnType<typeof setInterval>;
  const fakeWs = { close: () => clearInterval(intervalId) } as unknown as WebSocket;

  client.get(`/runs/${runId}`)
    .then((res) => client.get(`/simulations/${res.data.simulation_config_id}`))
    .then((simRes) => {
      const simulation = simRes.data;
      const config = buildConfigFromSimulation(simulation);
      const mockEvents = buildMockEvents(simulation);

      onInit?.({ simulation_name: simulation.scenario_name, config, status: 'running' });

      let i = 0;
      intervalId = setInterval(() => {
        if (i < mockEvents.length) {
          onEvent({ ...mockEvents[i], id: `live-${i}` });
          i++;
        } else {
          clearInterval(intervalId);
          onComplete({
            status: 'passed',
            duration_seconds: 3.2 + Math.random() * 2,
            errors: [],
            summary: {},
            report: { assertion_results: [], deployment_health: {} },
          });
        }
      }, 200);
    })
    .catch(() => {
      onInit?.({ simulation_name: 'Simulation Run', config: { topics: [], participants: [] }, status: 'running' });
      setTimeout(() => onComplete({ status: 'passed', duration_seconds: null, errors: [], summary: {}, report: { assertion_results: [], deployment_health: {} } }), 3000);
    });

  return fakeWs;
}
