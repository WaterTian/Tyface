var That;

export default class Face {
	constructor(cam, onComplete) {
		That = this;
		this.webcam = cam;
		this.onComplete = onComplete;


		this.faceImage = document.createElement('canvas');
		this.faceImage.setAttribute("style", "display:none;");
		document.body.appendChild(this.faceImage);

		this.faceImageCtx;
		this.brfv4 = null;
		this.brfManager = null;
		this.resolution = null;

		this.faceImage.width = this.webcam.videoWidth;
		this.faceImage.height = this.webcam.videoHeight;
		this.faceImageCtx = this.faceImage.getContext("2d");

		That.brfv4 = {
			locateFile: function(fileName) {
				return brfv4BaseURL + fileName;
			}
		};
		initializeBRF(That.brfv4);


		That.waitForSDK();
	}

	waitForSDK() {
		console.log("waitForSDK");

		if (That.brfv4.sdkReady) {
			That.initSDK();
		} else {
			setTimeout(That.waitForSDK, 1000);
		}
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