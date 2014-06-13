EpiCohort = new Meteor.Collection('epiCohort');

var epiCohortHandle = Meteor.subscribe('epiCohort', Session.get('epiCohort_myTbl'));

Session.setDefault('epiCohort_myTbl', null);
Session.setDefault('epiCohortShowNew', false);
Session.setDefault('epiCohortEditingId', null);


Template.epiCohortTbl.getEpiCohorts = function(){
    return EpiCohort.find();
};

Template.epiCohortTbl.showNew = function(){
    return Session.get("epiCohortShowNew");
};

Template.epiCohortTbl.isEditing = function(){
  return Session.equals('epiCohortEditingId', this._id);
};

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

Template.epiCohortForm.events({
  'click #epiCohort-create': function (evt, tmpl){
      var obj = new_values(tmpl);
      obj['timestamp'] = (new Date()).getTime();
      obj['user_id'] = Meteor.userId();
      obj['myTbl_id'] = Session.get('epiCohort_myTbl');
      console.log(obj);
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
