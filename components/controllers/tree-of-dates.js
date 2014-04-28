module.exports = function treeOfDates(variation, callback) {
	var startingYear = variation.common.archives.startingYear,
		startingMonth = variation.common.archives.startingMonth,
		currentDate = new Date(),
		yearNumber = currentDate.getFullYear() - startingYear + 1,
		years = [],
		min,
		max,
		str,
		pad = "00";

	for (var i = 0; i < yearNumber; i++) {
		years[i] = {};
		years[i].year = currentDate.getFullYear() - i;
		years[i].months = [];

		min = (startingYear === years[i].year) ? startingMonth : 0;
		max = (currentDate.getFullYear() === years[i].year) ? currentDate.getMonth() + 1 : 12;

		for (var j = min; j < max; j++) {
			str = "" + parseInt(j + 1, 10);
			years[i].months.push( pad.substring(0, pad.length - str.length) + str );
		};
	};

	callback(years);
};