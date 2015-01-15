controllers.controller('FeedbackController', function($scope, $state, $ionicPopup, LoadingFactory, DatabaseFactory, DataService, StorageService) {

  var feedback = this;
  LoadingFactory.show();

  // Get user data object (false if not available)
  var localUser = StorageService.getUser();

  // Redirect to login if no user data
  if (!localUser) {
    $state.go("login");
    LoadingFactory.hide();
  }

  // Get number of votes from user
  feedback.userFeedback = localUser.feedback;

  // Retrieve feedback items list from database, hide loader
  DatabaseFactory.feedback.getAll().then(function (response) {
    feedback.feedbackItems = DataService.extractDocs(response);
    LoadingFactory.hide();
  });

  // Show informational popup if no votes
  if (feedback.userFeedback.voteItems.length == 0) {
    $ionicPopup.alert({
      title: 'SchedU needs your help!',
      template: "On this page, please select the features you would like to see in SchedU. " +
      "The items with the most votes will be added to SchedU first!"
    });
  }

  /**
  * Toggle vote status on a given item
  * @param  {Integer} index Index of tapped item in feedback list
  */
  feedback.voteOnItem = function (itemId) {

    var itemIsSelected = _.contains(feedback.userFeedback.voteItems, itemId);

    // If not selected, add to list of selected items
    if (feedback.userFeedback.votes > 0 && !itemIsSelected) {

      // Add item to voteItems list
      feedback.userFeedback.voteItems.push(itemId);

      // Decrement number of votes left
      feedback.userFeedback.votes--;

      syncVotes();

      // If selected, remove from list of selected items
    } else if (itemIsSelected) {

      // Remove item from voteItems list
      feedback.userFeedback.voteItems = _.without(feedback.userFeedback.voteItems, itemId);

      // Add a vote back
      feedback.userFeedback.votes++;

      syncVotes();

      // No votes left
    } else {
      $ionicPopup.alert({
        template: 'Sorry, you\'re out of votes! Try deselecting a feature.'
      });
    }
  };

  /**
  * Sync user's vote data to database
  */
  var syncVotes = function () {

    LoadingFactory.show();

    localUser.feedback = feedback.userFeedback;
    DatabaseFactory.user.get(localUser._id).then(function (response) {

      if (response.data._rev != localUser._rev) {

        localUser = response.data;
        localUser.feedback = feedback.userFeedback;
      }

      return DatabaseFactory.user.insert(localUser);

    }).then(function (response) {

      localUser._rev = response.data.rev;
      StorageService.storeUser(localUser);
      LoadingFactory.hide();
    });
  };
});
