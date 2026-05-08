#include "Delete.h"

// Constructor with dependency injection
Delete::Delete(IOutput* output, IUserRepo* users) 
    : output(output), users(users) {}

void Delete::execute() {
    // empty meanwhile, that the tests compile and run - you will fill in the logic here in the next steps
}

void Delete::setInput(std::string inp) { 
    this->input = inp;
}