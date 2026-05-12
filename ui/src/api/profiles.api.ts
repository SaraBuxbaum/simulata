import client from './client';

export interface ProfileInfo {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  profile_data?: Record<string, any>;
}

export interface TopologyInfo {
  domains: { name: string; domain_id: number }[];
  topics: { name: string; type_ref: string }[];
  participants: {
    name: string;
    domain_id: number;
    writers: { name: string; topic: string }[];
    readers: { name: string; topic: string }[];
  }[];
}

export async function listProfiles(): Promise<ProfileInfo[]> {
  const { data } = await client.get('/profiles');
  return data;
}

export async function createProfile(name: string, xml: string): Promise<{ validation_warnings: any[] }> {
  const { data } = await client.post('/profiles', { name, xml });
  return data;
}

export async function deleteProfile(id: string): Promise<void> {
  await client.delete(`/profiles/${id}`);
}

export async function getProfileTopology(id: string): Promise<TopologyInfo> {
  const { data } = await client.get(`/profiles/${id}/topology`);
  return data;
}

export async function fetchProfileXml(id: string): Promise<{ xml: string }> {
  const { data } = await client.get(`/profiles/${id}/xml`);
  return data;
}
