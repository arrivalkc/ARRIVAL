function validateSignup(user, pass){
	if(!user||!pass)return false;
	if(user==""||pass=="")return false;
	return true;
}
function reportLoggedIn(user, pass, report){
	if(!LOADED){
		report("The page has not loaded yet.");
		return;
	}
	if(CONNECTED){
		report("Already signed in... try refreshing");
		return;
	}
	if(!validateSignup(user, pass))return;
	CONNECT(user, pass, report);
}
function reportNewUser(user, pass, report){
	if(!LOADED)return;
	if(CONNECTED)return;
	if(!validateSignup(user, pass))return;
	if(new Date-LAST_CONNECT_MESSAGE<5000){
		if(report)report("Please wait 5 seconds before retrying...");
		return;
	}
	LAST_CONNECT_MESSAGE = new Date;
	socket.emit('new user', user, pass);
}
function logOut(){

}

var pageFrame;
var page;
var title_box_alert = function(updated){
	var old = document.title;
	this.time = 1000;
	var kill = false;
	var self = this;
	var toggle = true;
	this.stop = function(){
		kill = true;
	};
	var refresh_fnc = function(){
		if(kill){
			document.title = old;
			return;
		}
		if(toggle)
		{
			document.title = updated;
			toggle = false;
		}
		else
		{
			document.title = old;
			toggle = true;
		}
		setTimeout(refresh_fnc, self.time);
	};
	refresh_fnc();
};
var CONNECTED = false;
var CONNECTION_TIMEOUT = 0;
var LOADED = false;
var lobby_open = false;
var socket;
if(typeof io!=='undefined'){socket = io();}
var onFinishedLoadingList = [];
function onFinishedLoading(fnc){
	if(onFinishedLoadingList==null)return;
	onFinishedLoadingList.push(fnc);
}
window.onload = function(){
	LOADED = true;
	pageFrame = document.getElementById('pageFrame');
	page = pageFrame.contentWindow;
	socket.on('public log', function(msg, color, time){
		if(page.LOG)page.LOG.add(msg, color, time);
	});
	socket.on('set client data', function(index, name){
		socket.index = index;
		socket.username = name;
	});
	socket.on('user joined', function(username){
		if(page.LOG)page.LOG.add(username+" joined","#FF0");
		if(!lobby_open)return;
		lobby.contentWindow._activeUsers.add();
		lobby.contentWindow._lobbyAmt.add();
	});
	socket.on('user left', function(username){
		if(page.LOG)page.LOG.add(username+" left","#FF0");
		if(!lobby_open)return;
		lobby.contentWindow._activeUsers.sub();
	});

	socket.on('message', function(data){
	// timestamp("MESSAGE: "+data.type);
		if(data.type==null)return;
			/** initiate connection and errors */
		if(data.type==0)
		{	// refresh connection
			CONNECTION_TIMEOUT = 0;
		}
		else if(data.type==1)
		{ /** unused */	}
		else if(data.type==2)
		{	// refresh connection info
			if(!lobby_open)return;
			lobby.contentWindow._openGames.value = data.g;
			lobby.contentWindow._openGames.update();
			lobby.contentWindow._lobbyAmt.value = data.l;
			lobby.contentWindow._lobbyAmt.update();
			lobby.contentWindow._activeUsers.value = data.a;
			lobby.contentWindow._activeUsers.update();
			lobby.contentWindow._gamesPlaying.value = data.p;
			lobby.contentWindow._gamesPlaying.update();
		}
		else if(data.type==3)
		{	// receive already opened games data
			if(!lobby_open)return;
			for(var i in data.info)
			{
				lobby.contentWindow.add_game(data.info[i].name,data.info[i].map,data.info[i].page);
				lobby.contentWindow._openGames.add();
				// add player list
			}
		}
		else if(data.type==4)
		{	// client disconnected
			CONNECTED = false;
			CONNECTION_TIMEOUT = 0;
		}
		else if(data.type==5)
		{	// report username taken
			var err_report = pageFrame.contentWindow;
			if(err_report==null)return;
			if(err_report.report==null)return;
			err_report.report("User name taken!");
		}
		else if(data.type==6)
		{	// report username does not exist
			var err_report = pageFrame.contentWindow;
			if(err_report==null)return;
			if(err_report.report==null)return;
			err_report.report("Username does not exist!");
		}
		else if(data.type==7)
		{	// report password is not correct
			var err_report = pageFrame.contentWindow;
			if(err_report==null)return;
			if(err_report.report==null)return;
			err_report.report("Password not correct!");
		}
		else if(data.type==8)
		{	// error connecting to server
			if(!page.LOG){
				if(page.report==null)return;
				page.report("General error when signing-up/logging-in");
			}else{
				window.location.reload();
			}
		}
		else if(data.type==9)
		{	// new user added correctly
			var loginFrame = pageFrame.contentWindow;
			if(loginFrame==null)return;
			if(loginFrame.login==null)return;
			LAST_CONNECT_MESSAGE = 0;
			loginFrame.login();
		}

			/** page messages */
		else if(data.type==10)
		{	// end turn
			page.INTERFACE.Game.Active_Player().End_Turn();
		}
		else if(data.type==11)
		{	// move unit
			page.INTERFACE.Game.Move(data.unit, data.x, data.y, data.path, null, true);
		}
		else if(data.type==12)
		{	// act building
			var result = page.INTERFACE.Game.Build(data.building, data.input, null,  true);
			page.INTERFACE.Draw();
		}
		else if(data.type==13)
		{	// receive chat message
			if(lobby_open)return;
			lobby.contentWindow.add_msg(data.sender, data.txt);
		}
		else if(data.type==14)
		{	// request page data
			if(!page.INTERFACE.Game)return;
			page.INTERFACE.Game.Update_Server_With_Gamestate();
		}
		else if(data.type==15)
		{	// report invalid page data -> fix or break if unfixable
			if(!page.INTERFACE.Game)return;
			if(data.page==null)
			{ // no gamestate to revert to
				page.INTERFACE.Game.End_Game();
				if(!page.LOG)return;
				page.LOG.add("ERROR: Game data issue. Could not salvage page.", "#F00", 10000);
				page.LOG.add("Game ended and no points were lost", "#F00", 10000);
				page.LOG.add("Note for dev., add button to auto restart last page?", "#FFF", 20000);
				return;
			}
			setTimeout(function(){ // reset page after 5 seconds
				page.INTERFACE.setGame(new page.Engine_Class(data.page));
				page.INTERFACE.Game.Start();
			}, 5000);
			if(!page.LOG)return;
			page.LOG.add("ERROR: Game data issue. Reverting page to last saved point...", "#F00", 10000);
		}
		else if(data.type==16)
		{	// player reconnected
			pageFrame.onload = function(){
				if(!page.load_game)return;
				page.load_game(data.page);
				if(!page.LOG)return;
				page.LOG.add("Resuming page from last saved gamestate", "#FFF", 5000);
			}
		}

			/** lobby connections */
		else if(data.type==20)
		{	// caching user info and validating connection
			socket.index = data.index;
			CONNECTED = true;
			CHECK_CONNECTION();
			if(pageFrame.src!="/welcome/")
				pageFrame.src = "/welcome/";
			document.title = "Welcome " + socket.username + " to Arrival";
		}
		else if(data.type==21)
		{	// setup page to play
			page.init_map(page.Map_Reader.Read(page.decrypt_game_data(data.map)), data.players, data.page);
		}
		else if(data.type==22)
		{	// starting page
			if(page.LOG)page.LOG.add("page started","#F00");
			page.INTERFACE.Game.Start();
			lobby.contentWindow._openGames.sub();
		}
		else if(data.type==22.5)
		{	// report updated passkey for page to work
			page.INTERFACE.Game.Set_Passkey(data.passkey);
		}
		else if(data.type==23)
		{	// report opened page id
			socket.game_id = data.id;
		}
		else if(data.type==24)
		{	// player timed-out-of/left page
			if(page.currently_playing)
			{
				page.INTERFACE.Game.Leave(data.slot);
			}
			else page.Menu.PreGame.Set(data.slot, "");
		}
		else if(data.type==25)
		{	// page closed in lobby
			if(!lobby_open)return;
			lobby.contentWindow.remove_game(data.page);
			lobby.contentWindow._openGames.sub();
		}
		else if(data.type==26)
		{	// join page
			if(page.LOG)page.LOG.add(data.name+" joined page","#F00");
			page.INTERFACE.Game.Set_Player(data.slot, data.player, data.name);
			page.Menu.PreGame.Set(data.slot, data.name);
		}
		else if(data.type==27)
		{	// open page in lobby
			if(!lobby_open)return;
			lobby.contentWindow.add_game(data.name,data.map,data.page);
			lobby.contentWindow._openGames.add();
			// if(page.LOG)page.LOG.add(page.Levels.Names(data.map)+" opened with id "+data.page,"#F00");
		}
		else if(data.type==28)
		{	// player lost connection
			if(!page.LOG)return;
			var playerName = page.INTERFACE.Game.Player(data.slot);
			if(playerName)
				playerName = playerName.Name;
			else playerName = data.slot;
			page.LOG.add("Warning, player "+playerName+" lost connection", "#FFF", 10000);
			page.LOG.add("This player has 30 seconds to reconnect", "#FFF", 20000);
			page.LOG.add("Otherwise they forfeit the page", "#FFF", 30000);
		}
		else if(data.type==29)
		{	// player regained connection
			if(!page.LOG)return;
			var playerName = page.INTERFACE.Game.Player(data.slot);
			if(playerName)
				playerName = playerName.Name;
			else playerName = data.slot;
			page.LOG.add("Player "+playerName+" reconnected connection.", "#FFF");
		}

			/** loading published games */
		else if(data.type==500)
		{	// error requesting data
			console.error("Could not get data request. CODE:",data.type);
		}
		else if(data.type==501)
		{	// map index does not exist
			page.LOG.add("We could not find any of the maps that you were looking for. Try changing your search");
		}
		else if(data.type==502)
		{	// recieved page data
			let name = "";
			while(name!="")
			{
				name = prompt("What do you want to name the page?");
			}
			page.new_custom_game(game_data, name);
		}
		else if(data.type==503)
		{	// recieved a list of page data that matched the query
			page.Menu.LevelSelect.Update_Map_Search(data.data);
		}
		else if(data.type==504)
		{	// report the date the account was created
			page.Report_Created(data.day_created);
		}
		else if(data.type==505)
		{	// report the most recent date the account accessed
			page.Report_Last_Login(data.last_login);
		}

			/** client saved custom map data */
		else if(data.type==600)
		{	// Unlocked the next story level
			page.Levels.Report_Unlocked(data.story_prog);
			page.Menu.StoryScreen.Prep(data.section);
			page.Menu.StoryScreen.Load();
		}
		else if(data.type==601)
		{	// Unlocked all the story levels
		}
		else if(data.type==605)
		{	// CONGRATS for leveling up!

		}

			/** client saved custom map data */
		else if(data.type==700)
		{	// error requesting mapdata
			if(page.Menu.MapEditor.Server_Response==null)return;
		}
		else if(data.type==701)
		{	// download existing maps
			if(page.Menu.MapEditor.Server_Response==null)return;

			page.Menu.MapEditor.Server_Response.Map_List(data.data);
		}
		else if(data.type==702)
		{	// UNUSED
			if(page.Menu.MapEditor.Server_Response==null)return;
		}
		else if(data.type==703)
		{	// delete existing map
			if(page.Menu.MapEditor.Server_Response==null)return;
		}
		else if(data.type==704)
		{	// report map playtested
			if(page.Menu.MapEditor.Server_Response==null)return;
		}
		else if(data.type==705)
		{	// publish playtested map
			if(page.Menu.MapEditor.Server_Response==null)return;
		}
		else if(data.type==706)
		{	// report newly uploaded map's unique Identification\
			if(page.Menu.MapEditor.Server_Response==null)return;
			page.Menu.MapEditor.Server_Response.Report_Id(data.mapid);
		}
		else if(data.type==707)
		{	// report faulty map upload -- try again?
			if(page.Menu.MapEditor.Server_Response==null)return;
		}
		else if(data.type==708)
		{	// user has too many maps saved, delete old map or update exsisting map
			if(page.Menu.MapEditor.Server_Response==null)return;
		}
		else if(data.type==709)
		{	// cannot find map with that ID on server... if you think this is an accident on our part, please report the incident to us
			if(page.Menu.MapEditor.Server_Response==null)return;
		}
		else if(data.type==710)
		{	// map succesfully updated / deleted / renammed
			if(page.Menu.MapEditor.Server_Response==null)return;

			page.Menu.MapEditor.Server_Response.Updated_With_Server(true);
		}
		else if(data.type==777)
		{	// unlucky general error -- don't know what caused error here
			if(page.Menu.MapEditor.Server_Response==null)return;
		}

			/** in-page error messages */
		else if(data.type==100)
		{	// could not connect to page message
			if(page.LOG)page.LOG.add("ERROR:Could not connect to page "+data.page, "#F00");
		}

			/** logs */
		else if(data.type==110)
		{	// console log message
			console.warn("WARNING: IMPROPER USE OF MESSAGING");
			console.log(data.msg);
		}
		else if(data.type==111)
		{	// page log message
			console.warn("WARNING: IMPROPER USE OF MESSAGING");
			if(page.LOG)page.LOG.add(data.msg, data.color);
		}
	});
	for(var i in onFinishedLoadingList){
		onFinishedLoadingList[i]();
	}
	onFinishedLoadingList = null;
};

var LAST_CONNECT_MESSAGE = 0;
function CONNECT(name, pass, report){
	if(CONNECTED)return;
	if(new Date-LAST_CONNECT_MESSAGE<5000){
		if(report)report("Please wait 5 seconds before retrying...");
		return;
	}
	LAST_CONNECT_MESSAGE = new Date;
	socket.username = name;
	socket.password = pass;
	socket.emit('connect user', name, pass);
}

const CONNECTION = function(){
	let CONNECTION = {
		FAST:3000,
		SLOW:20000,
		NONE:-1
	};
	let time = CONNECTION.SLOW;
	this.GET = function(){
		return time;
	};
	this.SET = function(val){
		switch (val) {
			case 0:
				time = CONNECTION.NONE;
				break;
			case 1:
				if(time==CONNECTION.NONE)
				{
					time = CONNECTION.SLOW;
					CHECK_CONNECTION();
					return;
				}
				time = CONNECTION.SLOW;
				break;
			case 1:
				if(time==CONNECTION.NONE)
				{
					time = CONNECTION.FAST;
					CHECK_CONNECTION();
					return;
				}
				time = CONNECTION.FAST;
				break;
		}
	};
};
const CONNECTION_ACTIVE = new CONNECTION;

function setConnection(val){
	CONNECTION_ACTIVE.SET(val);
}

function CHECK_CONNECTION(){
	if(CONNECTION_TIMEOUT>5)
	{
		if(CONNECTED)
		{
			LOST_CONNECTION();
			CONNECTED = false;
		}
	}
	else
	{
		if(!CONNECTED)
		{
			CONNECT(socket.username, socket.password);
			RECONNECTED();
		}
		CONNECTION_TIMEOUT++;
	}
	socket.emit('check');
	if(CONNECTION_ACTIVE.GET()==-1)return;
	setTimeout(function(){CHECK_CONNECTION()}, CONNECTION_ACTIVE.GET());
}
function LOST_CONNECTION(){
	var time = new Date().toLocaleTimeString();
	console.error("Lost connection at "+time);
	if(page.LOG)page.LOG.add("Lost connection at "+time,"#F00",10000);
	document.title_alert = new title_box_alert("LOST CONNECTION");
}
function RECONNECTED(){
	var time = new Date().toLocaleTimeString();
	console.error("Regained connection at "+time);
	if(page.LOG)page.LOG.add("Regained connection at "+time,"#0F0",5000);
	refresh_lobby();
	if(document.title_alert)
	{
		document.title_alert.stop();
	}
}

function openLobby(){
	lobby.src = "includes/lobby.html";
	document.getElementById("refreshLobby").href = "includes/lobby.html";
	socket.emit('lobby on');
}
function openChat(){
	lobby_open = false;
	document.getElementById("refreshLobby").href = "includes/chat.html";
	lobby.src = "includes/chat.html";
}

function refreshChatList(){
	if(lobby_open)return;
	var list = page.INTERFACE.Request_Connections();
	for(var i in list){
		lobby.contentWindow.addPlayer(list[i][0], list[i][1]);
	}
}
function refresh_lobby(){
	if(!lobby_open)return;
	lobby.contentWindow.games = [];
	lobby.contentWindow.refresh();
	socket.emit('refresh lobby');
}
function refresh_game(){
	pageFrame.src = pageFrame.src;
}

function send_chat(__input_passkey, text){
	if(!page.currently_playing)return;
	socket.emit('chat', __input_passkey, text);
	lobby.contentWindow.add_msg(socket.index, text);
}
function join_game(game_id){
	if(page.currently_playing)
	{
		if(!confirm("Are you sure you want to leave this page?"))
			return;
		page.INTERFACE.Game.End_Game(false);
	}
	socket.emit('join', game_id);
}

function timestamp(){
	var str = "";
	for(var i in arguments)
	{
		str+=arguments[i]+" ";
	}
	console.log(new Date().toLocaleTimeString(),"->",str);
}
var lobby = document.getElementById('lobbyFrame');
