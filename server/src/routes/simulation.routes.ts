import { Router } from 'express';
import { getAllSimulations, getSimulationById, createSimulation, updateSimulation, deleteSimulation, runSimulation } from '../controllers/simulation.controller.js';
import { getRunsBySimulation } from '../routes/run.routes.js';

const router = Router();

router.get('/', getAllSimulations);
router.post('/', createSimulation);
router.get('/:id', getSimulationById);
router.put('/:id', updateSimulation);
router.delete('/:id', deleteSimulation);
router.post('/:id/run', runSimulation);
router.get('/:simulationId/runs', getRunsBySimulation);

export default router;
