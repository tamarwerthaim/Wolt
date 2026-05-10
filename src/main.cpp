#include "APP.h"
#include "Console.h"     // Tool for input and output
#include "MemoryUsers.h"  // The database for users
#include "POST.h"         // The "POST" command
#include "PATCH.h"     // The "PATCH" command
#include "Help.h"        // The "Help" command
#include "GET.h"   // The "GET" command
#include "Delete.h" // The "DELETE" command
#include <map>
#include <string>

int main() {
    Console console; 
    // We use a file named "data/users_db.txt" to store our users.
    MemoryUsers repo("data/users_db.txt"); 

    std::map<std::string, ICommand*> commandMap;

    // Initialize the command map with our commands, injecting the necessary dependencies
    commandMap["POST"] = new POST(repo, console, "");
    commandMap["PATCH"] = new PATCH(repo, console, "");
    commandMap["HELP"] = new Help(console, "");
    commandMap["GET"] = new GET("", &console, &repo);
    commandMap["DELETE"] = new Delete(&console, &repo);
    
    // Create the app with all dependencies injected
    App woltApp(console, console, repo, commandMap);
    woltApp.run();
    
    return 0;
}
