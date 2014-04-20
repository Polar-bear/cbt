//Conditional Turn Based System
var _players = require("./players.json");

var Skill = function(player, name, modifier, fn) {
	this.player = player;
	this.name = name;
	this.modifier = modifier;
	this.skillfn = fn;
}

Skill.prototype = {
	getWaitTime: function() {
		return this.player[this.modifier];
	},
	getEffects: function(target) {
		return this.skillfn(this.player, target);
	}
}

var Player = function(data) {
	this.hp = data[0];
	this.mhp = data[0];
	this.atk = data[1];
	this.aspd = data[2];
	this.mspd = data[3];
	this.man = 200;

	var self = this;
	this.skills = {}
	this.skills.heal = new Skill(self, "heals", "mspd", function(player, target) {
		var hp = Math.round(player.mhp * 0.20);
		player.hp = player.hp + hp;
		return [0, hp];
	});
	this.skills.attack = new Skill(self, "attacks", "aspd", function(player, target) {
		var dam = player.atk + Math.round(Math.random() * (player.atk * 0.2) - (player.atk * 0.1));
		target.hp = target.hp - dam;
		return [dam, 0];
	});
}

Player.prototype = {
	//super basic AI
	getSkill: function() {
		if(this.hp / this.mhp < 0.70 && this.man > 0) {
			return this.skills.heal;
		}
		return this.skills.attack;
	},
	isDead: function() {
		return this.hp < 1;
	}
}

var players = {}, order = [];

for(var name in _players) {
	players[name] = new Player(_players[name]);
	order.push([name, players[name].getSkill().getWaitTime()]);
}

order = order.sort(function(a, b) {
	return a[1] - b[1];
});


var aliveCount = function(players) {
	var i = 0;
	for(var name in players) {
		if(!players[name].isDead()) ++i;
	}
	return i;
}

var getOpponents = function(players, me) {
	var opponents = [];
	for(var name in players) {
		if(players[name].isDead()) continue;
		if(name != me) opponents.push(name);
	}
	return opponents;
}

while(aliveCount(players) > 1) {
	var current = order.shift();
	if(players[current[0]].isDead()) continue;
	for(var i = 0; i < order.length; ++i) {
		order[i][1] -= current[1];
	}

	var opponents = getOpponents(players, current[0]);
	var opponent_name = opponents[Math.floor(Math.random() * opponents.length)];
	var opponent = players[opponent_name];
	var skill = players[current[0]].getSkill();
	var effects = skill.getEffects(opponent);

	if(effects[0] > 0) {
		console.log(current[0], skill.name, opponent_name, "attacks for", effects[0], "damage");
	}
	if(effects[1] > 0) {
		console.log(current[0], skill.name, "for", effects[1], "health");
	}
	if(opponent.isDead()) {
		console.log(current[0], "has slain", opponent_name);
	}

	order.push([current[0], players[current[0]].getSkill().getWaitTime()]);
	order = order.sort(function(a, b) {
		return a[1] - b[1];
	});
}
