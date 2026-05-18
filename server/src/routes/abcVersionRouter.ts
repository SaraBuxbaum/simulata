import { Router } from 'express';
import { AbcVersionController } from '../controllers/abcVersionController.js';

const router = Router();

router.get('/contract/:contract_config_id', AbcVersionController.getByContract);

export default router;