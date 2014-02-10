function onRemoteStreamAdded(event)
{
    console.log("Remote stream added");

    var remote = document.getElementById("remoteFrame");

    attachMediaStream(remote,event.stream);
    setGlobal("remotestream",event.stream);
    waitForRemoteVideo();
}

function onRemoteStreamRemoved(event)
{
    console.log("Remote stream removed");
}

function waitForRemoteVideo()
{
    var remote = document.getElementById("remoteFrame");
    console.log("Remote stream: "+isDefined(getGlobal("remotestream")));
    console.log("Remote stream: "+JSON.stringify(getGlobal("remotestream")));
    if(remote.currentTime > 0 || getGlobal("remotestream").videoTracks.length === 0)
    {
        console.log("Remote stream arrived");
    }
    else
    {
        console.log("Remote stream hasn't arrived yet");
        setTimeout(waitForRemoteVideo,100);
    }
}

function canStart()
{
    console.log("Initiating components of "+getGlobal("username"));
    console.log("Started: "+getGlobal("started"));
    console.log("Local stream status: "+getGlobal("localstream"));

    console.log("P2P channel status: "+isDefined(getGlobal("peerconn")));

    if(!getGlobal("started") && getGlobal("localstream"))
    {
        console.log("Initiating "+getGlobal("username")+"'s P2P channel");
        initP2PChannel();
        console.log("P2P channel status: "+isDefined(getGlobal("peerconn")));

        console.log("Adding "+getGlobal("username")+"'s local stream to P2P channel");
        getGlobal("peerconn").addStream(getGlobal("localstream"));
        console.log("P2P channel status: "+isDefined(getGlobal("peerconn")));
        setGlobal("started",true);

        if(getGlobal("initiator"))
        {
            console.log("Making a call to: "+getGlobal("destination"));
            makeCall();
            console.log("End of making a call");
        }
    }
}

function subscribeToUserMedia()
{
    var constraints = {"mandatory":{},"optional":[]};

    try{
        getUserMedia({'audio':true,'video':constraints},onSubscribeSuccess,onSubscribeFailure);
        console.log("Getting user media");
    }
    catch(e)
    {
        console.log("Getting user media failed");
    }
}
/*  OBSOLETE ITEMS FOLLOW */

window.URL = (window.URL || window.webkitURL || window.mozURL || window.msURL);

function error(e)
{
    if (typeof e == typeof {})
    {
        alert("Oh no! "+ JSON.stringify(e));
    }
    else
    {
        alert("Oh no! "+ e)
    }
}


