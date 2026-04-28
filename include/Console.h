#ifndef CONSOLE_H
#define CONSOLE_H

#include "IInput.h"
#include "IOutput.h"
#include <string>

class Console : public IInput, public IOutput {
public:
    //IInput-
    //read input
    std::string read() override;
    //return true if we finish to read the input 
    bool isFinished() override;

    //IOutput-
    // wite output
    void write(const std::string& message) override;

    Console() = default; //constructor
    virtual ~Console() = default; //destructor
};

#endif