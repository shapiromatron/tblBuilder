MyTbls = new Meteor.Collection('myTbls');

var myTblsHandle = Meteor.subscribe('myTbls', Meteor.userId());


UI.registerHelper("formatDate", function(datetime, format) {
    var DateFormats = {
        short: "DD MMMM - YYYY",
        long: "dddd DD.MM.YYYY HH:mm"
    };
    if (moment) {
        f = DateFormats[format];
        return moment(datetime).format(f);
    }
    else {
        return datetime;
    }
});


Session.setDefault("myTblShowNew", false);
Session.setDefault('myTblEditingId', null);

Template.myTbl.getMyTbls = function(){
    return MyTbls.find();
};

Template.myTbl.showNew = function(){
    return Session.get("myTblShowNew");
};

Template.myTbl.events({
    'click #myTbl-show-create': function(){
        Session.set("myTblShowNew", true);
    }
});

Template.myTblForm.TblTypeSelected = function(prev, opt){
    return prev===opt;
};

Template.myTblForm.events({
  'click #myTbl-create': function (evt, tmpl){
      var obj = new_values(tmpl);
      obj['timestamp'] = (new Date()).getTime();
      obj['user_id'] = Meteor.userId();
      MyTbls.insert(obj);
      Session.set("myTblShowNew", false);
    },
    'click #myTbl-create-cancel': function (evt, tmpl){
      Session.set("myTblShowNew", false);
    }
    // },
    // 'click #rr-update': function (evt, tmpl){
    //   var vals = update_values(tmpl, this);
    //   RelRisks.update(this._id, {$set: vals});
    //   Session.set("rr_editing_id", null);
    // },
    // 'click #rr-update-cancel': function (evt, tmpl){
    //   Session.set("rr_editing_id", null);
    // },
    // 'click #rr-delete': function (evt, tmpl){
    //   RelRisks.remove(this._id);
    //   Session.set("rr_editing_id", null);
    // }
});
