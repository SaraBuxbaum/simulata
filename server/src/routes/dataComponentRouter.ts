import { Router } from 'express';
import { DataComponentController } from '../controllers/dataComponentController.js';

const router = Router();

router.get('/contract/:contract_config_id', DataComponentController.getComponentsByContractId);
router.put('/:component_type/:component_id', DataComponentController.updateConfig);

export default router;