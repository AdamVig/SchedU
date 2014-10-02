angular.module('schedu.services', [])

.service('DataService', function($q, dbUrl, FeedbackItemsFactory, StorageService) {

  // Create database objects
  var userDb = new PouchDB(dbUrl + "user");
  var scheduleDb = new PouchDB(dbUrl + "schedule");
  var feedbackDb = new PouchDB(dbUrl + "feedback");

  /////////////////////////////////////////
  // PUBLIC DATABASE RETRIEVAL FUNCTIONS //
  /////////////////////////////////////////

  /**
   * Retrieve schedule for date from database
   * @param  {string} date      Date to get schedule for, format: MM-DD-YY
   * @return {schedule object}  Schedule object containing periodOrder (array),
   *                            dayNumber (int, 1-8) and special (string or false)
   */
  this.getSchedule = function (date) {

    // Setup promise
    var request = $q.defer();

    scheduleDb.get(date, function (error, data) {

      if (error == null) {
        error = false;
      }

      // Resolve promise
      request.resolve({"data": data, "error": error});
    });

    return request.promise;
  };

  /**
   * Retrieve user from database
   * @param  {string} phoneNumber User's phone number with dashes,
   *                                      ex: 555-555-5555
   * @return {user object}        User object containing first name, last name,
   *                                     phone number, classes, phone number
   */
  this.getUser = function (phoneNumber) {

    // Setup promise
    var request = $q.defer();

    userDb.get(phoneNumber, function (error, data) {

      if (error == null) {
        error = false;
      }

      // Resolve promise
      request.resolve({"data": data, "error": error});
    });

    return request.promise;
  };

  /**
   * Retrieve list of feedback items from database
   * @return {array} Array of meta-doc objects containing doc, _id, and key;
   *                 each doc is a feedback item object containing _id, _rev,
   *                 name, and votes
   */
  this.getFeedbackItems = function () {

    // Setup promise
    var request = $q.defer();

    feedbackDb.allDocs({include_docs: true}, function (error, data) {

      if (error == null) {
        error = false;
      }

      data = FeedbackItemsFactory.make(data.rows);

      // Resolve promise
      request.resolve({"data": data, "error": error});
    });

    return request.promise;
  };

  ////////////////////////////////////////
  // PUBLIC USER MODIFICATION FUNCTIONS //
  ////////////////////////////////////////

  /**
   * Sync user to database
   * @param  {user object} userData User object containing first name, last name,
   *                                phone number, classes, phone number, AND revision
   * @return {response object}      Response object containing error (string or false)
   *                                and response (string or false)
   */
  this.syncUser = function (userData) {

    // Setup promise
    var request = $q.defer();

    // Write user data to database
    userDb.put(userData, userData.phoneNumber, userData._rev, function () {

      userDb.get(userData.phoneNumber, function (error, data) {

        if (error == null) {
          error = false;
        }

        StorageService.storeUser(data);

        // Resolve promise
        request.resolve({"data": data, "error": error});

      });
    });

    return request.promise;

  };

  /**
   * Create user
   * @param  {user object} userData User object containing first name, last name,
   *                                phone number, classes, phone number
   * @return {response object}      Response object containing error (string or false)
   *                                and response (string or false)
   */
  this.createUser = function (userData) {

    // Capitalize first name, last name, and class names
    // @TODO: make registration form take care of this
    userData.firstName = userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1);
    userData.lastName = userData.lastName.charAt(0).toUpperCase() + userData.lastName.slice(1);
    _.each(['a','b','c','d','e','f','g'], function (period) {
        userData[period].name = userData[period].name.charAt(0).toUpperCase() + userData[period].name.slice(1);
        if (userData[period].alternate) {
          userData[period].alternate.name = userData[period].alternate.name.charAt(0).toUpperCase() + userData[period].alternate.name.slice(1);
        }
    });

    // Add user feedback votes object
    userData["feedback"] = {
      "votes": 3,
      "voteItems": []
    };

    // Setup promise
    var request = $q.defer();

    // Write user data to database
    userDb.put(userData, userData.phoneNumber, function (error, data) {
      
      if (error == null) {
        error = false;
      }

      // Resolve promise
      request.resolve({"data": data, "error": error});
    });

    return request.promise;
  };

})

.service('StorageService', function() {

  /**
   * Store user data object in local storage
   * @param  {user object} userData User object containing first name, last name,
   *                                phone number, classes, phone number
   */
  this.storeUser = function (userData) {
    var userData = JSON.stringify(userData);
    window.localStorage.setItem('SchedUser', userData);
  };

  /**
   * Retrieve user data from local storage
   * @return {user object or boolean} User object containing first name, last name,
   *                                  phone number, classes, phone number
   *                                  OR false if not found
   */
  this.getUser = function () {

    var storedData = localStorage.getItem('SchedUser');
    if (storedData == "undefined") {
      user = false;
    } else {
      user = JSON.parse(storedData);
    }

    return user;
  };

})

.factory('ClassDaysFactory', function() {

  return {

    /**
     * Decides which days a class is on given a list of "primary" and "alternate"
     * @TODO remove the need for this factory by rewriting registration form
     * @param  {object} formData  All data from registration form
     * @return {object}          All data from registration form, days fixed
     */
    make: function (formData) {

      var dayLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

      // For each period
      _.each(dayLetters, function (dayLetter, index, list) {

        var currentClass = formData[dayLetter];

        // If current class meets on specific days
        if (currentClass.days) {

          var primaryDays = [];
          var alternateDays = [];

          // For each day
          _.each(currentClass.days, function (element, index) {

            if (element == "primary") {
              primaryDays.push(parseInt(index, 10)); // Add day number
            } else {
              alternateDays.push(parseInt(index, 10)); // Add day number
            }

          });

          currentClass.days = primaryDays;
          currentClass.alternate.days = alternateDays;
        }

        formData[dayLetter] = currentClass;
      });

      return formData;
    }
  }
})

.factory('ClassOrderFactory', function () {
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
    parseSchedule: function (scheduleObject) {

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

      // If holiday
      if (scheduleObject.special == "holiday") {

        classOrder.push({"name": scheduleObject.holiday});

      } else {

        // Each period in the day's schedule
        _.each(scheduleObject.periodOrder, function (currentPeriod, index) {

          // Period is a letter, ex: "a"
          if (currentPeriod.length == 1) {

            var currentClass = userData[currentPeriod];

            // Class alternates with another class
            if (currentClass && currentClass.alternate) {

              // Current class occurs today
              if (_.contains(currentClass.days, scheduleObject.dayNumber)) {

                // Slim object down to only required attributes
                currentClass = {
                  "name": currentClass.name, 
                  "teacher": currentClass.teacher, 
                  "room": currentClass.room
                };

              // Alternate class occurs today
              } else if (_.contains(currentClass.alternate.days, scheduleObject.dayNumber)) {

                currentClass = currentClass.alternate;

              // Neither class occurs today; default to study
              } else {

                // Default to study
                currentClass = {
                  "name": "Study"
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
  }
})

/**
 * Creates object out of feedbackItems where the index of each item
 * is its _id string from the database; makes searching in the
 * controller simpler
 * @param  {array} feedbackItemsDatabase Array of meta-doc objects containing doc, _id, and key;
 *                                       each doc is a feedback item object containing _id, _rev,
 *                                       name, and votes
 * @return {object}                      Object with keys being the _id of each feedback item;
 *                                       each feedback item object contains _id, name, and votes
 */
.factory('FeedbackItemsFactory', function () {
  
  return {
    make: function (feedbackItemsDatabase) {
      var feedbackItems = {};

      _.each(feedbackItemsDatabase, function (metaDoc) {
        feedbackItems[metaDoc.id] = {
          "_id": metaDoc.id,
          "name": metaDoc.doc.name,
          "votes": metaDoc.doc.votes
        };
      });

      return feedbackItems;
    }
  }
})

.factory('DateFactory', function () {
  return {

    /**
     * Gets today's date if not weekend, next 
     * Monday's date if weekend
     * @return {moment object} Moment() of the current day's date
     */
    currentDay: function () {

      currentDay = moment();

      // If weekend, change date to next Monday
      if (currentDay.isoWeekday() > 5) {
        currentDay.add(currentDay.isoWeekday()-5, 'days');
      }

      return currentDay;
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
})

.factory('LoadingFactory', function ($ionicLoading) {
  return {
    show: function () {
      $ionicLoading.show({
        templateUrl: '/templates/loader.html',
        noBackdrop: true
      });
    },
    hide: function () {
      setTimeout(function(){
          $ionicLoading.hide();
      }, 200);
    }
  }
});
