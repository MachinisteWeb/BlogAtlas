/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.treeOfCategories = require('./modules/tree-of-categories');
	website.components.listOfArticles = require('./modules/list-of-articles');
	website.components.markdownRender = require('./modules/markdown-render');
	website.components.extendedFormatDate = require('../assets/javascript/components/extended-format-date');

	publics.changeVariations = function (params, next) {
		var NA = this,
			variations = params.variations,
			mongoose = NA.modules.mongoose,
			marked = NA.modules.marked,
			Article = mongoose.model('article'),
			Category = mongoose.model('category'),
			/*sessionID = params.request.sessionID,*/
			session = params.request.session;

		variations.backend = {};
		variations.session = session;

		/*console.log(variations.params);
		console.log(variations.params[0]);*/

		/*if (variations.params && variations.params[0]) { variations.params.category = variations.params[0]; }*/

		website.components.treeOfCategories(Category, function (treeOfCategories, listOfCategories) {
			var categoryId,
				categoryUrn,
				categoryTitle;

			variations.backend.categories = treeOfCategories;


			for (var i = 0; i < listOfCategories.length; i++) {
				if (listOfCategories[i].urn === variations.params.category) {
					categoryId = listOfCategories[i]._id;
					categoryUrn = listOfCategories[i].urn;
					categoryTitle = listOfCategories[i].title;
				}
			}

			website.components.listOfArticles({
				Article: Article,
				categoryId: categoryId, 
				marked: marked,
				session: variations.session,
				markdownRender: website.components.markdownRender,
				extendedFormatDate: website.components.extendedFormatDate,
				variations: variations
			}, function (listOfArticles) {
				if (typeof categoryId !== 'undefined') {
					variations.backend.articles = listOfArticles;
					variations.specific.breadcrumb.items[2].content = categoryTitle;
					variations.specific.breadcrumb.items[2].title = categoryTitle;
					variations.specific.titlePage = variations.specific.titlePage.replace(/%title%/g, categoryTitle);
					variations.specific.breadcrumb.items[2].href = variations.specific.breadcrumb.items[2].href.replace(/%urn%/g, categoryUrn);
					variations.specific.articles.title = variations.specific.articles.title.replace(/%title%/g, categoryTitle);
					variations.specific.description = variations.specific.description.replace(/%title%/g, categoryTitle);
				} else {
					variations.specific.breadcrumb.items[2].href = variations.specific.breadcrumb.items[2].href.replace(/%urn%/g, variations.params.category);
					variations.specific.articles.title = variations.specific.articles.titleNoCategory;
					variations.specific.description = variations.specific.articles.titleNoCategory;
				}

				next(variations);
			});
		});
	};

}(website));

exports.changeVariations = website.changeVariations;