/* jslint node: true */
module.exports = function treeOfCategories(Category, callback) {
	Category
	.find()
	.sort({ type: 'asc', urn: 'asc' })
	.exec(function (error, results) {
		if (error) {
			throw error;
		}

		function createLeaf(depth, outputs) {
			outputs.categories = [];

			for (var i = 0; i < results.length; i++) {
				if (results[i].type === depth) {
					if (outputs._id + '' === results[i].parent + '' || depth === 0) {
						results[i].categories = createLeaf(depth + 1, results[i]);
						outputs.categories.push(results[i]);
					}
				}
			}

			return outputs.categories;
		}

		callback(createLeaf(0, {}), results);
	});
};