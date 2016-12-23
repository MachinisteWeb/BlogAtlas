/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.treeOfCategories = require('./modules/tree-of-categories');
	website.components.listOfArticles = require('./modules/list-of-articles');
	website.components.markdownRender = require('./modules/markdown-render');
	website.components.extendedFormatDate = require('../assets/javascript/components/extended-format-date');

	publics.changeVariations = function (next, locals, request) {
		var NA = this,
			mongoose = NA.modules.mongoose,
			marked = NA.modules.marked,
			Article = mongoose.model('article'),
			Category = mongoose.model('category'),
			/*sessionID = params.request.sessionID,*/
			session = request.session;

		locals.backend = {};
		locals.session = session;

		/*console.log(locals.params);
		console.log(locals.params[0]);*/

		/*if (locals.params && locals.params[0]) { locals.params.category = locals.params[0]; }*/

		website.components.treeOfCategories(Category, function (treeOfCategories, listOfCategories) {
			var categoryId,
				categoryUrn,
				categoryTitle;

			locals.backend.categories = treeOfCategories;


			for (var i = 0; i < listOfCategories.length; i++) {
				if (listOfCategories[i].urn === locals.params.category) {
					categoryId = listOfCategories[i]._id;
					categoryUrn = listOfCategories[i].urn;
					categoryTitle = listOfCategories[i].title;
				}
			}

			website.components.listOfArticles({
				Article: Article,
				categoryId: categoryId, 
				marked: marked,
				session: locals.session,
				markdownRender: website.components.markdownRender,
				extendedFormatDate: website.components.extendedFormatDate,
				locals: locals
			}, function (listOfArticles) {
				if (typeof categoryId !== 'undefined') {
					locals.backend.articles = listOfArticles;
					locals.specific.breadcrumb.items[2].content = categoryTitle;
					locals.specific.breadcrumb.items[2].title = categoryTitle;
					locals.specific.titlePage = locals.specific.titlePage.replace(/%title%/g, categoryTitle);
					locals.specific.breadcrumb.items[2].href = locals.specific.breadcrumb.items[2].href.replace(/%urn%/g, categoryUrn);
					locals.specific.articles.title = locals.specific.articles.title.replace(/%title%/g, categoryTitle);
					locals.specific.description = locals.specific.description.replace(/%title%/g, categoryTitle);
				} else {
					locals.specific.breadcrumb.items[2].href = locals.specific.breadcrumb.items[2].href.replace(/%urn%/g, locals.params.category);
					locals.specific.articles.title = locals.specific.articles.titleNoCategory;
					locals.specific.description = locals.specific.articles.titleNoCategory;
				}

				next();
			});
		});
	};

}(website));

exports.changeVariations = website.changeVariations;