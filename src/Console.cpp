#include "Console.h"
#include <iostream>
#include <string>

//implement read from IInput, read line.
std::string Console::read() {
    std::string input;
    //   clean buffer?   //////////////////////////////////////////////////////////////////////////////////////////////////
    std::getline(std::cin, input);
    return input;
}

//implement isFinish from IInput
bool Console::isFinished() {
    // return true if we finish the input
    return std::cin.eof();
}

//implement write from IOutput, and go down a line. 
void Console::write(const std::string& message) {
    std::cout << message;
    std::cout.flush();
}