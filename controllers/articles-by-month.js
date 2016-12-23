/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.treeOfDates = require('./modules/tree-of-dates');
	website.components.listOfArticles = require('./modules/list-of-articles');
	website.components.markdownRender = require('./modules/markdown-render');
	website.components.extendedFormatDate = require('../assets/javascript/components/extended-format-date');

	publics.changeVariations = function (next, locals, request) {
		var NA = this,
			mongoose = NA.modules.mongoose,
			marked = NA.modules.marked,
			Article = mongoose.model('article'),
			/*sessionID = params.request.sessionID,*/
			session = request.session;

		locals.backend = {};
		locals.session = session;

		website.components.treeOfDates(locals, function (treeOfDates) {

			locals.backend.archives = treeOfDates;

			website.components.listOfArticles({
				Article: Article,
				date: {
					year: locals.params.year,
					month: locals.params.month
				},
				marked: marked,
				session: locals.session,
				markdownRender: website.components.markdownRender,
				extendedFormatDate: website.components.extendedFormatDate,
				locals: locals
			}, function (listOfArticles) {

				locals.backend.articles = listOfArticles;

				locals.specific.titlePage = locals.specific.titlePage.replace(/%year%/g, locals.params.year).replace(/%month%/g, locals.params.month);
				locals.specific.articles.title = locals.specific.articles.title.replace(/%year%/g, locals.params.year).replace(/%month%/g, locals.common.dates.months[locals.params.month - 1]);
				locals.specific.description = locals.specific.description.replace(/%year%/g, locals.params.year).replace(/%month%/g, locals.common.dates.months[locals.params.month - 1]);
				locals.specific.breadcrumb.items[2].content = locals.params.year;
				locals.specific.breadcrumb.items[2].title = locals.params.year;
				locals.specific.breadcrumb.items[2].href = locals.specific.breadcrumb.items[2].href.replace(/%year%/g, locals.params.year);
				locals.specific.breadcrumb.items[3].content = locals.common.dates.months[locals.params.month - 1];
				locals.specific.breadcrumb.items[3].title = locals.common.dates.months[locals.params.month - 1];
				locals.specific.breadcrumb.items[3].href = locals.specific.breadcrumb.items[2].href.replace(/%month%/g, locals.params.month);

				next();

			});
		});
	};

}(website));

exports.changeVariations = website.changeVariations;