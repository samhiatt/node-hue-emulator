var fs = require('fs');
var http = require('http');
var ssdp = require("peer-ssdp");
var peer = ssdp.createPeer();


//var interval;
/**
 * handle peer ready event. This event will be emitted after `peer.start()` is called.
 */
peer.on("ready",function(){
	// handle ready event 
	console.log("UPNP server listening on port 1900.");	
//	// send ssdp:alive messages every 1s 
//	// {{networkInterfaceAddress}} will be replaced before 
//	// sending the SSDP message with the actual IP Address of the corresponding 
//	// Network interface. This is helpful for example in UPnP for LOCATION value 
//	interval = setInterval(function(){
//		peer.alive({
//			NT: "urn:schemas-upnp-org:device:basic:1",
//			SERVER: "node.js/0.10.28 UPnP/1.1",
//			ST: "urn:schemas-upnp-org:device:basic:1",
//			USN: "uuid:f40c2981-7329-40b7-8b04-27f187aecfb5",
//			LOCATION: "http://{{networkInterfaceAddress}}:8080/upnp/amazon-ha-bridge/setup.xml",
//		});
//	}, 1000);
//	// shutdown peer after 10 s and send a ssdp:byebye message before 
//	setTimeout(function(){
//		clearInterval(interval);
//		// Close peer. After peer is closed the `close` event will be emitted. 
//		peer.close();
//	}, 10000);
});

// handle SSDP NOTIFY messages.  
// param headers is JSON object containing the headers of the SSDP NOTIFY message as key-value-pair.  
// param address is the socket address of the sender 
peer.on("notify",function(headers, address){
	// handle notify event 
	//console.log("NOTIFY:",headers);
});

// handle SSDP M-SEARCH messages.  
// param headers is JSON object containing the headers of the SSDP M-SEARCH message as key-value-pair.  
// param address is the socket address of the sender 
peer.on("search",function(headers, address){
	// handle search request 
	// reply to search request 
	// {{networkInterfaceAddress}} will be replaced with the actual IP Address of the corresponding
	// sending the SSDP message with the actual IP Address of the corresponding 
	// Network interface. 
	console.log("SEARCH:",headers,address);
	if (headers.ST && headers.MAN=='"ssdp:discover"') {
		peer.reply({
			
			NT: "urn:schemas-upnp-org:device:basic:1",
			SERVER: "node.js/0.10.28 UPnP/1.1",
			ST: "urn:schemas-upnp-org:device:basic:1",
			USN: "uuid:Socket-1_0-221438K0100073::urn:Belkin:device:**",
			LOCATION: "http://{{networkInterfaceAddress}}:8082/upnp/amazon-ha-bridge/setup.xml",
		}, address);
	}
});

// handle SSDP HTTP 200 OK messages.  
// param headers is JSON object containing the headers of the SSDP HTTP 200 OK  message as key-value-pair.  
// param address is the socket address of the sender 
peer.on("found",function(headers, address){
	// handle found event 
	console.log("FOUND:",headers);
});

// handle peer close event. This event will be emitted after `peer.close()` is called. 
peer.on("close",function(){
	// handle close event 
	console.log("CLOSING.");
});

// Start peer. Afer peer is ready the `ready` event will be emitted. 
peer.start();

var config = JSON.parse(fs.readFileSync('config.json'));

const PORT=8082;

function handleRequest(request, response){
	console.log(request.method, request.url);
	var lightMatch = /^\/api\/(\w*)\/lights\/([\w\-]*)/.exec(request.url);
	if (lightMatch) {
		if (request.method == 'PUT') {
			request.on('data', function(chunk) {
				console.log("Received PUT data:",chunk.toString());
				request.data = JSON.parse(chunk);
			});
			request.on('end', function() {
				response.writeHead(200, "OK", {'Content-Type': 'application/json'});
				var responseStr='[{"success":{"/lights/'+lightMatch[2]+'/state/on":'+request.data.on+'}}]';
				console.log("Sending response:",responseStr);
				response.end(responseStr);
			});
		} else {
			console.log("Sending light ", lightMatch[2]);
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify(config.lights[lightMatch[2]]));
		}
	} else 
	if (/^\/api/.exec(request.url)) {
		console.log("Sending lights.json");
		response.writeHead(200, {'Content-Type': 'application/json'});
		response.end(JSON.stringify(config));
	} else if (request.url=='/upnp/amazon-ha-bridge/setup.xml') {
		var setup = fs.readFileSync('setup.xml');
		console.log("Sending setup.xml");
		response.writeHead(200, {'Content-Type': 'application/xml'});
		response.end(setup);	
	}
}

var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
	console.log("Hue API server listening on: http://localhost:%s", PORT);
});