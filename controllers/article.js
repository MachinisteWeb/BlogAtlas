/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.oneArticle = require('./modules/article');
	website.components.markdownRender = require('./modules/markdown-render');
	website.components.extendedFormatDate = require('../assets/javascript/components/extended-format-date');

	publics.changeVariations = function (params, mainCallback) {
		var NA = this,
			variations = params.variations,
			mongoose = NA.modules.mongoose,
			marked = NA.modules.marked,
			Article = mongoose.model('article'),
			/*sessionID = params.request.sessionID,*/
			session = params.request.session;

		variations.backend = {};
		variations.session = session;

		//console.log(variations.params);
		//console.log(variations.params[0]);

		if (variations.params && variations.params[0]) { variations.params.urn = variations.params[0]; }

		website.components.oneArticle(Article, variations.params.urn, function (oneArticle) {
			var title;

			if (oneArticle) {
				title = oneArticle.title.replace(/<\/?span>/g, '');

				variations.specific.titlePage = variations.specific.titlePage = title;
				variations.specific.description = title;
				variations.specific.breadcrumb.items[1].content = title;
				variations.specific.breadcrumb.items[1].title = title;

				if (oneArticle.others && oneArticle.others.markdown) {
					oneArticle.content = website.components.markdownRender(oneArticle.content, marked);
				}

				oneArticle.dates.format = website.components.extendedFormatDate(oneArticle.dates.published, variations.common.dates);

				variations.backend.article = oneArticle;

				variations.routeParameters.statusCode = 200;

				if (!session.account && !oneArticle.others.published) {
					variations.backend.article = undefined;
					variations.routeParameters.statusCode = 404;
				}
			} else {
				variations.routeParameters.statusCode = 404;
			}

			variations.specific.breadcrumb.items[1].href = variations.specific.breadcrumb.items[1].href.replace(/%urn%/g, variations.params.urn);

			mainCallback(variations);
		});

	};

	publics.setSockets = function () {
		var NA = this,
			io = NA.io,
			fs = require('fs'),
			mongoose = NA.modules.mongoose,
			common = NA.modules.common,
			marked = NA.modules.marked,
			Article = mongoose.model('article'),
			Category = mongoose.model('category'),
			Rss = NA.modules.rss;

		io.sockets.on('connection', function (socket) {
			var /*sessionID = socket.request.sessionID,*/
				session = socket.request.session;

			function rss() {
				var feed,
					feedHeader;

				feedHeader = {
					title: common.rss.title,
					description: common.rss.description,
					feed_url: NA.webconfig.urlWithoutFileName + common.rss.feedUrl.replace(/^\//g, ""),
					site_url: NA.webconfig.urlWithoutFileName,
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
						    url: NA.webconfig.urlWithoutFileName + common.rss.url.replace(/%urn%/g, articles[i].urn),
						    guid: articles[i]._id.toString(),
						    categories: categories,
						    author: common.rss.author,
						    date: articles[i].dates.published
						};

						feed.item(item);
					}

					fs.writeFile(NA.serverPath + NA.webconfig.assetsRelativePath + common.rss.feedUrl, feed.xml("    "));
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
					}, function (error/*, numberAffected, raw*/) {
						if (error) { throw error; }

						function categoryFindOne (i) {
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
								}, function (error/*, numberAffected, raw*/) {
									if (error) { throw error; }
								});
							});
						}

						for (var i = 0; i < data.categories.length; i++) {
							categoryFindOne(i);
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
					io.sockets.emit('update-article-button-all', {
						title: data.title,
						content: data.content,
						markdown: data.markdown,
						script: data.script,
						stylesheet: data.stylesheet,
						published: data.published,
						publishedDate: data.publishedDate,
						variation: common,
						permalink: data.permalink
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

}(website));

exports.setSockets = website.setSockets;
exports.changeVariations = website.changeVariations;
exports.asynchrones = website.asynchrones;