var website = {};

website.articlesByYear = {};

(function (publics) {
	"use strict";
	
	var privates = {};

	privates.treeOfDates = require('../components/controllers/tree-of-dates');
	privates.listOfArticles = require('../components/controllers/list-of-articles');
	privates.markdownRender = require('../components/controllers/markdown-render');
	privates.extendedFormatDate = require('../assets/javascript/components/extended-format-date');

	publics.preRender = function (params, mainCallback) {
		var variation = params.variation,
			mongoose = params.NA.modules.mongoose,
			marked = params.NA.modules.marked,
			Article = mongoose.model('article'),
			sessionID = params.request.sessionID,
			session = params.request.session;;

		variation.backend = {};
		variation.session = session;

		privates.treeOfDates(variation, function (treeOfDates) {

			variation.backend.archives = treeOfDates;

			privates.listOfArticles({
				Article: Article,
				date: { year: variation.params.year }, 
				marked: marked,
				session: variation.session,
				markdownRender: privates.markdownRender,
				extendedFormatDate: privates.extendedFormatDate,
				variation: variation
			}, function (listOfArticles) {

				variation.backend.articles = listOfArticles;

				variation.specific.titlePage = variation.specific.titlePage.replace(/%year%/g, variation.params.year);
				variation.specific.articles.title = variation.specific.articles.title.replace(/%year%/g, variation.params.year);
				variation.specific.breadcrumb.items[2].content = variation.params.year;
				variation.specific.breadcrumb.items[2].title = variation.params.year;
				variation.specific.breadcrumb.items[2].href = variation.specific.breadcrumb.items[2].href.replace(/%year%/g, variation.params.year);

				mainCallback(variation);

			});
		});
	};

}(website.articlesByYear));

exports.preRender = website.articlesByYear.preRender;