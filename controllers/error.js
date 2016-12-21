/* jslint node: true */
var website = {};

(function (publics) {
	"use strict";

	publics.changeVariations = function (params, next) {
		var variations = params.variations;

		next(variations);
	};

}(website));

exports.changeVariations = website.changeVariations;