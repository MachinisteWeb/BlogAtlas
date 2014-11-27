var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.treeOfCategories = require('../components/controllers/tree-of-categories');

	publics.preRender = function (params, mainCallback) {
		var variation = params.variation,
			mongoose = params.NA.modules.mongoose,
			Category = mongoose.model('category'),
			sessionID = params.request.sessionID,
			session = params.request.session;

		variation.backend = {};
		variation.session = session;

		website.components.treeOfCategories(Category, function (treeOfCategories) {

			variation.backend.categories = treeOfCategories;

			mainCallback(variation);
		});
	};

}(website));

exports.preRender = website.preRender;