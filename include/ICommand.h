#ifndef ICOMMAND_H  // deal if its exist
#define ICOMMAND_H
#include <string>
#include <sstream>

class ICommand {
public:
    virtual ~ICommand() {} //destractor
    //run command and where send the output
    virtual void execute(IOutput& output) = 0;
    //set
    virtual void setInput(std::string inp) = 0; 
};

#endif