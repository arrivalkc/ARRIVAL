/// Code written and created by Elijah Storm
// Copywrite April 5, 2020
// for use only in ARRIVAL KC Project


var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var mongo = require('mongojs')
var db = mongo(process.env.MONGODB_URI || 'mongodb://localhost/datatest');

db.on('error', function(err){
	console.log('Data Base ERR:', err);
});
server.listen(port, function(){
	console.log('\********** Server listening on port %d **********', port);
});


// Routing
app.use(express.static(__dirname + '/public'));

function timestamp(){
	var str = "";
	for(var i in arguments)
	{
		str+=arguments[i]+" ";
	}
	console.log(new Date().toLocaleTimeString(),"->",str);
}
var data_list = function(){
	this.list = [];
	this.Add = function(data)
	{
		var i = 0;
		for(;i<this.list.length;i++)
		{
			if(this.list[i]==null)break;
		}
		this.list[i] = data;
		return i;
	};
	this.Remove = function(index)
	{
		if(index>=this.list.length)return false;
		var removed = this.list[index];
		this.list[index] = null;
		for(var i=index+1;i<this.list.length;i++)
		{
			if(this.list[i]!=null)return removed;
		}
		var last_good = index;
		for(;last_good>0;last_good--)
		{
			if(this.list[last_good-1]!=null)break;
		}
		this.list.splice(last_good, this.list.length-last_good);
		return removed;
	};
	this.Active = function()
	{
		var running = [];
		for(var i in this.list)
		{
			if(this.list[i]!=null)
			{
				running.push(this.list[i]);
			}
		}
		return running;
	};
};
var con_handler = function(){
	var active = new data_list();
	var amt = 0;
	this.Socket = function(index)
	{
		if(index>=active.list.length)return null;
		return active.list[index];
	};
	this.Add = function(socket)
	{
		amt++;
		return active.Add(socket);
	};
	this.Disconnect = function(index)
	{
		var user = active.Remove(index);
		if(!user)return;
		amt--;
		timestamp("user "+user.username+" disconnected");
	};
	this.Reconnect = function(index, socket)
	{
		if(index>=active.list.length)return;
		var oldSocket = active.list[index];
		socket.index = index;
		socket.username = oldSocket.username;
		socket.vars = oldSocket.vars;
		active.list[index] = socket;
		timestamp("user",oldSocket.username,"reconnected");
	};
	this.Length = function()
	{
		return active.list.length;
	};
	this.Amount = function()
	{
		return amt;
	};
	this.Active = function()
	{
		return active.Active();
	};
};
var Connections = new con_handler();

let SUDO_ROUTE_PASS = Math.random();
setInterval(function(){
	SUDO_ROUTE_PASS = Math.random();
}, 300000); // refresh passkey every 5 minutes

function send_lobby_info(data, sender){
	var active = Connections.Active();
	for(var i in active)
	{
		if(active[i].vars.lobby_listening)
		{
			if(active[i].index==sender)continue;
			active[i].send(data);
		}
	}
}

io.on('connection', function(socket){
	socket.vars = {
		online:false,
		in_game:null,
		lobby_listening:true
	};

	socket.on('lobby on', function(){
		socket.vars.lobby_listening = true;
	});
	socket.on('lobby off', function(){
		socket.vars.lobby_listening = false;
	});
	socket.on('refresh lobby', function(){
		if(!socket.vars.lobby_listening)return;
		var lbyAmt = 0;
		var active_users = Connections.Active();
		for(var i in active_users)
		{
			if(Connections.Socket(i))
			if(Connections.Socket(i).vars.lobby_listening)
				lbyAmt++;
		}
		socket.send({
			type:2,
			l:lbyAmt,
			a:Connections.Amount()
		});
	});

	socket.on('chat', function(__input_passkey, msg){
		if(socket.vars.in_game==null)return;
	});

	socket.on('log', function(msg){
		timestamp(socket.username+": "+msg);
	});


	socket.on('new user', function(username, password, email){
		if(socket.vars.online)return;
		db.users.find({username:username}, function(err, data){
			if(err){
				socket.send({type:8});
				return;
			}
			if(data.length==0){
				db.users.save({
					username:username,
					password:password,
					email:email,
					day_created:new Date(),
					last_login:new Date(),
					last_payment:null,
					member_tier:0,
					activity:0,
					level:1
				}, function(err, saved){
					if(err||!saved)socket.send({type:8});
					else{
						socket.send({type:9});
						timestamp("New user",saved.username,"added");
					}
				});
			}
			else socket.send({type:5});
		});
	});
	socket.on('connect user', function(username, password){
		if(socket.vars.online)return;
		db.users.find({username:username}, function(err, data){
			if(err||!data||data.length==0){
				socket.send({type:6});
			}else if(data.length==1){
				if(data[0].password!=password){
					socket.send({type:7});
					return;
				}
				var activeCons = Connections.Active();
				var rejoined = false;
				for(var i in activeCons){
					if(activeCons[i].username!=username)continue;
					if(!activeCons[i].vars.online){
						Connections.Reconnect(i, socket);
						rejoined = true;
						break;
					}else{
						timestamp("ERROR: user",username,"tried to join twice at once");
						socket.send({type:8});
						return;
					}
				}
				if(!rejoined){
					socket.index = Connections.Add(socket);
					socket.username = username;
					timestamp("user",username,"connected");
				}
				socket.send({
					type:20,
					index:socket.index
				});
				socket.vars.online = true;
				socket.broadcast.emit('user joined', socket.username);
			}else socket.send({type:8});
		});
	});
	socket.on('disconnect', function(){
		if(!socket.vars.online)return;
		socket.vars.online = false;
		// echo globally that this client has left
		socket.broadcast.emit('user left', socket.username);
		Connections.Disconnect(socket.index);
	});
	socket.on('userdata get', function(query){
		db.users.find({username:socket.username}, function(err, data){
			if(err){
				socket.send({type:500});
				return;
			}
			if(data.length==0){
				socket.send({type:500});
				return;
			}
			if(query=="day created")
			{	// dispay date account was created
				socket.send({type:504, day_created:data[0].day_created});
			}
			if(query=="last login")
			{	// dispay most recent date account was accessed
				socket.send({type:505, last_login:data[0].last_login});
			}
		});
	});
	socket.on('userdata add', function(query){
		db.users.find({username:socket.username}, function(err, data){
			if(err){
				socket.send({type:500});
				return;
			}
			if(data.length==0){
				socket.send({type:500});
				return;
			}
			if(query.type=="last login")
			{	// update last login date
				db.users.update({username:socket.username}, {$set:{
					last_login:new Date()
				}});
			}
		});
	});

	socket.on('print data', function(){
		timestamp("!** Request to print data by:", socket.username);
		if(socket.username!="storm")
			return;	// check for admin permission
		timestamp("Request permitted to:", socket.username);

		db.users.find({}, function(err, data){
			if(err||!data){
				timestamp("***Error printing user data.");
			}else{
				timestamp("***user data: ");
				data.forEach(function(cur){
					console.log("-->",cur.username);
					console.log(cur);
				});
			}
		});
		db.games.find({}, function(err, data){
			if(err||!data){
				timestamp("***Error printing game data.");
			}else{
				timestamp("***game data: ");
				data.forEach(function(cur){
					console.log(cur.username, cur.password);
				});
			}
		});
		console.log("Connections",Connections.Amount());
		for(var i=0;i<Connections.Length();i++)
		{
			if(Connections.Socket(i)!=null)
			{
				console.log(i, Connections.Socket(i).username, Connections.Socket(i).vars.in_game);
			}
			else console.log(i, null);
		}
		console.log("Lobby",Lobby.list.length);
		for(var i=0;i<Lobby.list.length;i++)
		{
			console.log(i, Lobby.list[i]);
		}
		timestamp("Print data done");
	});

	socket.on('check', function(){
		if(socket.vars.online)socket.send({type:0});
		else socket.send({type:4});
	});
});
