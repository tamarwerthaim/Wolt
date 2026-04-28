#ifndef ICOMMAND_H  // deal if its exist
#define ICOMMAND_H

class ICommand {
public:
    virtual ~ICommand() {} //destractor
    //run command
    virtual void execute() = 0;
};

#endif