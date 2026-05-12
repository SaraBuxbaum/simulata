import { Router } from 'express';
import { getAllRuns, getRunById, getRunsBySimulation } from '../controllers/run.controller.js';

const router = Router({ mergeParams: true });

router.get('/', getAllRuns);
router.get('/:id', getRunById);

export { getRunsBySimulation };
export default router;
