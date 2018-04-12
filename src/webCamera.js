
export default class webCamera {
	constructor(onComplete) {
		var That = this;

		this.onComplete = onComplete;

		this.dom = document.createElement('video');
		this.dom.setAttribute("style", "display:none;");
		this.dom.setAttribute('playsinline', true);
		this.dom.setAttribute('webkit-playsinline', true);
		document.body.appendChild(this.dom);

		function onStreamFetched(mediaStream) {
			console.log("onStreamFetched");

			That.dom.srcObject = mediaStream;
			That.dom.play();

			function onStreamDimensionsAvailable() {
				console.log("onStreamDimensionsAvailable");
				if (That.dom.videoWidth === 0) {
					setTimeout(onStreamDimensionsAvailable, 100);
				} else {
					That.onComplete();
					///////
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


}