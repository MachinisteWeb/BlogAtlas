var website = {};

website.archives = {};

(function (publics) {
	"use strict";

	var privates = {};

	privates.treeOfDates = require('../components/controllers/tree-of-dates');

	publics.preRender = function (params, mainCallback) {
		var variation = params.variation;

		variation.backend = {};

		privates.treeOfDates(variation, function (treeOfDates) {

			variation.backend.archives = treeOfDates;

			mainCallback(variation);
		});
	};

}(website.archives));

exports.preRender = website.archives.preRender;