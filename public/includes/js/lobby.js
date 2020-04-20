window.onload = function()
{
	var data_handler = function(node){
		this.value = 0;
		this.add = function(){
			node.innerHTML = ++this.value;
		};
		this.sub = function(){
			node.innerHTML = --this.value;
		};
		this.update = function(){
			node.innerHTML = this.value;
		};
	};
	var lobby_handler = function(name, map, id, cantJoin){
		//get player amt from map
		var players = [];
		this.Set = function(index, value){
			players[index] = value;
		};
		this.Length = function(){
			return players.length;
		};
		this.Name = function(){
			return name;
		};
		this.Map = function(){
			return map;
		};
		this.ID = function(){
			return id;
		};
		this.Join = function(){
			if(cantJoin)return;
			if(window.parent)window.parent.join_game(id);
		};
	};

	if(document.getElementById('lobbyamt')!=null)
	{
		window._lobbyAmt = new data_handler(document.getElementById('lobbyamt').childNodes[1]);
		window._openGames = new data_handler(document.getElementById('open').childNodes[1]);
		window._activeUsers = new data_handler(document.getElementById('connectInfo').childNodes[1]);
		window._gamesPlaying = new data_handler(document.getElementById('playing').childNodes[1]);
	}
	window.games = [];

	window.add_game = function(name, map, id, cantJoin){
		games[games.length] = new lobby_handler(name, map, id, cantJoin);
		setTimeout(function(){refresh();}, 5);
	};
	window.remove_game = function(id){
		var index = -1;
		for(var i in games)
		{
			if(games[i].ID()==id)
			{
				index = i;
				break;
			}
		}
		if(index==-1)return;
		games.splice(index, 1);
		setTimeout(function(){refresh();}, 5);
	};
	window.refresh = function(){
		var output = document.getElementById('lobby');
		output.innerHTML = "";
		for(var i=0;i<games.length;i++)
		{
			var game_info = games[i];
			var node = document.createElement('div');
			node.setAttribute('class', 'gameList');
			node.setAttribute('id', game_info.ID());
			
			var name = document.createElement('div');
			name.setAttribute('class', 'name');
			name.innerHTML = game_info.Name();
			node.appendChild(name);
			
			var container = document.createElement('div');
			container.setAttribute('class', 'playersContainer');
			for(var j=0;j<game_info.Length();j++)
			{
				var player = document.createElement('div');
				player.setAttribute('class', 'playerIcon');
				player.setAttribute('id', i+'PI'+j);
				container.appendChild(player);
			}
			node.appendChild(container);
			
			var btn = document.createElement('div');
			btn.setAttribute('class', 'btnJoin');
			btn.innerHTML = "Join";
			btn.onclick = function(){
				remove_game(i);
				game_info.Join();
			};
			node.appendChild(btn);
			
			output.appendChild(node);
		}
	};

	if(window.parent){
		window.parent.refresh_lobby();
		window.parent.lobby_open = true;
	}
};

function hide()
{
	document.getElementById('overlay').style.display = 'block';
}
function show()
{
	document.getElementById('overlay').style.display = 'none';
}