services.factory('RegistrationFactory', function ($filter, UsageFactory) {

  return {

    process: function (userData) {

      // Capitalize first name, last name, and class names
      userData.firstName = $filter('sentencecase')(userData.firstName);
      userData.lastName = $filter('sentencecase')(userData.lastName);

      _.each(['a','b','c','d','e','f','g'], function (periodLetter) {

        // Capitalize primary class name
        userData[periodLetter].name = $filter('sentencecase')(userData[periodLetter].name);

        // Class has an alternate
        if (userData[periodLetter].alternate.name) {

          // Capitalize alternate class name
          userData[periodLetter].alternate.name = $filter('sentencecase')(userData[periodLetter].alternate.name);

          // Remove empty values from days arrays
          userData[periodLetter].days = _.compact(userData[periodLetter].days);
          userData[periodLetter].alternate.days = _.compact(userData[periodLetter].alternate.days);


          // If no alternate, delete empty fields
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
      userData["usage"] = UsageFactory.get({"registerDate": moment().format("MM-DD-YY")});

      return userData;

    }
  }
});
