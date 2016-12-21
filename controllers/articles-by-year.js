/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.treeOfDates = require('./modules/tree-of-dates');
	website.components.listOfArticles = require('./modules/list-of-articles');
	website.components.markdownRender = require('./modules/markdown-render');
	website.components.extendedFormatDate = require('../assets/javascript/components/extended-format-date');

	publics.changeVariations = function (params, next) {
		var NA = this,
			variations = params.variations,
			mongoose = NA.modules.mongoose,
			marked = NA.modules.marked,
			Article = mongoose.model('article'),
			/*sessionID = params.request.sessionID,*/
			session = params.request.session;

		variations.backend = {};
		variations.session = session;

		website.components.treeOfDates(variations, function (treeOfDates) {

			variations.backend.archives = treeOfDates;

			website.components.listOfArticles({
				Article: Article,
				date: { year: variations.params.year },
				marked: marked,
				session: variations.session,
				markdownRender: website.components.markdownRender,
				extendedFormatDate: website.components.extendedFormatDate,
				variations: variations
			}, function (listOfArticles) {

				variations.backend.articles = listOfArticles;

				variations.specific.titlePage = variations.specific.titlePage.replace(/%year%/g, variations.params.year);
				variations.specific.articles.title = variations.specific.articles.title.replace(/%year%/g, variations.params.year);
				variations.specific.description = variations.specific.description.replace(/%year%/g, variations.params.year);
				variations.specific.breadcrumb.items[2].content = variations.params.year;
				variations.specific.breadcrumb.items[2].title = variations.params.year;
				variations.specific.breadcrumb.items[2].href = variations.specific.breadcrumb.items[2].href.replace(/%year%/g, variations.params.year);

				next(variations);

			});
		});
	};

}(website));

exports.changeVariations = website.changeVariations;