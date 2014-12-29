services.factory('PhoneNumberFactory', function ($filter) {
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
});
