'use strict';

var That;

export default class Loader {
	constructor() {
		That = this;

		this.queuePreloader = null;

	}

	preload(filesToLoad, callback) {
		if (That.queuePreloader !== null || !filesToLoad) {
			return;
		}

		function onPreloadProgress(event) {
			That.setProgressBar(event.loaded, true);
		}

		function onPreloadComplete(event) {
			That.setProgressBar(1.0, false);
			if (callback) callback();
		}

		var queue = That.queuePreloader = new createjs.LoadQueue(true);
		queue.on("progress", onPreloadProgress);
		queue.on("complete", onPreloadComplete);
		queue.loadManifest(filesToLoad, true);
	}

	setProgressBar(percent, visible) {
		if(percent < 0.0) percent = 0.0;
		if(percent > 1.0) percent = 1.0;

		console.log("loading"+percent);
	}

}