import express from 'express';
import * as searchController from '../controllers/searchController.js';

const router = express.Router();

// Route for text search queries across restaurants and products
// : a dynamic parameter for what appers after the /
router.get('/:query', searchController.getSearchResults);

export default router;