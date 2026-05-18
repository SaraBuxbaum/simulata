import { Router } from 'express';
import { SimulationConfigController } from '../controllers/simulationConfigController.js';

const router = Router();

router.get('/', SimulationConfigController.getAll);
router.get('/names', SimulationConfigController.getSimulationsNames);
router.get('name/:scenario_name', SimulationConfigController.getByName);
router.post('/', SimulationConfigController.create);
router.delete('/:simulation_config_id', SimulationConfigController.delete);
router.put('/:simulation_config_id', SimulationConfigController.update);

export default router;