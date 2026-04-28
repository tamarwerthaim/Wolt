#ifndef IINPUT_H
#define IINPUT_H
#include <string>

class IInput {
public:
    virtual ~IInput() {}
    //read input from user
    virtual std::string read() = 0; 
};

#endif