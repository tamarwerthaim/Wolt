import socket
import sys

def main():
    # check if get the server IP and port from command line arguments
    if len(sys.argv) != 3:
        print("Usage: python3 client.py <server_ip> <server_port>")
        sys.exit(1)
    # Get the server IP and port from command line arguments
    server_ip = sys.argv[1]
    try:
        server_port = int(sys.argv[2])
    # Validate the port number
    except ValueError:
        print("Error: Port must be a number.")
        sys.exit(1)
    try:
        # Create a TCP socket and connect to the server
        client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client_socket.connect((server_ip, server_port))
    # Handle connection errors
    except Exception as e:
        print(f"Failed to connect to server: {e}")
        sys.exit(1)
    try:
        # Read user input in a loop, send it to the server, and print the response
        while True:
            # Read a line of input from the user
            try:
                # input function waits for the user to enter a command and press Enter
                user_input = input()
            except EOFError:
                break
            # add a newline character to the end of the command before sending
            full_command = user_input + "\n"
            # Send the command to the server
            client_socket.sendall(full_command.encode('utf-8'))
            # Wait for the response from the server and print it
            response = client_socket.recv(4096)
            if not response:
                # If the server has closed the connection, break the loop
                print("Server disconnected.")
                break
            # Print the response from the server, decoding it from bytes to a string
            print(response.decode('utf-8'), end='')
    except Exception as e:
        # Handle any exceptions that occur during communication with the server
        print(f"Error during communication: {e}")
    finally:
        # Close the socket when done
        client_socket.close()

if __name__ == "__main__":
    main()