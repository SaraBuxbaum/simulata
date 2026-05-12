import { Request, Response } from 'express';

const PROFILES: any[] = [];

export async function getAllProfiles(req: Request, res: Response): Promise<void> {
  res.json(PROFILES);
}

export async function createProfile(req: Request, res: Response): Promise<void> {
  const { name, xml } = req.body;
  if (!name || !xml) { res.status(400).json({ error: 'name and xml are required' }); return; }
  const profile = { id: crypto.randomUUID(), name, created_at: new Date().toISOString(), validation_warnings: [] };
  PROFILES.push({ ...profile, xml });
  res.status(201).json({ ...profile, validation_warnings: [] });
}

export async function deleteProfile(req: Request, res: Response): Promise<void> {
  const idx = PROFILES.findIndex((p) => p.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Profile not found' }); return; }
  PROFILES.splice(idx, 1);
  res.status(204).send();
}

export async function getProfileTopology(req: Request, res: Response): Promise<void> {
  const profile = PROFILES.find((p) => p.id === req.params.id);
  if (!profile) { res.status(404).json({ error: 'Profile not found' }); return; }
  res.json({ domains: [], topics: [], participants: [] });
}

export async function getProfileXml(req: Request, res: Response): Promise<void> {
  const profile = PROFILES.find((p) => p.id === req.params.id);
  if (!profile) { res.status(404).json({ error: 'Profile not found' }); return; }
  res.json({ xml: profile.xml ?? '' });
}
