from tkinter import *
import tkinter
import socket
import pickle
# creating a window

gui = tkinter.Tk()

# title

gui.title("Apple store menu")

frame = Frame(gui, bd=0, bg="White")
frame.grid(column=200, row=100, columnspan=100)

# window size
gui.geometry("500x500")

# method to open client chat
def compute():
    HOST = 'localhost'
    PORT = 9999
    # step 1 Create a server socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    print("Server socket")
    # step 2 Bind host and a port with a tuple
    s.bind((HOST, PORT))
    print("Binding")
    # step 3 Listen for a connection from the client
    s.listen(1)
    print('Waiting for connection')
    # step 4 Accept requests from a client socket
    c_socket, c_port = s.accept()
    print("Connection accepted")
    # connections
    while True:
        msg = input("Mahie from Apple typing > ")
        c_socket.send(msg.encode("utf-8"))
        print("data send")

        msg_received = c_socket.recv(1024)
        print(msg_received.decode("utf-8"))

    c_socket.close()
# next time be able to get geographical location and be able to see who else is waiting to connect

def stock():
    window = Tk()
    window.title("Stock database")
    #creates window size
    window.geometry("500x500")


    HOST = '127.0.0.1'
    PORT = 65432
    # step 1 Create a server socket
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # step 2  Bind host and a port with a specific socket
    server_socket.bind((HOST, PORT))

    # step 3 Listen for a connection from the client
    server_socket.listen(1)
    print('Waiting for connection')

    # step 4 Accept requests from a client socket, keeps waiting for incoming connections
    socket_client, (host, port) = server_socket.accept()
    print(f'Received connection from {host} ({port})\n')
    print(f'Connection Established., Connected from: {host}')

    # step 5 Unpicking
    received_data = socket_client.recv(1024)
    received_object = pickle.loads(received_data)
    print(f': The client said: {received_object} ')
    Label(window, text=f': The client said: {received_object} ').grid(row=2, column=0, sticky=E)
    # step 6 Close the connection
    socket_client.close()
    window.mainloop()

def order():
    # Adds orderlist to the list box and displays quantity for each item
    def createListinListBox(shopping):
        for elem in shopping:
            theList.insert(END, elem[0] + "-" + str(elem[1]))
        # displays them in the list and prints each individual element
        # 1 is the quantity

    def listIndex(shopping, item):
        # retrieves the index of each individual item in the list
        index = -1
        #-1 to not go out of bounds
        for i in range(len(shopping)):
            if shopping[i][0] == item:
        # if item is correct return index
                index = i
        return index

    # takes shopping list item and index and adds to the list
    def addList(shopping, item, index):
        if index == -1:
            shopping.append([item, 1])
        else:
            shopping[index][1] += quantity.get()

    def removeList(shopping, index):
        del (shopping[index])
    #remove an item from list

    def add():
        index = listIndex(shopping, item.get())
        addList(shopping, item.get(), index)
        if index >= 0:
            theList.delete(index)
            theList.insert(index, shopping[index][0] + "-" + str(shopping[index][1]))
        else:
            theList.insert(END, item.get() + "-" + str(quantity.get()))
    # adds an item to the list and retrieves quantity

    def remove():
        index = theList.index(ACTIVE)
        #locates selected index item we want to remove
        print(index)
        removeList(shopping, index)
        theList.delete(index)
        #remove from shopping list and index

    def order():
        Label(window, text="Your order has been successfully confirmed").grid(row=4, column=1, sticky=S)
    #after clicking order it prints

    shopping = [["Macbook", 100], ["Iphone 8", 100], ["Iphone X", 100], ["Iphone XR", 100], ["Iphone 11", 100], ["Iphone 12", 100], ["Iphone 12 pro", 100], ["Iphone 13", 100], ["Iphone 13 pro", 100]]
    #list of shopping

    window = Tk()
    window.title("Order")
    #creates new root window

    theList = Listbox(window, selectmode=SINGLE)
    # APPENDS TO WINDOW
    theList.grid(row=0, column=0, columnspan=2, sticky=E)
    #define where it will be using grid
    createListinListBox(shopping)
    # send order list through

    item = StringVar()
    #item is a string
    quantity = IntVar()
    #quantity is integer
    quantity.set(100)
    # initial number set which will aceept new numbers

    Label(window, text="Item:").grid(row=1, column=0, sticky=E)
    #label for item
    Entry(window, textvariable=item).grid(row=1, column=1, sticky=W)
    #allows user to enter an item in box

    Label(window, text="Quantity:").grid(row=2, column=0, sticky=E)
    #label for quantity
    Entry(window, textvariable=quantity).grid(row=2, column=1, sticky=W)
    #allows user to enter quantity
    Button(window, text="Add", command=add).grid(row=3, column=0, columnspan=3)
    Button(window, text="Remove", command=remove).grid(row=0, column=3)
    Button1 = Button(window, text="Order now", command=order)
    Button1.grid(row=0, column=5)
    # buttons for gui
    window.mainloop()
    # runs the window
# source https://www.youtube.com/watch?v=3j2IFfC-q5k
# next time add prices and send via client and server
def dashboard():

    window = Tk()
    window.title("Dashboard")
    #creates window size and font
    window.geometry("500x500")
    FONT = ('Arial', 20)

    Label(window, text="APPLE DASHBOARD", font=FONT, bg='blue' ).grid(row=1, column=0, sticky=E)
    Label(window, text="TOTAL EARNED TODAY =£75000").grid(row=2, column=0, sticky=E)
    Label(window, text="TOTAL ORDERS TODAY =800").grid(row=3, column=0, sticky=E)
    Label(window, text="COMMISION FOR YOU =£3000").grid(row=4, column=0, sticky=E)
    # labels for dashboard
    window.mainloop()
    #runs the new window
# next time add more interactive features
# client chat
b1 = Button(frame, text="Talk to client", command=compute)
b1.grid(row=1, column=1)

b2 = Button(frame, text="current stock", command=stock)
b2.grid(row=5, column=2)

b3 = Button(frame, text="Orders", command=order)
b3.grid(row=12, column=3)

b4 = Button(frame, text="dashboard", command=dashboard)
b4.grid(row=15, column=4)
# buttons for main gui
# display the gui
gui.mainloop()
