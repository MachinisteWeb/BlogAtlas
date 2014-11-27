var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.treeOfDates = require('../components/controllers/tree-of-dates');
	website.components.listOfArticles = require('../components/controllers/list-of-articles');
	website.components.markdownRender = require('../components/controllers/markdown-render');
	website.components.extendedFormatDate = require('../assets/javascript/components/extended-format-date');

	publics.preRender = function (params, mainCallback) {
		var variation = params.variation,
			mongoose = params.NA.modules.mongoose,
			marked = params.NA.modules.marked,
			Article = mongoose.model('article'),
			sessionID = params.request.sessionID,
			session = params.request.session;;

		variation.backend = {};
		variation.session = session;

		website.components.treeOfDates(variation, function (treeOfDates) {

			variation.backend.archives = treeOfDates;

			website.components.listOfArticles({
				Article: Article,
				date: { year: variation.params.year }, 
				marked: marked,
				session: variation.session,
				markdownRender: website.components.markdownRender,
				extendedFormatDate: website.components.extendedFormatDate,
				variation: variation
			}, function (listOfArticles) {

				variation.backend.articles = listOfArticles;

				variation.specific.titlePage = variation.specific.titlePage.replace(/%year%/g, variation.params.year);
				variation.specific.articles.title = variation.specific.articles.title.replace(/%year%/g, variation.params.year);
				variation.specific.description = variation.specific.description.replace(/%year%/g, variation.params.year);
				variation.specific.breadcrumb.items[2].content = variation.params.year;
				variation.specific.breadcrumb.items[2].title = variation.params.year;
				variation.specific.breadcrumb.items[2].href = variation.specific.breadcrumb.items[2].href.replace(/%year%/g, variation.params.year);

				mainCallback(variation);

			});
		});
	};

}(website));

exports.preRender = website.preRender;