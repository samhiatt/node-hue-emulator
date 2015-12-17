# node-hue-emulator
NodeJs Hue emulator, with UPnP discovery that works with Amazon Echo

Allows Amazon Echo to communicate with arbitrary http services using the Hue API. 

Derrived from http://github.com/armzilla/amazon-echo-ha-bridge

#### Notes
**TODO:** I thought I had gotten this to the point where I could define the "onURL" and "offURL" for each light (or arbitrary 
device) as you do in amazon-echo-ha-bridge, but I don't see this anywhere in my code. I'll check my devices later to see 
if I have pushed the latest code.  

I wish I had written this README 5 months ago when I started this project. But I didn't. Sorry.  

Pull requests welcome.

## Installation
```
git clone https://github.com/samhiatt/node-hue-emulator.git  
cd node-hue-emulator   
npm install  
```

## Running the UPnP server
```
node index.js  
```
This should start a UPnP server on port 8082 that will allow Echo to discover the devices defined in config.json
