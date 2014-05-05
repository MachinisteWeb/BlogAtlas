var website = {};

website.article = {};

// PreRender
(function (publics) {
	"use strict";
	
	var privates = {};

	publics.oneArticle = require('../components/controllers/article');
	publics.markdownRender = require('../components/controllers/markdown-render');
	privates.extendedFormatDate = require('../assets/javascript/components/extended-format-date');

	publics.preRender = function (params, mainCallback) {
		var variation = params.variation,
			mongoose = params.NA.modules.mongoose,
			marked = params.NA.modules.marked,
			Article = mongoose.model('article'),
			sessionID = params.request.sessionID,
			session = params.request.session;

		variation.backend = {};
		variation.session = session;

		/*console.log(variation.params);
		console.log(variation.params[0]);*/

		/*if (variation.params && variation.params[0]) { variation.params.urn = variation.params[0]; }*/

		website.article.oneArticle(Article, variation.params.urn, function (oneArticle) {
			var title;

			if (oneArticle) {
				title = oneArticle.title.replace(/<\/?span>/g, '');

				variation.specific.titlePage = variation.specific.titlePage = title;
				variation.specific.breadcrumb.items[1].content = title;
				variation.specific.breadcrumb.items[1].title = title;

				if (oneArticle.others && oneArticle.others.markdown) {
					oneArticle.content = website.article.markdownRender(oneArticle.content, marked);
				}

				oneArticle.dates.format = privates.extendedFormatDate(oneArticle.dates.published, variation.common.dates);

				variation.backend.article = oneArticle;

				variation.pageParameters.statusCode = 200;

				if (!session.account && !oneArticle.others.published) {
					variation.backend.article = undefined;
					variation.pageParameters.statusCode = 404;
				}
			} else {
				variation.pageParameters.statusCode = 404;
			}
			
			variation.specific.breadcrumb.items[1].href = variation.specific.breadcrumb.items[1].href.replace(/%urn%/g, variation.params.urn);

			mainCallback(variation);
		});

	};

}(website.article));



// Asynchrone
(function (publics) {
	"use strict";

	var privates = {};

	publics.asynchrone = function (params) {
		var io = params.io,
			mongoose = params.NA.modules.mongoose,
			common = params.NA.modules.common,
			marked = params.NA.modules.marked,
			Article = mongoose.model('article'),
			renderer = new marked.Renderer();

		io.sockets.on('connection', function (socket) {
			var sessionID = socket.handshake.sessionID,
				session = socket.handshake.session;

			socket.on('update-article-button', function (data) {
				if (session.account) {
					Article.update({ 
						urn: data.urn 
					}, { 
						$set: {
							title: data.title,
							content: data.content,
							'dates.published': new Date(data.publishedDate),
							'dates.updated': [],
							'others.markdown': data.markdown,
							'others.published': data.published
						}
					}, function (error, numberAffected, raw) {
						if (error) { throw error; }
					});

					if (data.markdown) {
						data.content = website.article.markdownRender(data.content, marked);
					}

					socket.emit('update-article-button');
					socket.broadcast.emit('update-article-button-others', {
						published: data.published
					});
					io.sockets.emit('update-article-button-all', {
						title: data.title,
						content: data.content,
						markdown: data.markdown,
						published: data.published,
						publishedDate: data.publishedDate,
						variation: common
					});
				}
			});

			socket.on('update-article-load-content', function (data) {
				if (session.account) {
					website.article.oneArticle(Article, data.urn, function (oneArticle) {
						socket.emit('update-article-load-content', {
							content: oneArticle.content
						});
					});
				}
			});

			socket.on('create-article-button', function (data) {
				var article = new Article({
					_id: mongoose.Types.ObjectId(),
					title: data.title,
					urn: data.urn,
					'dates.updated': [],
					'others.markdown': false,
					'cache.comment.number': 0,
					'others.published': false
				});

				if (session.account) {
					article.save(function (error) {
						if (error) { 
							throw error;
						}

						io.sockets.emit('create-article-button', data);
					});
				}
			});

			socket.on('delete-article-button', function (data) {
				if (session.account) {
					Article.find({ urn: data.urn }).remove(function (error, documents) {
						if (error) { 
							throw error;
						}

						io.sockets.emit('delete-article-button', data);
					});
				}
			});
  		});
	};

}(website.article));

exports.preRender = website.article.preRender;
exports.asynchrone = website.article.asynchrone;