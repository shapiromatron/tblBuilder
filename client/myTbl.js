MyTbls = new Meteor.Collection('myTbls');

var myTblsHandle = Meteor.subscribe('myTbls', Meteor.userId());

Session.setDefault("myTblShowNew", false);
Session.setDefault('myTblEditingId', null);

Template.myTbl.getMyTbls = function(){
    return MyTbls.find();
};

Template.myTbl.showNew = function(){
    return Session.get("myTblShowNew");
};

Template.myTbl.isEditing = function(){
  return Session.equals('myTblEditingId', this._id);
};

Template.myTbl.events({
    'click #myTbl-show-create': function(evt, tmpl){
        Session.set("myTblShowNew", true);
    },
    'click #myTbl-show-edit': function(evt, tmpl){
        Session.set("myTblEditingId", this._id);
        Deps.flush(); // update DOM before focus
        activateInput(tmpl.find("input[name=name]"));
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
    },
    'click #myTbl-update': function (evt, tmpl){
      var vals = update_values(tmpl, this);
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
