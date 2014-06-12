
// References -- {citation: String,
//                timestamp: Number}
Refs = new Meteor.Collection("refs");

// Publish all items for requested list_id.
Meteor.publish('refs', function () {
  return Refs.find();
});


// RelRisks   -- {ref_id: String,
//                low: String,
//                mid: Number,
//                high: Number,
//                timestamp: Number
RelRisks = new Meteor.Collection("relRisks");

// Publish all items for requested list_id.
Meteor.publish('relRisks', function () {
  return RelRisks.find();
});

Meteor.publish('relRisksRef', function (ref_id) {
    check(ref_id, String);
    return RelRisks.find({ref_id: ref_id});
});
