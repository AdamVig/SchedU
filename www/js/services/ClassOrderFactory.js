services.factory('ClassOrderFactory', function () {

  /**
  * Returns class that occurs on dayNum, defaults
  * to "Study" if neither class occurs on dayNum.
  * @param  {object} primaryClass   Contains name and list of days
  * @param  {object} alternateClass Contains name and list of days
  * @param  {integer} dayNum        Number of day, 1-8
  * @return {object}                primaryClass, alternateClass, or
  *                                 {'name': "Study"}
  */
  function decideWhichClass(primaryClass, alternateClass, dayNum) {

    // Primary class occurs today
    if (_.contains(primaryClass.days, dayNum)) {

      return primaryClass;

      // Alternate class occurs today
    } else if (_.contains(alternateClass.days, dayNum)) {

      return alternateClass;

      // Neither class occurs today; default to study
    } else {

      return {"name": "Study"};
    }

  }


  return {

    /**
    * Parses schedule object into A1 notation using the first period from
    * periodOrder and the day number. False if first period is more than one
    * letter long or if period order doesn't exist.
    * @param  {object} scheduleObject Schedule object containing periodOrder,
    *                                 dayNumber, special (and holiday if applicable)
    * @return {string or boolean}     Schedule as string in A1 notation or false if
    *                                 schedule object doesn't have a period order
    */
    makeScheduleString: function (scheduleObject) {

      var scheduleString = false;

      // Period order exists in schedule object
      if (scheduleObject.periodOrder) {

        var dayLetter = scheduleObject.periodOrder[0].toUpperCase()

        // Is a single letter
        if (dayLetter.length == 1) {
          scheduleString = dayLetter + scheduleObject.dayNumber;
        }
      }
      return scheduleString;
    },

    /**
    * Generate class order from user data and schedule object
    * @param  {user object} userData  User object containing first name, last name,
    *                                   phone number, classes, phone number
    * @param  {object} scheduleObject Schedule object containing periodOrder,
    *                                 dayNumber, special (and holiday if applicable)
    * @return {array}                 List of class objects, each containing name
    *                                 and letter (unless holiday)
    */
    make: function (userData, scheduleObject) {

      var classOrder = [];

      // Holiday
      if (scheduleObject.special == "holiday") {

        classOrder.push({"name": scheduleObject.holiday});
        //@TODO getschedule for next school day

        // Normal day
      } else {

        var currentClass, classToAdd;

        // Each period in the day's schedule
        _.each(scheduleObject.periodOrder, function (currentPeriod, periodNum, periodOrder) {

          // Period is a letter, ex: "a"
          if (currentPeriod.length == 1) {

            currentClass = userData[currentPeriod];

            // Class doesn't alternate
            if (!currentClass.alternate) {

              classToAdd = currentClass;

              // Class does alternate
            } else {
              classToAdd = decideWhichClass(currentClass, currentClass.alternate, scheduleObject.dayNumber);
            }

            classToAdd.letter = currentPeriod.toUpperCase();

            // Add lunch if third to last period
            // Handles normal and activity period schedules
            if (periodNum == periodOrder.length - 3) {
              classToAdd.lunch = true;
            }

            // Special period, ex: "Activity Period"
          } else {
            classToAdd = {
              "name": currentPeriod, // Name of special period
              "letter": "Sp"
            }
          }

          // Add class to class order
          classOrder.push(classToAdd);


        });
      } // End else normal day

      return classOrder;
    }
  }
});
