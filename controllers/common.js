/* jslint node: true */
var website = {};

website.components = {};

(function (publics) {
	"use strict";

	website.components.mongoose = require('./modules/mongoose');

	publics.setModules = function () {
		var NA = this,
			path = NA.modules.path;

		NA.modules.marked = require('marked');
		NA.modules.mongoose = require('mongoose');
		NA.modules.RedisStore = require('connect-redis');
		NA.modules.rss = require('rss');
		NA.modules.jshashes = require('jshashes');
		NA.modules.common = require(path.join(NA.serverPath, NA.webconfig.variationsRelativePath, 'common.json'));
	};

	publics.setConfigurations = function (next) {
		var NA = this,
			route = NA.webconfig.routes,
			mongoose = NA.modules.mongoose;

		NA.express.use(function (request, response, next) {
			response.setHeader("Content-Security-Policy", "frame-ancestors www.lesieur.name");
			next();
		});

		website.components.mongoose.initialisation(mongoose, 'mongodb://127.0.0.1:27017/blog', function () {
			next();
		});
	};

	publics.mongooseSchemas = function (mongoose) {
		publics.schemas = {};

		publics.schemas.article = require('../models/Article');
		publics.schemas.category = require('../models/Category');

		mongoose.model('article', website.schemas.article, 'article');
		mongoose.model('category', website.schemas.category, 'category');
	};

	publics.setSessions = function (next) {
		var NA = this,
			mongoose = NA.modules.mongoose,
			session = NA.modules.session,
			RedisStore = NA.modules.RedisStore(session);

		NA.sessionStore = new RedisStore();

		publics.mongooseSchemas(mongoose);

		next();
	};

	publics.changeVariations = function (next, locals, request) {
		var session = request.session;

		locals.edit = false;
		locals.fs = false;
		locals.fc = false;
		if (session.account) {
			locals.edit = locals.routeParameters.variation;
			locals.fs = locals.edit;
			locals.fc = locals.webconfig.commonVariation;
		}

		next();
	};

}(website));

exports.setSockets = website.setSockets;
exports.setModules = website.setModules;
exports.setSessions = website.setSessions;
exports.setConfigurations = website.setConfigurations;
exports.changeVariations = website.changeVariations;