import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import authorize from '../middleware/authorize.middleware.js';
import { ROLES } from '../config/constants.config.js';

const router = Router();

/**
 * Report Routes — /api/reports
 *
 * Endpoints to implement:
 *   POST   /api/reports              → Submit a report (user or author) [protect]
 *   GET    /api/reports              → Get all reports [protect, authorize(ADMIN)]
 *   GET    /api/reports/:id          → Get single report [protect, authorize(ADMIN)]
 *   PUT    /api/reports/:id          → Update report status + adminNotes [protect, authorize(ADMIN)]
 *
 * Report types: REPORT_TYPE.USER, REPORT_TYPE.BOOK, REPORT_TYPE.REVIEW
 * Report status flow: PENDING → REVIEWED | DISMISSED
 *
 * Controller file to create: controllers/reportController.js
 * Service file to create:    services/reportService.js
 */

// TODO: import reportController from '../controllers/reportController.js';

// router.post('/', protect, reportController.submitReport);
// router.get('/', protect, authorize(ROLES.ADMIN), reportController.getAllReports);
// router.get('/:id', protect, authorize(ROLES.ADMIN), reportController.getReport);
// router.put('/:id', protect, authorize(ROLES.ADMIN), reportController.updateReportStatus);

export default router;
