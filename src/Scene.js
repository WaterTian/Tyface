const PIXI = require('pixi.js');
const TweenMax = require('gsap');
const Stats = require('stats.js');
const VConsole = require('vconsole');

const isMobile = require('./libs/isMobile.min.js');
const isIOS11 = (window.navigator.userAgent.indexOf("iPad") > 0 || window.navigator.userAgent.indexOf("iPhone") > 0) && window.navigator.userAgent.indexOf("OS 11_") > 0;

var That;
const APP = new PIXI.Application();
document.body.appendChild(APP.view);


var webcam = document.getElementById("webcam");
var imageData = document.getElementById("imageData"); // image data for BRFv4
var imageDataCtx = null;
var brfv4 = null;
var brfManager = null;
var resolution = null;

export default class Scene {
	constructor() {
		this.vconsole = new VConsole();
		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);

		That = this;

		That.initCamera();
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



		var mediaDev = window.navigator.mediaDevices.getUserMedia({
			audio: false,
			video: {
				width: 640,
				height: 480,
				frameRate: 30
			}
		});
		mediaDev.then(That.onStreamFetched);
		mediaDev.catch(function(err) {
			alert("Camera Erro. " + err);
		});
	}

	onStreamFetched(mediaStream) {
		console.log("onStreamFetched");

		webcam.srcObject = mediaStream;
		webcam.play();

		function onStreamDimensionsAvailable() {
			console.log("onStreamDimensionsAvailable");
			if (webcam.videoWidth === 0) {
				setTimeout(onStreamDimensionsAvailable, 100);
			} else {

				// if (isIOS11) {
				// 	webcam.pause();
				// 	webcam.srcObject.getTracks().forEach(function(track) {
				// 		track.stop();
				// 	});
				// }

				imageData.width		= webcam.videoWidth;
				imageData.height	= webcam.videoHeight;
				imageDataCtx		= imageData.getContext("2d");

				That.waitForSDK();
			}
		}
		
		onStreamDimensionsAvailable();
	}
	waitForSDK() {
		console.log("waitForSDK");

		if (brfv4 === null) {
			brfv4 = {
				locateFile: function(fileName) {
					return "js/libs/brf_wasm/" + fileName;
				}
			};
			initializeBRF(brfv4);
		}

		if (brfv4.sdkReady) {
			That.initSDK();
		} else {
			setTimeout(That.waitForSDK, 100);
		}
	}

	initSDK() {

		resolution = new brfv4.Rectangle(0, 0, 640, 480);
		brfManager = new brfv4.BRFManager();
		brfManager.init(resolution, resolution, "com.tastenkunst.brfv4.js.examples.minimal.webcam");

		That.trackFaces();
	}

	trackFaces() {

		imageDataCtx.setTransform(-1.0, 0, 0, 1, resolution.width, 0); // mirrored for draw of video
		imageDataCtx.drawImage(webcam, 0, 0, resolution.width, resolution.height);
		imageDataCtx.setTransform(1.0, 0, 0, 1, 0, 0); // unmirrored for draw of results

		brfManager.update(imageDataCtx.getImageData(0, 0, resolution.width, resolution.height).data);

		var faces = brfManager.getFaces();

		for (var i = 0; i < faces.length; i++) {

			var face = faces[i];

			if (face.state === brfv4.BRFState.FACE_TRACKING_START ||
				face.state === brfv4.BRFState.FACE_TRACKING) {

				imageDataCtx.strokeStyle = "#00a0ff";

				for (var k = 0; k < face.vertices.length; k += 2) {
					imageDataCtx.beginPath();
					imageDataCtx.arc(face.vertices[k], face.vertices[k + 1], 2, 0, 2 * Math.PI);
					imageDataCtx.stroke();
				}
			}
		}

		requestAnimationFrame(That.trackFaces);
	}



	init() {

		var button = new PIXI.Graphics()
			.beginFill(0x666666, 0.5)
			.drawRoundedRect(0, 0, 100, 100, 10)
			.endFill()
			.beginFill(0xffffff)
			.moveTo(36, 30)
			.lineTo(36, 70)
			.lineTo(70, 50);

		button.x = (APP.screen.width - button.width) / 2;
		button.y = (APP.screen.height - button.height) / 2;
		button.interactive = true;
		button.buttonMode = true;
		APP.stage.addChild(button);
		button.on('pointertap', That.start);
	}

	start() {

	}

}