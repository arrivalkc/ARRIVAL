
var parentFrame = window.parent.document.getElementById('pageFrame');

var online = false;
var socket;
window.onload = function(){
	if(window.parent)socket = window.parent.socket;
	if(socket)online = true;

	document.getElementById('connetion-welcome-text').innerHTML = "Welcome to Arrival, " + socket.username + ".<br />You have pre-enrolled.";

	socket.emit('userdata get', "day created");
	socket.emit('userdata get', "last login");

	if(window.parent.mobilecheck())
	{
		// for display
	}

	document.getElementById('overlay').style.display = 'none';
};

function Report_Created(__date) {
	__date = new Date(Date.parse(__date));
	document.getElementById('connetion-date-created').innerHTML = "Account created: " + __date.toDateString();
}
function Report_Last_Login(__date) {
	__date = new Date(Date.parse(__date));
	document.getElementById('connetion-date-last-login').innerHTML = "Most recent login: " + __date.toDateString();
}
