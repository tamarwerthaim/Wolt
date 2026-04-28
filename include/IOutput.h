#ifndef IOUTPUT_H
#define IOUTPUT_H
#include <string>

class IOutput {
public:
    // destructor
    virtual ~IOutput() {}
    // write message 
    virtual void write(const std::string& message) = 0;
};

#endif