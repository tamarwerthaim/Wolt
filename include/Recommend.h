#ifndef RECOMMEND_H
#define RECOMMEND_H

#include "ICommand.h"
#include "IInput.h"
#include "IOutput.h"
#include "IUserRepo.h"
#include "User.h"
#include "Product.h"
#include <vector>
#include <map>

class Recommend : public ICommand {
private:
    // fields
    IInput* input;
    IOutput* output;
    IUserRepo* users;

    // Finds user in the repo
    // User* findTargetUser(int userId, std::vector<User>& allUsers);
    User* findTargetUser(int userId, std::vector<User*>& allUsers);

    // Calculates similarity between two users
    int calcSimilar(const User& target, const User& other, int productId) const;

    // Finds all users who watched a specific product
    std::vector<User> getUsersWithProduct(const Product& p);

    // Sums up all product scores based on similar users' weights
    std::map<int, int> calculateRawScores(const User& target, int productId);

    // Sorts the scores and return the top 10
    std::vector<Product> sortAndLimit(const std::map<int, int>& scores);

public:
    // Constructor
    Recommend(IInput* in, IOutput* out, IUserRepo* repo);

    // Inherited from ICommand
    void execute() override;

    // Main entry point for the algorithm logic used in tests
    std::vector<Product> getRecommendations(int userId, int productId);
};

#endif