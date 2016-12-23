/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.treeOfDates = require('./modules/tree-of-dates');

	publics.changeVariations = function (next, locals, request) {
		var /*sessionID = request.sessionID,*/
			session = request.session;

		locals.backend = {};
		locals.session = session;

		website.components.treeOfDates(locals, function (treeOfDates) {

			locals.backend.archives = treeOfDates;

			next();
		});
	};

}(website));

exports.changeVariations = website.changeVariations;