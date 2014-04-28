module.exports = function listOfArticles(params, callback) {
	var categoryId = params.categoryId,
		marked = params.marked,
		markdownRender = params.markdownRender,
		Article = params.Article,
		date = params.date,
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
		maxYear = parseInt(date.year, 10) + 1

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
		}
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
				};
			}

			// Maybe no filter, depend of preceding matching.
			if (typeof categoryId === 'undefined' || hasCategory) {
				
				if (temp[i].others && temp[i].others.markdown) {
					temp[i].content = markdownRender(temp[i].content, marked);
				}

				temp[i].content = temp[i].content.substring(0, temp[i].content.indexOf('<h2'));

				//console.log(temp[i].dates.published)

				results.push(temp[i]);
			}
		}

		//console.log("================");

		//console.log(min);
		//console.log(max);

		callback(results);
	});
};