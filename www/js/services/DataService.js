services.service('DataService', [function () {
  this.extractDocs = function (response) {
    return response.data.rows.map(function (metaDoc) {
      return metaDoc.doc;
    });
  };
}]);
