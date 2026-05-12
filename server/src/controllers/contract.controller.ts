import { Request, Response } from 'express';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '../data/productionConfigs.json');

export async function getContractById(req: Request, res: Response): Promise<void> {
  try {
    const raw = await readFile(filePath, 'utf-8');
    const productions: any[] = JSON.parse(raw);
    for (const prod of productions) {
      const contract = prod.contracts?.find((c: any) => c.contract_config_id === req.params.id);
      if (contract) { res.json(contract); return; }
    }
    res.status(404).json({ error: 'Contract not found' });
  } catch {
    res.status(500).json({ error: 'Failed to load contract' });
  }
}
