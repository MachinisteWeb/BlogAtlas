var website = {};

(function (publics) {
	"use strict";

	publics.preRender = function (params, mainCallback) {
		var variation = params.variation;

		mainCallback(variation);
	};

}(website));

exports.preRender = website.preRender;