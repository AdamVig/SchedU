services.factory('SyncUserFactory', function ($q, DataService) {

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

        if (!response.error) {
          response.data.usage = userData.usage;

          // User doesn't exist, get out of function
        } else {
          $q.reject({"data": null, "error": {"status": 404}});
          return;
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
});
