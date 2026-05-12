import { Router } from 'express';
import { getAllProfiles, createProfile, deleteProfile, getProfileTopology, getProfileXml } from '../controllers/profile.controller.js';

const router = Router();

router.get('/', getAllProfiles);
router.post('/', createProfile);
router.delete('/:id', deleteProfile);
router.get('/:id/topology', getProfileTopology);
router.get('/:id/xml', getProfileXml);

export default router;
