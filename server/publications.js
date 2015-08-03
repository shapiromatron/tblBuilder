var userCanView = function(tbl, userId) {
  // User-can view permissions check on a table-level basis.
  if (serverShared.isStaffOrHigher(userId)) return true;

  if (tbl && userId) {
    var valid_ids = _.pluck(tbl.user_roles, "user_id");
    return (userId === tbl.user_id) || (valid_ids.indexOf(userId) >= 0);
  }
  return false;
};

Meteor.publish('tables', function(user_id) {
  var options = {sort: [['volumeNumber', 'desc'], ['timestamp', 'desc']]};
  if (this.userId != null) {
    if (serverShared.isStaffOrHigher(this.userId)) {
      return Tables.find({}, options);
    } else {
      return Tables.find({
        $or: [
          {user_id: this.userId},
          {user_roles: {$elemMatch: {user_id: this.userId}}}
        ]
      }, options);
    }
  }
  return this.ready();
});

Meteor.publish('epiDescriptive', function(tbl_id) {
  var tbl;
  check(tbl_id, String);
  tbl = Tables.findOne({_id: tbl_id});
  if (userCanView(tbl, this.userId)) {
    return [
      EpiDescriptive.find({tbl_id: tbl_id}),
      EpiResult.find({tbl_id: tbl_id}),
      Reference.find({monographAgent: {$in: [tbl.monographAgent]}})
    ];
  }
  return this.ready();
});

Meteor.publish('epiCollective', function(volumeNumber, monographAgent) {
  var allTbls, i, len, tbl, tbl_ids, tbls;
  allTbls = Tables.find({
    tblType: "Epidemiology Evidence",
    volumeNumber: parseInt(volumeNumber, 10),
    monographAgent: monographAgent
  }).fetch();

  tbls = _.filter(allTbls, function(tbl){
    return userCanView(tbl, this.userId);
  }, this);

  if (tbls.length > 0) {
    tbl_ids = _.pluck(tbls, "_id");
    return [
      EpiDescriptive.find({tbl_id: {$in: tbl_ids}}),
      EpiResult.find({tbl_id: {$in: tbl_ids}}),
      Reference.find({monographAgent: {$in: [monographAgent]}})
    ];
  }
  return this.ready();
});

Meteor.publish('mechanisticEvidence', function(tbl_id) {
  var tbl;
  check(tbl_id, String);
  tbl = Tables.findOne({_id: tbl_id});
  if (userCanView(tbl, this.userId)) {
    return [
      MechanisticEvidence.find({tbl_id: tbl_id}),
      Reference.find({monographAgent: {$in: [tbl.monographAgent]}})
    ];
  }
  return this.ready();
});

Meteor.publish('exposureEvidence', function(tbl_id) {
  var tbl;
  check(tbl_id, String);
  tbl = Tables.findOne({_id: tbl_id});
  if (userCanView(tbl, this.userId)) {
    return [
      ExposureEvidence.find({tbl_id: tbl_id}),
      Reference.find({monographAgent: {$in: [tbl.monographAgent]}})
    ];
  }
  return this.ready();
});

Meteor.publish('animalEvidence', function(tbl_id) {
  var tbl;
  check(tbl_id, String);
  tbl = Tables.findOne({_id: tbl_id});
  if (userCanView(tbl, this.userId)) {
    return [
      AnimalEvidence.find({tbl_id: tbl_id}),
      AnimalEndpointEvidence.find({tbl_id: tbl_id}),
      Reference.find({monographAgent: {$in: [tbl.monographAgent]}})
    ];
  }
  return this.ready();
});

Meteor.publish('genotoxEvidence', function(tbl_id) {
  var tbl;
  check(tbl_id, String);
  tbl = Tables.findOne({_id: tbl_id});
  if (userCanView(tbl, this.userId)) {
    return [
      GenotoxEvidence.find({tbl_id: tbl_id}),
      Reference.find({monographAgent: {$in: [tbl.monographAgent]}})
    ];
  }
  return this.ready();
});

Meteor.publish('tblUsers', function(tbl_id) {
  var ids, tbl, v;
  check(tbl_id, String);
  tbl = Tables.findOne(tbl_id);
  if (userCanView(tbl, this.userId)) {
    ids = (function() {
      var i, len, ref, results;
      ref = tbl.user_roles;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        v = ref[i];
        results.push(v.user_id);
      }
      return results;
    })();
    return Meteor.users.find({_id: {$in: ids}}, {fields: {_id: 1, emails: 1, profile: 1}});
  }
  return this.ready();
});

Meteor.publish('adminUsers', function() {
  if (serverShared.isStaffOrHigher(this.userId)) {
    return Meteor.users.find({}, {fields: {_id: 1, emails: 1, profile: 1, roles: 1, createdAt: 1}});
  } else {
    return this.ready();
  }
});

Meteor.publish('monographReference', function(monographAgent) {
  check(monographAgent, String);
  return Reference.find({monographAgent: {$in: [monographAgent]}});
});

Meteor.publish('reportTemplate', function() {
  return ReportTemplate.find();
});
