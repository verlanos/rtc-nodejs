var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(8080);
console.log("Listening on 8080");

app.use("/style",express.static(__dirname + "/style"));
app.use("/script",express.static(__dirname + "/script"));
app.use("/resources",express.static(__dirname + "/resources"));

app.get('/', function(req,res){
    console.log("Sending index.html");
	res.sendfile(__dirname + '/index.html');
});

var clients = new Array();
var sessions = new Array();

var nextId = 0;

io.sockets.on('connection',function(socket)
{
    var session = new Object;
    var client = new Object;

	socket.emit('welcome',{greeting: "Welcome to RASPVDO"});

	socket.on('join',function(data)
	{
		console.log(data.username);

		var msgToSend = data.username+" has joined the chat.";

		session.username = data.username;
		session.socket = socket;
		session.id = nextId++;


        client.username = data.username;
        client.id = session.id;

        var now = new Date();
        var time = generateTimeStamp(now);
        socket.broadcast.emit("announce",{message: msgToSend, timestamp: time});
        socket.emit("createSession",{session_id: session.id});

        socket.broadcast.emit("update",{event: "connect", username: data.username, id: session.id});
        socket.emit("update",{event: "connected",list: clients});

        clients.push(client);
        sessions.push(session);
	});

	socket.on('chat',function(data)
	{
        var now = new Date();
        var time = generateTimeStamp(now);

        socket.broadcast.emit('chat',{username: data.username, message: data.message, timestamp: time});
		console.log(data.message);
	});

    socket.on('ice_candidate',function(data)
    {
        var dest = data.destination;

        for (var i = 0; i<sessions.length; i++)
        {
            if(sessions[i].username == dest)
            {
                sessions[i].socket.emit('ice_candidate',data);
            }
        }
    });

    socket.on('call',function(data)
    {
        var dest = data.destination;

        for (var i = 0; i<sessions.length; i++)
        {
            if(sessions[i].username == dest)
            {
                sessions[i].socket.emit('call',data);
            }
        }
    });

    socket.on('answer',function(data)
    {
        var dest = data.destination;

        for (var i = 0; i<sessions.length; i++)
        {
            if(sessions[i].username == dest)
            {
                sessions[i].socket.emit('answer',data);
            }
        }
    });

    socket.on("disconnect",function()
    {
        if(client)
        {
            for(var i = clients.length-1; i >= 0; i--){
                if(clients[i].id == client.id){
                    clients.splice(i,1);
                }
            }
        }

        if(session)
        {
            for(var i = sessions.length-1; i>= 0; i--)
            {
                if(sessions[i].id == session.id)
                {
                    sessions.splice(i,1);
                }
            }
        }

        var msgToSend = client.username+" has left the chat.";

        var now = new Date();
        var time = generateTimeStamp(now);

        socket.broadcast.emit("update",{event: "disconnect", username: client.username, id: client.id});
        socket.broadcast.emit("announce",{message: msgToSend, timestamp: time});
    });

});

function generateTimeStamp(date)
{
    var str = date.getUTCMonth()+'/'+(date.getUTCDate()+1)+'/'+date.getUTCFullYear()+'-'+date.getUTCHours()+':'+date.getUTCMinutes()+':'+date.getUTCSeconds();
    return str;
}