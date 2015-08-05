var clsMethods = {
        typeOptions: [
            "Exposure Evidence",
            "Epidemiology Evidence",
            "Animal Bioassay Evidence",
            "Genetic and Related Effects",
            "Mechanistic Evidence Summary",
        ],
        roleOptions: [
            "projectManagers",
            "teamMembers",
            "reviewers"
        ]
    },
    instanceMethods = {};


Tables = new Meteor.Collection('tables', {
  transform: function (doc) {
    return  _.extend(Object.create(instanceMethods), doc);
  }
});
_.extend(Tables, clsMethods);
