/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.listOfArticles = require('./modules/list-of-articles');
	website.components.markdownRender = require('./modules/markdown-render');
	website.components.extendedFormatDate = require('../assets/javascript/components/extended-format-date');

	publics.changeVariations = function (params, next) {
		var NA = this,
			variations = params.variations,
			mongoose = NA.modules.mongoose,
			marked = NA.modules.marked,
			Article = mongoose.model('article'),
			/*sessionID = socket.request.sessionID,*/
			session = params.request.session;

		variations.backend = {};
		variations.session = session;

		website.components.listOfArticles({
			Article: Article,
			marked: marked,
			markdownRender: website.components.markdownRender,
			session: variations.session,
			extendedFormatDate: website.components.extendedFormatDate,
			variations: variations
		}, function (listOfArticles) {

			variations.backend.articles = listOfArticles;

			next(variations);
		});
	};

}(website));

exports.changeVariations = website.changeVariations;