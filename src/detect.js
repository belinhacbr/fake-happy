function removeFaces(){
  var faces = document.getElementsByClassName('smiley');
  Array.from(faces).forEach(function(face) {
    face.parentNode.removeChild(face);
    console.log('removed');
  });
};

function detectFace(){
    removeFaces();
    var tracker = new tracking.ObjectTracker('face');
    var img = document.getElementById('img');
    tracker.setStepSize(2.0);
    tracking.track('#img', tracker);
    tracker.on('track', function(event) {
      event.data.forEach(function(rect) {
        window.plot(rect.x, rect.y, rect.width, rect.height, '.img-container', img);
      });
    });
    window.plot = function(x, y, w, h) {
      var rect = document.createElement('div');
      document.querySelector('.img-container').appendChild(rect);
      rect.classList.add('smiley');
      rect.style.width = w + 'px';
      rect.style.height = h + 'px';
      rect.style.left = (img.offsetLeft + x) + 'px';
      rect.style.top = (img.offsetTop + y) + 'px';
      console.log('faces!');
    };
};

var fileUpload = document.getElementById('fileUpload');

function readImage() {
    var img = document.getElementById('img');
    if ( this.files && this.files[0] ) {
        var FR = new FileReader();
        FR.onload = function(e) {
           img.src = e.target.result;
           img.onload = function(){
            detectFace();
          };
        };
        FR.readAsDataURL( this.files[0] );
    }
};



window.onload = detectFace;
fileUpload.onchange = readImage;
