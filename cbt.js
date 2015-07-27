//Conditional Turn Based System

// Load players from the JSON file.
// each player is {name: [hp, max hp, strength, attack speed, magic speed]}
var _players = require("./players.json");

// Skill class wrapper.
// player   [class Player] 													 Player class
// name     [string] 																 Skill name
// modifier [string/key] 														 Skill modifier type
// fn       [function(Player player, Player target)] Skill logic to execute
var Skill = function(player, name, modifier, fn) {
	this.player   = player;   // player class
	this.name     = name;     // skill name
	this.modifier = modifier; // skill modifier type
	this.skillfn  = fn;       // skill logic
}

Skill.prototype = {
	// Dummy function, usually you would invoke some higher logic
	// In this case we return the attack speed (aspd) or magic speed (mspd)
	// Returns wait time for the skill
	getWaitTime: function() {
		return this.player[this.modifier];
	},
	// Wrapper function
	// target [class Player] Target to hit
	// Returns [Number damage taken, Number health healed]
	getEffects: function(target) {
		return this.skillfn(this.player, target);
	}
}

// Player class
// data [array]  constant values
// name [string] player name
var Player = function(data, name) {
	this.hp   = data[0]; // current hp
	this.mhp  = data[0]; // max hp
	this.atk  = data[1]; // attack (strength)
	this.aspd = data[2]; // attack speed
	this.mspd = data[3]; // magic speed
	this.man  = 200;     // mana
	this.name = name;    // name

	var self = this;
	this.skills = {}
	// Initiate the heal skill
	this.skills.heal = new Skill(self, "heals", "mspd", function(player, target) {
		// Cancel skill if the player has not enough mana
		if(player.man < 100) {
			return [0, 0];
		}

		// Increase the max HP by approximately 20% of max
		var hp = Math.round(Math.random() * (player.mhp * 0.15) + (player.mhp * 0.15));
		player.hp = player.hp + hp;
		// Reduce mana by 100
		player.man -= 150;
		// Done no damage to the target and healed {hp} to player
		return [0, hp];
	});
	// Print how long (wait time) it takes for {player} to execute {skill}
	console.log(name, 'has learned the skill heal for', this.skills.heal.getWaitTime(), 'wait time');

	// Initiate the attack skill
	this.skills.attack = new Skill(self, "attacks", "aspd", function(player, target) {
		// Deal players base attack + give or take 10% additional damage.
		var dam = player.atk + Math.round(Math.random() * (player.atk * 0.2) - (player.atk * 0.1));
		target.hp = target.hp - dam;
		// Dealt {dam} damage to target and healed no health to player
		return [dam, 0];
	});
	// Print how long (wait time) it takes for {player} to execute {skill}
	console.log(name, 'has learned the skill attack for', this.skills.attack.getWaitTime(), 'wait time');
}

// Super Basic AI
Player.prototype = {
	// Returns Skill
	getSkill: function() {
		// If hp is less than 70% and i have more than 0 mana
		if(this.hp / this.mhp < 0.70 && this.man > 0) {
			return this.skills.heal;
		}
		return this.skills.attack;
	},
	// Check if the current player is incapacitated
	// Returns Boolean
	isDead: function() {
		return this.hp < 1;
	}
}

// Player object, wait time order
var players = {}, order = [];

for(var name in _players) {
	// Initiate the player
	players[name] = new Player(_players[name], name);
	// Push the player's name and it's basic attack wait time as the initiator
	order.push([name, players[name].skills.attack.getWaitTime()]);
}

// Cort the wait time order by skill wait time
order = order.sort(function(a, b) {
	return a[1] - b[1];
});

// Print wait time
console.log('\t', order.map(function(x) { return x[0] + ' (' + x[1] + ')' }).join(', '));

// Count the number of alive players
// Returns Number
var aliveCount = function(players) {
	var i = 0;
	for(var name in players) {
		if(!players[name].isDead()) ++i;
	}
	return i;
}

// Get an array of opponents that are still alive
// players [Object] Players involved in the battle
// me      [Player] Current player name
// Returns Array
var getOpponents = function(players, me) {
	var opponents = [];
	for(var name in players) {
		if(players[name].isDead()) continue;
		if(name != me) opponents.push(name);
	}
	return opponents;
}

// While the number of alive players is greater than 1
while(aliveCount(players) > 1) {
	// Get the first player in the wait time list
	var current = order.shift();
	// Skip if the given player is dead
	if(players[current[0]].isDead()) continue;

	// This is important
	// Reduce every wait time in the order by the current skill's wait time
	for(var i = 0; i < order.length; ++i) {
		order[i][1] -= current[1];
	}

	// Get current alive opponents
	var opponents     = getOpponents(players, current[0]);
	// Pick a random opponent by name
	var opponent_name = opponents[Math.floor(Math.random() * opponents.length)];
	// Get the player object of the opponent_name
	var opponent      = players[opponent_name];
	// Get a skill from some light AI
	var skill         = players[current[0]].getSkill();
	// Execute skill logic on opponent
	var effects       = skill.getEffects(opponent);

	// If damage done is greater than 0
	if(effects[0] > 0) {
		// Print how much damage has been done
		console.log(current[0], skill.name, opponent_name, "for", effects[0], "damage");
	}

	// If health healed is greater than 0
	if(effects[1] > 0) {
		// Print how much health has been healed
		console.log(current[0], skill.name, "for", effects[1], "health");
	}

	// If the opponent died during the encounter
	if(opponent.isDead()) {
		// Print that the current player has incapacitated the opponent
		console.log(current[0], "has slain", opponent_name);
	}

	// Queue up another skill
	order.push([current[0], current[1] + players[current[0]].getSkill().getWaitTime()]);

	// Sort the wait time order again
	order = order.sort(function(a, b) {
		return a[1] - b[1];
	});

	// Re-print wait time
	console.log('\t', order.map(function(x) { return x[0] + ' (' + x[1] + ')' }).join(', '));
}
