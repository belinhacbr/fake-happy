const slider = document.getElementById("slider-input");
const fileUpload = document.getElementById('fileUpload');

const base_image = new Image();
base_image.src = 'assets/smiley.png';

function detectFace(objSrc, objId, container, camera){
    console.log('Reading ' + objId);
    prepareCanvas(objSrc);
    var tracker = new tracking.ObjectTracker('face');
    tracker.setStepSize(1.5);
    tracker.setInitialScale(4);
    tracker.setEdgesDensity(0.1);
    tracking.track(objId, tracker, {camera : camera});
    tracker.on('track', function(event) {
      console.log('detecting..')
      prepareCanvas(objSrc);
      event.data.forEach(function(rect) {
        drawOnCanvas(rect, objSrc);
      });
    });
};


function prepareCanvas(objSrc){
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = objSrc.width;
  canvas.height = objSrc.height;
};


function drawOnCanvas(rect, objSrc) {
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  context.drawImage(base_image, rect.x, rect.y, rect.width, rect.height);
  console.log('faces!');
};


function readImage() {
    var img = document.getElementById('img');
    slider.checked = true;
    loadSelectedCanvas();
    if ( this.files && this.files[0] ) {
        var FR = new FileReader();
        FR.onload = function(e) {
           img.src = e.target.result;
           img.onload = function(){
            detectFace(img, '#img', '.img-container');
          };
        };
        FR.readAsDataURL( this.files[0] );
    }
};


function reloadDetection(){
  var img = document.getElementById('img');
  detectFace(img, '#img', '.img-container');
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
  detectFace(video, '#video', '.cam-container', true);
};


function stopVideo(err){
  var video = document.getElementById("video")
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach(function(track){track.stop();});
  }
};


function loadSelectedCanvas(){
  console.log(slider.checked ? 'selected img' : 'selected cam')
  var frame = document.getElementById('frame');

  if (slider.checked == true) {
    stopVideo();
    const imgHTML = "<div class='img-container'><img id='img' src='assets/band.jpg' onclick='reloadDetection()'/></div>"
    frame.innerHTML = imgHTML;
    readImage();
  } else {
    const videoHTML = "<div class='cam-container'><video id='video' width='800' height='400' preload autoplay loop muted></video></div>"
    frame.innerHTML = videoHTML;
    openVideo();
  }
};

slider.onchange = loadSelectedCanvas;
fileUpload.onchange = readImage;
window.onload = reloadDetection;
