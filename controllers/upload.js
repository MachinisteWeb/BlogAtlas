/* jslint node: true */
var website = {};

(function (publics) {
	"use strict";

	publics.changeVariations = function (next, locals, request) {
		var fs = require('fs');

		if (request && request.files && request.files["file-upload-avatar"]) {

			console.log(request.files["file-upload-avatar"].path);
			console.log('./asset/media/uploads/' + request.files["file-upload-avatar"].name);

		   	fs.renameSync(request.files["file-upload-avatar"].path, './asset/media/uploads/' + request.files["file-upload-avatar"].name);

			locals.header["Content-Type"] = "text/plain";
            /*locals.upload = "./media/tmp/" + module.request.sessionID + "-" + module.request.files["registration-cat-photo"].name*/
			console.log("Yep !");
		} else {
			console.log("Nope...");
		}

		locals.backend = JSON.stringify({
			"test": "test"
		});

		next();
	};

}(website));

exports.changeVariations = website.changeVariations;