var website = {};

(function (publics) {
	"use strict";

	publics.changeVariation = function (params, mainCallback) {
		var variation = params.variation;

		mainCallback(variation);
	};

}(website));

exports.changeVariation = website.changeVariation;