var instanceMethods = {};
Reference = new Meteor.Collection('reference', {
    transform: function (doc) {
        return  _.extend(Object.create(instanceMethods), doc);
    }
});


// collection class methods/attributes
_.extend(Reference, {
    typeOptions: [
        "PubMed",
        "Other"
    ]
});


tblBuilderCollections.attachSchema(Reference, _.extend({
    name: {
        label: "Reference Short Name",
        type: String,
        min: 1
    },
    referenceType: {
        label: "Reference Type",
        type: String,
        allowedValues: Reference.typeOptions,
        denyUpdate: true
    },
    otherURL: {
        label: "Other URL",
        type: SimpleSchema.RegEx.Url,
        optional: true
    },
    pubmedID: {
        label: "PubMed ID",
        type: Number,
        optional: true,
        custom: function() {
            var needsPMID = this.field('referenceType').value === "PubMed",
                isPositive = this.value > 0;
            if (needsPMID && !isPositive) return "required";
        },
        denyUpdate: true
    },
    fullCitation: {
        label: "Full Citation Text",
        type: String,
        min: 1
    },
    pdfURL: {
        label: "PDF URL",
        type: SimpleSchema.RegEx.Url,
        optional: true
    },
    monographAgent: {
        type: [String],
        minCount: 1
    }
}, tblBuilderCollections.base));
