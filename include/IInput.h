#ifndef IINPUT_H
#define IINPUT_H
#include <string>

class IInput {
public:
    // destructor
    virtual ~IInput() {}
    //read input from user
    virtual std::string read() = 0; 
    //check if we finishto read the input - return true if we finish
    virtual bool isFinished() = 0;
};

#endif