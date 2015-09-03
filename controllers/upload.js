/* jslint node: true */
var website = {};

(function (publics) {
	"use strict";

	publics.changeVariation = function (params, mainCallback) {
		var variation = params.variation,
			request = params.request,
			fs = require('fs');

		if (request && request.files && request.files["file-upload-avatar"]) {

			console.log(request.files["file-upload-avatar"].path);
			console.log('./asset/media/uploads/' + request.files["file-upload-avatar"].name);

		   	fs.renameSync(request.files["file-upload-avatar"].path, './asset/media/uploads/' + request.files["file-upload-avatar"].name);

			variation.header["Content-Type"] = "text/plain";
            /*variation.upload = "./media/tmp/" + module.request.sessionID + "-" + module.request.files["registration-cat-photo"].name*/
			console.log("Yep !");
		} else {
			console.log("Nope...");
		}

		variation.backend = JSON.stringify({
			"test": "test"
		});

		mainCallback(variation);
	};

}(website));

exports.changeVariation = website.changeVariation;