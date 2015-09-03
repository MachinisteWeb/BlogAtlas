/* jslint node: true */
module.exports = function oneArticle(Article, urn, callback) {
	Article
	.findOne({ urn: urn })
	.populate('categories')
	.exec(function (error, result) {
		if (error) {
			throw error;
		}

		callback(result);
	});
};