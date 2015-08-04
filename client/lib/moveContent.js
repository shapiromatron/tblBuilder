Template.moveModalHolder.helpers({
  getCurrentTable: function() {
    var d = Session.get('Tbl');
    return d.volumeNumber + " " + d.monographAgent + ": " + d.name;
  },
  getOptions: function() {
    var userId = Meteor.userId(),
        tbls = Tables.find({tblType: Session.get("Tbl").tblType}).fetch();

    return _.chain(tbls).filter(clientShared.userCanEdit).map(function(d) {
      return "<option value='" + d._id + "'>" + d.volumeNumber + " " + d.monographAgent + ": " + d.name + "</option>";
    }).value().join("");
  }
});

Template.moveModalHolder.events({
  'click #move-content': function(evt, tmpl) {
    var content_id = this.content._id,
        tbl_id = $(tmpl.find("select[name='moveTblTo']")).val(),
        ET = clientShared.evidenceType[Session.get("evidenceType")],
        nesteds;

    ET.collection.update(
      {"_id": content_id},
      {$set: {"tbl_id": tbl_id, "sortIdx": 500}});

    if (ET.nested_collection != null) {
      nesteds = ET.nested_collection.find({parent_id: content_id}).fetch();
      nesteds.forEach(function(nested){
        ET.nested_collection.update(
          {"_id": nested._id}, {
          $set: {"tbl_id": tbl_id}});
      })

    }
    return $(tmpl.firstNode).modal('hide');
  }
});

Template.moveModalHolder.rendered = function() {
  return $(this.find('#moveModalHolder')).modal('show');
};
