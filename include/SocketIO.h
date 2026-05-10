#ifndef SOCKETIO_H
#define SOCKETIO_H

#include "IInput.h"
#include "IOutput.h"
#include <string>

class SocketIO : public IInput, public IOutput {
private:
    int client_fd; // File Descriptor of the client
    bool connected; //the status of connection

public:
    // constructor
    SocketIO(int fd);

    // implement the interfaces
    virtual std::string read() override;
    virtual void write(const std::string& data) override;
    virtual bool isFinished() override; 
};

#endif