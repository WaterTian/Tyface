const PIXI = require('pixi.js');
const TweenMax = require('gsap');
const Stats = require('stats.js');
const VConsole = require('vconsole');


const Face = require('./Face.js').default;

var That;
var APP;
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

		APP = new PIXI.Application();
		document.body.appendChild(APP.view);


		faceTexture = PIXI.Texture.fromCanvas(That.face.faceImage);
		// faceTexture = PIXI.Texture.fromVideo(That.face.webcam);

		var _w = That.face.faceImage.width;
		var _h = That.face.faceImage.height;

		var faceNum = 5;

		for (var i = 0; i < faceNum; i++) {

			var c = 1 - (0.15 * i);

			var facePlane = new PIXI.Sprite(faceTexture);
			facePlane.width = _w;
			facePlane.height = _h;
			facePlane.anchor.set(0.5);
			facePlane.x = _w / 2;
			facePlane.y = _h / 2;
			facePlane.scale.set(c, c);
			facePlaneArr.push(facePlane);
			APP.stage.addChild(facePlane);

			if (i < faceNum - 1) {
				var faceMask = new PIXI.Graphics();
				faceMask.scale.set(c, c);
				faceMask.x = _w * (1 - c) / 2;
				faceMask.y = _h * (1 - c) / 2;
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