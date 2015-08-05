var clsMethods = {
        typeOptions: [
            "PubMed",
            "Other"
        ]
    },
    instanceMethods = {};


Reference = new Meteor.Collection('reference', {
  transform: function (doc) {
    return  _.extend(Object.create(instanceMethods), doc);
  }
});
_.extend(Reference, clsMethods);
