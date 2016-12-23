/* jslint node: true */
var website = {};

(function (publics) {
	"use strict";

	publics.changeVariations = function (next) {
		next();
	};

}(website));

exports.changeVariations = website.changeVariations;