services.factory('UsageFactory', function (appVersion) {

  return {

    get: function (usage) {

      var registerDate;

      return {
        "appVersion": appVersion,
        "platform": {
          "name": ionic.Platform.platform(),
          "version": ionic.Platform.version()
        },
        "lastOpen": moment().format("MM-DD-YY hh:mm:ssa"),
        "registerDate": usage.registerDate
      }
    }
  }
});
