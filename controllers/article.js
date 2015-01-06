var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.oneArticle = require('../components/controllers/article');
	website.components.markdownRender = require('../components/controllers/markdown-render');
	website.components.extendedFormatDate = require('../assets/javascript/components/extended-format-date');

	publics.changeVariation = function (params, mainCallback) {
		var variation = params.variation,
			mongoose = params.NA.modules.mongoose,
			marked = params.NA.modules.marked,
			Article = mongoose.model('article'),
			sessionID = params.request.sessionID,
			session = params.request.session;

		variation.backend = {};
		variation.session = session;

		//console.log(variation.params);
		//console.log(variation.params[0]);

		if (variation.params && variation.params[0]) { variation.params.urn = variation.params[0]; }

		website.components.oneArticle(Article, variation.params.urn, function (oneArticle) {
			var title;

			if (oneArticle) {
				title = oneArticle.title.replace(/<\/?span>/g, '');

				variation.specific.titlePage = variation.specific.titlePage = title;
				variation.specific.description = title;
				variation.specific.breadcrumb.items[1].content = title;
				variation.specific.breadcrumb.items[1].title = title;

				if (oneArticle.others && oneArticle.others.markdown) {
					oneArticle.content = website.components.markdownRender(oneArticle.content, marked);
				}

				oneArticle.dates.format = website.components.extendedFormatDate(oneArticle.dates.published, variation.common.dates);

				variation.backend.article = oneArticle;

				variation.currentRouteParameters.statusCode = 200;

				if (!session.account && !oneArticle.others.published) {
					variation.backend.article = undefined;
					variation.currentRouteParameters.statusCode = 404;
				}
			} else {
				variation.currentRouteParameters.statusCode = 404;
			}
			
			variation.specific.breadcrumb.items[1].href = variation.specific.breadcrumb.items[1].href.replace(/%urn%/g, variation.params.urn);

			mainCallback(variation);
		});

	};

	publics.asynchrones = function (params) {
		var publics = {},
			socketio = params.socketio,
			fs = require('fs'),
			mongoose = params.NA.modules.mongoose,
			common = params.NA.modules.common,
			marked = params.NA.modules.marked,
			Article = mongoose.model('article'),
			Category = mongoose.model('category'),
			renderer = new marked.Renderer(),
			Rss = params.NA.modules.rss;

		socketio.sockets.on('connection', function (socket) {
			var sessionID = socket.request.sessionID,
				session = socket.request.session;

			function rss() {
				var feed,
					feedHeader;

				feedHeader = {
					title: common.rss.title,
					description: common.rss.description,
					feed_url: params.NA.webconfig.urlWithoutFileName + common.rss.feedUrl.replace(/^\//g, ""),
					site_url: params.NA.webconfig.urlWithoutFileName,
					author: common.rss.author,
					managingEditor: common.rss.author,
				    webMaster: common.rss.author,
				    copyright: common.rss.copyright + ' ' + common.rss.author,
				    language: common.rss.language,
				    pubDate: new Date(),
				    ttl: '60'
				};

				feed = new Rss(feedHeader);

				Article
				.find({
					'others.published': true
				})
				.sort({ 'dates.published': -1 })
				.limit(20)
				.populate('categories')
				.exec(function (error, articles) {
					var item,
						categories,
						content;

					for (var i = 0; i < articles.length; i++) {
						categories = []; 

						if (articles[i].categories) {
							for (var j = 0; j < articles[i].categories.length; j++) {
								categories.push(articles[i].categories[j].title);
							}
						}

						content = articles[i].content;
						if (articles[i].others && articles[i].others.markdown) {
							content = website.components.markdownRender(articles[i].content, marked);
						}

						item = {
						    title: articles[i].title,
						    description: content,
						    url: params.NA.webconfig.urlWithoutFileName + common.rss.url.replace(/%urn%/g, articles[i].urn),
						    guid: articles[i]._id.toString(),
						    categories: categories,
						    author: common.rss.author,
						    date: articles[i].dates.published
						}

						feed.item(item);
					}

					fs.writeFile(params.NA.websitePhysicalPath + params.NA.webconfig.assetsRelativePath + common.rss.feedUrl, feed.xml("    ")); 
				});
			}

			socket.on('update-article-button', function (data) {
				if (session.account) {

					Article.update({
						urn: data.urn 
					}, { 
						$set: {
							title: data.title,
							content: data.content,
							script: data.script,
							stylesheet: data.stylesheet,
							'dates.published': new Date(data.publishedDate),
							'dates.updated': [],
							'categories': [],
							'others.markdown': data.markdown,
							'others.published': data.published
						}
					}, function (error, numberAffected, raw) {
						if (error) { throw error; }

						for (var i = 0; i < data.categories.length; i++) {
							Category.findOne({
								urn: data.categories[i]
							}, function (error, document) {
						  		if (error) {
						  			throw error;
						  		}

								Article.update({ 
									urn: data.urn 
								}, { 
									$addToSet: {
										'categories': document._id	
									}
								}, function (error, numberAffected, raw) {
									if (error) { throw error; }
								});
							})
						}	
					});

					if (data.markdown) {
						data.content = website.components.markdownRender(data.content, marked);
					}

				 	rss();

					socket.emit('update-article-button');
					socket.broadcast.emit('update-article-button-others', {
						published: data.published
					});
					socketio.sockets.emit('update-article-button-all', {
						title: data.title,
						content: data.content,
						markdown: data.markdown,
						script: data.script,
						stylesheet: data.stylesheet,
						published: data.published,
						publishedDate: data.publishedDate,
						variation: common
					});
				}
			});

			socket.on('update-article-load-content', function (data) {
				if (session.account) {
					website.components.oneArticle(Article, data.urn, function (oneArticle) {

						Category
							.find()
							.sort({ 'urn': 1 })
							.exec(function (error, categories) {
								if (error) { 
									throw error;
								}

								socket.emit('update-article-load-content', {
									content: oneArticle.content,
									categories: categories
								});
							});
					});
				}
			});

			socket.on('create-article-button', function (data) {
				var article = new Article({
					_id: mongoose.Types.ObjectId(),
					title: data.title,
					content: "",
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

						socketio.sockets.emit('create-article-button', data);
					});
				}
			});

			socket.on('delete-article-button', function (data) {
				if (session.account) {
					Article.find({ urn: data.urn }).remove(function (error, documents) {
						if (error) { 
							throw error;
						}

						socketio.sockets.emit('delete-article-button', data);
					});
				}
			});
  		});
	};

}(website));

exports.changeVariation = website.changeVariation;
exports.asynchrones = website.asynchrones;