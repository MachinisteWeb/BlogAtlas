var website = website || {};

website.module = website.module || {};

website.module.extendedFormatDate = function (date, variation) {
	var format = {},
		minute = date.getMinutes(),
		hour = date.getHours(),
		day = date.getDate(),
		month = date.getMonth() + 1,
		fullMonth = variation.months[date.getMonth()],
		fullYear = date.getFullYear();

	minute = ((minute.toString().length > 1) ? '' : '0') + minute;
	hour = ((hour.toString().length > 1) ? '' : '0') + hour;
	day = ((day.toString().length > 1) ? '' : '0') + day;
	month = ((month.toString().length > 1) ? '' : '0') + month;

	format.string = 
		variation.toDate + " " +
		day + " " +
		fullMonth + " " +
		fullYear + " " +
		variation.toHour + " " +
		hour +
		variation.unitHours +
		minute;

	format.time = 
		fullYear + "-" + month + "-" + day + "T" + hour + ":" + minute + ":00.000";

	return format;
};

if (typeof module === 'object') {
	module.exports = website.module.extendedFormatDate;
}