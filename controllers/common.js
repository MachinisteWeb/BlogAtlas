var website = {};

// Loading modules for this website.
(function (publics) {
	"use strict";

	var privates = {};

	publics.loadModules = function (NA) {
		var modulePath = (NA.webconfig._needModulePath) ? NA.nodeModulesPath : '';
		
		NA.modules.cookie = require(modulePath + 'cookie');
		NA.modules.marked = require(modulePath + 'marked');
		NA.modules.mongoose = require(modulePath + 'mongoose');
		NA.modules.io = require(modulePath + 'socket.io');
		NA.modules.RedisStore = require(modulePath + 'connect-redis');
		NA.modules.rss = require(modulePath + 'rss');
		NA.modules.common = require(NA.websitePhysicalPath + NA.webconfig.variationsRelativePath + 'common.json');

		NA.modules.ejs = privates.setFilters(NA.modules.ejs, NA);

		return NA;
	};

	privates.setFilters = function (templateEngine, NA) {
		templateEngine.filters.et = templateEngine.filters.editText = function (obj, arr) {
			var markup = "span",
        		file,
        		claimSource = " ";

        	if (typeof obj === 'string') {
	        	if (arr[0].split(".")[0] === "specific") {
	        		file = arr[1];
	        	} else {
	        		file = NA.webconfig.commonVariation;
	        	}
        	} else {
        		file = arr[1];
        		obj = publics.getLookup(obj, arr[0]);
        		if (file === NA.webconfig.commonVariation) {
        			arr[0] = 'common.' + arr[0];
        		} else {
        			arr[0] = 'specific.' + arr[0];
        		}
        	}

        	if (!obj) { obj = " "; }

        	//if (arr[2]) { markup = "div"; }
        	
        	if (arr[2]) {
    			claimSource = ' data-edit-source="' + arr[2] + '" ';
        	}

            if (arr[1]) {
                return '<' + markup + claimSource + 'data-edit="true" data-edit-type="text" data-edit-file="' + file + '" data-edit-path="' + arr[0] + '">' +  obj + "</" + markup + ">";
            } else {
                return '<' + markup + ' data-edit-path="' + arr[0] + '">' +  obj + "</" + markup + ">";
            }
        };

        templateEngine.filters.eh = templateEngine.filters.editHtml = function (obj, arr) {
        	var markup = "div",
        		file,
        		claimSource = " ";

        	if (typeof obj === 'string') {
	        	if (arr[0].split(".")[0] === "specific") {
	        		file = arr[1];
	        	} else {
	        		file = NA.webconfig.commonVariation;
	        	}
        	} else {
        		file = arr[1];
        		obj = publics.getLookup(obj, arr[0]);
        		if (file === NA.webconfig.commonVariation) {
        			arr[0] = 'common.' + arr[0];
        		} else {
        			arr[0] = 'specific.' + arr[0];
        		}
        	}

        	if (!obj) { obj = " "; }

        	//if (arr[2]) { markup = "span"; }

        	if (arr[2]) {
    			claimSource = ' data-edit-source="' + arr[2] + '" ';
        	}

            if (arr[1]) {
                return '<' + markup + claimSource  + ' data-edit="true" data-edit-type="html" data-edit-file="' + file + '" data-edit-path="' + arr[0] + '">' +  obj + "</" + markup + ">";
            } else {
                return '<' + markup + ' data-edit-path="' + arr[0] + '">' +  obj + "</" + markup + ">";
            }
        };

        templateEngine.filters.ea = templateEngine.filters.editAttr = function (obj, arr) {
        	var file,
        		claimSource = " ";

        	if (typeof obj === 'string') {
	        	if (arr[0].split(".")[0] === "specific") {
	        		file = arr[1];
	        	} else {
	        		file = NA.webconfig.commonVariation;
	        	}
        	} else {
        		file = arr[1];
        		obj = publics.getLookup(obj, arr[0]);
        		if (file === NA.webconfig.commonVariation) {
        			arr[0] = 'common.' + arr[0];
        		} else {
        			arr[0] = 'specific.' + arr[0];
        		}
        	}

        	if (!obj) { obj = " "; }

        	if (arr[3]) {
    			claimSource = ' data-edit-attr-source-' + arr[2] + '="' + arr[3] + '" ';
        	}

            if (arr[1]) {
                return obj + '" data-edit="true"' + claimSource + 'data-edit-attr="true" data-edit-attr-name-' + arr[2] + '="true" data-edit-attr-path-' + arr[2] + '="' + arr[0] + '" data-edit-attr-file-' + arr[2] + '="' + file;
            } else {
                return obj + '" data-edit-attr-path-' + arr[2] + '="' + arr[0];
            }
        };

		return templateEngine;
	};

}(website));



// Asynchrone
(function (publics) {
	"use strict";

	var privates = {};

	privates.setLookup = function (obj, key, val) {
		var fields,
			type = typeof key,
			result = obj;

		if (type == 'string' || type == "number") {
			fields = ("" + key).replace(/\[(.*?)\]/, function (m, key) {
				return '.' + key;
			}).split('.');
		}

	  	for (var i = 0, n = fields.length; i < n && result !== undefined; i++) {
	    	var field = fields[i];

	    	if (i === n - 1) {
  				result[field] = val;
	    	} else {
	      		if (typeof result[field] === 'undefined' || !((typeof result[field] == "object") && (result[field] !== null))) {
	        		result[field] = {};
	      		}
	      		result = result[field];
	    	}
	  	}
	};

	publics.getLookup = function (obj, key) {
		var type = typeof key;

		if (type == 'string' || type == "number") {
			key = ("" + key).replace(/\[(.*?)\]/, function (m, key) {
				return '.' + key;
			}).split('.');
		}
		for (var i = 0, l = key.length, currentkey; i < l; i++) {
		 	if (obj.hasOwnProperty(key[i])) {
		 		obj = obj[key[i]];
		 	} else { 
		 		return undefined;
	 		}
		}

		return obj;
	};

	privates.orderByFile = function (options) {
		var files = {},
			next;

		for (var i = 0, l = options.length; i < l; i++) {
			next = false;
			for (var file in files) {
				if (file === options[i].file) {
					files[options[i].file].push(options[i]);
					next = true;
				}
			}
			if (!next) {
				files[options[i].file] = [];
				files[options[i].file].push(options[i]);
			}
		}

		return files;
	};

	publics.asynchrone = function (params) {
		var io = params.io,
			NA = params.NA,
			fs = NA.modules.fs;

		io.sockets.on('connection', function (socket) {
			var sessionID = socket.request.sessionID,
				session = socket.request.session;

			socket.on('update-variation', function (options) {
				var files, object, key;

				if (session.account) {
					files = privates.orderByFile(options);
					
					for (var file in files) {
						try {
							object = require(NA.websitePhysicalPath + NA.webconfig.variationsRelativePath + file);
							if (object) {
								for (var i = 0, l = files[file].length; i < l; i++) {
									key = files[file][i].path.split('.').slice(1).join('.');

									if (publics.getLookup(object, key) || publics.getLookup(object, key) === "") {
										privates.setLookup(object, key, files[file][i].value);

										if (!files[file][i].source || typeof files[file][i].source === 'string') {
											socket.broadcast.emit('update-variation', {
												path: files[file][i].path,
												value: files[file][i].value,
												source: files[file][i].source,
												type: files[file][i].type,
												attrName: files[file][i].attrName
											});
										}
									}
								}
							}
							fs.writeFileSync(NA.websitePhysicalPath + NA.webconfig.variationsRelativePath + file, JSON.stringify(object, undefined, "    "));
						} catch (exception) {
							console.log(exception);
						}
					}	
				}
			});

			socket.on('source-variation', function (options) {
				var object, key;

				if (session.account) {
					try {
						object = require(NA.websitePhysicalPath + NA.webconfig.variationsRelativePath + options.file);
						if (object) {
							key = options.path.split('.').slice(1).join('.');

							socket.emit('source-variation', {
								value: publics.getLookup(object, key),
								path: options.path
							});
						}
					} catch (exception) {
						console.log(exception);
					}	
				}
			});

			socket.on('update-comment-number', function (options) {
				var http = require('http'),
					request;

				request = http.request(options, function (response) {
				    var data = '';

				    response.on('data', function (chunk) {
				        data += chunk;
				    });

				    response.on('end', function () {
				    	var interestingPart = data.match(/\"counts\":\[(.+)\]/g),
				    		json;

				    	if (interestingPart && interestingPart[0]) {
							json = JSON.parse("{" + interestingPart[0] + "}");
				        	socket.emit('update-comment-number', json);
				    	}
				    });
				});

				request.on('error', function (e) {
				    console.log(e.message);
				});

				request.end();
			});

		});
	};

}(website));



// Set configuration for this website.
(function (publics) {
	"use strict";

	var privates = {};

	publics.setSessions = function (NA, callback) {
        var session = NA.modules.session,
        	RedisStore = NA.modules.RedisStore(session);
        
        NA.sessionStore = new RedisStore();

		callback(NA);
	};	

	publics.setConfigurations = function (NA, callback) {
		var mongoose = NA.modules.mongoose,
			io = NA.modules.io;

		privates.mongooseInitialization(mongoose, function (mongoose) {

			privates.mongooseShemas(mongoose);

			privates.socketIoInitialisation(io, NA, function (io) {

				privates.socketIoEvents(io, NA);

				callback(NA);					
			});
		});

	};			

	privates.socketIoInitialisation = function (io, NA, callback) {
		var optionIo = (NA.webconfig.urlRelativeSubPath) ? { path: '/' + NA.webconfig.urlRelativeSubPath + '/socket.io' } : undefined,
			io = io(NA.server, optionIo),
			cookie = NA.modules.cookie,
			cookieParser = NA.modules.cookieParser;

		console.log(optionIo);

		io.use(function(socket, next) {
			var handshakeData = socket.request;

			if (!handshakeData.headers.cookie) {
                return next(new Error('Cookie de session requis.'));
            }

            handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
            handshakeData.cookie = cookieParser.signedCookies(handshakeData.cookie, NA.webconfig.session.secret);
    		handshakeData.sessionID = handshakeData.cookie[NA.webconfig.session.key];

			NA.sessionStore.load(handshakeData.sessionID, function (error, session) {
                if (error || !session) {
                	return next(new Error('Aucune session récupérée.'));
                } else {
                    handshakeData.session = session;           			
                    next();
                }
            });
		});

    	callback(io);
	};

	privates.mongooseInitialization = function (mongoose, callback) {
		var mongoDbAddress = 'mongodb://127.0.0.1:27017/blog';
		mongoose.connect(mongoDbAddress, function (error) {
  			if (error) {
				console.log("La base '" + mongoDbAddress + "' n'est pas accessible.");
				process.kill(process.pid);
  			};

  			callback(mongoose);
		});
		
		mongoose.connection.on('error', function (error) {
	  		console.log('Erreur pour la connexion par défaut à Mongoose: ' + error);
		});

		mongoose.connection.on('disconnected', function () {
			console.log('Connexion par défaut à Mongoose déconnectée.');
		});

		process.on('SIGINT', function (error) {
			mongoose.connection.close(function () {
				console.log('Connexion par défaut à Mongoose déconnectée en raison de l\'arrêt de l\'app termination');
				process.exit(0);
			});
		});
	};

	privates.socketIoEvents = function (io, NA) {
		var params = {};

		params.io = io;
		params.NA = NA;

		website.asynchrone(params);
		require('./article').asynchrone(params);
		require('./login').asynchrone(params);
	};

	privates.mongooseShemas = function (mongoose) {
		publics.shemas = {};

		publics.shemas.article = require('../models/Article');
		publics.shemas.category = require('../models/Category');

		mongoose.model('article', website.shemas.article, 'article');
		mongoose.model('category', website.shemas.category, 'category');
	};

}(website));

// PreRender
(function (publics) {
	"use strict";

	publics.preRender = function (params, mainCallback) {
		var variation = params.variation,
			session = params.request.session;

		variation.edit = false;
		variation.fs = false;
		variation.fc = false;
		if (session.account) {
			variation.edit = variation.pageParameters.variation;
			variation.fs = variation.edit;
			variation.fc = variation.webconfig.commonVariation;
		}

		// Ici on modifie les variables de variations.
		//console.log(params.variation);

		mainCallback(variation);
	};

}(website));

// Render
(function (publics) {
	"use strict";

	publics.render = function (params, mainCallback) {
		var data = params.data;

		// Ici on peut manipuler le DOM côté serveur avant retour client.
		//console.log(params.data);

		mainCallback(data);
	};

}(website));


exports.loadModules = website.loadModules;
exports.setSessions = website.setSessions;
exports.setConfigurations = website.setConfigurations;
exports.preRender = website.preRender;
exports.render = website.render;