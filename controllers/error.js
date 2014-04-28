var website = {};

website.error = {};

// PreRender
(function (publics) {
	"use strict";
	
	var privates = {};

	publics.preRender = function (params, mainCallback) {
		var variation = params.variation;

		mainCallback(variation);
	};

}(website.error));

exports.preRender = website.error.preRender;