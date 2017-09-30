/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.listOfArticles = require('./modules/list-of-articles');
	website.components.markdownRender = require('./modules/markdown-render');
	website.components.extendedFormatDate = require('../assets/javascripts/components/extended-format-date');

	publics.changeVariations = function (next, locals, request) {
		var NA = this,
			mongoose = NA.modules.mongoose,
			marked = NA.modules.marked,
			Article = mongoose.model('article'),
			session = request.session;

		locals.backend = {};
		locals.session = session;

		if (locals.query.query) {
			website.components.listOfArticles({
				Article: Article,
				search: locals.query.query,
				marked: marked,
				session: locals.session,
				markdownRender: website.components.markdownRender,
				extendedFormatDate: website.components.extendedFormatDate,
				locals: locals
			}, function (listOfArticles) {
				var nbrArticle = listOfArticles.length,
					add = (nbrArticle > 1) ? 's' : '';

				if (nbrArticle > 0) {
					locals.backend.articles = listOfArticles;
					locals.specific.breadcrumb.items[2].content = locals.query.query;
					locals.specific.breadcrumb.items[2].title = locals.query.query;
					locals.specific.breadcrumb.items[2].href = locals.specific.breadcrumb.items[2].href.replace(/%search%/g, locals.query.query.replace(/ /g, '+'));
					locals.specific.articles.title = locals.specific.articles.title.replace(/%search%/g, locals.query.query).replace(/%nbr%/g, nbrArticle).replace(/%moreOne%/g, add);
					locals.specific.description = locals.specific.articles.title;
					locals.specific.titlePage = locals.specific.articles.title;
				} else {
					locals.specific.breadcrumb.items[2].href = locals.specific.breadcrumb.items[2].href.replace(/%search%/g, locals.query.query.replace(/ /g, '+'));
					locals.specific.articles.title = locals.specific.articles.titleNoSearch;
					locals.specific.articles.noArticle = locals.specific.articles.noArticle.replace(/%search%/g, locals.query.query);
					locals.specific.description = locals.specific.articles.noArticle;
					locals.specific.titlePage = locals.specific.articles.titleNoSearch;
				}

				next();
			});
		} else {
			locals.specific.breadcrumb.items.splice(2, 1);
			next();
		}
	};

}(website));

exports.changeVariations = website.changeVariations;