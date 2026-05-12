export interface SystemInfo {
  id: string;
  name: string;
}

export interface Dictionary {
  id: string;
  systemId: string;
  name: string;
}

export async function listSystems(): Promise<SystemInfo[]> {
  return [
    { id: 'sys-1', name: 'NAVAL_COMMAND_CENTER' },
    { id: 'sys-2', name: 'RADAR_SUBSYSTEM_A' },
    { id: 'sys-3', name: 'SONAR_INTEGRATION_HUB' },
    { id: 'sys-4', name: 'FLEET_MONITOR_V2' },
  ];
}

export async function listDictionaries(): Promise<Dictionary[]> {
  return [
    { id: 'd1', systemId: 'sys-1', name: 'NAVAL_Protocols_v1' },
    { id: 'd2', systemId: 'sys-1', name: 'NAVAL_Weapon_Specs' },
    { id: 'd3', systemId: 'sys-2', name: 'RADAR_Frequency_Map' },
    { id: 'd4', systemId: 'sys-2', name: 'RADAR_Target_Types' },
    { id: 'd5', systemId: 'sys-3', name: 'SONAR_Depth_Tables' },
  ];
}
