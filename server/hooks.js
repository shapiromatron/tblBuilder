var addTimestampAndUserID = function(userId, doc) {
    doc.timestamp = new Date();
    doc.user_id = userId;
  },
  addQAmarks = function(doc) {
    doc.isQA = false;
    doc.timestampQA = null;
    doc.user_id_QA = null;
  },
  getNewIdx = function(Cls, tbl_id) {
    // auto-incrementing table index , starting at 1
    var max = 0;
        found = Cls.findOne(
          {tbl_id: tbl_id},
          {sort: {sortIdx: -1}}
        );
    if (found) max = found.sortIdx;
    return max + 1;
  },
  addTblContentInsertion = function(userId, doc, Cls){
    addTimestampAndUserID(userId, doc);
    addQAmarks(doc);
    doc.isHidden = false;
    if(doc.sortIdx === undefined) doc.sortIdx = getNewIdx(Cls, doc.tbl_id);
    return true;
  };


Meteor.startup(function() {

  // Pre-create hooks
  Tables.before.insert(function(userId, doc) {
    var currentMax, currentMaxTable;
    addTimestampAndUserID(userId, doc);
    currentMaxTable = Tables.findOne(
      {"volumeNumber": doc.volumeNumber, "monographAgent": doc.monographAgent},
      {"sort": {"sortIdx": -1}}
    );
    currentMax = currentMaxTable ? currentMaxTable.sortIdx : 0;
    doc.sortIdx = currentMax + 1;
    return true;
  });

  ReportTemplate.before.insert(function(userId, doc) {
    addTimestampAndUserID(userId, doc);
    return true;
  });

  Reference.before.insert(function(userId, doc) {
    var newMonographAgent, ref;
    addTimestampAndUserID(userId, doc);

    if (isFinite(doc.pubmedID)) {
      ref = Reference.findOne({pubmedID: doc.pubmedID});
    } else {
      ref = Reference.findOne({fullCitation: doc.fullCitation});
    }

    if ((ref != null)) {
      newMonographAgent = doc.monographAgent[0];
      if (ref.monographAgent.indexOf(newMonographAgent) < 0) {
        Reference.update(ref._id, {$push: {'monographAgent': newMonographAgent}});
      }
      return false;  // don't create
    }
  });

  tblBuilderCollections.evidenceTypes.forEach(function(Cls){
    Cls.before.insert(function(userId, doc){
      return addTblContentInsertion(userId, doc, Cls);
    });
  })


  // Remove hooks
  Tables.before.remove(function(userId, doc) {
    tblBuilderCollections.evidenceTypes.forEach(function(Cls){
      Cls.remove({tbl_id: doc._id})
    });
  });


  // Post-insert hooks
  Meteor.users.after.insert(function(userId, doc) {
    return Roles.addUsersToRoles(doc._id, "default");
  });

  Tables.after.insert(function(userId, doc) {
    if (doc.tblType === "Mechanistic Evidence Summary") {
      // todo: move to collection-level method
      MechanisticEvidence.evidenceCategories.forEach(function(category){
        MechanisticEvidence.insert({
          tbl_id: doc._id,
          section: "characteristics",
          text: "",
          subheading: category,
          humanInVivo: "I",
          animalInVivo: "I",
          humanInVitro: "I",
          animalInVitro: "I",
          references: []
        });
      });
    }
  });

});
