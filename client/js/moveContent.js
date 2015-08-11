Template.moveModal.helpers({
  getCurrentTable: function() {
    var d = Session.get('Tbl');
    return "{0} {1}: {2}".printf(d.volumeNumber, d.monographAgent, d.name);
  },
  getOptions: function() {
    var userId = Meteor.userId(),
        tbls = Tables.find({tblType: Session.get("Tbl").tblType}).fetch();

    return _.chain(tbls)
      .filter(clientShared.userCanEdit)
      .map(function(d) {
        return "<option value='{0}'>{1} {2}: {3}</option>".printf(
          d._id, d.volumeNumber, d.monographAgent, d.name);
      })
      .value().join("");
  }
});
Template.moveModal.events({
  'click #move-content': function(evt, tmpl) {
    var content_id = this.content._id,
        tbl_id = $(tmpl.find("select[name='moveTblTo']")).val(),
        newMonographAgent = Tables.findOne(tbl_id).monographAgent,
        ET = tblBuilderCollections.evidenceLookup[Session.get("evidenceType")],
        nesteds;

    // ensure reference is associated with monographAgent
    if (this.content.referenceID){
      Reference
          .findOne(this.content.referenceID)
          .addMonographAgent(newMonographAgent);
    }

    // update reference
    ET.collection.update(
      {"_id": content_id},
      {$set: {"tbl_id": tbl_id, "sortIdx": 1000}});

    // move nested collections
    if (ET.nested_collection != null) {
      nesteds = ET.nested_collection.find({parent_id: content_id}).fetch();
      nesteds.forEach(function(nested){
        ET.nested_collection.update(
          {"_id": nested._id}, {
          $set: {"tbl_id": tbl_id}});
      })
    }

    $(tmpl.firstNode).modal('hide');
  }
});
Template.moveModal.onRendered(function() {
  $(this.find('#moveModal')).modal('show');
});
