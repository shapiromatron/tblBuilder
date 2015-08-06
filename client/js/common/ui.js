var TIMESTAMP_FORMAT = 'MMM Do YYYY, h:mm a';

UI.registerHelper("formatDate", function(datetime) {
  return moment(datetime).format(TIMESTAMP_FORMAT);
});

UI.registerHelper("QAstampFormat", function(datetime, userID) {
  var user, username;
  datetime = moment(datetime).format(TIMESTAMP_FORMAT);
  user = Meteor.users.findOne(userID);
  if (user) username = user.profile.fullName;
  if (username) {
    return "QA'd by " + username + " on " + datetime;
  } else {
    return "QA'd on " + datetime;
  }
});

UI.registerHelper("userCanEdit", function() {
  var tbl = Session.get('Tbl');
  return clientShared.userCanEdit(tbl);
});

UI.registerHelper("ballotBoolean", function(bool) {
  var icon = bool.hash.bool ? "glyphicon-ok" : "glyphicon-remove";
  return Spacebars.SafeString("<span class='glyphicon " + icon + "'></span>");
});

UI.registerHelper("eachIndex", function(array) {
  return _.map(array, function(v, i){ return {value: v, index: i};});
});

UI.registerHelper("isEqual", function(kw) {
  return kw.hash.current === kw.hash.target;
});

UI.registerHelper("qaMark", function(isQA) {
  var icon, title;
  if (Session.get("showQAflags")) {
    icon = isQA ? "glyphicon-ok" : "glyphicon-remove";
    title = isQA ? "QA'd" : "Not QA'd";
    return Spacebars.SafeString("<span title=\"" + title + "\" class=\"btn-xs text-muted pull-right glyphicon " + icon + "\"></span>");
  }
});

UI.registerHelper("hasContactEmail", function() {
  return (Meteor.settings != null) &&
         (Meteor.settings["public"] != null) &&
         (Meteor.settings["public"].contact_email != null);
});

UI.registerHelper("contactEmail", function() {
  return Meteor.settings["public"].contact_email + "?subject=[IARC Table Builder]";
});

UI.registerHelper("commaList", function(lst) {
  return lst.join(", ");
});

UI.registerHelper("addIndex", function(lst) {
  return _.map(lst, function(v, i) {
    return {i: i, v: v};
  });
});

UI.registerHelper("equals", function(a, b) {
  return a === b;
});

UI.registerHelper("isNTP", function() {
  return Meteor.settings["public"].context === "ntp";
});

UI.registerHelper("getContainerClass", function() {
  return (Session.get("isFullScreen")) ? "container-fluid" : "container";
});

UI.registerHelper("getUserDescription", function() {
  if (this.profile && this.profile.fullName){
    return this.profile.fullName;
  } else {
    return _.pluck(this.emails, "address").join(", ");
  }
});
