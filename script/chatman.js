/*
    SOCKET.IO CallBacks
 */
var intro = function(data){
    s_chan.emit('join',{username: window.username});
};

var chatOut = function(event){
    var text = getText();
    s_chan.emit("chat",{message: text,username: window.username});
    printChatMessage("You",text);
};

var chatOutEnter = function(event){
    if(event.which == 13)
    {
        var text = getText();
       s_chan.emit("chat",{message: text,username: window.username});
        printChatMessage("You",text);
    }
};

var updateClientList = function(data){
    if(data.event == "connect")
    {
        addParticipant(data.id,data.username);
    }

    if(data.event == "disconnect")
    {
        removeParticipant(data.id);
    }

    if(data.event == "connected")
    {
        for (var per = 0; per<data.list.length; per++)
        {
            var current = data.list[per];
            addParticipant(current.id,current.username);
        }
    }
};

var handleAnnouncement = function(data){
    printAnnouncement(data.message);
};

var chatIn = function(data){
    printChatMessage(data.username,data.message);
};

var handleLogin = function(event){
    window.username = $("#username").val();
    hideLogin();
    initConnection();
    createChatUI();

    $("#chatEntry").keypress(chatOutEnter);
};

var handleLoginEnter = function(event){
    if(event.which == 13)
    {
        window.username = $("#username").val();
        hideLogin();
        initConnection();
        createChatUI();
        $("#chatEntry").keypress(chatOutEnter);
    }
};

/*
    WebRTC CallBacks
 */

var handleCall = function(data){

    if(!started)
    {
        console.log("ERROR: Cannot accept call CAUSE: No P2P channel");
        return;
    }

    destination = data.source;
    var rtc_data = data.content;
    var type = rtc_data.type;

    if(type === 'offer'){
        p_chan.setRemoteDescription(new RTCSessionDescription(rtc_data));
        createAnswer();
    }

};

var handleAnswer = function(data){

    if(!started)
    {
        console.log("ERROR: Cannot handle answer CAUSE: No P2P channel");
        return;
    }

    destination = data.source;
    var rtc_data = data.content;
    var type = rtc_data.type;

    if(type === 'answer'){
        p_chan.setRemoteDescription(new RTCSessionDescription(rtc_data));
    }
};

var handleICE = function(data){

    if(!started)
    {
        console.log("ERROR: Cannot use ICE candidate CAUSE: No P2P channel");
        return;
    }

    destination = data.source;
    var rtc_data = data.content;
    var type = rtc_data.type;
    var candidate = new RTCIceCandidate({sdpMLineIndex:rtc_data.label,
                                         candidate:rtc_data.candidate});

    if(type === 'candidate'){
        p_chan.addIceCandidate(candidate);
    }
};

function createAnswer(){

    if(!started){
        console.log("ERROR: Cannot answer call CAUSE: No P2P Channel");
        return;
    }

    console.log("Creating answer");
    p_chan.createAnswer(setLocalAndSendMessage_answer,null,sdpConstraints);
}

// Helper functions used with pc.createOffer and pc.createAnswer
function setLocalAndSendMessage_call(sessionDescription){

    if(!p_chan)
    {
        console.log("ERROR: Cannot set local description. CAUSE: No P2P Channel");
        return;
    }

    p_chan.setLocalDescription(sessionDescription);
    s_chan.emit("call",{source:username,destination:destination,content:sessionDescription});
    // TODO Send sessionDescription to 'destination'
    console.log("Sent Local Session Description to Destination");
}

function setLocalAndSendMessage_answer(sessionDescription){

    if(!p_chan)
    {
        console.log("ERROR: Cannot set local description. CAUSE: No P2P Channel");
        return;
    }

    p_chan.setLocalDescription(sessionDescription);
    s_chan.emit("answer",{source:username,destination:destination,content:sessionDescription});
    // TODO Send sessionDescription to 'destination'
    console.log("Sent Local Session Description to Destination");
}

function startRTC(){

    if(!started && !p_chan && localstream)
    {
        startP2PChannel();
        console.log("Adding local stream");
        p_chan.addStream(localstream);
        started = true;
    }
}

function startP2PChannel(){

    console.log("Creating P2P channels");

    try{
        console.log("About to create P2P channels");
        p_chan = new RTCPeerConnection(configuration);
        console.log("Created P2P Channel");
    } catch(e) {
        console.log("Failed to create P2P Channel");
        return;
    }

    p_chan.onicecandidate = onIceCandidate;
    p_chan.onconnecting = onSessionConnecting;
    p_chan.onopen = onSessionOpened;
    p_chan.onaddstream = onRemoteStreamAdded;
    p_chan.onremovestream = onRemoteStreamRemoved;
}

function onIceCandidate(event){

    if(event.candidate){
        // TODO Send ICE candidate information to destination
        s_chan.emit('ice_candidate',{source:username,
                                     destination:destination,
                                     content:
                                     {label:event.candidate.sdpMLineIndex,
                                      id:event.candidate.sdpMid,
                                      candidate:event.candidate.candidate}
                                    });
    }
    else{
        console.log('End of candidates');
    }
}

function onRemoteStreamAdded(event){

    console.log("Remote stream added");
    // TODO reattachMediaStream(minilocalVideoElement,LocalVideoElement);
    attachMediaStream(remoteVideo,event.stream);
    remotestream = event.stream;
    remoteVideo.play();
    waitForRemoteVideo();
}

function onRemoteStreamRemoved(event){

    console.log('Remote stream added');
}

function onSessionConnecting(event)
{
    console.log("Session connecting");
}

function onSessionOpened(event)
{
    console.log("Session opened");
}

function waitForRemoteVideo(){

    videoTracks = remotestream.getVideoTracks();
    if(videoTracks.length === 0 || remoteVideo.currentTime > 0){

    } else {
        setTimeout(waitForRemoteVideo, 100);
    }
}

function getMediaAccess(){

    try{
        getUserMedia(audio_video,onUserMediaSuccess,onUserMediaError);
        console.log("Requested access to User Media");
    } catch(e){
        console.log("getUserMedia failed with exception: "+ e.message);
    }
}

function onUserMediaSuccess(stream){

    console.log("User media access has been granted");
    attachMediaStream(localVideo,stream);
    localstream = stream;
    startRTC();
}

function onUserMediaError(error){

    console.log("Failed to get access to user media");
}

function makeCall(){

    console.log("Making call");
    p_chan.createOffer(setLocalAndSendMessage_call,null,sdpConstraints);
}

/*
    COMMON Functions
 */
function initConnection(){

    if(!s_chan)
    {
        s_chan = io.connect('http://localhost:8080');

        s_chan.on("welcome",intro);
        s_chan.on("announce",handleAnnouncement);
        s_chan.on("chat",chatIn);
        s_chan.on("update",updateClientList);
        s_chan.on("call",handleCall);
        s_chan.on("answer",handleAnswer);
        s_chan.on("ice",handleICE);
    }
}



/*
 MAIN
 */

$( document ).ready(function() {

    $("#username").keypress(handleLoginEnter);
    $("#submit").click(handleLogin);

    $("#chatSubmit").click(chatOut);
});