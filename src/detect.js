const slider = document.getElementById("slider-input");
const fileUpload = document.getElementById('fileUpload');

const smileys = [];

var _objSrc = document.getElementById('img');
var _objId = '#img';

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

function loadAssets(){
  for(var i=1; i<8; i++){
    var smiley = new Image();
    smiley.src = 'assets/smiley'+i+'.png';
    smileys.push(smiley);
  }
}

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
  var base_image = smileys[Math.floor(Math.random()*smileys.length)];
  var imgSize = Math.max(box.width, box.height) * 1.15;
  cx = box.x + box.width/2;
  cy = box.y + box.height/2;
  px = cx - imgSize/2;
  py = cy - imgSize/2;
  context.drawImage(base_image, px, py, imgSize, imgSize);
  // context.fillStyle = 'green';
  // context.fillRect(px, py, 5, 5);
  // context.fillStyle = 'red';
  // context.fillRect(cx, cy, 5, 5);
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
  loadAssets();
  await faceapi.loadSsdMobilenetv1Model('weights/');
  detectFace();
}

async function openVideo(){

  await faceapi.loadMtcnnModel('weights/');

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
