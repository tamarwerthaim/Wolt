#ifndef APP_H
#define APP_H
 
#include "IInput.h"
#include "IOutput.h"
#include "IUserRepo.h"
#include "ICommand.h"
#include <string>
#include <map>

class App {
    private:
    //field:
        IInput& input;
        IOutput& output;
        IUserRepo& repo;
        std::map<std::string, ICommand*> commands;

        //take care on line - get line, find the command, check and call to the fit func
        void processCommand(const std::string& line);
        //clean the memmory at the end
        void cleanup();


    public:
        //constructor
        App(IInput& input, IOutput& output, IUserRepo& repo, std::map<std::string, ICommand*> cmds);
        //destructor
        ~App();
        //run
        void run();

};
#endif