var mongoose = require('mongoose'),
	categorySchema = new mongoose.Schema({
		_id: mongoose.Schema.Types.ObjectId,
		title: String,
		type: Number,
		urn: { type : String, match: /^[a-zA-Z0-9-_]+$/ },
		dates : {
			published: { type : Date, default : Date.now },
			updated: [ { type : Date, default : Date.now } ]
		},
		parent: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
		categories: [ { type: mongoose.Schema.Types.Mixed, ref: 'category' } ],
		articles: [ { type: mongoose.Schema.Types.ObjectId, ref: 'article' } ],
		cache: {
			article: {
				number: { type : Number, min : 0 }
			}
		}
	});

module.exports = categorySchema;