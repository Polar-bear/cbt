// Conditional Turn Based System
// It's sloppy, and doesn't allow people of exactly the same agility, but it works.
// Players = "Name": [Agility, Damage, currentHP, maxHP]

var players = require("./players.json"), rules = require("./rules.json"), waittime = {}, waittime_d = {};
var order = {}, alivePlayers = 0;

Object.keys(players).forEach(function(player) {
	console.log(player, "enters the arena");
	waittime[player] = rules.maxWT - players[player][0];
	waittime_d[player] = rules.maxWT - players[player][0];
	order[waittime[player]] = player;
	alivePlayers += 1;
});

while(alivePlayers > 1) {
	var Order = ["Attack", "Attack", "Attack", "Item"];
	var PlayerName = order[Object.keys(order)[0]], Player = players[PlayerName], wt = waittime[order[Object.keys(order)[0]]];

	if(Player[2] < Player[3]/4) Order = ["Item", "Item", "Item", "Attack"];
	if(Player[2] >= Player[3]) {
		Order = ["Attack", "Attack", "Attack", "Attack"];
		Player[2] = Player[3];
	}

	var Action = Order[Math.floor(Math.random() * 4)], Action2 = "";


	Object.keys(waittime).forEach(function(wait) {
		if(players[wait][2] < 1) return;
		waittime[wait] -= rules.WTAuto;
		if(waittime[wait] < 1) waittime[wait] = 0;
	})

	waittime[PlayerName] = waittime_d[PlayerName] * rules[Action];

	if(Action == "Attack") {
		Action2 = PlayerName;
		wt = wt * rules[Action];
		while(Action2 == PlayerName) {
			Action2 = Object.keys(players)[Math.floor(Math.random() * Object.keys(players).length)];
			if(players[Action2][2] < 1) Action2 = PlayerName;
		}
		Action = "attacks the";
		var DMG = Player[1];
		if(Math.random() > 0.5) DMG *= (Math.random() * 2);
		else DMG *= Math.random();
		DMG = Math.ceil(DMG);
		players[Action2][2] -= DMG;
		console.log(PlayerName, Action, Action2, "("+DMG+")");
	} else {
		Action = "heals itself.";
		Player[2] += rules.ItemHeal;
		console.log(PlayerName, Action);
	}


	if(Action2 != "") {
		if(players[Action2][2] < 1) {
			console.log(PlayerName, "as slain", Action2+"!");
			alivePlayers--;
		}
	}

	order = {};
	Object.keys(waittime).forEach(function(wait) {
		if(players[wait][2] < 1) return;
		order[waittime[wait]] = wait;
	});
}

