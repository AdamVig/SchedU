services.service('StorageService', function() {

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

});
