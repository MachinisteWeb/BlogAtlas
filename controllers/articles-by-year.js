var website = {};

website.articlesByYear = {};

(function (publics) {
	"use strict";
	
	var privates = {};

	privates.treeOfDates = require('../components/controllers/tree-of-dates');
	privates.listOfArticles = require('../components/controllers/list-of-articles');
	privates.markdownRender = require('../components/controllers/markdown-render');

	publics.preRender = function (params, mainCallback) {
		var variation = params.variation,
			mongoose = params.NA.modules.mongoose,
			marked = params.NA.modules.marked,
			Article = mongoose.model('article');

		variation.backend = {};

		privates.treeOfDates(variation, function (treeOfDates) {

			variation.backend.archives = treeOfDates;

			privates.listOfArticles({
				Article: Article,
				date: { year: variation.params.year }, 
				marked: marked,
				markdownRender: privates.markdownRender,
			}, function (listOfArticles) {

				variation.backend.articles = listOfArticles;

				variation.specific.titlePage = variation.specific.titlePage.replace(/%year%/g, variation.params.year);
				variation.specific.breadcrumb.items[2].content = variation.params.year;
				variation.specific.breadcrumb.items[2].title = variation.params.year;
				variation.specific.breadcrumb.items[2].href = variation.specific.breadcrumb.items[2].href.replace(/%year%/g, variation.params.year);

				mainCallback(variation);

			});
		});
	};

}(website.articlesByYear));

exports.preRender = website.articlesByYear.preRender;