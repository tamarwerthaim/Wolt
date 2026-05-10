#include "APP.h"
#include "Console.h"     // Tool for input and output
#include "MemoryUsers.h"  // The database for users
#include "POST.h"         // The "POST" command
#include "Help.h"        // The "Help" command
#include "GET.h"   // The "GET" command
#include <map>
#include <string>

int main() {
    Console console; 
    // We use a file named "data/users_db.txt" to store our users.
    MemoryUsers repo("data/users_db.txt"); 

    std::map<std::string, ICommand*> commandMap;

    // Initialize the command map with our commands, injecting the necessary dependencies
    commandMap["POST"] = new POST(repo, console, "");
    commandMap["help"] = new Help(console, "");
    commandMap["GET"] = new GET("", &console, &repo);
    
    // Create the app with all dependencies injected
    App woltApp(console, console, repo, commandMap);
    woltApp.run();
    
    return 0;
}