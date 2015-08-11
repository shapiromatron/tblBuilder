var setAdminNotification = function(message, type) {
  var div = $('#messages')[0],
      data = {
        alertType: type,
        message: message
      };
  return Blaze.renderWithData(Template.dismissableAlert, data, div);
},
getAdminUserValues = function(tmpl) {
  var obj = {
        profile: {
          fullName: tmpl.find('input[name="fullName"]').value,
          affiliation: tmpl.find('input[name="affiliation"]').value
        },
        emails: [
          {
            address: tmpl.find('input[name="email"]').value,
            verified: false
          }
        ],
        roles: []
      };

  tmpl.findAll('input[type="checkbox"]').forEach(function(inp){
    if (inp.checked) obj.roles.push(inp.name);
  });

  return obj;
};


Template.adminMain.onCreated(function() {
  Session.set('adminUserEditingId', null);
  Session.set("adminUserShowNew", false);
  Session.set("reportTemplateEditingId", null);
  Session.set("reportTemplateShowNew", false);
});
Template.adminMain.onDestroyed(function() {
  Session.set('adminUserEditingId', null);
  Session.set("adminUserShowNew", false);
  Session.set("reportTemplateEditingId", null);
  Session.set("reportTemplateShowNew", false);
});


Template.admin.helpers({
  getUsers: function() {
    return Meteor.users.find({}, {sort: {createdAt: -1}});
  },
  adminUserShowNew: function() {
    return Session.get("adminUserShowNew");
  }
});
Template.admin.events({
  'click #adminUser-show-create': function(evt, tmpl) {
    return Session.set("adminUserShowNew", true);
  }
});


Template.adminUserRow.helpers({
  adminUserIsEditing: function() {
    return Session.equals('adminUserEditingId', this._id);
  },
  getUserEmail: function() {
    return _.pluck(this.emails, 'address').join(", ");
  },
  getRoles: function() {
    return this.roles.join(', ');
  }
});
Template.adminUserRow.events({
  'click #adminUser-show-edit': function(evt, tmpl) {
    Session.set("adminUserEditingId", this._id);
    Tracker.flush();
    return clientShared.activateInput(tmpl.find("input[name=fullName]"));
  },
  'click #adminUser-resetPassword': function(evt, tmpl) {
    var email, message;
    Meteor.call('adminUserResetPassword', this._id);
    email = this.emails[0].address;
    message = "An password-reset email was just sent to " + email;
    return setAdminNotification(message, "success");
  },
  'click #adminUser-removeUser': function(evt, tmpl) {
    var message;
    Meteor.users.remove(this._id);
    message = "User removed";
    return setAdminNotification(message, "success");
  },
  'click #adminUser-setPassword': function(evt, tmpl) {
    var passwd;
    passwd = tmpl.find("input[name='password']").value;
    if (passwd.length < 6) {
      return setAdminNotification("Must be at least six-characters", "danger");
    }
    return Meteor.call('adminSetPassword', this._id, passwd, function(error, result) {
      if ((result != null) && result.success) {
        return setAdminNotification("Password successfully changed", "success");
      } else {
        return setAdminNotification("An error occurred", "danger");
      }
    });
  }
});
Template.adminUserRowForm.helpers({
  getEmail: function() {
    if (this.emails != null) return this.emails[0].address;
  },
  hasRole: function(v) {
    if (this.roles != null) {
      return this.roles.indexOf(v.hash.role) >= 0;
    } else {
      return false;
    }
  }
});


Template.adminUserRowForm.events({
  'click #adminUser-update': function(evt, tmpl) {
    var vals = getAdminUserValues(tmpl);
    Meteor.call('adminUserEditProfile', this._id, vals);
    return Session.set("adminUserEditingId", null);
  },
  'click #adminUser-update-cancel': function(evt, tmpl) {
    return Session.set("adminUserEditingId", null);
  },
  'click #adminUser-create': function(evt, tmpl) {
    var vals = getAdminUserValues(tmpl), msg;
    Meteor.call('adminUserCreateProfile', vals);
    Session.set("adminUserShowNew", false);
    msg = "User created- an email was sent to user to create password.";
    return setAdminNotification(msg, "success");
  },
  'click #adminUser-create-cancel': function(evt, tmpl) {
    return Session.set("adminUserShowNew", false);
  }
});
