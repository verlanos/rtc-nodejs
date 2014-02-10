var pc;
var configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

// Hide Login box when Enter button is clicked
function hideLogin()
{
    $("#login").hide("slow");
}

function createChatUI()
{
    var header = $("<h1>Hi "+username.trim()+"</h1>");

    // Create container for chatlog, entryfield and submit button
    var chatContainer = $("<div/>",{id: "chatContainer",class: "chat_room_items"});
    var chatLog = $("<textarea/>",{id: "chatLog", width: "400px", height: "400px", readonly: true, wrap: "hard"});
    var chatEntry = $("<input/>",{id: "chatEntry", type: "text", autofocus: true, width: "400px"});
    var chatSubmit = $("<button/>",{id: "chatSubmit", type: "button", html:"Enter"});

    var shelf = $("<ul/>",{class: "nolist"}).append($("<li/>").append(chatLog)).append($("<li/>").append(chatEntry,chatSubmit));
    chatContainer.append(shelf);


    // Create container showing active participants of the chatroom
    var participantContainer = $("<div/>",{id: "participantContainer", class: "chat_room_items"});
    var participantList = $("<ul/>",{id: "participantList", class: "nolist"});

    participantContainer.append(participantList);


    var videoCallWindow = $("<div/>",{id: "videoCallWindow", class:"video_items"});
    var selfView = $("<button/>",{id: "selfView", type: "button", html: "Self View", class: "centered_button"});

    videoCallWindow.append(selfView);


    var chatRoomContainer = $("<div/>",{id: "chatRoomContainer", class: ""});
    chatRoomContainer.append(chatContainer);
    chatRoomContainer.append(participantContainer);
    chatRoomContainer.append(videoCallWindow);



    $("body").append(header);
    $("body").append($("<hr>"));
    $("body").append(chatRoomContainer);

    $("#selfView").click(showSelfView);

    addVideoCallElements();
    getMediaAccess();
}

var showSelfView = function(event)
{
    $("#selfView").hide("slow");
    var videoElement = $("<video/>",{id: "videoFrame", controls: "true"});
    $("#videoCallWindow").append(videoElement);

    var elem = document.getElementById("videoFrame");

    getUserMedia({video:true,audio:true}, function(stream){
      attachMediaStream(elem,stream);
    });
    elem.play();
};

function addVideoCallElements()
{
    $("#selfView").hide("slow");
    var local_video_element = $("<video/>",{id: "videoFrame", controls: "true"});
    $("#videoCallWindow").append(local_video_element);

    var remote_video_element = $("<video/>",{id:"remoteFrame",controls:"true"});
    $('#videoCallWindow').append(remote_video_element);

    localVideo = document.getElementById("videoFrame");
    remoteVideo = document.getElementById("remoteFrame");
}

/*
    Get Textfield contents & clear it
 */
function getText()
{
    var entryField = $("#chatEntry");
    var entry = entryField.val();
    entryField.val("");
    return entry;
}

/*
    Update Chat Log
 */
function updateLog(text)
{
    var chatBox = $("#chatLog");
    chatBox.append(text+"\n");
}

/*
    Print Announcement
 */
function printAnnouncement(text)
{
    updateLog("ANNOUNCEMENT: "+text);
}

/*
    Print Chat Messages
 */
function printChatMessage(username,text)
{
    updateLog('&lt;'+username+'&gt; '+text);
}

/*
    Add Participant
 */
function addParticipant(id,uname)
{
    var list = $("#participantList");
    var button = $("<button/>",{id: "client"+id, html: uname});
    var item = $("<li/>",{id: "client_"+id}).append(button);

    list.append(item);

    $('#client'+id).click(function()
    {
       alert("You are calling "+uname);
       destination = uname;
       makeCall();
    });
}

/*
    Remove Participant
 */
function removeParticipant(id)
{
    var list = $("#participantList");
    $("#client_"+id).remove();
}

