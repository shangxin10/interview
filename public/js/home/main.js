'use strict';

var PeerConnections = {};
var localStream ;
var personCount = 0;

var pc_config = {
    'iceServers': [{
      'url': 'stun:stun.l.google.com:19302'
    }]
};

var pc_constraints = {
    'optional': [{
      'DtlsSrtpKeyAgreement': true
    }]
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
    'mandatory': {
      'OfferToReceiveAudio':true,
      'OfferToReceiveVideo':true 
    }
};
 
var mediaConstraints = {
    video: true,
    audio: true
};

var socket = io.connect();

socket.on('created', function(room){
    console.log("created====>",room);
});

socket.on('join', function (socketId){
    console.log('join socket ' + socketId);
    //判断PeerConnection是否存在
    if(!PeerConnections[socketId]){
        //创建PeerConnection
        PeerConnections[socketId] = {
            pc: null,
            remoteStream: null,
            isStarted: false,
            isInitiator: false,
            isChannelReady: false
        };
        PeerConnections[socketId].isInitiator = true;
        PeerConnections[socketId].isChannelReady = true;
    }
});

socket.on('joined', function (socketId){
    console.log("joined====>",socketId);
    if(!PeerConnections[socketId]){
        PeerConnections[socketId] = {
            pc: null,
            remoteStream: null,
            isStarted: false,
            isInitiator: false,
            isChannelReady: false
        };
        PeerConnections[socketId].isChannelReady = true;
    }
});

socket.on('log', function (array){
  console.log.apply(console, array);
});

////////////////////////////////////////////////

function sendMessage(message, socketId){
	// console.log('Client sending message: ', message, socketId);
  // if (typeof message === 'object') {
  //   message = JSON.stringify(message);
  // }
  socket.emit('message', message, socketId);
}

socket.on('message', function (message, socketId){
    if(!PeerConnections[socketId]){
        console.log("filter message from ", socketId);
        return;
    }
    if(message === 'got user media'){
        maybeStart(socketId);
    }else if (message.type === 'offer') {
        //初始化PeerConnection
        if(!PeerConnections[socketId].isInitiator){
            maybeStart(socketId);  
        }
        PeerConnections[socketId].pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer(PeerConnections[socketId], socketId);
    } else if (message.type === 'answer' && PeerConnections[socketId].isStarted) {
        
        PeerConnections[socketId].pc.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === 'candidate' && PeerConnections[socketId].isStarted) {
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: message.label,
          candidate: message.candidate
        });
        PeerConnections[socketId].pc.addIceCandidate(candidate);
    } else if (message === 'bye') {
        PeerConnections[socketId].pc.close();
        delete PeerConnections[socketId];
        handleRemoteHangup(socketId);
    }
});
function maybeStart(socketId){
    //初始化PeerConnection
    if(typeof localStream != 'undefined'){
        createPeerConnection(PeerConnections[socketId], socketId);
        PeerConnections[socketId].pc.addStream(localStream);
        PeerConnections[socketId].isStarted = true;
        if(PeerConnections[socketId].isInitiator){
            //创建offer流
            doCall(PeerConnections[socketId], socketId);
        }
    }
}
////////////////////////////////////////////////////
// var localVideo = document.getElementById('localVideo');
// var remoteVideo = document.getElementById('remoteVideo');
// var miniVideo = document.getElementById('miniVideo');
var localVideo = $('#localVideo');
var remoteVideo = $('#remoteVideo');
var createButton = $('#create-button');
var joinButton = $("#join-button");
var miniVideo = $('#miniVideo');
var enterButton = $(".enter");

createButton.click(function(event){
    var roomNum = $("input[name=roomNum]").val();
    var roomPwd = $("input[name=roomPwd]").val();
    var roomCreateor = $(this).attr('data-id');
    var roomType = $("select[name=roomType]").val();
    var roomName = $("input[name=roomName]").val();
    var interviewer = $("input[name=interviewer]").val();
    var phone = $("input[name=phone]").val();
    var email = $("input[name=email]").val();
    var startDate = $("input[name=startDate]").val();
    var endDate = $("input[name=endDate]").val();
    var room = {
        roomNum: roomNum,
        roomPwd: roomPwd,
        roomType: roomType,
        roomName: roomName,
        interviewer: interviewer,
        phone: phone,
        email: email,
        startDate: startDate,
        endDate: endDate,
        roomCreateor: roomCreateor
    }

    console.log("room",room)
    if(!roomNum || !roomPwd || !roomType 
        || !roomName || !interviewer || !phone
        || !email || !startDate || !endDate || !roomCreateor){
            alert("请填写完整信息");
            return;
        }
    $.ajax({
        url: '/home/user/room/create',
        type: 'post',
        data: room,
        success: function(res){
            if(res.errcode == 0){
                console.log('Create or join room', roomNum);
                socket.emit('create or join', roomNum);
                //获取摄像头
                getUserMedia(mediaConstraints, handleUserMedia, handleUserMediaError);
                //显示localVideo
                showLocalVideo();
                //显示底部
                showFooter(roomNum, roomName, roomType);
                //显示图标
                showIcons();
                //隐藏
                hiddenRoomSelection();
                //隐藏头部
                hiddenHeader();
            }else{
              alert(res.errmsg);
            }
          }
      })
})
joinButton.click(function(event){
    var roomNum = $("input[name=roomNum]").val();
    var roomPwd = $("input[name=roomPwd]").val();
    var roomCreateor = $(this).attr('data-id');
    var room = {
        roomNum: roomNum,
        roomPwd: roomPwd,
        roomCreateor: roomCreateor
    }
    $.ajax({
        url: '/home/user/room/join',
        type: 'post',
        data: room,
        success: function(res){
            if(res.errcode == 0){
                console.log('Create or join room', roomNum);
                socket.emit('create or join', roomNum);
                //获取摄像头
                getUserMedia(mediaConstraints, handleUserMedia, handleUserMediaError);
                //显示localVideo
                showLocalVideo();
                //显示底部
                showFooter(roomNum, res.data.name, res.data.type);
                //显示图标
                showIcons();
                //隐藏
                hiddenRoomSelection();
                //隐藏头部
                hiddenHeader();
            }else{
              alert(res.errmsg);
            }
        }
      })
})

enterButton.click(function(){
    var roomNum = $(this).parent().siblings('.roomNum').text();
    var roomName = $(this).parent().siblings('.roomName').text();
    var roomType = $(this).parent().siblings('.roomType').text();
    console.log('Create or join room', roomNum);
    socket.emit('create or join', roomNum);
    //获取摄像头
    getUserMedia(mediaConstraints, handleUserMedia, handleUserMediaError);
    //显示localVideo
    showLocalVideo();
    //显示图标
    showIcons();
    //显示底部
    showFooter(roomNum,roomName,roomType);
    //隐藏头部
    hiddenHeader();

})

function showLocalVideo(){
    localVideo.addClass("active");
    miniVideo.removeClass("active");
    remoteVideo.attr("src","");
    miniVideo.attr('src','');
}
function showIcons(){
    $("#icons").attr('class','active');
}

function showFooter(num, name, type){
    $("#room-num").text(num)
    $("#room-name").text(name);
    $("#sharing-div").attr('class','active');
}

function hiddenRoomSelection(){
    $("#room-selection").attr("class",'hidden');
}

function hiddenIcons(){
    $("#icons").attr('class','hidden');
}
function hiddenHeader(){
    $(".header").attr("class","hidden");
}
function showRemoteVideo(socketId){
    miniVideo.addClass("active");
    remoteVideo.addClass("active");
    remoteVideo.attr("data-id",socketId)
    localVideo.removeClass("active");
}

function showThirdVideo(socketId){
    remoteVideo.css("width","50%");
    remoteVideo.css("object-fit","inherit");
    localVideo.css("width","50%");
    localVideo.css("float","right");
    localVideo.addClass("active");
    localVideo.css("object-fit","inherit");
    localVideo.attr("data-id",socketId);
}
function handleUserMedia(stream) {
    console.log('Adding local stream.');
    localVideo.attr('src',window.URL.createObjectURL(stream));
    localStream = stream;
    sendMessage('got user media')
}

function handleUserMediaError(error){
    console.log('getUserMedia error: ', error);
}






window.onbeforeunload = function(e){
	sendMessage('bye');
    console.log();
}

/////////////////////////////////////////////////////////

function createPeerConnection(peerConnection, socketId) {
    try {
        peerConnection.pc = new RTCPeerConnection(pc_config);
        
        peerConnection.pc.onicecandidate = function(event){
            // console.log('handleIceCandidate event: ', event);
            if (event.candidate) {
              sendMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate}, socketId);
            } else {
              console.log('End of candidates.');
            }
        }


        peerConnection.pc.onaddstream = function(event){
            console.log('Remote stream added.');
            personCount ++;

            if(personCount == 1){
                console.log("first");
                remoteVideo.attr('src',window.URL.createObjectURL(event.stream));
                peerConnection.remoteStream = event.stream;
                miniVideo.attr('src', window.URL.createObjectURL(localStream));
                //设置另一端video
                showRemoteVideo(socketId);
            }else if(personCount == 2){
                console.log("second");
                localVideo.attr('src',window.URL.createObjectURL(event.stream));
                peerConnection.remoteStream = event.stream;
                showThirdVideo(socketId);
            }
                
        };
    
        

        peerConnection.pc.onremovestream = handleRemoteStreamRemoved;
        
        peerConnection.isStarted = true;
        
        
        console.log('Created RTCPeerConnnection');
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object.');
        return;
    }
    
}


function doCall(peerConnection, socketId) {
    console.log('Sending offer to peer');
    peerConnection.pc.createOffer(function(sessionDescription){
        sessionDescription.sdp = preferOpus(sessionDescription.sdp);
        peerConnection.pc.setLocalDescription(sessionDescription);
        console.log('setLocalAndSendMessage sending message' , sessionDescription);
        sendMessage(sessionDescription, socketId);
    },handleCreateOfferError);
}

function doAnswer(peerConnection, socketId) {
    console.log('Sending answer to peer.');
    peerConnection.pc.createAnswer(function(sessionDescription){
        sessionDescription.sdp = preferOpus(sessionDescription.sdp);
        peerConnection.pc.setLocalDescription(sessionDescription);
        console.log('setLocalAndSendMessage sending message' , sessionDescription);
        sendMessage(sessionDescription, socketId);
    }, handleCreateAnswerError);
}

function handleCreateOfferError(event){
    console.log('createOffer() error: ', e);
}

function handleCreateAnswerError(event){
    console.log('createAnswer() error:', e);
}

function requestTurn(turn_url) {
    var turnExists = false;
    for (var i in pc_config.iceServers) {
        if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
        turnExists = true;
        turnReady = true;
        break;
        }
    }
    if (!turnExists) {
        // console.log('Getting TURN server from ', turn_url);
        // No TURN server. Get one from computeengineondemand.appspot.com:
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200) {
            var turnServer = JSON.parse(xhr.responseText);
            // console.log('Got TURN server: ', turnServer);
            pc_config.iceServers.push({
            'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
            'credential': turnServer.password
            });
            turnReady = true;
        }
        };
        xhr.open('GET', turn_url, true);
        xhr.send();
    }
}

function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
}

$("#hangup").click(function(){
    console.log('Hanging up.');
    sendMessage('bye');
    window.location.reload();
}) 
    
function handleRemoteHangup(socketId) {
    var videos = $("#videos").children('.bigVideo');
    --personCount;
    console.log("personCount",personCount)
    if(personCount == 1){
       videos.each(function(){
           $(this).css("object-fit",'cover');
            if(socketId == $(this).attr("data-id")){
                $(this).removeClass('active');
            }else{
                $(this).css('width','100%')
            }
        })
    }else if(personCount == 0){
        localVideo.attr("src", miniVideo.attr('src'));
        localVideo.css('width','100%');
        localVideo.addClass('active');
        remoteVideo.removeClass('active');
        miniVideo.removeClass('active');
    }
}


///////////////////////////////////////////

// Set Opus as the default audio codec if it's present.
function preferOpus(sdp) {
    var sdpLines = sdp.split('\r\n');
    var mLineIndex;
    // Search for m line.
    for (var i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].search('m=audio') !== -1) {
            mLineIndex = i;
            break;
        }
    }
    if (mLineIndex === null) {
        return sdp;
    }

    // If Opus is available, set it as the default in m line.
    for (i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].search('opus/48000') !== -1) {
        var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
        if (opusPayload) {
            sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
        }
        break;
        }
    }

    // Remove CN in m line and sdp.
    sdpLines = removeCN(sdpLines, mLineIndex);

    sdp = sdpLines.join('\r\n');
    return sdp;
}

function extractSdp(sdpLine, pattern) {
    var result = sdpLine.match(pattern);
    return result && result.length === 2 ? result[1] : null;
}

// Set the selected codec to the first in m line.
function setDefaultCodec(mLine, payload) {
    var elements = mLine.split(' ');
    var newLine = [];
    var index = 0;
    for (var i = 0; i < elements.length; i++) {
        if (index === 3) { // Format of media starts from the fourth.
        newLine[index++] = payload; // Put target payload to the first.
        }
        if (elements[i] !== payload) {
        newLine[index++] = elements[i];
        }
    }
    return newLine.join(' ');
}

// Strip CN from sdp before CN constraints is ready.
function removeCN(sdpLines, mLineIndex) {
    var mLineElements = sdpLines[mLineIndex].split(' ');
// Scan from end for the convenience of removing an item.
    for (var i = sdpLines.length-1; i >= 0; i--) {
            var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
            if (payload) {
            var cnPos = mLineElements.indexOf(payload);
            if (cnPos !== -1) {
                // Remove CN payload from m line.
                mLineElements.splice(cnPos, 1);
            }
            // Remove CN line in sdp
            sdpLines.splice(i, 1);
            }
    }

    sdpLines[mLineIndex] = mLineElements.join(' ');
    return sdpLines;
}