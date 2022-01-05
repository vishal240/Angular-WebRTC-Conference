import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
declare var RTCMultiConnection: any;
declare var getHTMLMediaElement: any;
declare var detectcamera: any;
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit{
  roomid: any;
  constructor(public route: ActivatedRoute) {
  }
  connection: any;
  ngOnInit(): void {
    this.webrtc();
  }
  ngAfterViewInit(): void {
    this.join('123456');
  }
  join(roomid: any) {
    var predefinedRoomId = roomid;
    this.connection.checkPresence(predefinedRoomId, (isRoomExist: any, roomid: any, error: any) => {
      if (isRoomExist === true) {
          this.connection.join(roomid);
          this.connection.extra.fullName = 'Remote';
      } else {
          this.connection.open(roomid);
          this.connection.extra.fullName = 'Local';
      }
    });
  }
  stop() {
    this.connection.getAllParticipants().forEach((pid: any): any => {
      this.connection.disconnectWith(pid);
    });
    this.connection.attachStreams.forEach((localStream: any): any => {
        localStream.stop();
    });
    this.connection.closeSocket();
  }
  chattext(e: any) {
    if (e.keyCode != 13) return;
    this.connection.send(e.target.value);
  }
  webrtc() {
    this.connection = new RTCMultiConnection();
    this.connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
    this.connection.enableLogs = false;
    this.connection.videosContainer = document.getElementById('videos-container');
    this.connection.session = {
      audio: true,
      video: true,
      data: true
    };
    this.connection.enableFileSharing = true;
    this.connection.onMediaError = (error: any) => {
      console.log('error', error);
      console.log('error', JSON.stringify(error));
    };
    this.connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true
    };
    this.connection.onmessage = this.appendDIV;
    this.connection.onstream = (event: any): any => {
      var video = document.createElement('video');
      video.setAttributeNode(document.createAttribute('autoplay'));
      video.setAttributeNode(document.createAttribute('playsinline'));
      if(event.type === 'local') {
        video.volume = 0;
        video.setAttributeNode(document.createAttribute('muted'));
      }
      event.mediaElement.muted = true;
      event.mediaElement.volume = 0;
      video.srcObject = event.stream;
      var mediaElement = getHTMLMediaElement(video, {
        title: event.extra.fullName,
        buttons: ['full-screen'],
        width: 300,
        showOnMouseEnter: false
      });
      this.connection.videosContainer.appendChild(mediaElement);
      mediaElement.id = event.streamid;
    };
    this.connection.onleave = (event: any): any => {
      var remoteUserId = event.userid;
    };
    this.connection.onstreamended = (event: any): any => {
      var mediaElement = document.getElementById(event.streamid);
      if (mediaElement) {
          mediaElement.parentNode!.removeChild(mediaElement);
      }
  };
  }
  appendDIV(e: any) {
    console.log(e);
  }
}
