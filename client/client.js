var ws;
var lastPacket;
function wsSetup() {
	ws = new WebSocket(location.href.replace("http", "ws"));
	ws.onopen = openData;
	ws.onerror = function(err) { console.log('err: ', err) };
	ws.onmessage = function(event) { receivedData(JSON.parse(event.data)) };
	ws.onclose = function() {console.log("Connection closed")};
}
/**@param {clientData} obj*/
function sendData(obj) {
	var data = JSON.stringify(obj);
	if(ws.readyState == ws.OPEN) ws.send(data);
}
var players = [];
var game = {
	size: {
		width: 100,
		height: 100
	}
}
/**
 * Handle received data
 * @param {serverData} data
 */
function receivedData(data) {
	lastPacket = data;
	if(data.players) ({players} = data);
	if(data.size) game.size = data.size;
}
/**
 * Sent when a connection first opens
 */
function openData() {
	sendData({size: true});
}
function sendUpdate() {
	sendData({players: true});
}