services.factory('DatabaseFactory', ['$http', 'dbUrl', function($http, dbUrl) {

  // Enable CORS
  $http.defaults.withCredentials = true;

  /**
   * Remove trailing slash
   * @param  {string} url URL string
   * @return {string}     URL string without trailing slash
   */
  function removeTrailingSlash(url) {
    if(url.substr(-1) == '/') {
      return url.substr(0, url.length - 1);
    }
    return url;
  }
  /**
   * Build URL from given parts
   * @param  {string} couchUrl     Complete URL of CouchDB server
   * @param  {string} databaseName Name of database
   * @param  {string} docId        Name of document
   * @return {string}              Complete request URL
   */
  function makeRequestUrl(couchUrl, databaseName, docId) {
    var requestUrl = removeTrailingSlash(couchUrl);
    if (databaseName) {
      requestUrl += '/' + encodeURIComponent(databaseName);
    }
    if (docId) {
      requestUrl += '/' + encodeURIComponent(docId);
    }
    return requestUrl;
  }

  /**
   * Database class
   * @param {string} couchUrl     URL of CouchDB server
   * @param {string} databaseName Name of database
   */
  function SimpleCouch(couchUrl, databaseName) {

    /**
     * Get a document from the database
     * @param  {string}  docId ID of document
     * @return {promise}       Promise resolved by response object
     */
    this.get = function (docId) {
      return $http({
        method: "GET",
        url: makeRequestUrl(couchUrl, databaseName, docId)
      });
    };

    /**
     * Add a document to the database with ID if specified
     * @param  {object}  docData Data to put in place of document
     * @param  {string}  docId   ID of document (optional)
     * @return {promise}         Promise resolved by response object
     */
    this.insert = function (docData, docId) {
      if (docId) {
        return $http({
          method: "PUT",
          url: makeRequestUrl(couchUrl, databaseName, docId),
          data: docData
        });
      } else if (docData._id) {
        return $http({
          method: "PUT",
          url: makeRequestUrl(couchUrl, databaseName, docData._id),
          data: docData
        });
      } else {
        return $http({
          method: "POST",
          url: makeRequestUrl(couchUrl, databaseName),
          data: docData
        });
      }
    };

    /**
     * Delete document from database
     * @param  {string}  docId  ID of document
     * @param  {string}  docRev Current revision of document in database
     * @return {promise}        Promise resolved by response object
     */
    this.delete = function (docId, docRev) {
      return $http({
        method: "DELETE",
        url: makeRequestUrl(couchUrl, databaseName, docId),
        params: { rev: docRev }
      });
    };

    /**
     * Get all documents from database
     * @return {promise}    Promise resolved by response object
     */
    this.getAll = function () {
      return $http({
        method: "GET",
        url: makeRequestUrl(couchUrl, databaseName, '_all_docs'),
        params: { include_docs: true }
      });
    };
  }

  return {
    'schedule':  new SimpleCouch(dbUrl, 'schedule'),
    'user':  new SimpleCouch(dbUrl, 'user'),
    'feedback':  new SimpleCouch(dbUrl, 'feedback'),
    'versions':  new SimpleCouch(dbUrl, 'versions')
  };

}]);
