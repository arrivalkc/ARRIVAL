document.getElementById('inputMessage').onkeypress = function(event){
	if(event.keyCode==13&&this.value!='')
	{
		window.parent.game.INTERFACE.Game.Send_Chat(this.value);
		this.value = "";
	}
};

window.onload = function(){
	document.getElementById('inputMessage').focus()
	window.parent.refreshChatList();
};

var chatters = [];
var nameList = document.getElementById('connectInfo');
var chat = document.getElementById('chat');

function addPlayer(name, socket)
{
	var nameNode = document.createElement('div');
	nameNode.innerHTML = name;
	nameNode.setAttribute('class','namelist');
	nameList.appendChild(nameNode);
	chatters.push([name, socket, nameNode]);
}
function delPlayer(socket)
{
	for(var i in chatters)
	{
		if(chatters[i][1]==socket)
		{
			nameList.removeChild(chatters[i][2]);
			chatters.splice(i, 1);
			break;
		}
	}
}

function add_msg(sender, text)
{
	var name = null;
	for(var i in chatters)
	{
		if(chatters[i][1]==sender)
		{
			name = chatters[i][0];
			break;
		}
	}
	if(name==null)return;
	var msg_node = document.createElement('div'),
		txt_node = document.createElement('div'),
		name_node = document.createElement('div');
	name_node.innerHTML = name;
	txt_node.innerHTML = ': '+text;
	msg_node.setAttribute('class','messageContainer');
	name_node.setAttribute('class','username');
	txt_node.setAttribute('class','msgContent');
	msg_node.appendChild(name_node);
	msg_node.appendChild(txt_node);
	chat.appendChild(msg_node);
}
