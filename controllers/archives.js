/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.treeOfDates = require('./modules/tree-of-dates');

	publics.changeVariation = function (params, mainCallback) {
		var variation = params.variation,
			/*sessionID = params.request.sessionID,*/
			session = params.request.session;

		variation.backend = {};
		variation.session = session;

		website.components.treeOfDates(variation, function (treeOfDates) {

			variation.backend.archives = treeOfDates;

			mainCallback(variation);
		});
	};

}(website));

exports.changeVariation = website.changeVariation;