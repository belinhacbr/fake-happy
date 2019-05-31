const slider = document.getElementById("slider-input");
const fileUpload = document.getElementById('fileUpload');

const base_image = new Image();
base_image.src = 'assets/smiley.png';

var _objSrc = document.getElementById('img');
var _objId = '#img';

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');


async function detectFace(){
  console.log('detecting ' + _objId);
  const displaySize = { width: _objSrc.width, height: _objSrc.height }
  prepareCanvas(displaySize);
  const detections = await faceapi.detectAllFaces(_objSrc)
  const resizedDetections = faceapi.resizeResults(detections, displaySize)
  console.log(resizedDetections)
  // faceapi.draw.drawDetections(canvas, resizedDetections)
  resizedDetections.forEach(function (face) {  drawOnCanvas(face.box); });
}

function prepareCanvas(displaySize){
  const canvas = document.getElementById('canvas')
  faceapi.matchDimensions(canvas, displaySize)
}

function drawOnCanvas(box) {
  var imgSize = Math.max(box.width, box.height);
  context.drawImage(base_image, box.x, box.y, imgSize, imgSize);
  console.log('faces!');
};


function loadImage() {
    var img = document.getElementById('img');
    const displaySize = { width: img.width, height: img.height }
    prepareCanvas(displaySize);
    if ( this.files && this.files[0] ) {
        var FR = new FileReader();
        FR.onload = function(e) {
           img.src = e.target.result;
           img.onload = readImage();
        };
        FR.readAsDataURL( this.files[0] );
    }
};

async function readImage(){
  await faceapi.loadSsdMobilenetv1Model('weights/');
  detectFace();
}

async function openVideo(){

  await faceapi.loadMtcnnModel('weights/');
  // await faceapi.loadFaceRecognitionModel('weights/');

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
  onPlay(video);
};

function onPlay(video) {
  if (!slider.checked){
    detectFace();
    setTimeout(() => onPlay(video), 10);
  } else {
    console.log('stopping video detection');
  }
}

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
    readImage();
  } else {
    document.getElementById('img').parentElement.style.display = 'none';
    document.getElementById('video').parentElement.style.display = 'block';
    _objSrc = document.getElementById('video')
    _objId = '#video';
    openVideo();
  }
};

slider.onchange = loadSelectedCanvas;
fileUpload.onchange = loadImage;
window.onload = readImage;
