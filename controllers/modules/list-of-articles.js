/* jslint node: true */
module.exports = function listOfArticles(params, callback) {
	var categoryId = params.categoryId,
		marked = params.marked,
		session = params.session,
		markdownRender = params.markdownRender,
		extendedFormatDate = params.extendedFormatDate,
		Article = params.Article,
		date = params.date,
		locals = params.locals,
		query = {},
	    min,
	    max,
	    minYear,
	    maxYear,
	    minMonth,
	    maxMonth;

	if (typeof date !== 'undefined' &&
		typeof date.year !== 'undefined')
	{

		minMonth = 0;
		maxMonth = 0;
		minYear = date.year;
		maxYear = parseInt(date.year, 10) + 1;

		if (typeof date.month !== 'undefined') {
			minMonth = parseInt(date.month, 10) - 1;
			maxMonth = minMonth + 1;
			maxYear = minYear;
		}

		min = new Date(minYear, minMonth, 1);
		max = new Date(maxYear, maxMonth, 1);

		query = {
			'dates.published': {
				$gte: min,
				$lt: max
			}
		};
	}

	Article
	.find(query)
	.sort({ 'dates.published': -1 })
	.populate('categories')
	.exec(function (error, temp) {
		var results = [],
			hasCategory = false;

		if (error) {
			throw error;
		}

		for (var i = 0; i < temp.length; i++) {
			hasCategory = false;

			// Filter by articles.
			if (typeof categoryId !== 'undefined' && temp[i].categories !== null) {
				for (var j = 0; j < temp[i].categories.length; j++) {
					if (temp[i].categories[j]._id + '' === categoryId + '') {
						hasCategory = true;
						break;
					}
				}
			}

			// Maybe no filter, depend of preceding matching.
			if (typeof categoryId === 'undefined' || hasCategory) {

				if (temp[i].others && temp[i].others.markdown) {
					temp[i].content = markdownRender(temp[i].content, marked);
				}

				if (temp[i].content) {
					temp[i].content = temp[i].content.substring(0, temp[i].content.indexOf('<h2'));
				}
				temp[i].dates.format = extendedFormatDate(temp[i].dates.published, locals.common.dates);

				if (temp[i].others.published || session.account) {
					results.push(temp[i]);
				}
			}
		}

		callback(results);
	});
};