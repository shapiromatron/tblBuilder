var instanceMethods = {};
NtpEpiResult = new Meteor.Collection('ntpEpiResult', {
  transform: function (doc) {
    return  _.extend(Object.create(instanceMethods), doc);
  }
});


// collection class methods/attributes
_.extend(NtpEpiResult, {});
