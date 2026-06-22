import * as searchModel from '../models/searchModel.js';

/* Handle global search requests across restaurants and menu items */
export const getSearchResults = async (req, res) => {
    try {
        const { query } = req.params;

        /* Return a 400 Bad Request if the search query is empty or just spaces */
        if (!query || query.trim() === '') {
            return res.status(400).json({ error: "Search query cannot be empty" });
        }

        /* Fetch the matching results from the search model layer */
        const results = await searchModel.searchRestaurantsAndProducts(query);

        return res.status(200).json(results);
    } catch (error) {
        console.error("Error in getSearchResults controller:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};