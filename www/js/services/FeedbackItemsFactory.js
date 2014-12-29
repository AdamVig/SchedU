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
services.factory('FeedbackItemsFactory', function () {

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
});
