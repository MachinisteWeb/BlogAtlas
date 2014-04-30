var website = {};

website.index = {};

// PreRender
(function (publics) {
	"use strict";

	var privates = {};

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

		privates.listOfArticles({ 
			Article: Article, 
			marked: marked,
			markdownRender: privates.markdownRender,
			session: variation.session,
			extendedFormatDate: privates.extendedFormatDate,
			variation: variation
		}, function (listOfArticles) {

			variation.backend.articles = listOfArticles;

			mainCallback(variation);
		});
	};

}(website.index));

// Render
(function (publics) {
	"use strict";
	
	publics.render = function (params, mainCallback) {
		var data = params.data;

		// Ici on peut manipuler le DOM côté serveur avant retour client.
		//console.log(params.data);

		mainCallback(data);
	};

}(website.index));

exports.preRender = website.index.preRender;
exports.render = website.index.render;