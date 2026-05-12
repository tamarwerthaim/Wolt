#include "CommandException.h"


// deal with all invalid input
const char* InvalidInputException::what() const noexcept {
    return "400 Bad Request\n";
}


// deal with all logical errors
const char* LogicalErrorException::what() const noexcept {
    return "404 Not Found\n";
}
