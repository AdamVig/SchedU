services.service('DataService', function($q, dbUrl, FeedbackItemsFactory, StorageService) {

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

});
