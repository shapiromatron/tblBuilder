var instanceMethods = {};
NtpEpiResult = new Meteor.Collection('ntpEpiResult', {
  transform: function (doc) {
    return  _.extend(Object.create(instanceMethods), doc);
  }
});


// collection class methods/attributes
_.extend(NtpEpiResult, {
});


tblBuilderCollections.attachSchema(NtpEpiResult, _.extend({
    organSite: {
        label: "Organ site",
        type: String,
        min: 1,
        popoverText: "Specify ICD code where needed for clarity (e.g., for lymphomas)",
        typeaheadMethod: "searchOrganSite",
    },
    parent_id: {
        type: SimpleSchema.RegEx.Id,
        denyUpdate: true
    }
}, tblBuilderCollections.base, tblBuilderCollections.table));
