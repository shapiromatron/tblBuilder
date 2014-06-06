// Define Minimongo collections to match server/publish.js.
Refs = new Meteor.Collection("refs");

// Subscribe to 'lists' collection on startup.
// Select a list once data has arrived.
var listsHandle = Meteor.subscribe('refs', function (){});

// ID of currently selected list
Session.setDefault('editing_ref', null);

////////// Helpers for in-place editing //////////

// Returns an event map that handles the "escape" and "return" keys and
// "blur" events on a text input (given by selector) and interprets them
// as "ok" or "cancel".
var okCancelEvents = function (selector, callbacks) {
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
};

var activateInput = function (input) {
  input.focus();
  input.select();
};

/*
  Reference tbody template event settings
*/
Template.refs_tbody.references = function(){
  return Refs.find({}, {sort: {timestamp: 1}});
}

Template.refs_tbody.editing = function () {
  return Session.equals('editing_ref', this._id);
};

Template.refs_tbody.events({
    'click #citation-select-edit': function (evt, tmpl){
        console.log('edit select');
        Session.set('editing_ref', this._id);
        Deps.flush(); // update DOM before focus
        activateInput(tmpl.find("input[name=test_system]"));
    },
    'click #save-settings': function (evt, tmpl){
      console.log('save select');
      var vals = update_values(tmpl, this);
      Refs.update(this._id, {$set: vals});
      Session.set('editing_ref', null);
    },
    'click #cancel-save': function (evt, tmpl){
      console.log('cancel select');
      Session.set('editing_ref', null);
    },
    'click #delete': function (evt, tmpl){
      console.log('delete select');
      Refs.remove(this._id);
      Session.set('editing_ref', null);
    }
});

var update_values = function(tmpl, obj){
  updates = {}
  for (var key in obj){
    var inp = tmpl.find('input[name="' + key + '"]');
    if (inp && obj[key] !== inp.value) updates[key] = inp.value;
  }
  return updates;
}


// Template.refs_form.events({
//   'click #create-new': function (evt, tmpl){
//       console.log('create new');
//     },
//   'click #cancel-new': function (evt, tmpl){
//       console.log('cancel new');
//     },
// })
