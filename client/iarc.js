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
    'dblclick #citation-display': function (evt, tmpl){
        Session.set('editing_ref', this._id);
        Deps.flush(); // update DOM before focus
        activateInput(tmpl.find("#citation-editor"));
    }
});

Template.refs_tbody.events(okCancelEvents(
  '#citation-editor',
  {
    ok: function (value) {
      console.log('ok called');
      Refs.update(this._id, {$set: {citation: value}});
      Session.set('editing_ref', null);
    },
    cancel: function () {
      console.log('cancel called');
      console.log(this);
      Session.set('editing_ref', null);
    }
  }));
