const isIOS11 = (window.navigator.userAgent.indexOf("iPad") > 0 || window.navigator.userAgent.indexOf("iPhone") > 0) && window.navigator.userAgent.indexOf("OS 11_") > 0;

var That;

export default class Face {
	constructor(onComplete) {
		That = this;

		this.onComplete = onComplete;

		this.webcam = document.createElement('video');
		this.webcam.setAttribute("style", "display:none;");
		this.webcam.setAttribute('webkit-playsinline', true);

		this.faceImage = document.createElement('canvas');
		this.faceImage.setAttribute("style", "display:none;");
		this.faceImageCtx;
		this.brfv4 = null;
		this.brfManager = null;
		this.resolution = null;

		this.initCamera();
	}



	initCamera() {

		var support = (typeof WebAssembly === 'object');
		if (support) {
			function testSafariWebAssemblyBug() {
				var bin = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 6, 1, 96, 1, 127, 1, 127, 3, 2, 1, 0, 5, 3, 1, 0, 1, 7, 8, 1, 4, 116, 101, 115, 116, 0, 0, 10, 16, 1, 14, 0, 32, 0, 65, 1, 54, 2, 0, 32, 0, 40, 2, 0, 11]);
				var mod = new WebAssembly.Module(bin);
				var inst = new WebAssembly.Instance(mod, {});
				return (inst.exports.test(4) !== 0);
			}
			if (!testSafariWebAssemblyBug()) {
				support = false;
			}
		}
		console.log(support);
		var script = document.createElement("script");
		script.setAttribute("type", "text/javascript");
		script.setAttribute("async", true);
		script.setAttribute("src", "js/libs/brf_wasm/BRFv4_JS_TK190218_v4.0.5_trial.js");
		document.getElementsByTagName("head")[0].appendChild(script);


		//add
		document.body.appendChild(this.webcam);
		document.body.appendChild(this.faceImage);



		var mediaDev = window.navigator.mediaDevices.getUserMedia({
			audio: false,
			video: {
				width: 640,
				height: 480,
				frameRate: 30
			}
		});
		mediaDev.then(this.onStreamFetched);
		mediaDev.catch(function(err) {
			alert("Camera Erro. " + err);
		});
	}

	onStreamFetched(mediaStream) {
		console.log("onStreamFetched");

		That.webcam.srcObject = mediaStream;
		That.webcam.play();

		function onStreamDimensionsAvailable() {
			console.log("onStreamDimensionsAvailable");
			if (That.webcam.videoWidth === 0) {
				setTimeout(onStreamDimensionsAvailable, 100);
			} else {

				// if (isIOS11) {
				// 	webcam.pause();
				// 	webcam.srcObject.getTracks().forEach(function(track) {
				// 		track.stop();
				// 	});
				// }

				That.faceImage.width = That.webcam.videoWidth;
				That.faceImage.height = That.webcam.videoHeight;
				That.faceImageCtx = That.faceImage.getContext("2d");

				That.waitForSDK();
			}
		}

		onStreamDimensionsAvailable();
	}
	waitForSDK() {
		console.log("waitForSDK");

		if (That.brfv4 === null) {
			That.brfv4 = {
				locateFile: function(fileName) {
					return "js/libs/brf_wasm/" + fileName;
				}
			};
			initializeBRF(That.brfv4);
		}

		if (That.brfv4.sdkReady) {
			That.initSDK();
		} else {
			setTimeout(That.waitForSDK, 100);
		}
	}

	initSDK() {

		That.resolution = new That.brfv4.Rectangle(0, 0, 640, 480);
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

		for (var i = 0; i < faces.length; i++) {
			var face = faces[i];
			if (face.state === this.brfv4.BRFState.FACE_TRACKING_START ||
				face.state === this.brfv4.BRFState.FACE_TRACKING) {
				this.faceImageCtx.strokeStyle = "#00ffa0";
				for (var k = 0; k < face.vertices.length; k += 2) {
					this.faceImageCtx.beginPath();
					this.faceImageCtx.arc(face.vertices[k], face.vertices[k + 1], 2, 0, 2 * Math.PI);
					this.faceImageCtx.stroke();
				}
			}
		}


		return faces;
	}



}