function main() {
	ctx.save();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	scale = canvas.height/game.size.height;
	ctx.scale(scale, scale);
	players.forEach(player => 
		drawPlayer(player)
	);
	ctx.restore();
}
function click() {
	sendData({skip: true});
}
var scale;
function drawPlayer(player) {
	ctx.fillStyle = player.color;
	ctx.fillRect(player.x, player.y, player.s, player.s);
}
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");