/* jslint node: true */
var website = {};

(function (publics) {
    "use strict";

    publics.events = function (socketio, NA, asynchroneCallback) {
        var params = {};

        params.socketio = socketio;
        params.NA = NA;

        asynchroneCallback(params);
    };

    publics.initialisation = function (socketio, NA, callback) {
        var optionIo = (NA.webconfig.urlRelativeSubPath) ? { path: NA.webconfig.urlRelativeSubPath + '/socket.io', secure: ((NA.webconfig.httpSecure) ? true : false) } : undefined,
            socketio = socketio(NA.server, optionIo),
            cookie = NA.modules.cookie,
            cookieParser = NA.modules.cookieParser;

        socketio.use(function(socket, next) {
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

        callback(socketio, NA);
    };

}(website));

exports.initialisation = website.initialisation;
exports.events = website.events;