const slider = document.getElementById("slider-input");
const fileUpload = document.getElementById('fileUpload');

const base_image = new Image();
base_image.src = 'assets/smiley.png';

var _objSrc = document.getElementById('img');
var _objId = '#img';

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

function detectFace(camera){
    var tracker = new tracking.ObjectTracker('face');
    console.log('Reading ' + _objId);
    prepareCanvas();
    prepareTracker(tracker, camera);
    tracker.on('track', track);
};

function track(event){
    prepareCanvas();
    event.data.forEach(function(rect) {
        drawOnCanvas(rect);
    });
};


function prepareTracker(tracker, camera){
  tracker.setStepSize(1.5);
  tracker.setInitialScale(4);
  tracker.setEdgesDensity(0.1);
  tracking.track(_objId, tracker, {camera: camera});
}


function prepareCanvas(){
  context.save();
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = _objSrc.width;
  canvas.height = _objSrc.height;
  context.restore();
};


function drawOnCanvas(rect) {
  context.drawImage(base_image, rect.x, rect.y, rect.width, rect.height);
  console.log('faces!');
};


function readImage() {
    var img = document.getElementById('img');
    if ( this.files && this.files[0] ) {
        var FR = new FileReader();
        FR.onload = function(e) {
           img.src = e.target.result;
           img.onload = function(){
            detectFace(false);
          };
        };
        FR.readAsDataURL( this.files[0] );
    }
};


function reloadDetection(){
  detectFace(false);
};


function openVideo(){
  const constraints = {
                        audio: false,
                        video: {
                          facingMode: "user",
                          width: 800,
                          height: 400
                        }
                      };

  navigator.mediaDevices.getUserMedia(constraints)
                        .then(readVideo)
                        .catch(function(err){
                          console.log(err);
                          slider.checked = true;
                          loadSelectedCanvas();
                        });
};


function readVideo(stream){
  window.stream = stream;
  var video = document.getElementById("video")
  video.srcObject = stream;
  detectFace(true);
};


function stopVideo(){
  var video = document.getElementById("video")
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach(function(track){track.stop();});
  }
  if (window.stream) {
    window.stream.getTracks().forEach(function(track){track.stop();});
  }
};


function loadSelectedCanvas(){
  console.log(slider.checked ? 'selected img' : 'selected cam')

  if (slider.checked == true) {
    stopVideo();
    document.getElementById('video').parentElement.style.display = 'none';
    document.getElementById('img').parentElement.style.display = 'block';
    _objSrc = document.getElementById('img')
    _objId = '#img';
    reloadDetection();
  } else {
    document.getElementById('img').parentElement.style.display = 'none';
    document.getElementById('video').parentElement.style.display = 'block';
    _objSrc = document.getElementById('video')
    _objId = '#video';
    openVideo();
  }
};

slider.onchange = loadSelectedCanvas;
fileUpload.onchange = readImage;
window.onload = reloadDetection;
