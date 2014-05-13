var website = {};

website.categories = {};

(function (publics) {
	"use strict";
	
	var privates = {};

	privates.treeOfCategories = require('../components/controllers/tree-of-categories');

	publics.preRender = function (params, mainCallback) {
		var variation = params.variation,
			mongoose = params.NA.modules.mongoose,
			Category = mongoose.model('category'),
			sessionID = params.request.sessionID,
			session = params.request.session;

		variation.backend = {};
		variation.session = session;

		privates.treeOfCategories(Category, function (treeOfCategories) {

			variation.backend.categories = treeOfCategories;

			mainCallback(variation);
		});
	};

}(website.categories));

exports.preRender = website.categories.preRender;