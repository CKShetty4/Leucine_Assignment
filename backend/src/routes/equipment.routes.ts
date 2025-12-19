import { Router } from 'express';

import {
    createEquipment,
    deleteEquipment,
    getAllEquipment,
    updateEquipment,
} from '../controllers/equipment.controller';

const router = Router();

router.get('/', getAllEquipment);
router.post('/', createEquipment);
router.put('/:id', updateEquipment);
router.delete('/:id', deleteEquipment);

export default router;
