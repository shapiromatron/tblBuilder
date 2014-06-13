EpiCohort = new Meteor.Collection('epiCohort');

var epiCohortHandle = null;

Deps.autorun(function () {
  var myTbl_id = Session.get('epiCohort_myTbl');
  if (myTbl_id){
    epiCohortHandle = Meteor.subscribe('epiCohort', myTbl_id);
    } else{
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
  "epiCohortShowNew" : function(){
    return Session.get("epiCohortShowNew");
  },
  "epiCohortIsEditing" : function(){
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
  "epiCohortIsNew" : function(val){return (val==="T");}
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
      var vals = update_values(tmpl.find('#epiCohortForm'), this);
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
