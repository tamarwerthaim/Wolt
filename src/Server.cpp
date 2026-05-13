#include "Server.h"
#include "SocketIO.h"
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <iostream>
#include <stdexcept>


// constructer : server_fd get (-1) because he didnt get number and running = F :we didnt start to listen
Server::Server(int port, std::string ip)
    : port(port), ip(ip), server_fd(-1), running(false) {}


// create the main socket and start listening
void Server::createSocket() {
    // create the listening socket
    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        throw std::runtime_error("Error: Failed to create socket.");
    }


    // accept ports in TIME WAIT
    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));


    // difine the adress, protocol
    sockaddr_in address; //struct
    address.sin_family = AF_INET; //using IPv4
    address.sin_port = htons(port); // check the format of our computer and define (big/little endian)
   
    // convert the ip to binary and chack if its legal
    if (inet_pton(AF_INET, ip.c_str(), &address.sin_addr) <= 0) {
        throw std::runtime_error("Error: Invalid IP address format.");
    }


    // Bind
    if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) < 0) {
        throw std::runtime_error("Error: Bind failed. Check if port is free.");
    }


    // Listen - start listen mode
    if (listen(server_fd, 5) < 0) {
        throw std::runtime_error("Error: Listen failed.");
    }


    //print message
    std::cout << "Server initialized on " << ip << ":" << port << std::endl;
}


// loop for clients
void Server::start(App& app) {
    // in case, if we didnt call to "creatSocket"
    if (server_fd == -1) {
        createSocket();
    }


    running = true; //sign we running
    std::cout << "Server is now accepting connections..." << std::endl;


    //run until we close the listening
    while (running) {
        //build data structure to client details
        sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);


        // waiting until someone want to connect
        int client_fd = accept(server_fd, (struct sockaddr*)&client_addr, &client_len);


        //if we fail
        if (client_fd < 0) {
            if (running) std::cerr << "Accept failed" << std::endl;
            continue; //wait for the next client
        }


        std::cout << "New client connected! (FD: " << client_fd << ")" << std::endl;

        //save on heap so if delete automaticly when the loop end
        SocketIO io(client_fd);
       
        // run and send io to input and output
        app.run(io, io);

        //close conversation
        close(client_fd);
        std::cout << "Client disconnected." << std::endl;
    }
}


// end listenning
void Server::stop() {
    running = false;
    // Close the listening socket if it's open
    if (server_fd != -1) {
        close(server_fd);
        server_fd = -1;
    }
    //print message
    std::cout << "Server stopped." << std::endl;
}
