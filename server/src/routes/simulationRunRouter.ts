import { Router } from 'express';
import { SimulationRunController } from '../controllers/simulationRunController.js';

const router = Router();

router.get('/', SimulationRunController.getAll);
router.get('/simulation/:simulation_config_id', SimulationRunController.getBySimulationId);
router.get('/name/:scenario_name', SimulationRunController.getBySimulationName);
router.get('/status/:status', SimulationRunController.getBySimulationByStatus);
router.post('/run', SimulationRunController.runSimulation);

export default router;