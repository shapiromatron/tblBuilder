var instanceMethods = {};
Tables = new Meteor.Collection('tables', {
    transform: function (doc) {
        return  _.extend(Object.create(instanceMethods), doc);
    }
});


// collection class methods/attributes
_.extend(Tables, {
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
});


tblBuilderCollections.attachSchema(Tables, _.extend({
    monographAgent: {
        label: "Monograph Agent Name",
        type: String,
        min: 1
    },
    volumeNumber: {
        label: "Volume Number",
        type: Number,
        decimal: false
    },
    name: {
        label: "Table Name",
        type: String,
        min: 1
    },
    tblType: {
        label: "Table Type",
        type: String,
        allowedValues: Tables.typeOptions,
        denyUpdate: true
    },
    "user_roles.$.user_id": {
        type: SimpleSchema.RegEx.Id
    },
    "user_roles.$.role": {
        type: String,
        allowedValues: Tables.roleOptions
    },
    sortIdx: {
        type: Number,
        decimal: true,
        optional: true
    }
}, tblBuilderCollections.base));