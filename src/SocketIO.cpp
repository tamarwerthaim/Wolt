#include "SocketIO.h"
#include <sys/socket.h>
#include <unistd.h>
#include <iostream>
#include <vector>

// constructor : we init:  client_fd=fd ; connected=true
SocketIO::SocketIO(int fd) : client_fd(fd), connected(true) {}

// implement write from IOutput
void SocketIO::write(const std::string& data) {
    std::string toSend = data; // create var we can change because data is const

    //we check if the data end with '\n' and if not we will add : according to the protocol
    if (toSend.empty() || toSend.back() != '\n') {
        toSend += "\n";
    }

    //send the data to network
    int sent_bytes = send(client_fd, toSend.c_str(), toSend.length(), 0);

    //if we failed : update 'connected' to false
    if (sent_bytes < 0) {
        connected = false;
    }
}

//CHECK WITH OMER!!!!!!!

// std::string SocketIO::read() {
//     std::string result = "";
//     char buffer;
    
//     // קריאה עד לתו ירידת שורה
//     while (connected) {
//         int bytesRead = recv(client_fd, &buffer, 1, 0);
//         if (bytesRead <= 0) {
//             connected = false;
//             break;
//         }
//         if (buffer == '\n' || buffer == '\r') {
//             if (result.empty()) continue; // דילוג על שורות ריקות
//             break;
//         }
//         result += buffer;
//     }
//     return result;
// }

// implement read from IInput
std::string SocketIO::read() {
    std::string result = ""; //save the input - we read every time one char and add it to the string
    char buffer; //temp place to save one char
    int bytesRead; //sign if we succeed to read a char

    //we will read one char every time until we get '\n'
    //if we fail in the reading - we stop the loop
    while (true) {
        bytesRead = recv(client_fd, &buffer, 1, 0); //try to read

        if (bytesRead > 0) { //we secceed to read
            if (buffer == '\n') { //we get to the end
                break;
            }
            result += buffer; // add the char to the result string
        } 
        else if (bytesRead == 0) { //if the client close the connection
            connected = false; //update the connection status
            break;
        } 
        else {
            connected = false; //fail in reading
            break;
        }
    }
    return result;
}

// chack if we stil connected
bool SocketIO::isFinished() {
    //if connected=true : we dont finish
    //if connected=false :  we finish
    return !connected;
}