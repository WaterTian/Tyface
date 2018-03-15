
var That;

export default class Face {
	constructor(onComplete) {
		That = this;

		this.onComplete = onComplete;

		this.webcam = document.createElement('video');
		this.webcam.setAttribute("style", "display:none;");
		this.webcam.setAttribute('playsinline', true);
		this.webcam.setAttribute('webkit-playsinline', true);


		this.faceImage = document.createElement('canvas');
		this.faceImage.setAttribute("style", "display:none;");
		this.faceImageCtx;
		this.brfv4 = window.brfv4;
		this.brfManager = null;
		this.resolution = null;


		//add
		document.body.appendChild(That.webcam);
		document.body.appendChild(That.faceImage);

		That.waitForSDK();
	}

	waitForSDK() {
		console.log("waitForSDK");

		if (That.brfv4.sdkReady) {
			That.startCamera();
		} else {
			setTimeout(That.waitForSDK, 100);
		}
	}

	startCamera() {

		function onStreamFetched(mediaStream) {
			console.log("onStreamFetched");

			That.webcam.srcObject = mediaStream;
			That.webcam.play();

			function onStreamDimensionsAvailable() {
				console.log("onStreamDimensionsAvailable");
				if (That.webcam.videoWidth === 0) {
					setTimeout(onStreamDimensionsAvailable, 100);
				} else {

					That.faceImage.width = That.webcam.videoWidth;
					That.faceImage.height = That.webcam.videoHeight;
					That.faceImageCtx = That.faceImage.getContext("2d");

					That.initSDK();
				}
			}

			onStreamDimensionsAvailable();
		}

		var mediaDev = window.navigator.mediaDevices.getUserMedia({
			audio: false,
			video: {
				width: 640,
				height: 480,
				frameRate: 30
			}
		});
		mediaDev.then(onStreamFetched);
		mediaDev.catch(function(err) {
			alert("Camera Erro. " + err);
		});
	}


	initSDK() {
		console.log("initSDK");

		That.resolution = new That.brfv4.Rectangle(0, 0, That.faceImage.width, That.faceImage.height);
		That.brfManager = new That.brfv4.BRFManager();
		That.brfManager.init(That.resolution, That.resolution, "com.tastenkunst.brfv4.js.examples.minimal.webcam");

		That.onComplete();
	}



	getFaces() {

		this.faceImageCtx.setTransform(-1.0, 0, 0, 1, this.resolution.width, 0); // mirrored for draw of video
		this.faceImageCtx.drawImage(this.webcam, 0, 0, this.resolution.width, this.resolution.height);
		this.faceImageCtx.setTransform(1.0, 0, 0, 1, 0, 0); // unmirrored for draw of results

		var faceImageData = this.faceImageCtx.getImageData(0, 0, this.resolution.width, this.resolution.height).data;
		this.brfManager.update(faceImageData);

		var faces = this.brfManager.getFaces();

		// ///points draw
		// for (var i = 0; i < faces.length; i++) {
		// 	var face = faces[i];
		// 	if (face.state === this.brfv4.BRFState.FACE_TRACKING_START || face.state === this.brfv4.BRFState.FACE_TRACKING) {
  //               ///points
		// 		this.faceImageCtx.strokeStyle = "#00ffa0";
		// 		for (var k = 0; k < face.vertices.length; k += 2) {
		// 			this.faceImageCtx.beginPath();
		// 			this.faceImageCtx.arc(face.vertices[k], face.vertices[k + 1], 2, 0, 2 * Math.PI);
		// 			this.faceImageCtx.stroke();
		// 		}

		// 	}
		// }


		return faces;
	}



}