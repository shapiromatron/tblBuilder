var instanceMethods = {
    addMonographAgent: function(monographAgent){
        if (_.contains(this.monographAgent, monographAgent)) return;
        this.monographAgent.push(monographAgent);
        var vals = {monographAgent: this.monographAgent};
        Reference.update(this._id, {$set: vals});
    },
    getSortString: function(){
        var yr = "0000",
            nums = this.name.match(/\d{4}/g);
        if (nums) yr = nums.pop();
        return "{0}_{1}".printf(yr, this.name);
    },
};
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
    ],
    tabular: function(monographAgent){
        var data, refs,
            header = [
                '_id', 'Short Citation', 'Full Citation',
                'Reference Type', 'Pubmed ID', 'Other URL',
                'PDF link'
            ];

        refs = Reference.find(
            {"monographAgent": {$in: [monographAgent]}},
            {sort: [["name", 1]]}).fetch();
        data = _.map(refs, function(v) {
            return [
                v._id, v.name, v.fullCitation,
                v.referenceType, v.pubmedID, v.otherURL,
                v.pdfURL];
        });
        data.unshift(header);
        return data;
    },
    checkForDuplicate: function(doc){
        // try to get matching reference, or return undefined if not found
        if (doc.pubmedID === null) {
          ref = Reference.findOne({fullCitation: doc.fullCitation});
        } else {
          ref = Reference.findOne({pubmedID: doc.pubmedID});
        }
        return ref;
    },
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
        type: String,
        regEx: [SimpleSchema.RegEx.Url],
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
        type: String,
        regEx: [SimpleSchema.RegEx.Url],
        optional: true
    },
    monographAgent: {
        type: [String],
        minCount: 1
    }
}, tblBuilderCollections.base));
