/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.treeOfDates = require('./modules/tree-of-dates');

	publics.changeVariations = function (params, mainCallback) {
		var variations = params.variations,
			/*sessionID = params.request.sessionID,*/
			session = params.request.session;

		variations.backend = {};
		variations.session = session;

		website.components.treeOfDates(variations, function (treeOfDates) {

			variations.backend.archives = treeOfDates;

			mainCallback(variations);
		});
	};

}(website));

exports.changeVariations = website.changeVariations;