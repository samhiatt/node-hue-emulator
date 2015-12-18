# node-hue-emulator
NodeJs Hue emulator, with UPnP discovery that works with Amazon Echo

Allows Amazon Echo to communicate with arbitrary http services using the Hue API. 

Derrived from http://github.com/armzilla/amazon-echo-ha-bridge

#### Notes
This project is incomplete. It began as an expirement using UPnP discovery with Amazon Echo via the Hue API.  
The UPnP part should be working, if I recall correctly, but it still needs an interface for defining new lights (currently defined in config.json) and for responding to Hue API requests (lights on/off).
##### TODO:
* Provide API for responding to onn/off requests
* Provide configuration interface for listing/adding lights, and defining onURL/offURL for each light

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
