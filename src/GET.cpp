#include "GET.h"
#include <map>
#include <algorithm>
#include <sstream>

// Constructor
GET::GET(IUserRepo* repo) 
    : users(repo) {
    
}
// execute the recommendation command - writing at most top 10 product recommendations 
// to the givven product and user
void GET::execute(IOutput& out) {
    std::stringstream ss(input);
    int userID;
    int productID;

    // 1. Try to read the two integers or check if they are negative
    if (!(ss >> userID >> productID) || userID < 0 || productID < 0) {
        // If we're here, the input wasn't 2 ints or contained negative values
        out.write("400 Bad Request\n");
        return; 
    }

    // 2. make sure there's no "garbage" left at the end
    std::string extra;
    if (ss >> extra) {
        // If we can still read something, it means there were more than 2 parameters
        out.write("400 Bad Request\n");
        return;
    }

    // Get the recommendations for the user and product
    std::vector<Product> recommendationsList = getRecommendations(userID, productID);

    // the request is valid, write the status line first
    out.write("200 Ok\n\n");

    // Write the recommended product IDs to output
    for (size_t i = 0; i < recommendationsList.size(); ++i) {
        // Write the product ID - convert to string first
        out.write(std::to_string(recommendationsList[i].getID()));
        
        // Add a space only if it's not the last element
        if (i < recommendationsList.size() - 1) {
            out.write(" ");
        }
    }
    out.write("\n");
}

// Update the input parameters for the recommendation command
void GET::setInput(std::string inp) { 
    this->input = inp;
}

// Main logic to get the recommendations for a user based on the product they watched
std::vector<Product> GET::getRecommendations(int userId, int productId) {
    std::vector<User*> allUsers = users->getUsers();
    
    // 1. Get the target user
    User* target = findTargetUser(userId, allUsers);
    // If user not found, return empty list
    if (!target) return {}; 

    // 2. Build the score map
    std::map<int, int> scores = calculateRawScores(*target, productId);

    // 3. Sort them and return the top 10
    return sortAndLimit(scores);
}

 // Calculates how many products two users have in common.
 int GET::calcSimilar(const User& target, const User& other, int productId) const {
    int commonCount = 0;
    // Compare every product from target with every product from other
    for (const auto& p : target.getProducts()) {
        if (p.getID() == productId) 
            continue;
        if (other.hasProduct(p.getID())) {
            commonCount++;
        }
    }
    return commonCount;
}

 // Finds all users in the repo who watched this product.
std::vector<User> GET::getUsersWithProduct(const Product& p) {
    std::vector<User> result;
    // Get all users from the repository
    std::vector<User*> allUsers = users->getUsers(); 

    for (auto u : allUsers) {
        // Check if this specific user watched the product
        if (u->hasProduct(p.getID())) {
            result.push_back(*u); 
        }
    }
    return result;
}

// Logic for finding the user
User* GET::findTargetUser(int userId, std::vector<User*>& allUsers) {
    for (auto u : allUsers) {
        if (u->getID() == userId) return u;
    }
    // Return null if not found
    return nullptr;
}


// Logic for the scoring algorithm
std::map<int, int> GET::calculateRawScores(const User& target, int productId) {
    std::map<int, int> scores;
    std::vector<User> similarUsers = getUsersWithProduct(Product(productId));

    for (const auto& other : similarUsers) {
        if (other.getID() == target.getID()) 
            continue;

        int weight = calcSimilar(target, other, productId);
        if (weight > 0) {
            for (const auto& p : other.getProducts()) {
                // Don't recommend the same product they already watched
                if (p.getID() == productId) 
                    continue;
                // Don't recommend products they already have
                if (target.hasProduct(p.getID())) 
                    continue;
                // Add the weight to the score of this product
                scores[p.getID()] += weight;
            }
        }
    }
    return scores;
}

// Logic for sorting and limiting the list
std::vector<Product> GET::sortAndLimit(const std::map<int, int>& scores) {
    // Convert to vector for sorting
    std::vector<std::pair<int, int>> sortedList(scores.begin(), scores.end());

    // Sorting logic - First by score (High to Low), then by ID (Low to High)
    std::sort(sortedList.begin(), sortedList.end(), [](const auto& a, const auto& b) {
        if (a.second != b.second) 
            return a.second > b.second;
        return a.first < b.first;
    });

    // Build the final list (limit to 10)
    std::vector<Product> result;
    for (size_t i = 0; i < sortedList.size() && i < 10; ++i) {
        result.push_back(Product(sortedList[i].first));
    }
    return result;
}
