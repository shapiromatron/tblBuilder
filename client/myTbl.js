MyTbls = new Meteor.Collection('myTbls');

var myTblsHandle = null;
Deps.autorun(function () {
  var userId = Meteor.userId();
  if (userId){
    myTblsHandle = Meteor.subscribe('myTbls', userId);
  } else {
    myTblsHandle = null;
  }
});

Session.setDefault("myTblShowNew", false);
Session.setDefault('myTblEditingId', null);

Template.myTbl.helpers({
  getMyTbls: function(){
    return MyTbls.find();
  },
  showNew: function(){
    return Session.get("myTblShowNew");
  },
  isEditing: function(){
    return Session.equals('myTblEditingId', this._id);
  },
  getURL: function(){
    var url;
    switch (this.tblType){
      case "In Vitro":
        url = Router.path('in_vitro');
        break;
      case "Epidemiology - Cohort":
        url = Router.path('epiCohortMain', {_id: this._id});
        break;
      case "Epidemiology - Case Control":
        url = Router.path('epiCaseControlMain', {_id: this._id});
        break;
    }
    return url;
  }
});

Template.myTbl.events({
  'click #myTbl-show-create': function(evt, tmpl){
    Session.set("myTblShowNew", true);
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("input[name=name]"));
  },
  'click #myTbl-show-edit': function(evt, tmpl){
    Session.set("myTblEditingId", this._id);
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("input[name=name]"));
  }
});

Template.myTblForm.helpers({
  TblTypeSelected : function(prev, opt){
    return prev===opt;
  }
});

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
  },
  'click #myTbl-update': function (evt, tmpl){
    var vals = update_values(tmpl.find("#myTblForm"), this);
    MyTbls.update(this._id, {$set: vals});
    Session.set("myTblEditingId", null);
  },
  'click #myTbl-update-cancel': function (evt, tmpl){
    Session.set("myTblEditingId", null);
  },
  'click #myTbl-delete': function (evt, tmpl){
    MyTbls.remove(this._id);
    Session.set("myTblEditingId", null);
  }
});
