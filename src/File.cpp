#include "File.h"
#include <fstream>
#include <string>

//constructor
File::File(const std::string& path) : filePath(path), inputStream(path) {}


//implement read from IInput
std::string File::read() {
    //variable for thr line
    std::string line; 
    
    // check if we succeeded to open the file, and save the next line to "inputStream"
    if (inputStream.is_open() && std::getline(inputStream, line)) {
        return line;
    }

    // if we dont succeeded to open
    return ""; 
}
//implement isFinish from IInput - return true if we finish the input or we cant open
bool File::isFinished() {
    //eof() return true if we finish the file
    return !inputStream.is_open() || inputStream.eof();
}


//implement write from IOutput - write line
void File::write(const std::string& message) {
    //define the stream - append to the end
    std::ofstream outFile(filePath, std::ios::app); 

    if (outFile.is_open()) {  //check if we secceed to open
        //write the line
        outFile << message << std::endl;
    }
}