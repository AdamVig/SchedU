services.factory('DateFactory', function (dismissal) {

  /**
  * If day is a weekend, change date to next Monday
  * @param  {moment} day Moment object
  * @return {moment}     Moment object
  */
  function skipWeekend(day) {

    // Saturday
    if (day.weekday() == 6) {
      day.add(2, 'days');

      // Sunday
    } else if (day.weekday() == 0) {
      day.add(1, 'days');
    }

    return day;
  }

  return {

    /**
    * Gets today's date if not weekend, next
    * Monday's date if weekend; tomorrow's date if after
    * dismissal time
    * @return {moment object} Moment() of the current school
    *                         day's date
    */
    currentDay: function () {

      currentDay = moment();

      if (currentDay.isAfter(dismissal)) {
        currentDay.add(1, 'days');
      }

      currentDay = skipWeekend(currentDay);

      return currentDay;
    },

    /**
    * Return next non-weekend day after today
    * @return {moment object} Moment() of the next day's date
    */
    nextDay: function () {

      nextDay = moment().add(1, 'days');

      nextDay = skipWeekend(nextDay);

      return nextDay;
    },

    /**
    * Return previous day
    * @return {moment object} Moment() of the previous day's date
    */
    previousDay: function () {

      previousDay = moment().subtract(1, 'days');

      return previousDay;
    },

    /**
    * Format date into weekday and full date format,
    * ex: todaysDate = September 27; dayOfWeek = Wednesday
    * @param  {string} date Date in format MM-DD-YY
    * @return {object}      Object containing todaysDate and
    *                       dayOfWeek as strings
    */
    formatDate: function (date) {
      var todaysDate = date.format("MMMM D");
      var dayOfWeek = date.format("dddd");

      return {
        "todaysDate": todaysDate,
        "dayOfWeek": dayOfWeek
      };
    }
  }
});
