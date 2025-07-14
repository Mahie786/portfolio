import socket
HOST = 'localhost'
PORT = 9999
# step 1 Create a client socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print("client socket")
# step 2 Connect to server
s.connect((HOST, PORT))
print("connection established")
# step 3 Sending data to the server
while True:
    msg_received = s.recv(1024)
    print(msg_received.decode("utf-8"))
# step 4 Receiving data back from the server
    msg = input("James from Hendon typing > ")
    s.send(msg.encode("utf-8"))
    print("data send")
# step 5 Close the connection
client_socket.close()