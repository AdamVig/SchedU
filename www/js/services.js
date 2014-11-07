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
   * Create user
   * @param  {user object} userData User object containing first name, last name,
   *                                phone number, classes, phone number
   * @return {response object}      Response object containing error (string or false)
   *                                and response (string or false)
   */
  this.createUser = function (userData) {

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

  /**
   * Update user
   * @param  {user object} userData User object containing _id, _rev, first name, 
   *                                last name, phone number, classes, phone number
   * @return {response object}      Response object containing error (string or false)
   *                                and response (string or false)
   */
  this.updateUser = function (userData) {
    // Setup promise
    var request = $q.defer();

    // Write user data to database
    userDb.put(userData, userData._id, userData._rev, function (error, data) {
      
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
    var userData = angular.toJson(userData);
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

  /**
   * Delete user data from local storage
   */
  this.deleteUser = function () {
    localStorage.removeItem('SchedUser');
  };

})

.factory('SyncUserFactory', function ($q, DataService) {

  /**
   * Sync user to database
   * @param  {user object} userData User object containing first name, last name,
   *                                phone number, classes, phone number, AND revision
   * @return {response object}      Response object containing error (string or false)
   *                                and response (string or false)
   */
  return {
    sync: function (userData) {

      // Setup promise
      var request = $q.defer();

      // Get fresh user data
      DataService.getUser(userData._id).then(function (response) {

        if (response.data) {
          response.data.usage = userData.usage;
        }

        return DataService.updateUser(response.data);

      }).then(function (response) {

        return DataService.getUser(userData._id)

      }).then(function (response) {

        request.resolve(response);
      
      });

      return request.promise;
    }

  };
})

.factory('ClassDaysFactory', function ($filter) {

  return {

    /**
     * Cleans up form data by parsing lists of days and
     * alternate days from each class
     * @param  {object} formData Contains periods a-g, each of which
     *                           might contain days[] and alternate.days[],
     *                           in format [1: "1", 2: "2", ... 8: "8"]
     * @return {object}          Original form data object but with lists
     *                           of days in format [1,2,3,4,5,6,7,8]
     */
    make: function (formData) {
      var dayLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

      // For each period
      _.each(dayLetters, function (dayLetter, index, list) {

        // If current class has an alternate
        if (formData[dayLetter].alternate.name) {

          formData[dayLetter].days = $filter('classdays')(formData[dayLetter].days);
          formData[dayLetter].alternate.days = $filter('classdays')(formData[dayLetter].alternate.days);
        }

      });

      return formData;
    }
  }
})

.factory('ClassOrderFactory', function () {

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
     * Monday's date if weekend
     * @return {moment object} Moment() of the current day's date
     */
    currentDay: function () {

      currentDay = moment();

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

.factory('RegistrationFactory', function ($filter, UsageFactory) {

  return {

    process: function (userData) {

      // Capitalize first name, last name, and class names
      // @TODO: make registration form take care of this
      userData.firstName = $filter('sentencecase')(userData.firstName);
      userData.lastName = $filter('sentencecase')(userData.lastName);

      _.each(['a','b','c','d','e','f','g'], function (periodLetter) {
          userData[periodLetter].name = $filter('sentencecase')(userData[periodLetter].name);
          
          // Capitalize alternate class name if exists
          if (userData[periodLetter].alternate.name) {
            userData[periodLetter].alternate.name = $filter('sentencecase')(userData[periodLetter].alternate.name);
          
          // If no alternate, delete all associated fields
          } else {
            delete userData[periodLetter].days;
            delete userData[periodLetter].alternate;
          }
      });

      // Add user feedback info
      userData["feedback"] = {
        "votes": 3,
        "voteItems": []
      };

      // Add version and platform info
      userData["usage"] = UsageFactory.get({});

      return userData;

    }
  }
})

.factory('UsageFactory', function (appVersion) {

  return {

    get: function (usage) {

      var registerDate;

      // Supply register date from existing usage object
      if (usage) {
        registerDate = usage.registerDate;
      } else {
        registerDate = moment().format("MM-DD-YY");
      }

      return {
        "appVersion": appVersion,
        "platform": {
          "name": ionic.Platform.platform(),
          "version": ionic.Platform.version()
        },
        "lastOpen": moment().format("MM-DD-YY hh:mm:ssa"),
        "registerDate": registerDate
      }
    }
  }
})

.factory('PhoneNumberFactory', function ($filter) {
  return {
    parse: function (phoneNumber) {

      // Set to empty string if undefined
      phoneNumber = phoneNumber || "";

      // Reject any characters not 0-9
      phoneNumber = phoneNumber.replace(/[^0-9]+/g, '');

      // Add dashes
      phoneNumber = $filter('phonenumber')(phoneNumber);

      return phoneNumber;
    }
  }
})

.factory('LoadingFactory', function ($ionicLoading) {
  return {
    show: function () {
      $ionicLoading.show({
        templateUrl: 'templates/loader.html',
        noBackdrop: false
      });
    },
    showNoConnection: function () {
      $ionicLoading.show({
        templateUrl: 'templates/noconnection.html',
        noBackdrop: false
      });
    },
    quickHide: function () {
      $ionicLoading.hide();
    },
    hide: function () {
      setTimeout(function(){
          $ionicLoading.hide();
      }, 200);
    }
  }
});
