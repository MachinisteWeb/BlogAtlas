var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.treeOfCategories = require('../components/controllers/tree-of-categories');
	website.components.listOfArticles = require('../components/controllers/list-of-articles');
	website.components.markdownRender = require('../components/controllers/markdown-render');
	website.components.extendedFormatDate = require('../assets/javascript/components/extended-format-date');

	publics.changeVariation = function (params, mainCallback) {
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

		website.components.treeOfCategories(Category, function (treeOfCategories, listOfCategories) {
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

			website.components.listOfArticles({
				Article: Article,
				categoryId: categoryId, 
				marked: marked,
				session: variation.session,
				markdownRender: website.components.markdownRender,
				extendedFormatDate: website.components.extendedFormatDate,
				variation: variation
			}, function (listOfArticles) {
				if (typeof categoryId !== 'undefined') {
					variation.backend.articles = listOfArticles;
					variation.specific.breadcrumb.items[2].content = categoryTitle;
					variation.specific.breadcrumb.items[2].title = categoryTitle;
					variation.specific.titlePage = variation.specific.titlePage.replace(/%title%/g, categoryTitle);
					variation.specific.breadcrumb.items[2].href = variation.specific.breadcrumb.items[2].href.replace(/%urn%/g, categoryUrn);
					variation.specific.articles.title = variation.specific.articles.title.replace(/%title%/g, categoryTitle);
					variation.specific.description = variation.specific.description.replace(/%title%/g, categoryTitle);
				} else {
					variation.specific.breadcrumb.items[2].href = variation.specific.breadcrumb.items[2].href.replace(/%urn%/g, variation.params.category);
					variation.specific.articles.title = variation.specific.articles.titleNoCategory;
					variation.specific.description = variation.specific.articles.titleNoCategory;
				}

				
				mainCallback(variation);
			});
		});
	};

}(website));

exports.changeVariation = website.changeVariation;