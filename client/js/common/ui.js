var uiHelpers = {
    userCanEdit: function() {
        return clientShared.userCanEdit(Session.get('Tbl'));
    },
    ballotBoolean: function(bool) {
        var icon = bool.hash.bool ? "glyphicon-ok" : "glyphicon-remove";
        return Spacebars.SafeString("<span class='glyphicon " + icon + "'></span>");
    },
    eachIndex: function(array) {
        return _.map(array, function(v, i){ return {value: v, index: i};});
    },
    isEqual: function(kw) {
        return kw.hash.current === kw.hash.target;
    },
    qaMark: function(isQA) {
        var icon, title;
        if (Session.get("showQAflags")) {
            icon = isQA ? "glyphicon-ok" : "glyphicon-remove";
            title = isQA ? "QA'd" : "Not QA'd";
            return Spacebars.SafeString('<span title="{0}" class="btn-xs text-muted pull-right glyphicon {1}"></span>'.printf(title, icon));
        }
    },
    hasContactEmail: function() {
        return (Meteor.settings != null) &&
               (Meteor.settings["public"] != null) &&
               (Meteor.settings["public"].contact_email != null);
    },
    contactEmail: function() {
        var email = Meteor.settings["public"].contact_email;
        return "{0}?subject=[IARC Table Builder]".printf(email);
    },
    commaList: function(lst) {
        return lst.join(", ");
    },
    addIndex: function(lst) {
        return _.map(lst, function(v, i) {
            return {i: i, v: v};
        });
    },
    equals: function(a, b) {
        return a === b;
    },
    isNTP: function() {
        return Meteor.settings["public"].context === "ntp";
    },
    getUserDescription: function() {
        return (this.profile && this.profile.fullName)
          ? this.profile.fullName
          : _.pluck(this.emails, "address").join(", ");
    },
    getMonographAgent: function(){
        return Session.get('monographAgent');
    },
};

_.each(uiHelpers, function(func, name){
    UI.registerHelper(name, func);
});
