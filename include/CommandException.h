#ifndef COMMAND_EXCEPTION_H
#define COMMAND_EXCEPTION_H


#include <exception>


// Base exception class
class CommandException : public std::exception {
public:
    // Virtual destructor to allow proper cleanup in derived classes
    virtual ~CommandException() {}
    // Pure virtual function to get the error message, must be implemented by derived classes
    virtual const char* what() const noexcept override = 0;
};

// invalid input exception
class InvalidInputException : public CommandException {
public:
    const char* what() const noexcept override;
};


//logical error exception
class LogicalErrorException : public CommandException {
public:
    const char* what() const noexcept override;
};

#endif