// import net- a built-in module in Node.js that provides an asynchronous network API for creating stream-based TCP or IPC servers and clients.
import net from 'net';

// IP and port of the C++ server we want to connect to
const CPP_HOST = process.env.CPP_SERVER_HOST || '127.0.0.1'; 
const CPP_PORT = process.env.CPP_SERVER_PORT || 8080; 


export function sendToCpp(dataToSend) {
    // this function will return a promise that resolves with the response from the C++ server
    return new Promise((resolve, reject) => {
        // create a new TCP client socket
        const client = new net.Socket();

        // connect to the C++ server and send the data once connected
        client.connect(CPP_PORT, CPP_HOST, () => {
            client.write(dataToSend + '\n'); 
        });

        // listen for data (response) from the C++ server
        client.on('data', (data) => {
            // once we receive data from the C++ server, we resolve the promise with that data and close the connection
            resolve(data.toString());
            client.destroy(); 
        });

        // handle any errors that occur during the connection or communication with the C++ server
        client.on('error', (err) => {
            reject(err);
            client.destroy();
        });
    });
}