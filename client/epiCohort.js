EpiCohort = new Meteor.Collection('epiCohort');
EpiCohortExposure = new Meteor.Collection('epiCohortExposure');

var epiCohortHandle = null,
    epiCohortExposure = null;

Deps.autorun(function () {
  var myTbl_id = Session.get('epiCohort_myTbl');
  if (myTbl_id){
    epiCohortHandle = Meteor.subscribe('epiCohort', myTbl_id);
    epiCohortExposure = Meteor.subscribe('epiCohortExposure', myTbl_id);
  } else{
    epiCohortHandle = null;
    epiCohortExposure = null;
  }
});

Session.setDefault('epiCohort_myTbl', null);
Session.setDefault('epiCohortShowNew', false);
Session.setDefault('epiCohortEditingId', null);

Template.epiCohortTbl.helpers({
  "getEpiCohorts" : function(){
    return EpiCohort.find();
  },
  "showNew" : function(){
    return Session.get("epiCohortShowNew");
  },
  "isEditing" : function(){
    return Session.equals('epiCohortEditingId', this._id);
  }
});

Template.epiCohortTbl.events({
  'click #epiCohort-show-create': function(evt, tmpl){
      Session.set("epiCohortShowNew", true);
  },
  'click #epiCohort-show-edit': function(evt, tmpl){
      Session.set("epiCohortEditingId", this._id);
      Deps.flush(); // update DOM before focus
      activateInput(tmpl.find("input[name=reference]"));
  }
});

Template.epiCohortForm.helpers({
  "checkIsNew" : function(isNew){
    return (isNew==="T");
  }
});

Template.epiCohortForm.events({
  'click #epiCohort-create': function (evt, tmpl){
      var obj = new_values(tmpl);
      obj['timestamp'] = (new Date()).getTime();
      obj['user_id'] = Meteor.userId();
      obj['myTbl_id'] = Session.get('epiCohort_myTbl');
      EpiCohort.insert(obj);
      Session.set("epiCohortShowNew", false);
    },
    'click #epiCohort-create-cancel': function (evt, tmpl){
      Session.set("epiCohortShowNew", false);
    },
    'click #epiCohort-update': function (evt, tmpl){
      var vals = update_values(tmpl, this);
      EpiCohort.update(this._id, {$set: vals});
      Session.set("epiCohortEditingId", null);
    },
    'click #epiCohort-update-cancel': function (evt, tmpl){
      Session.set("epiCohortEditingId", null);
    },
    'click #epiCohort-delete': function (evt, tmpl){
      EpiCohort.remove(this._id);
      Session.set("epiCohortEditingId", null);
    }
});

Session.setDefault('epiCohortExposureShowNew', false);
Session.setDefault('epiCohortExposureEditingId', null);


Template.epiCohortExposureTbl.helpers({
  "getEpiCohortExposures": function(){
    return EpiCohortExposure.find({epiCohort_id: this.epiCohort._id}); //
  },
  "epiCohortExposureShowNew": function(){
    return Session.get("epiCohortExposureShowNew");
  },
  "epiCohortExposureIsEditable" : function(editable){
    return (editable==="T");
  },
  "epiCohortExposureIsEditing": function(){
    return Session.equals('epiCohortExposureEditingId', this._id);
  }
});

Template.epiCohortExposureTbl.events({
    'click #epiCohortExposure-show-create': function(evt, tmpl){
        Session.set("epiCohortExposureShowNew", true);
    },
    'click #epiCohortExposure-show-edit': function(evt, tmpl){
        Session.set("epiCohortExposureEditingId", this._id);
        Deps.flush(); // update DOM before focus
        activateInput(tmpl.find("input[name=organSite]"));
    }
});

Template.epiCohortExposureForm.helpers({
  "epiCohortExposureCheckIsNew" : function(isNew){
    return (isNew==="T");
  }
});

Template.epiCohortExposureForm.events({
  'click #epiCohortExposure-create': function (evt, tmpl){
      var obj = new_values(tmpl);
      obj['timestamp'] = (new Date()).getTime();
      obj['user_id'] = Meteor.userId();
      obj['epiCohort_id'] = tmpl.data.epiCohort._id;
      obj['myTbl_id'] = Session.get('epiCohort_myTbl');
      EpiCohortExposure.insert(obj);
      Session.set("epiCohortExposureShowNew", false);
    },
    'click #epiCohortExposure-create-cancel': function (evt, tmpl){
      Session.set("epiCohortExposureShowNew", false);
    },
    'click #epiCohortExposure-update': function (evt, tmpl){
      var vals = update_values(tmpl, this);
      EpiCohort.update(this._id, {$set: vals});
      Session.set("epiCohortExposureEditingId", null);
    },
    'click #epiCohortExposure-update-cancel': function (evt, tmpl){
      Session.set("epiCohortExposureEditingId", null);
    },
    'click #epiCohortExposure-delete': function (evt, tmpl){
      EpiCohort.remove(this._id);
      Session.set("epiCohortExposureEditingId", null);
    }
});
