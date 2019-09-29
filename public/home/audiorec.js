// This example uses MediaRecorder to record from a live audio stream,
// and uses the resulting blob as a source for an audio element.
//
// The relevant functions in use are:
//
// navigator.mediaDevices.getUserMedia -> to get audio stream from microphone
// MediaRecorder (constructor) -> create MediaRecorder instance for a stream
// MediaRecorder.ondataavailable -> event to listen to when the recording is ready
// MediaRecorder.start -> start recording
// MediaRecorder.stop -> stop recording (this will generate a blob of data)
// URL.createObjectURL -> to create a URL from a blob, which we can use as audio src

var recordButton, stopButton, recorder;

window.onload = function () {
  recordButton = document.getElementById('record');
  stopButton = document.getElementById('stop');

  // get audio stream from user's mic
  navigator.mediaDevices.getUserMedia({
    audio: true
  })
  .then(function (stream) {
    recordButton.disabled = false;
    recordButton.addEventListener('click', startRecording);
    stopButton.addEventListener('click', stopRecording);
    var options = {
      audioBitsPerSecond : 16000,
      // mimeType : 'audio/ogg'
      mimeType: 'audio/webm'
    }
    recorder = new MediaRecorder(stream, options);
    recorder.addEventListener('dataavailable', onRecordingReady);
  });
};

function startRecording() {
  recordButton.disabled = true;
  stopButton.disabled = false;
  recorder.start();
}

function stopRecording() {
  recordButton.disabled = false;
  stopButton.disabled = true;

  // Triggers the `dataavailable` event
  recorder.stop();
}

function onRecordingReady(e) {
  var audio = document.getElementById('audio');
  // e.data contains a blob representing the recording
  const blob = e.data
  const uid = "UUIDTEST"; //(new Date().getTime()).toString(36);
  const filename = "" + uid + ".webm"
  audio.src = URL.createObjectURL(blob, filename);
  audio.play();
  sendaudio(blob, filename)
}

function sendaudio(blob, filename) {
  var xhr=new XMLHttpRequest();
  xhr.onload=function(e) {
      if(this.readyState === 4) {
          console.log("Server returned: ",e.target.responseText);
      }
  };
  var fd=new FormData();
  fd.append("audio_data",blob, filename);
  xhr.open("POST","/sendaudiomessage",true);
  xhr.send(fd);
}