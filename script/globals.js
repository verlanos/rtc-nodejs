//GLOBALS

var username;
var session;
var localstream;
var remotestream;
var p_chan;
var s_chan;
var destination;
var started = false;
var initiator = false;

var sdpConstraints = {'mandatory': {
    'OfferToReceiveAudio': true,
    'OfferToReceiveVideo': true }};

var configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

var optional_servers = {
    iceServers:
    [
        { url: "stun1.l.google.com:19302"},
        { url: "stun2.l.google.com:19302"},
        { url: "stun3.l.google.com:19302"},
        { url: "stun4.l.google.com:19302"},
        { url: "stun01.sipphone.com"},
        { url: "stun.ekiga.net"},
        { url: "stun.fwdnet.net"},
        { url: "stun.ideasip.com"},
        { url: "stun.iptel.org"},
        { url: "stun.rixtelecom.se"},
        { url: "stun.schlund.de"},
        { url: "stunserver.org"},
        { url: "stun.softjoys.com"},
        { url: "stun.voiparound.com"},
        { url: "stun.voipbuster.com"},
        { url: "stun.voipstunt.com"},
        { url: "stun.voxgratia.org"},
        { url: "stun.xten.com"}
    ]
};

var options = {
    optional: [
        {DtlsSrtpKeyAgreement: true},
        {RtpDataChannels: true}
    ]
};

var mediaConstraints = {"mandatory":{},"optional":[]};

var audio_video = {'audio':true,'video':mediaConstraints};

var localVideo;
var remoteVideo;
var videoTracks;

function isDefined(x) {
    var undefined;
    return x !== undefined;
}