#include "APP.h"
#include "Server.h"
#include "Console.h"    
#include "MemoryUsers.h"  // The database for users
#include "POST.h"         
#include "PATCH.h"     
#include "Help.h"        
#include "GET.h"   
#include "Delete.h" 
#include <map>
#include <string>
#include <iostream>

int main(int argc, char* argv[]) {
    //check that we get port
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " [port]" << std::endl;
        return 1;
    }

    //convert to int
    int port = std::stoi(argv[1]);

    // We use a file named "data/users_db.txt" to store our users.
    MemoryUsers repo("data/users_db.txt"); 

    std::map<std::string, ICommand*> commandMap;

    // Initialize the command map with our commands, injecting the necessary dependencies
    commandMap["POST"] = new POST(repo);
    commandMap["PATCH"] = new PATCH(repo);
    commandMap["HELP"] = new Help();
    commandMap["GET"] = new GET(&repo);
    commandMap["DELETE"] = new Delete(&repo);
    
    // Create the app with all dependencies injected
    App woltApp(repo, commandMap);

    // create network
    try {
        Server server(port);
        // server run the app for all client
        server.start(woltApp); 
    } catch (const std::exception& e) {
        // If there's an error starting the server, print it and exit
        std::cerr << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
