var audioContext = null;
var meter = null;
var canvasContext = null;
var WIDTH=500;
var HEIGHT=50;
var rafID = null;
var isRecording = false;

// grab our canvas
canvasContext = document.getElementById( "meter" ).getContext("2d");

function didntGetStream() {
    alert('Stream generation failed.');
}

var mediaStreamSource = null;

function drawLoop( time ) {
    // clear the background
    canvasContext.clearRect(0,0,WIDTH,HEIGHT);

    // check if we're currently clipping
    if (meter.checkClipping())
        canvasContext.fillStyle = "red";
    else
        canvasContext.fillStyle = "green";

    // draw a bar based on the current volume
    if(isRecording)
       canvasContext.fillRect(0, 0, meter.volume*WIDTH*1.4, HEIGHT);

    // set up the next visual callback
    rafID = window.requestAnimationFrame( drawLoop );
}



function __log(e, data) {
    console.log(e + " " + (data || ''));
}
var audio_context;
var recorder;
function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    __log('Media stream created.');
    // Uncomment if you want the audio to feedback directly
    //input.connect(audio_context.destination);
    //__log('Input connected to audio context destination.');

    recorder = new Recorder(input);
    __log('Recorder initialised.');
    
    
    //Visual
    // Create an AudioNode from the stream.
    mediaStreamSource = input;

    // Create a new volume meter and connect it.
    meter = createAudioMeter(audio_context);
    mediaStreamSource.connect(meter);

    // kick off the visual updating
    drawLoop();
    
}
function startRecording(button) {
    recorder && recorder.record();
    button.disabled = true;
    button.nextElementSibling.disabled = false;
    isRecording = true;
    __log('Recording...');
}
function stopRecording(button) {
    recorder && recorder.stop();
    button.disabled = true;
    button.previousElementSibling.disabled = false;
    isRecording = false;
    __log('Stopped recording.');

    // create WAV download link using audio data blob
    createDownloadLink();

    recorder.clear();
}
function createDownloadLink() {
    recorder && recorder.exportWAV(function(blob) {
        var url = URL.createObjectURL(blob);
        var li = document.createElement('li');
        var au = document.createElement('audio');
        var hf = document.createElement('a');

        au.controls = true;
        au.src = url;
        hf.className = "btn btn-default";
        hf.href = url;
        hf.download = new Date().toISOString() + '.wav';
        hf.innerHTML = '<span class="glyphicon glyphicon-save" aria-hidden="true"></span> Download';
        li.appendChild(au);
        li.appendChild(hf);
        recordingslist.appendChild(li);
    });
}
window.onload = function init() {
    
    try {
        // webkit shim
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
        window.URL = window.URL || window.webkitURL;

        audio_context = new AudioContext;
        __log('Audio context set up.');
        __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
        alert('No web audio support in this browser!');
    }

    navigator.getUserMedia({audio: {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            }}, startUserMedia, function(e) {
        __log('No live audio input: ' + e);
    });
};