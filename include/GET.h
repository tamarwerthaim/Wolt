#ifndef GET_H
#define GET_H

#include "ICommand.h"
#include "IInput.h"
#include "IOutput.h"
#include "IUserRepo.h"
#include "User.h"
#include "Product.h"
#include "CommandException.h"
#include <vector>
#include <map>
#include <string>

class GET : public ICommand {
private:
    // fields
    std::string input;
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
    GET(IUserRepo* repo);

    // Inherited from ICommand
    void execute(IOutput& output) override;

    // Update the input parameters for the recommendation command
    void setInput(std::string inp) override;

    // Main entry point for the algorithm logic used in tests
    std::vector<Product> getRecommendations(int userId, int productId);
};

#endif