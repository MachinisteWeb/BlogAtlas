var website = {};

website.articlesByCategory = {};

(function (publics) {
	"use strict";
	
	var privates = {};

	privates.treeOfCategories = require('../components/controllers/tree-of-categories');
	privates.listOfArticles = require('../components/controllers/list-of-articles');
	privates.markdownRender = require('../components/controllers/markdown-render');
	privates.extendedFormatDate = require('../assets/javascript/components/extended-format-date');

	publics.preRender = function (params, mainCallback) {
		var variation = params.variation,
			mongoose = params.NA.modules.mongoose,
			marked = params.NA.modules.marked,
			Article = mongoose.model('article'),
			Category = mongoose.model('category'),
			sessionID = params.request.sessionID,
			session = params.request.session;;

		variation.backend = {};
		variation.session = session;

		/*console.log(variation.params);
		console.log(variation.params[0]);*/

		/*if (variation.params && variation.params[0]) { variation.params.category = variation.params[0]; }*/

		privates.treeOfCategories(Category, function (treeOfCategories, listOfCategories) {
			var categoryId,
				categoryUrn,
				categoryTitle;

			variation.backend.categories = treeOfCategories;


			for (var i = 0; i < listOfCategories.length; i++) {
				if (listOfCategories[i].urn === variation.params.category) {
					categoryId = listOfCategories[i]._id;
					categoryUrn = listOfCategories[i].urn;
					categoryTitle = listOfCategories[i].title;
				}
			}

			privates.listOfArticles({
				Article: Article,
				categoryId: categoryId, 
				marked: marked,
				session: variation.session,
				markdownRender: privates.markdownRender,
				extendedFormatDate: privates.extendedFormatDate,
				variation: variation
			}, function (listOfArticles) {
				if (typeof categoryId !== 'undefined') {
					variation.backend.articles = listOfArticles;
					variation.specific.breadcrumb.items[2].content = categoryTitle;
					variation.specific.breadcrumb.items[2].title = categoryTitle;
					variation.specific.titlePage = variation.specific.titlePage.replace(/%title%/g, categoryTitle);
					variation.specific.breadcrumb.items[2].href = variation.specific.breadcrumb.items[2].href.replace(/%urn%/g, categoryUrn);
				} else {
					variation.specific.breadcrumb.items[2].href = variation.specific.breadcrumb.items[2].href.replace(/%urn%/g, variation.params.category);
				}
				

				mainCallback(variation);
			});
		});
	};

}(website.articlesByCategory));

exports.preRender = website.articlesByCategory.preRender;