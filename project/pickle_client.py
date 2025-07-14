import pickle
import socket

with open('currentstock.txt', 'r') as file:
        content = file.read()
        print(content)
HOST = '127.0.0.1'
PORT = 65432
# step 1 Create a server socket
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# step 2 Listen for a connection from a server and accepted
client_socket.connect((HOST, PORT))

# step 3 Pickle the data
pickle_object = pickle.dumps(content)
client_socket.send(pickle_object)


# step 5 Close the connection
client_socket.close()
