var website = {};

website.index = {};

// PreRender
(function (publics) {
	"use strict";

	var privates = {};

	privates.listOfArticles = require('../components/controllers/list-of-articles');
	privates.markdownRender = require('../components/controllers/markdown-render');

	publics.preRender = function (params, mainCallback) {
		var variation = params.variation,
			mongoose = params.NA.modules.mongoose,
			marked = params.NA.modules.marked,
			Article = mongoose.model('article');

		variation.backend = {};

		privates.listOfArticles({ 
			Article: Article, 
			marked: marked,
			markdownRender: privates.markdownRender,
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