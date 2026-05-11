#ifndef SERVER_H
#define SERVER_H


#include "App.h"
#include <string>
#include <atomic>


class Server {
private:
    int port;
    std::string ip;
    int server_fd;    
    std::atomic<bool> running;


public:
    // counstructer, listen to everyone
    Server(int port, std::string ip = "0.0.0.0");
   
    // open the listening socket
    void createSocket();
   
    // creat socket for client
    void start(App& app);
   
    //close the listening socket
    void stop();
};


#endif
