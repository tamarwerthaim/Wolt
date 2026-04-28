#include "APP.h"
#include "Console.h"     // Tool for input and output
#include "MemoryUsers.h"  // The database for users
#include "Add.h"         // The "Add" command
#include "Help.h"        // The "Help" command
#include "Recommend.h"   // The "Recommend" command
#include <map>
#include <string>

int main() {
    // 1. Create the main objects
    // The console handles both typing and printing
    Console console; 
    MemoryUsers repo;

    // 2. Create a map for the commands
    std::map<std::string, ICommand*> commandMap;

    // 3. Put commands in the map
    // 'add' only needs the database
    commandMap["add"] = new Add(repo, "");
    
    // 'help' only needs the screen to print
    commandMap["help"] = new Help(console, "");
    
    // 'recommend' needs input, output, and the database
    commandMap["recommend"] = new Recommend("", &console, &repo);
    
    // 4. Setup the App
    // Give the app the console, the database, and the commands
    App woltApp(console, console, repo, commandMap);

    // 5. Start the program loop
    woltApp.run();
 
    // Delete all commands in the map to free memory
    for (auto const& [name, cmd] : commandMap) {
        delete cmd;
    }
    commandMap.clear(); // Empty the map

    return 0;
}