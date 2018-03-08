const PIXI = require('pixi.js');
const TweenMax = require('gsap');
const Stats = require('stats.js');
const VConsole = require('vconsole');

const isMobile = require('./libs/isMobile.min.js');
const isIOS11 = (window.navigator.userAgent.indexOf("iPad") > 0 || window.navigator.userAgent.indexOf("iPhone") > 0) && window.navigator.userAgent.indexOf("OS 11_") > 0;

const Face = require('./Face.js').default;

var That;
const APP = new PIXI.Application(640, 480);
document.body.appendChild(APP.view);
var faceTexture;
var facePlaneArr = [];
var faceMaskArr = [];


export default class Scene {
	constructor() {
		this.vconsole = new VConsole();
		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);

		That = this;

		this.face = new Face(this.completeFace);

	}

	completeFace() {
		console.log("completeFace");
		console.log(That.face.getFaces());

		That.start();
	}


	start() {

		faceTexture = PIXI.Texture.fromCanvas(That.face.faceImage);
		// faceTexture = PIXI.Texture.fromVideo(That.face.webcam);

		var faceNum = 5;

		for (var i = 0; i < faceNum; i++) {

			var c = 1 - (0.18 * i);

			var facePlane = new PIXI.Sprite(faceTexture);
			facePlane.width = APP.screen.width;
			facePlane.height = APP.screen.height;
			facePlane.anchor.set(0.5);
			facePlane.x = APP.screen.width / 2;
			facePlane.y = APP.screen.height / 2;
			facePlane.scale.set(c, c);
			facePlaneArr.push(facePlane);
			APP.stage.addChild(facePlane);

			if (i < faceNum - 1) {
				var faceMask = new PIXI.Graphics();
				faceMask.scale.set(c, c);
				faceMask.x = APP.screen.width * (1 - c) / 2;
				faceMask.y = APP.screen.height * (1 - c) / 2;
				faceMaskArr.push(faceMask);
				APP.stage.addChild(faceMask);
			}

			if (i > 0) {
				facePlaneArr[i].mask = faceMaskArr[i - 1];
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
			for (var i = 0; i < faceMaskArr.length; i++) {
				faceMaskArr[i].clear();
				faceMaskArr[i].beginFill(0xffffff, 0.3);
				faceMaskArr[i].moveTo(face.vertices[0], face.vertices[1]);

				for (var k = 2; k < 17 * 2; k += 2) {
					faceMaskArr[i].lineTo(face.vertices[k], face.vertices[k + 1]);
				}
				for (k = 26 * 2; k >= 17 * 2; k -= 2) {
					faceMaskArr[i].lineTo(face.vertices[k], face.vertices[k + 1]);
				}
			}

			// for (var j = 0; j < faceContainerArr.length; j++) {
			// 	// faceContainerArr[j].x += (face.vertices[30 * 2]-faceContainerArr[j].x)*0.1*(j+1);
			// 	// faceContainerArr[j].y += (face.vertices[30 * 2 + 1]-faceContainerArr[j].y)*0.1*(j+1);
			// 	// faceContainerArr[j].x = face.vertices[30 * 2];
			// 	// faceContainerArr[j].y = face.vertices[30 * 2 + 1];
			// }

		}


	}


}