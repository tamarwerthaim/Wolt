#ifndef FILE_H
#define FILE_H

#include "IInput.h"
#include "IOutput.h"
#include <string>
#include <fstream>

class File : public IInput, public IOutput {
private:
    std::string filePath; //private to provide errors
    std::ifstream inputStream; //pointer to the next line

public:
    // constractor
    File(const std::string& path);

    //has defultive destructor

    //IInput-
    //read input
    std::string read() override;
    //check if finish
    bool isFinished() override;

    //IOutput-
    // wite output
    void write(const std::string& message) override;
};

#endif