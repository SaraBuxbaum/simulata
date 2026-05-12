import { Request, Response } from 'express';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { normalizeStatus } from '../models/RunStatus.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '../data/simulationRuns.json');
const simsFilePath = join(__dirname, '../data/simulations.json');

async function readRuns(): Promise<any[]> {
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function readSimulations(): Promise<any[]> {
  try {
    const raw = await readFile(simsFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch { return []; }
}

function enrichRun(run: any, simulations: any[]): any {
  const sim = simulations.find((s) => s.simulation_config_id === run.simulation_config_id);
  return {
    ...run,
    simulation_name: sim?.scenario_name ?? 'Unknown',
    id: run.simulation_run_id,
    status: normalizeStatus(run.status ?? ''),
    started_at: run.start_time,
    duration_seconds: run.start_time && run.end_time
      ? (new Date(run.end_time).getTime() - new Date(run.start_time).getTime()) / 1000
      : null,
    total_events: 0,
    error_count: run.analysis?.contractResults?.reduce((sum: number, r: any) => sum + (r.error_count || 0), 0) ?? 0,
  };
}

export async function getAllRuns(req: Request, res: Response): Promise<void> {
  try {
    const [runs, simulations] = await Promise.all([readRuns(), readSimulations()]);
    res.json(runs.map((r) => enrichRun(r, simulations)));
  } catch {
    res.status(500).json({ error: 'Failed to load runs' });
  }
}

export async function getRunById(req: Request, res: Response): Promise<void> {
  try {
    const [runs, simulations] = await Promise.all([readRuns(), readSimulations()]);
    const run = runs.find((r) => r.simulation_run_id === req.params.id);
    if (!run) { res.status(404).json({ error: 'Run not found' }); return; }
    res.json(enrichRun(run, simulations));
  } catch {
    res.status(500).json({ error: 'Failed to load run' });
  }
}

export async function getRunsBySimulation(req: Request, res: Response): Promise<void> {
  try {
    const [runs, simulations] = await Promise.all([readRuns(), readSimulations()]);
    res.json(runs.filter((r) => r.simulation_config_id === req.params.simulationId).map((r) => enrichRun(r, simulations)));
  } catch {
    res.status(500).json({ error: 'Failed to load runs' });
  }
}
