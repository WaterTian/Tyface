const PIXI = require('pixi.js');
const TweenMax = require('gsap');
const Stats = require('stats.js');
const VConsole = require('vconsole');


const Face = require('./Face.js').default;

var That;
var APP;
var faceTexture;
var facePlaneArr = [];

var imageW, imageH;


var maskImage, maskImageCtx, maskTexture;


export default class Scene {
	constructor() {
		this.vconsole = new VConsole();
		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);

		That = this;

		this.face = new Face(this.completeFace);

	}

	completeFace() {
		console.log("completeFace get:");
		console.log(That.face.getFaces());

		That.start();
	}


	start() {

		APP = new PIXI.Application();
		document.body.appendChild(APP.view);


		faceTexture = PIXI.Texture.fromCanvas(That.face.faceImage);

		imageW = That.face.faceImage.width;
		imageH = That.face.faceImage.height;


		//mask
		maskImage = document.createElement('canvas');
		maskImageCtx = maskImage.getContext("2d");
		maskTexture = PIXI.Texture.fromCanvas(maskImage);
		maskImage.width = imageW;
		maskImage.height = imageH;


		var faceNum = 5;
		for (var i = 1; i <= faceNum; i++) {
			var c = 0.3 * i;
			if (i == 1) {
				var facePlane = new PIXI.Sprite(faceTexture);
				facePlane.scale.set(c, c);
				facePlane.x = imageW * (1 - c) / 2;
				facePlane.y = imageH * (1 - c) / 2;
				facePlaneArr.push(facePlane);
				APP.stage.addChild(facePlane);
			} else {
				var faceMask = new PIXI.Sprite(maskTexture);
				faceMask.scale.set(c, c);
				faceMask.x = imageW * (1 - c) / 2;
				faceMask.y = imageH * (1 - c) / 2;
				facePlaneArr.push(faceMask);
				APP.stage.addChild(faceMask);
			}
		}



		That.update();
	}

	update() {
		requestAnimationFrame(That.update.bind(That));

		if (this.stats) this.stats.update();

		faceTexture.update();


		var faces = That.face.getFaces();
		if (faces.length > 0) {
			var face = faces[0];


			maskImageCtx.clearRect(0, 0, imageW, imageH);
			maskImageCtx.fillStyle = "red";
			maskImageCtx.beginPath()
			if (face.state === That.face.brfv4.BRFState.FACE_TRACKING_START || face.state === That.face.brfv4.BRFState.FACE_TRACKING) {

				maskImageCtx.moveTo(face.vertices[0], face.vertices[1]);
				for (var k = 2; k < 17 * 2; k += 2) {
					maskImageCtx.lineTo(face.vertices[k], face.vertices[k + 1]);
				}
				for (k = 26 * 2; k >= 17 * 2; k -= 2) {
					maskImageCtx.lineTo(face.vertices[k], face.vertices[k + 1]);
				}
			}
			maskImageCtx.fill();
			maskImageCtx.globalCompositeOperation = "source-out";
			maskImageCtx.drawImage(That.face.faceImage, 0, 0);
			// maskImageCtx.fillStyle = "rgba(0,0,0,0.3)";
			// maskImageCtx.fillRect(0, 0, imageW, imageH);
			maskTexture.update();

			for (var i = 0; i < facePlaneArr.length; i++) {
				var c = facePlaneArr[i].scale.x;
				facePlaneArr[i].x = face.vertices[30 * 2]  * (1 - c);
				facePlaneArr[i].y = face.vertices[30 * 2 + 1]  * (1 - c);
			}

		}


	}


}