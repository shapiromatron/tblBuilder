// Define Minimongo collections to match server/publish.js.
Refs = new Meteor.Collection("refs");
RelRisks = new Meteor.Collection("relRisks");

// Subscribe to 'lists' collection on startup.
// Select a list once data has arrived.
var listsHandle = Meteor.subscribe('refs', function (){}), // grabs all from server
    listsHandle2 = Meteor.subscribe('relRisks', function (){});

// ID of currently selected list
Session.setDefault('editing_ref', null);
Session.setDefault('ref_shownew', false);
Session.setDefault('show_nondisplay', false);

Session.setDefault('rr_editing_id', null);
Session.set("rr_shownew", false);

/*
  Helper-functions, module-level namespace
*/
okCancelEvents = function (selector, callbacks) {
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
  tmpl.findAll("input").each(function(idx, inp){
    var val = get_value(inp),
        key = inp.name;
    if (obj[key] !== val) updates[key] = val;
  });
  return updates;
}, new_values = function(tmpl){
  var obj = {};
  tmpl.findAll("select,input").each(function(idx, inp){
    obj[inp.name] = get_value(inp);
  });
  return obj;
}, get_value = function(inp){
  var val;
  switch (inp.type) {
    case "text":
    case "hidden":
      val = inp.value;
      break;
    case "checkbox":
      val = inp.checked;
      break;
    case "select-one":
      val = $(inp).find('option:selected').val();
      break;
  }
  return val;
};

/*
  Reference tbody template settings
*/
Template.refs_tbody.references = function(){
  return Refs.find({}, {sort: {_idx: 1}});
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
    },
    'click #ref-move-up': function (evt, tmpl){
      var tr = $(tmpl.find('tr[data-idx=' + this._idx + ']')),
          prev = tr.prev();
      if (prev.length===1){
        Refs.update(this._id,
                    {$set: {'_idx': parseInt(prev.attr('data-idx'), 10) }});
        Refs.update(prev.attr('data-id'),
                    {$set: {'_idx': this._idx }});
      }
    },
    'click #ref-move-down': function (evt, tmpl){
      var tr = $(tmpl.find('tr[data-idx=' + this._idx + ']')),
          next = tr.next();
      if (next.length===1){
        Refs.update(this._id,
                    {$set: {'_idx': parseInt(next.attr('data-idx'), 10) }});
        Refs.update(next.attr('data-id'),
                    {$set: {'_idx': this._idx }});
      }
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
  },
  'click #download-excel' : function (evt, tmpl){
    Meteor.call('publish_workbook', 'foo', function(err, response) {
      var s2ab = function(s) {
          var buf = new ArrayBuffer(s.length);
          var view = new Uint8Array(buf);
          for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
          return buf;
      }, blob = new Blob([s2ab(response)], {type: "application/octet-stream"});
      saveAs(blob, "test.xlsx");
    });
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
      Session.set('ref_shownew', false);
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


// RR Templates
Template.rr_form.events({
  'click #rr-create': function (evt, tmpl){
      var obj = new_values(tmpl);
      obj['timestamp'] = (new Date()).getTime();
      RelRisks.insert(obj);
      Session.set("rr_shownew", false);
    },
    'click #rr-create-cancel': function (evt, tmpl){
      Session.set("rr_shownew", false);
    },
    'click #rr-update': function (evt, tmpl){
      var vals = update_values(tmpl, this);
      RelRisks.update(this._id, {$set: vals});
      Session.set("rr_editing_id", null);
    },
    'click #rr-update-cancel': function (evt, tmpl){
      Session.set("rr_editing_id", null);
    },
    'click #rr-delete': function (evt, tmpl){
      RelRisks.remove(this._id);
      Session.set("rr_editing_id", null);
    }
});

Template.rr_tbl.rr_shownew = function(){
  return Session.get('rr_shownew');
};
Template.rr_tbl.isEditing = function(){
  return Session.equals('rr_editing_id', this._id);
};

Template.rr_tbl.helpers({
  "relRisks": function(){
    return RelRisks.find({ref_id: this.ref_id});
  },
  "showEdit": function(val){
    return (val==="T");
  }
});

Template.rr_tbl.events({
  'click #rr-new-form' : function (evt, tmpl) {
    Session.set("rr_shownew", true);
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("input[name=name]"));
  },
  'click #rr-toggle-edit' : function (evt, tmpl){
    Session.set("rr_editing_id", this._id);
    Deps.flush(); // update DOM before focus
    activateInput(tmpl.find("input[name=name]"));
  }
});

Router.map(function () {
    this.route('my_lists', {path: '/'});
    this.route('in_vitro', {path: '/in_vitro'});
    this.route('404', {path: '*'});
});
