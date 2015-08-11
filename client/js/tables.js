Template.home.onCreated(function() {
  Session.set("tablesShowNew", false);
  Session.set("tablesEditingId", null);
  Session.set("reorderRows", false);
});
Template.home.onDestroyed(function() {
  Session.set("tablesShowNew", false);
  Session.set("tablesEditingId", null);
  Session.set("reorderRows", false);
});


Template.tableActions.events({
  'click #tables-show-create': function(evt, tmpl) {
    Session.set("tablesShowNew", true);
    Tracker.flush();
  },
  'click #reorderRows': function(evt, tmpl) {
    var isReorder = !Session.get('reorderRows');
    Session.set('reorderRows', isReorder);
    if (isReorder) {
      tmpl.sortables = _.map($('.sortables'), function(v){
        return clientShared.initDraggables(v, ".moveTableHandle", Tables);
      });
    } else {
      tmpl.sortables.forEach(function(v) { return v.destroy();});
    }
    clientShared.toggleRowVisibilty(isReorder, $('.moveTableHandle'));
  }
});


Template.volumesList.helpers({
  getMonographs: function() {
    var opts = {fields: {"volumeNumber": 1}, sort: {"volumeNumber": -1}};
    return _.chain(Tables.find({}, opts).fetch())
            .pluck('volumeNumber')
            .uniq()
            .value();
  },
  getMonographAgents: function(volumeNumber){
    return _.chain(Tables.find({volumeNumber: volumeNumber}).fetch())
            .pluck('monographAgent')
            .sort()
            .uniq(true)
            .value()
            .join(", ");
  },
  showNew: function() {
    return Session.get("tablesShowNew");
  },
});


Template.volumeTableList.helpers({
  getMonographAgents: function() {
    var tbls = Tables.find(
      {"volumeNumber": this.volumeNumber},
      {sort: {"monographAgent": 1}}).fetch();
    return _.chain(tbls)
            .pluck("monographAgent")
            .uniq()
            .value();
  },
  getTables: function(volumeNumber, monographAgent) {
    return Tables.find(
      {"volumeNumber": volumeNumber, "monographAgent": monographAgent},
      {sort: {"sortIdx": 1}}).fetch();
  },
  getURL: function() {
    var url;
    switch (this.tblType) {
      case "Mechanistic Evidence Summary":
        return url = Router.path('mechanisticMain', {_id: this._id});
      case "Epidemiology Evidence":
        return url = Router.path('epiMain', {_id: this._id});
      case "Exposure Evidence":
        return url = Router.path('exposureMain', {_id: this._id});
      case "Animal Bioassay Evidence":
        return url = Router.path('animalMain', {_id: this._id});
      case "Genetic and Related Effects":
        return url = Router.path('genotoxMain', {_id: this._id});
      default:
        return url = Router.path('404');
    }
  },
  canEdit: function() {
    var currentUser = Meteor.user(),
        ids = [], id;

    if (currentUser) id = currentUser._id;
    if (id === undefined) return false;
    if (currentUser.roles.indexOf("superuser") >= 0) return true;

    ids = _.chain(this.user_roles)
           .filter(function(v){return v.role === "projectManagers";})
           .pluck("user_id")
           .value();

    return (id === this.user_id) || (indexOf.call(ids, id) >= 0);
  },
  showNew: function() {
    return Session.get("tablesShowNew");
  },
  isEditing: function() {
    return Session.equals('tablesEditingId', this._id);
  }
});
Template.volumeTableList.events({
  'click #tables-show-edit': function(evt, tmpl) {
    Session.set("tablesEditingId", this._id);
    Tracker.flush();
    return clientShared.activateInput(tmpl.find("input[name=volumeNumber]"));
  },
  'click #agentEpiReport': function(evt, tmpl) {
    var div = tmpl.find('#modalHolder'),
        val = $(evt.target).data();
    val.multiTable = true;
    return Blaze.renderWithData(Template.reportTemplateModal, val, div);
  }
});


var getUserPermissionsObject = function(tmpl) {
  var ids = {},
      results = [],
      user_id;

  ['projectManagers', 'teamMembers', 'reviewers'].forEach(function(role){
    tmpl.findAll("." + role + " li").forEach(function(li){
      user_id = $(li).data('user_id');
      if (ids[user_id] === undefined){
        results.push({"user_id": user_id, "role": role});
        ids[user_id] = true;
      }
    });
  });
  return results;
};
Template.tablesForm.helpers({
  searchUsers: function(query, callback) {
    return Meteor.call('searchUsers', query, {}, function(err, res) {
      if (err) return console.log(err);
      return callback(res);
    });
  },
  getRoledUsers: function(userType) {
    if (!this.user_roles) return;
    var ids = _.chain(this.user_roles)
           .filter(function(d){return d.role === userType;})
           .pluck("user_id")
           .value();
    return Meteor.users.find({_id: {$in: ids}});
  },
  getTblTypeOptions: function() {
    return Tables.typeOptions;
  }
});
Template.tablesForm.events({
  'click #tables-create': function(evt, tmpl) {
    var errorDiv, isValid, obj;
    obj = clientShared.newValues(tmpl.find("#tablesForm"));
    obj['user_roles'] = getUserPermissionsObject(tmpl);
    delete obj['projectManagers'];
    delete obj['teamMembers'];
    delete obj['reviewers'];
    isValid = Tables.simpleSchema()
                    .namedContext()
                    .validate(obj);
    if (isValid) {
      Tables.insert(obj);
      return Session.set("tablesShowNew", false);
    } else {
      errorDiv = clientShared.createErrorDiv(Tables.simpleSchema().namedContext());
      return $(tmpl.find("#errors")).html(errorDiv);
    }
  },
  'click #tables-create-cancel': function(evt, tmpl) {
    return Session.set("tablesShowNew", false);
  },
  'click #tables-update': function(evt, tmpl) {
    var errorDiv, isValid, modifier, vals;
    vals = clientShared.updateValues(tmpl.find("#tablesForm"), this);
    vals['user_roles'] = getUserPermissionsObject(tmpl);
    delete vals['projectManagers'];
    delete vals['teamMembers'];
    delete vals['reviewers'];
    modifier = {$set: vals};
    isValid = Tables.simpleSchema()
                    .namedContext()
                    .validate(modifier, {modifier: true});
    if (isValid) {
      Tables.update(this._id, modifier);
      return Session.set("tablesEditingId", null);
    } else {
      errorDiv = clientShared.createErrorDiv(Tables.simpleSchema().namedContext());
      return $(tmpl.find("#errors")).html(errorDiv);
    }
  },
  'click #tables-update-cancel': function(evt, tmpl) {
    return Session.set("tablesEditingId", null);
  },
  'click #tables-delete': function(evt, tmpl) {
    Tables.remove(this._id);
    return Session.set("tablesEditingId", null);
  },
  'click .removeUser': function(evt, tmpl) {
    return $(evt.currentTarget).parent().remove();
  },
  'typeahead:selected .userTypeahead': function(evt, tmpl, v) {
    var $ul, ids;

    ids = [];
    $ul = $(tmpl.find("." + evt.target.name));
    $ul.find('li').each(function(i, li){
      ids.push($(li).data('user_id'));
    })

    if (ids.indexOf(v._id) < 0) {
      return Blaze.renderWithData(Template.UserLI, v, $ul[0]);
    }
  }
});
Template.tablesForm.onRendered(function() {
  clientShared.activateInput(this.find("input[name=volumeNumber]"));
  Meteor.typeahead.inject('.userTypeahead');
});
