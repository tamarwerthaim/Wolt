// import net- a built-in module in Node.js that provides an asynchronous network API for creating stream-based TCP or IPC servers and clients.
import net from 'net';

// IP and port of the C++ server we want to connect to
const CPP_HOST = process.env.CPP_SERVER_HOST || '127.0.0.1';
const CPP_PORT = process.env.CPP_SERVER_PORT || 8080;


export function sendToCpp(dataToSend) {
    // this function will return a promise that resolves with the response from the C++ server
    return new Promise((resolve, reject) => {
        let responseData = '';
        // create a new TCP client socket
        const client = new net.Socket();

        // connect to the C++ server and send the data once connected
        client.connect(CPP_PORT, CPP_HOST, () => {
            client.write(dataToSend + '\n');
        });

        // listen for data (response) from the C++ server
        client.on('data', (chunk) => {
            // Append the incoming data chunk to the response buffer
            responseData += chunk.toString();
            // The C++ server always terminates its official response with a newline character
            if (responseData.endsWith('\n')) {
                // Resolve the promise with the complete and trimmed response data
                resolve(responseData.trim());
                // Close the socket connection now that the data is fully received
                client.destroy();
            }
        });
        // handle any errors that occur during the connection or communication with the C++ server
        client.on('error', (err) => {
            reject(err);
            client.destroy();
        });
    });
}