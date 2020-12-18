//Packs
const http = require('http');
const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static("client"));
// default URL for website
app.use('/', function(_req, res) {
	// console.log(req.ip);
	res.sendFile(path.join(__dirname + '/client/index.html'));
	//__dirname : It will resolve to your project folder.
});
//Server
const server = http.createServer(app);
const port = 3000;
server.listen(port);
console.debug('Server listening on port ' + port);
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({server});
wss.on('listening', () => {
	console.log('WSS: listening on port: ' + port);
});
wss.on('connection', (ws, req) => {
	console.log("open");
	var close = () => console.log("close");
	/**@param {serverData} data*/
	var sendData = data =>
		ws.send(JSON.stringify(data));
	ws.on("message", msg => {
		var obj;
		//Try to turn the data into an object
		try{obj = JSON.parse(msg)}
		catch(err) {console.error(err)}
		//Use data if it's an object
		if(obj instanceof Object)
			receivedData.call(sendData, obj);
	});
	ws.on('close', close);
	ws.on('error', close);
});
/**
 * @this {(obj) => void}
 * @param {{}} data
 */
function receivedData(data) {
	/**@type {serverData}*/
	var reply = {};
	if(data.players) {
		reply.players = [];
		players.forEach(player => reply.players.push(
			player.data()
		));
	}
	if(data.size)
		reply.size = game.size;
	if(data.skip) 
		skip = !skip;
	this(reply);
}
var game = {
	size: {
		width: 100,
		height: 100
	}
}
const Neataptic = require('neataptic');
const Network = require('neataptic/src/architecture/network');
var {Neat, config: Config, methods: Methods} = Neataptic;
Config.warnings = true;
var neat = new Neat(
	4,
	3,
	null,
	{
		mutation: Methods.mutation.ALL,
		popsize: 100,
		mutationRate: 0.03,
		elitism: 25 //Best 25 out of 1000
	}
);
var {abs, random, floor, PI, sin, cos, atan2} = Math;
class myArray extends Array{
	vsLoop(callback, thisArg) {
		for(var a = 0; a < this.length; a++) {
			var player = this[a];
			for(var b = a + 1; b < this.length; b++) {
				var player2 = this[b];
				callback.call(thisArg, player, player2, a, b, this);
			}
		}
	}
}
class Entity{
	screenlock() {
		var {width, height} = game.size;
		if(this.x < 0) this.x = 0;
		if(this.y < 0) this.y = 0;
		if(this.x + this.s > width)
			this.x = width - this.s;
		if(this.y + this.s > height)
			this.y = height - this.s;
	}
	data() {
		var {x, y, s, color} = this;
		return {x, y, s, color};
	}
	get mx() {return this.x + this.s/2}
	get my() {return this.y + this.s/2}
	/**@param {Player} player @param {Player} player2*/
	static distance = (player, player2) => 
		(((player.mx - player2.mx) ** 2) + ((player.my - player2.my) ** 2)) ** 0.5;
	/**@param {Player} player @param {Player} player2*/
	static radianTo = (player, player2) => atan2(
		player2.my - player.my,
		player2.mx - player.mx
	);
	/**@param {Player} player @param {Player} player2*/
	static isTouching = (player, player2) =>
		abs(player.mx - player2.mx) < (player.s + player2.s)/2 && abs(player.my - player2.my) < (player.s + player2.s)/2;
	s = 1;
}
class Player extends Entity{
	/**@param {Network} network*/
	constructor(network) {
		super();
		this.ai = network;
		network.score = 0;
		this.color = "#" + floor(random() * 0xffffff).toString(16);
	}
	runAi() {
		var input = this.getInputs();
		var output = this.ai.activate(input);
		var [speed, radian, fireRad] = output;
		if(speed >  1) speed =  1;
		if(speed < -1) speed = -1;
		speed *= 0.1;
		this.velocity.x += speed * cos(radian * PI);
		this.velocity.y += speed * sin(radian * PI);
		if(ticks % 10 == 0) this.shoot(fireRad * PI);
	}
	shoot(rad) {
		summons.push(new Bullet(this, rad));
	}
	getInputs() {
		var {x, y} = this;
		var inputs = [];
		inputs.push(x, y);
		var id = players.indexOf(this);
		var enemies = [];
		players.forEach((player, pid) => {
			if(this == player) return;
			var distance = distances[id]?.[pid];
			try{
				if(typeof distance == "number") {
					var radian = radians[id][pid];
				}else{
					distance =  distances[pid][id];
					radian = radians[pid][id] + PI;
					radian %= PI * 2;
				}
				enemies.push({
					distance,
					radian
				});
			}catch(err) {
				console.log(id, pid);
			}
		});
		enemies.sort((a, b) => a.distance - b.distance);
		var [enemy] = enemies;
		if(enemy) inputs.push(enemy.distance, enemy.radian);
		else      inputs.push(0, 0);
		return inputs;
	}
	applyForce() {
		var {velocity} = this;
		var {x, y} = velocity;
		this.x += x;
		this.y += y;
		velocity.x *= 0.9 ** 0.5;
		velocity.y *= 0.9 ** 0.5;
	}
	update() {
		this.runAi();
		this.applyForce();
		this.screenlock();
	}
	spawn() {
		var {width, height} = game.size;
		do{
			this.x = floor(random() *  width);
			this.y = floor(random() * height);
		}while(this.nearOthers());
		return this;
	}
	nearOthers() {
		var is;
		players.forEach(player =>
			is ||= Player.distance(this, player) < 3
		);
		return is;
	}
	velocity = {x: 0, y: 0}
}
class Bullet extends Entity{
	/**@param {Player} parent @param {number} radian*/
	constructor(parent, radian) {
		super();
		this.parent = parent;
		this.radian = radian;
		this.x = this.parent.x;
		this.y = this.parent.y;
		this.color = "black";
	}
	update() {
		var {radian} = this;
		this.x += 0.1 * cos(radian);
		this.y += 0.1 * sin(radian);
		this.screenlock();
	}
	s = 0.25;
}
/**@type {number[][]}*/
var distances;
/**@type {number[][]}*/
var radians;
function calculate() {
	distances = [];
	radians   = [];
	players.vsLoop((player, player2, a, b) => {
		if((b - a) == 1) (distances[a] = [], radians[a] = []);
		distances[a][b] = Player.distance(player, player2);
		radians[a][b]   = Player.radianTo(player, player2);
	});
}
function nextGeneration() {
	neat.sort();
	var newPopulation = [];

	// Elitism
	for(var i = 0; i < neat.elitism; i++) {
		newPopulation.push(neat.population[i]);
	}

	// Breed the next individuals
	for(var i = 0; i < neat.popsize - neat.elitism; i++) {
		newPopulation.push(neat.getOffspring());
	}

	// Replace the old population with the new population
	neat.population = newPopulation;
	neat.mutate();

	neat.generation++;
	console.log(`generation: ${neat.generation}`);
	initPlayers();
}
function initPlayers() {
	ticks = 0;
	players = new myArray;
	neat.population.forEach(ai =>
		players.push(new Player(ai).spawn())
	);
}
var ticks;
/**@type {$myArray<Player | Bullet>}*/
var players;
/**@type {Bullet[]}*/
var summons;
var skip;
async function update() {
	while(1) {
		++ticks;
		var done = wait(skip? 0: 20);
		calculate();
		summons = [];
		players.forEach(player =>
			player.update()
		);
		players.vsLoop((player, player2) => {
			if(player.parent == player2) return;
			if(player2.parent == player) return;
			if(Player.isTouching(player, player2)) {
				player.dead  = true;
				player2.dead = true;
				if(player.parent && player2.parent) return;
				if(player.parent) player.parent.ai.score++;
			}
		});
		players = players
			.filter(player => !player.dead)
			.concat(summons);
		if(ticks == 200) nextGeneration();
		await done;
	}
}
var wait = time => new Promise(resolve => setTimeout(resolve,
	time //Milliseconds to wait
));
initPlayers();
update();