controllers.controller('RegisterController', function($scope, $state, $filter, LoadingFactory, $ionicPopup, DataService, DatabaseFactory, StorageService, PhoneNumberFactory, RegistrationFactory) {

  $scope.formData = {};
  $scope.periodLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  /**
   * Deselect currently selected day in alternate class
   * @param  {integer} dayNumber    Number of the selected day
   * @param  {string}  periodLetter Letter of the current period
   * @param  {boolean} alternate    (Optional) Either 'alternate' or not provided
   */
  $scope.deselectDays = function(dayNumber, periodLetter, alternate) {

    // Primary day:
    // 1. Remove day number from alternate days array
    // 2. Add day number to primary days array
    if (!alternate) {
      delete $scope.formData[periodLetter].alternate.days[dayNumber - 1];
      $scope.formData[periodLetter].days[dayNumber - 1] = dayNumber;

      // Alternate day:
      // 1. Remove day number from primary days array
      // 2. Add day number to alternate days array
    } else {
      delete $scope.formData[periodLetter].days[dayNumber - 1];
      $scope.formData[periodLetter].alternate.days[dayNumber - 1] = dayNumber;
    }

  };

  $scope.$watch("formData.phoneNumber", function(phoneNumber) {
    $scope.formData.phoneNumber = PhoneNumberFactory.parse(phoneNumber);
  });

  $scope.register = function(formData) {

    LoadingFactory.show();

    formData = RegistrationFactory.process(formData);

    ////////////////////////////////////////////////
    // ADD USER TO DATABASE, STORE, SHOW SCHEDULE //
    ////////////////////////////////////////////////

    DatabaseFactory.user.insert(formData, formData.phoneNumber).then(function(response) {

      DatabaseFactory.user.get(formData.phoneNumber).then(function(response) {

        StorageService.storeUser(response.data);
        LoadingFactory.hide();
        $state.go("schedule");

      }).catch(function(e) {
        $ionicPopup.show({
          template: 'Something went wrong. Contact ' +
            'info@getschedu.com if this keeps happening.',
          title: 'Sorry!',
          scope: $scope,
          buttons: [{
            text: 'Try again'
          }]
        }).then(function() {
          LoadingFactory.hide();
          $state.go("register");
        });
      });

    }).catch(function(e) {

      // Conflict, user already exists
      if (e.status == 409) {

        LoadingFactory.hide();
        $ionicPopup.show({
          template: 'A user already exists with this phone number. ' +
            'Is it you? You can either change your phone ' +
            'number or login using this phone number.',
          title: 'Oh no!',
          scope: $scope,
          buttons: [{
            text: 'I\'ll change my number'
          }, {
            text: 'Let me login',
            type: 'button-positive',
            onTap: function(e) {
              $state.go("login");
            }
          }]
        });
        // Unknown error
      } else {

        LoadingFactory.hide();
        $ionicPopup.show({
          template: 'Something went wrong. Contact ' +
            'info@getschedu.com if this keeps happening.',
          title: 'Sorry!',
          scope: $scope,
          buttons: [{
            text: 'Try again'
          }]
        });
      }
    });
  };
});
