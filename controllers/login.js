var website = {};

website.login = {};

// PreRender
(function (publics) {
	"use strict";

	var privates = {};

	publics.preRender = function (params, mainCallback) {
		var variation = params.variation,
			sessionID = params.request.sessionID,
			session = params.request.session;

		/*console.log("preRender");
		console.log(sessionID);
		console.log(session);*/

		/*if (session.account) {
			console.log("Loggué !");
		} else {
			console.log("Non loggué !");
		}*/

		variation.session = session;

		mainCallback(variation);
	};

}(website.login));

// Asynchrone
(function (publics) {
	"use strict";

	var privates = {};

	publics.asynchrone = function (params) {
		var io = params.io,
			NA = params.NA;

		io.sockets.on('connection', function (socket) {
			var sessionID = socket.handshake.sessionID,
				session = socket.handshake.session;

			/*console.log("Socket");
			console.log(sessionID);
			console.log(session);*/

			socket.on('account-login', function (data) {
				var dataResponse = {};

				/*console.log("Event");
				console.log(sessionID);
				console.log(session);*/
				if (!session.account) {
					if (data.email === NA.webconfig._emailAccountAuth &&
						data.password === NA.webconfig._passwordAccountAuth)
					{					
						session.account = {};
						session.touch().save();

						dataResponse.authSuccess = true;
					} else {
						dataResponse.authSuccess = false;
					}

					socket.emit('account-login', dataResponse);
				}
			});

			socket.on('account-logout', function (data) {
				if (session.account) {
					session.account = undefined;
					session.touch().save();

					socket.emit('account-logout', data);
				}
			});
  		});
	};

}(website.login));

exports.preRender = website.login.preRender;
exports.asynchrone = website.login.asynchrone;