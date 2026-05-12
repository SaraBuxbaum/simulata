import { Router } from 'express';
import { getContractById } from '../controllers/contract.controller.js';

const router = Router();

router.get('/:id', getContractById);

export default router;
