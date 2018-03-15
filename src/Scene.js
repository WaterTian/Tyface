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


var maskImageCtx, maskTexture;
var blackCtx, blackTexture;


export default class Scene {
	constructor() {
		var ua = navigator.userAgent.toLowerCase();
		var isWeChat = ua.match(/MicroMessenger/i) == "micromessenger";
		var isIOS = ua.indexOf("iphone") > 0;
		if (isWeChat && isIOS) document.getElementById('wechatTxt').style.display = "block";



		// this.vconsole = new VConsole();
		// this.stats = new Stats();
		// document.body.appendChild(this.stats.dom);

		That = this;
		this.face = new Face(this.completeFace);
	}

	completeFace() {
		console.log("completeFace get:");
		// console.log(That.face.getFaces());

		var loadingDiv = document.getElementById('loading');
		var startDiv = document.getElementById('svgCanvas');
		startDiv.setAttribute('class', 'loadingOut');
		setTimeout(function() {
			loadingDiv.style.display = "none";
			clearInterval(window.siv);
		}, 1000);

		That.start();
	}


	start() {
		imageW = That.face.faceImage.width;
		imageH = That.face.faceImage.height;


		APP = new PIXI.Application(imageW, imageH);
		document.body.appendChild(APP.view);
		APP.resolution = window.devicePixelRatio;


		faceTexture = PIXI.Texture.fromCanvas(That.face.faceImage);



		//maskFace
		var mask = document.createElement('canvas');
		maskImageCtx = mask.getContext("2d");
		maskTexture = PIXI.Texture.fromCanvas(mask);
		mask.width = imageW;
		mask.height = imageH;


		//maskBlack
		var black = document.createElement('canvas');
		blackCtx = black.getContext("2d");
		blackTexture = PIXI.Texture.fromCanvas(black);
		black.width = imageW;
		black.height = imageH;


		var faceNum = 5;
		for (var i = 0; i < faceNum; i++) {
			var c = -1.5 * Math.cos(i / faceNum * (Math.PI / 2)) + 1.5 + 0.2;
			if (i == 0) {
				var facePlane = new PIXI.Sprite(faceTexture);
				facePlane.scale.set(c, c);
				facePlane.x = imageW * (1 - c) / 2;
				facePlane.y = imageH * (1 - c) / 2;
				facePlaneArr.push(facePlane);
				APP.stage.addChild(facePlane);
			} else {

				var faceBlack = new PIXI.Sprite(blackTexture);
				faceBlack.scale.set(c, c * 1.1);
				faceBlack.x = imageW * (1 - c) / 2;
				faceBlack.y = imageH * (1 - c) / 2;
				facePlaneArr.push(faceBlack);
				APP.stage.addChild(faceBlack);

				var faceMask = new PIXI.Sprite(maskTexture);
				faceMask.scale.set(c, c);
				faceMask.x = imageW * (1 - c) / 2;
				faceMask.y = imageH * (1 - c) / 2;
				facePlaneArr.push(faceMask);
				APP.stage.addChild(faceMask);

			}
		}


		That.onResize();
		window.addEventListener("resize", That.onResize);

		That.update();
	}


	update() {
		requestAnimationFrame(That.update.bind(That));

		if (this.stats) this.stats.update();

		faceTexture.update();


		var faces = That.face.getFaces();
		if (faces.length > 0) {
			var face = faces[0];

			var centerX = face.vertices[30 * 2];
			var centerY = face.vertices[30 * 2 + 1];
			var _h = face.vertices[8 * 2 + 1] - centerY;

			//////////
			maskImageCtx.clearRect(0, 0, imageW, imageH);
			maskImageCtx.fillStyle = "red";
			maskImageCtx.beginPath();
			if (face.state === That.face.brfv4.BRFState.FACE_TRACKING_START || face.state === That.face.brfv4.BRFState.FACE_TRACKING) {
				var pArr = [];
				var _p;
				for (var k = 0 * 2; k < 17 * 2; k += 2) {
					_p = [face.vertices[k], face.vertices[k + 1]];
					pArr.push(_p);
				}
				for (k = 26 * 2; k >= 17 * 2; k -= 2) {
					_p = [face.vertices[k], face.vertices[k + 1]];
					pArr.push(_p);
				}


				for (var l = 0; l < pArr.length; l++) {
					if (l < 1) {
						maskImageCtx.moveTo(pArr[l][0], pArr[l][1]);
					} else {
						// var _px=pArr[l][0] + (pArr[l][0] - pArr[l-1][0]);
						// var _py=pArr[l][1] + (pArr[l][1] - pArr[l-1][1]);
						// maskImageCtx.quadraticCurveTo(_px, _py, pArr[l][0], pArr[l][1]);
						maskImageCtx.lineTo(pArr[l][0], pArr[l][1]);
					}
				}

			}
			maskImageCtx.fill();
			maskImageCtx.closePath();
			maskImageCtx.globalCompositeOperation = "source-out";
			maskImageCtx.drawImage(That.face.faceImage, 0, 0);
			maskTexture.update();


			/////////
			var grd = blackCtx.createRadialGradient(centerX, centerY, _h * 0.6, centerX, centerY, _h * 1.2);
			grd.addColorStop(0, "rgba(0,0,0,0)");
			grd.addColorStop(1, "rgba(0,0,0,1)");
			blackCtx.fillStyle = grd;
			blackCtx.clearRect(0, 0, imageW, imageH);
			blackCtx.fillRect(0, 0, imageW, imageH);
			blackTexture.update();


			for (var i = 0; i < facePlaneArr.length; i++) {
				var cx = facePlaneArr[i].scale.x;
				var cy = facePlaneArr[i].scale.y;
				facePlaneArr[i].x += (centerX * (1 - cx) - facePlaneArr[i].x) * 0.15 * (i + 1);
				facePlaneArr[i].y += (centerY * (1 - cy) - facePlaneArr[i].y) * 0.15 * (i + 1);
			}

		}
	}

	onResize() {
		var ww = window.innerWidth;
		var wh = window.innerHeight;

		var s = wh / imageH;

		if (imageW * s < ww) {
			s = ww / imageW;
		}

		var iw = imageW * s;
		var ih = imageH * s;
		var ix = (ww - iw) * 0.5;
		var iy = (wh - ih) * 0.5;

		APP.view.style.transformOrigin = "0% 0%";
		APP.view.style.transform = "matrix(" + s + ", 0, 0, " + s + ", " + ix + ", " + iy + ")";
	}
}