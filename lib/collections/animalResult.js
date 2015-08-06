var instanceMethods = {};
AnimalEndpointEvidence = new Meteor.Collection('animalEndpointEvidence', {
  transform: function (doc) {
    return  _.extend(Object.create(instanceMethods), doc);
  }
});


// collection class methods/attributes
_.extend(AnimalEndpointEvidence, {});


tblBuilderCollections.attachSchema(AnimalEndpointEvidence, _.extend({
    parent_id: {
        type: SimpleSchema.RegEx.Id,
        denyUpdate: true
    },
    tumourSite: {
        label: "Tumour site",
        type: String,
        min: 1
    },
    histology: {
        label: "Histology",
        type: String,
        min: 1
    },
    units: {
        label: "Dosing units",
        type: String,
        min: 1
    },
    "endpointGroups.$.dose": {
        label: "Dose",
        type: String
    },
    "endpointGroups.$.nStart": {
        label: "N at start",
        type: Number,
        decimal: false
    },
    "endpointGroups.$.nSurviving": {
        label: "N surviving",
        type: String,
        optional: true
    },
    "endpointGroups.$.incidence": {
        label: "Tumour incidence",
        type: String,
        optional: true
    },
    "endpointGroups.$.multiplicity": {
        label: "Tumour multiplicity",
        type: String,
        optional: true
    },
    "endpointGroups.$.totalTumours": {
        label: "Total tumours",
        type: String,
        optional: true
    },
    incidence_significance: {
        label: "Incidence significance notes",
        type: String,
        optional: true
    },
    multiplicity_significance: {
        label: "Multiplicity significance notes",
        type: String,
        optional: true
    },
    total_tumours_significance: {
        label: "Total tumours significance notes",
        type: String,
        optional: true
    }
}, tblBuilderCollections.base, tblBuilderCollections.table));
