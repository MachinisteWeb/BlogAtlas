var website = {};

website.components = {};

(function (publics) {
	"use strict";

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

		website.components.listOfArticles({ 
			Article: Article, 
			marked: marked,
			markdownRender: website.components.markdownRender,
			session: variation.session,
			extendedFormatDate: website.components.extendedFormatDate,
			variation: variation
		}, function (listOfArticles) {

			variation.backend.articles = listOfArticles;

			mainCallback(variation);
		});
	};

}(website));

exports.preRender = website.preRender;