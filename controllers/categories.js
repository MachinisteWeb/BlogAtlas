/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.treeOfCategories = require('./modules/tree-of-categories');

	publics.changeVariations = function (next, locals, request) {
		var NA = this,
			mongoose = NA.modules.mongoose,
			Category = mongoose.model('category'),
			/*sessionID = params.request.sessionID,*/
			session = request.session;

		locals.backend = {};
		locals.session = session;

		website.components.treeOfCategories(Category, function (treeOfCategories) {

			locals.backend.categories = treeOfCategories;

			next();
		});
	};

}(website));

exports.changeVariations = website.changeVariations;