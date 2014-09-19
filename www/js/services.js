angular.module('schedu.services', [])

////////////////////////
// ScheduleDB Service //
////////////////////////
.service('FeedbackDB', function ($q) {

  this.getList = function () {
    var db = new PouchDB('https://schedu.couchappy.com:6984/feedback');
    var dbBackup = new PouchDB('https://schedu.cloudant.com:6984/feedback');
    var deferred = $q.defer();

    db.allDocs({include_docs: true}, function (error, response) {
      deferred.resolve({"err": error, "response": response.rows});
    });

    return deferred.promise;
  };

})

//////////////////////
// Register Service //
//////////////////////
.service('RegisterService', function () {

  /**
   * Returns which days each class is on from form data
   * @param  {array} formDays ex: ['primary', 'other', ... ]
   * @return {object}            Contains arrays ex: [1,3,5,7] for primary and other classes
   */
  this.classDays = function (formDays) {

    var primaryDays = [];
    var otherDays = [];

    _.each(formDays, function (element, index) {

      if (element == "primary") {
        primaryDays.push(parseInt(index, 10)); // Add day number
      } else {
        otherDays.push(parseInt(index, 10)); // Add day number
      }

    });

    return {
      "primary": primaryDays,
      "other": otherDays
    };

  };

})


////////////////////
// UserDB Service //
////////////////////
.service('UserDB', function ($q) {
  
  this.testUser = {
    "firstName": "John",
    "lastName": "Smith",
    "phoneNumber": "555-555-5555",
    "grade": "12",
    "a": {
      "name": "Gym",
      "teacher": "Mrs. McNamara",
      "room": "Upper Gym",
      "days": [1,3,5,7],
      "alternate": {
        "name": "Health",
        "teacher": "Mr. Ettinger",
        "room": "Health",
        "days": [2,4,6,8]
      }
    },
    "b": {
      "name": "English",
      "teacher": "Mrs. Earley",
      "room": "111"
    },
    "c": {
      "name": "Calculus",
      "teacher": "Mr. Kempskie",
      "room": "102"
    },
    "d": {
      "name": "Study",
      "room": "Media Center",
      "days": [1,2,3,4,6,8],
      "alternate": {
        "name": "Guidance Seminar",
        "teacher": "Mr. Glover",
        "room": "Fishbowl",
        "days": [5,7]
      }
    },
    "e": {
      "name": "History",
      "teacher": "Mr. Sakellarion"
    },
    "f": {
      "name": "Programming",
      "teacher": "Mrs. Clark",
      "room": "403a"
    },
    "g": {
      "name": "Spanish",
      "teacher": "Señora Holman",
      "room": "168"
    }
  };


  /**
   * Add new user to user database using phone number as _id
   * @param {object} user Contains phone number, name, and all class data
   */
  this.addUser = function (userData) {
    var db = new PouchDB('https://schedu.iriscouch.com:6984/user');
    var deferred = $q.defer();

    db.put(userData, userData.phoneNumber, function (error, response) {
      deferred.resolve({"err":error, "response": response});
    });

    return deferred.promise;
  };

  /**
   * Queries database to see if user exists
   * @param  {object} response Either contains user or error object
   * @return {boolean}         True if exists, false otherwise
   */
  this.userExists = function (response) {
    if (response.error == "not_found")
      return false;
    else
      return true;
  };

  /**
   * Retrieve user from database by phone number
   * @param  {string} phoneNumber User's unique phone number
   * @return {User}               Contains phone number, name, and all class data
   */
  this.getUser = function (phoneNumber) {
    var db = new PouchDB('https://schedu.iriscouch.com:6984/user');
    var deferred = $q.defer();

    db.get(phoneNumber, function (error, userData) {
      deferred.resolve(userData);
    });

    return deferred.promise;

  };

  /**
   * Update user data in database
   * @param  {Object} userData Contains phone number, name, classes, etc.
   * @return {String}             Server respone to PUT request
   */
  this.updateUser = function (userData) {
    var db = new PouchDB('https://schedu.iriscouch.com:6984/user');
    var deferred = $q.defer();

    db.put(userData, userData._id, userData._rev, function (error, response) {
      deferred.resolve({"err":error, "response": response});
    });

    return deferred.promise;
  };

})


////////////////////////
// ClassOrder Service //
////////////////////////
.service('ClassOrder', function ($q) {

  this.testSchedule = {
   "_id": "08/27/14",
   "_rev": "2-fdf8fa68e3a8b97229b1b200699247e2",
   "dayNumber": 1,
   "special": false,
   "periodOrder": [
     "a",
     "Activity Period",
     "b",
     "c",
     "d",
     "e",
     "f",
     "g"
   ]
  };

  /**
   * Returns the day schedule for today in string format
   * @return {String} ex: A1
   */
  this.getDaySchedule = function () {
    var db = new PouchDB('https://schedu.iriscouch.com:6984/schedule');
    var deferred = $q.defer();
    
    var today = moment();

    // If weekend, change date to nearest Monday
    if (today.isoWeekday() == 6) {
      today.add(2, 'days');
    } else if (today.isoWeekday() == 7) {
      today.add(1, 'days');
    }

    db.get(today.format("MM-DD-YY"), function (error, schedule) {

      var daySchedule;
      if (schedule.periodOrder) {
        daySchedule = " - Day " + schedule.periodOrder[0].toUpperCase() + schedule.dayNumber;
      } else {
        daySchedule = false;
      }
      
      var date = new moment(schedule._id, "MM-DD-YY");
      var todaysDate = date.format("MMMM D");
      var dayOfWeek = date.format("dddd");

      deferred.resolve({
        "daySchedule": daySchedule,
        "todaysDate": todaysDate,
        "dayOfWeek": dayOfWeek
      });
    });

    return deferred.promise;
  
  }

  /**
   * Returns the schedule for today
   * @return {Object} ex: {"periodOrder":["a","b"..."g"], dayNumber": 1}
   */
  function getSchedule () {
    var db = new PouchDB('https://schedu.iriscouch.com:6984/schedule');
    var deferred = $q.defer();
    
    var today = moment();

    // If weekend, change date to nearest Monday
    if (today.isoWeekday() == 6) {
      today.add(2, 'days');
    } else if (today.isoWeekday() == 7) {
      today.add(1, 'days');
    }

    db.get(today.format("MM-DD-YY"), function (error, schedule) {
      deferred.resolve(schedule);
    });

    return deferred.promise;
  
  }

  function getTimes () {
    var db = new PouchDB('https://schedu.iriscouch.com:6984/info');
    var deferred = $q.defer();

    // Retrieve object containing all possible bell schedules
    db.get("bell-schedule", function (error, bellSchedules) {
      deferred.resolve(bellSchedules);
    });

    return deferred.promise;
  }
  
  /**
   * Create class order for given user and schedule
   * @param  {object} user     Contains phone number, name, and all class data
   * @param  {object} schedule Contains date, periodOrder ex: [a,b,c,d,e,f,g], dayNumber ex: 1, special ex: false
   * @return {object}          Contains classOrder, ex: [{"name": "Programming", "teacher": "Mrs. Clark", "room": "403B"}]
   */
  function createClassOrder (user, schedule, bellSchedules) {
    
    var classOrder = [];

    // If holiday
    if (schedule.special == "holiday") {
      classOrder = [{
        "name":schedule.holiday
      }];
    } else {

      var bellSchedule;
      if (schedule.special === false) { // Normal day

        bellSchedule = bellSchedules.standard;
      } else if (schedule.special == "activity-period") { // Activity period

        bellSchedule = bellSchedules.activityPeriod;
      } else if (schedule.special == "early-release") {

        bellSchedule = bellSchedules.earlyRelease;
      }

      // Each period in the day's schedule
      _.each(schedule.periodOrder, function (currentPeriod, index) {

        // Period is a letter, ex: "a"
        if (currentPeriod.length == 1) {

          var currentClass = user[currentPeriod];

          // Class alternates with another class
          if (currentClass && currentClass.alternate) {

            // Current class occurs today
            if (_.contains(currentClass.days, schedule.dayNumber)) {

              // Slim object down to only required attributes
              currentClass = {
                "name": currentClass.name, 
                "teacher": currentClass.teacher, 
                "room": currentClass.room
              };

            // Alternate class occurs today
            } else if (_.contains(currentClass.alternate.days, schedule.dayNumber)) {

              currentClass = currentClass.alternate;

            // Neither class occurs today; default to study
            } else {

              // Default to study
              currentClass = {
                "name": "Study",
                "teacher": null,
                "room": null
              };
            }

          }

          currentClass.letter = currentPeriod.toUpperCase();
          classOrder.push(currentClass);

        // Special period, ex: "Activity Period"
        } else {

          var specialPeriod = {
            "name": currentPeriod // Name of special period instead of letter
          }

          specialPeriod.letter = "Sp";
          classOrder.push(specialPeriod);
        }
      });
    } // End if holiday
    
    return classOrder;
  }

  this.make = function (user, callback) {

    var schedule;
    var deferred = $q.defer();

    getSchedule()
      .then(function (returnSchedule) {
        schedule = returnSchedule;
      })
      .then(getTimes)
      .then(function (bellSchedules) {
        var classOrder = createClassOrder(user, schedule, bellSchedules);
        deferred.resolve(classOrder);
        callback(classOrder);
      });

    return deferred.promise;
  }

});
