function padTwoDigits (num) {
	num = num.toString();
	while (num.length < 2) {
		num = "0" + num;
	}

	return num;
}


module.exports = function (time) {
	const sentMonth = time.getMonth() + 1;
	const sentDate = time.getDate();
	const sentYear = time.getFullYear();
	const sentHour = time.getHours();
	const sentMinute = time.getMinutes();

	const now = new Date(Date.now());
	const currentMonth = now.getMonth() + 1;
	const currentDate = now.getDate();
	const currentYear = now.getFullYear();

	if(sentMonth == currentMonth && sentDate == currentDate && sentYear == currentYear) {
		return `Today at ${padTwoDigits(sentHour)}:${padTwoDigits(sentMinute)}`;
	}
	else if(sentMonth == currentMonth && sentDate == currentDate - 1 && sentYear == currentYear) {
		return `Yesterday at ${padTwoDigits(sentHour)}:${padTwoDigits(sentMinute)}`;
	}
	else {
		return `${padTwoDigits(sentMonth)}/${padTwoDigits(sentDate)}/${sentYear}`;
	}
}
