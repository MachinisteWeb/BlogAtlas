var website = {};

(function (publics) {
    "use strict";

    publics.setLookup = function (obj, key, val) {
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

    publics.orderByFile = function (options) {
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

    publics.setFilters = function (templateEngine, NA) {
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
        		obj = website.getLookup(obj, arr[0]);
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
        		obj = website.getLookup(obj, arr[0]);
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
        		obj = website.getLookup(obj, arr[0]);
        		if (file === NA.webconfig.commonVariation) {
        			arr[0] = 'common.' + arr[0];
        		} else {
        			arr[0] = 'specific.' + arr[0];
        		}
        	}

        	if (!obj) { obj = ""; }

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

    publics.sockets = function (socket, NA, auth) {
        var fs = NA.modules.fs;

        socket.on('update-variation', function (options) {
            var files, object, key;

            if (auth) {
                files = publics.orderByFile(options);
                
                for (var file in files) {
                    try {
                        object = require(NA.websitePhysicalPath + NA.webconfig.variationsRelativePath + file);
                        if (object) {
                            for (var i = 0, l = files[file].length; i < l; i++) {
                                key = files[file][i].path.split('.').slice(1).join('.');

                                if (publics.getLookup(object, key) || publics.getLookup(object, key) === "") {
                                    publics.setLookup(object, key, String(files[file][i].value).toString());

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

            if (auth) {
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
    };
}(website));

exports.setFilters = website.setFilters;
exports.sockets = website.sockets;