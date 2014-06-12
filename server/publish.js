// References -- {_id: String,
//                user_id: String,
//                tblType: String,
//                name: String,
//                passwd: String,
//                timestamp: Number}
MyTbls = new Meteor.Collection('myTbls');

// Publish all items for requested list_id.
Meteor.publish('myTbls', function (user_id) {
    check(user_id, String);
    return MyTbls.find({user_id: user_id});
});


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
//                timestamp: Number}
RelRisks = new Meteor.Collection("relRisks");

// Publish all items for requested list_id.
Meteor.publish('relRisks', function () {
  return RelRisks.find();
});

Meteor.publish('relRisksRef', function (ref_id) {
    check(ref_id, String);
    return RelRisks.find({ref_id: ref_id});
});
