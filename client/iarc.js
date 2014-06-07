// Define Minimongo collections to match server/publish.js.
Refs = new Meteor.Collection("refs");

// Subscribe to 'lists' collection on startup.
// Select a list once data has arrived.
var listsHandle = Meteor.subscribe('refs', function (){});

// ID of currently selected list
Session.setDefault('editing_ref', null);
Session.setDefault('ref_shownew', false);
Session.setDefault('show_nondisplay', false);

/*
  Helper-functions
*/

var okCancelEvents = function (selector, callbacks) {
  // Returns an event map that handles the "escape" and "return" keys and
  // "blur" events on a text input (given by selector) and interprets them
  // as "ok" or "cancel".
  var ok = callbacks.ok || function () {},
      cancel = callbacks.cancel || function () {},
      events = {};

  events['keyup '+selector+', keydown '+selector] =
    function (evt) {
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);
      } else if (evt.type === "keyup" && evt.which === 13) {
        // return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };

  return events;
}, activateInput = function (input) {
  input.focus();
  input.select();
}, update_values = function(tmpl, obj){
  updates = {};
  for (var key in obj){
    var inp = tmpl.find('input[name="' + key + '"]'),
        val = get_value(inp);
    if (inp && obj[key] !== val) updates[key] = val;
  }
  return updates;
}, new_values = function(tmpl){
  var obj = {};
  tmpl.findAll("input").each(function(idx, inp){
    obj[inp.name] = get_value(inp);
  });
  return obj;
}, get_value = function(inp){
  var val;
  switch (inp.type) {
    case "text":
      val = inp.value;
      break;
    case "checkbox":
      val = inp.checked;
      break;
  }
  return val;
};

/*
  Reference tbody template settings
*/
Template.refs_tbody.references = function(){
  return Refs.find({}, {sort: {timestamp: 1}});
};

Template.refs_tbody.editing = function () {
  return Session.equals('editing_ref', this._id);
};

Template.refs_tbody.show_row = function () {
  return Session.get('show_nondisplay') || this._display;
};

Template.refs_tbody.isDisplayClass = function() {
    return this._display ? "" : "nondisplay";
};

Template.refs_tbody.events({
    'click #citation-select-edit': function (evt, tmpl){
        Session.set('editing_ref', this._id);
        Deps.flush(); // update DOM before focus
        activateInput(tmpl.find("input[name=test_system]"));
    }
});

/*
  Reference new form settings
*/

Template.refs_newform.show_new = function(){
  return Session.get('ref_shownew');
};

Template.refs_newform.events({
  'click #display_form' : function (evt, tmpl) {
    Session.set("ref_shownew", true);
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("input[name=test_system]"));
  },
  'click #show-all-rows' : function (evt, tmpl) {
    Session.set("show_nondisplay", !Session.get("show_nondisplay"));
  }
});

/*
  Reference form template settings - from is used in create/update settings
*/
Template.refs_form.events({
    'click #save-settings': function (evt, tmpl){
      var vals = update_values(tmpl, this);
      Refs.update(this._id, {$set: vals});
      Session.set('editing_ref', null);
    },
    'click #cancel-save': function (evt, tmpl){
      Session.set('editing_ref', null);
    },
    'click #cancel-new': function (evt, tmpl){
      console.log('here', Session.get('ref_shownew'));
      Session.set('ref_shownew', false);
      console.log('here', Session.get('ref_shownew'));
    },
    'click #delete': function (evt, tmpl){
      Refs.remove(this._id);
      Session.set('editing_ref', null);
    },
    'click #create-new' : function (evt, tmpl){
      var obj = new_values(tmpl);
      obj['timestamp'] = (new Date()).getTime();
      Session.set('ref_shownew', false);
      Refs.insert(obj);
    }
});

Template.refs_form.isDisplay = function() {
  var display = this._display;
  if (display===undefined) display = true;
  return display ? "checked" : "";
};

Template.refs_form.events(okCancelEvents(
  'input',
  {
    ok: function (value) {},
    cancel: function () {
      Session.set('editing_ref', null);
      Session.set('ref_shownew', false);
    }
  }));
