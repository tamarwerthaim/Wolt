import * as searchModel from '../models/searchModel.js';

// Handle global search text requests
export const getSearchResults = (req, res) => {
    const { query } = req.params;

    // Return bad request status if search token is empty
    if (!query || query.trim() === '') {
        return res.status(400).json({ error: "Search query cannot be empty" });
    }

    // Fetch filtered data sets from model layer
    const results = searchModel.searchRestaurantsAndProducts(query);
    
    return res.status(200).json(results);
};