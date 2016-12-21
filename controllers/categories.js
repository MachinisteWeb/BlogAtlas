/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.treeOfCategories = require('./modules/tree-of-categories');

	publics.changeVariations = function (params, next) {
		var NA = this,
			variations = params.variations,
			mongoose = NA.modules.mongoose,
			Category = mongoose.model('category'),
			/*sessionID = params.request.sessionID,*/
			session = params.request.session;

		variations.backend = {};
		variations.session = session;

		website.components.treeOfCategories(Category, function (treeOfCategories) {

			variations.backend.categories = treeOfCategories;

			next(variations);
		});
	};

}(website));

exports.changeVariations = website.changeVariations;