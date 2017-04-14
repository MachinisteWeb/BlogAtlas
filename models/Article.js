var mongoose = require('mongoose'),
	articleSchema = new mongoose.Schema({
		_id: mongoose.Schema.Types.ObjectId,
		title: String,
		description: String,
		image: String,
		script: String,
		stylesheet: String,
		urn: { type : String, match: /^[a-zA-Z0-9-_]+$/ },
		dates : {
			published: { type : Date, default : Date.now },
			format: { 
				string: String,
				time: String
			},
			updated: [ { type : Date, default : Date.now } ]
		},
		categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'category' }],
		content: String,
		cache: {
			comment: {
				number: { type : Number, min : 0 }
			}
		},
		others: {
			markdown: Boolean,
			published: Boolean
		}
	});

module.exports = articleSchema;