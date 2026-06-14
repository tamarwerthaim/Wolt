import express from 'express';
import * as searchController from '../controllers/searchController.js';

const router = express.Router();

/* Route handling global keyword search queries using a dynamic URL parameter */
router.get('/:query', searchController.getSearchResults);

export default router;