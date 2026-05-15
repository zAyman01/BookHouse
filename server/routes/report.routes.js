import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import authorize from '../middleware/authorize.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { ROLES } from '../config/constants.config.js';
import { createReportSchema, updateReportStatusSchema } from '../validators/report.validator.js';
import * as reportController from '../controllers/report.controller.js';

const router = Router();

router.post('/', protect, validate(createReportSchema), reportController.submitReport);
router.get('/', protect, authorize(ROLES.ADMIN), reportController.getAllReports);
router.get('/:id', protect, authorize(ROLES.ADMIN), reportController.getReportById);
router.put('/:id', protect, authorize(ROLES.ADMIN), validate(updateReportStatusSchema), reportController.updateReportStatus);

export default router;
