Added a simple function which allows input nodes to pass values by a flag (handshake) update. 
When the flag is changed, all the other PLC variables are passed in the msg.values object and the msg.payload consists of the value of the flag.
I essentially merged the code from send all and send one so very little new code was added.