/* jslint node: true */
var website = {};

(function (publics) {
	"use strict";

	publics.changeVariations = function (params, next) {
		var variations = params.variations,
			request = params.request,
			fs = require('fs');

		if (request && request.files && request.files["file-upload-avatar"]) {

			console.log(request.files["file-upload-avatar"].path);
			console.log('./asset/media/uploads/' + request.files["file-upload-avatar"].name);

		   	fs.renameSync(request.files["file-upload-avatar"].path, './asset/media/uploads/' + request.files["file-upload-avatar"].name);

			variations.header["Content-Type"] = "text/plain";
            /*variations.upload = "./media/tmp/" + module.request.sessionID + "-" + module.request.files["registration-cat-photo"].name*/
			console.log("Yep !");
		} else {
			console.log("Nope...");
		}

		variations.backend = JSON.stringify({
			"test": "test"
		});

		next(variations);
	};

}(website));

exports.changeVariations = website.changeVariations;