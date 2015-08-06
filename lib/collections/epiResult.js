var instanceMethods = {
    riskFormatter: function(obj) {
        if (obj.riskMid == null) return "-";
        var txt = obj.riskMid.toString();
        if ($.isNumeric(obj.riskLow) && $.isNumeric(obj.riskHigh)) {
          txt += " (" + obj.riskLow + "–" + obj.riskHigh + ")";
        }
        if (obj.riskEstimated) txt = "[" + txt + "]";
        return txt;
    }
};
EpiResult = new Meteor.Collection('epiResult', {
  transform: function (doc) {
    return  _.extend(Object.create(instanceMethods), doc);
  }
});


// collection class methods/attributes
_.extend(EpiResult, {});


var isNumberOrNR = function() {
  if (this.isSet && (this.value === "NR" || isFinite(this.value))) {
    return undefined;
  } else {
    return "numOrNR";
  }
}, extraNTP = {};

if (Meteor.settings["public"].context === "ntp") {
    extraNTP = {
        printCaption: {
            label: "Table caption",
            type: String,
            optional: true
        },
        printOrder: {
            label: "Table print order",
            type: Number,
            decimal: true,
            optional: true
        }
    };
};

tblBuilderCollections.attachSchema(EpiResult, _.extend({
    organSite: {
        label: "Organ site (ICD code)",
        type: String,
        min: 1
    },
    effectMeasure: {
        label: "Measure of effect",
        type: String,
        min: 1
    },
    effectUnits: {
        label: "Units of effect measurement",
        type: String,
        optional: true
    },
    trendTest: {
        label: "p-value for trend",
        type: Number,
        decimal: true,
        optional: true
    },
    "riskEstimates.$.exposureCategory": {
        label: "Exposure category or level",
        type: String,
        min: 1
    },
    "riskEstimates.$.numberExposed": {
        label: "Exposed cases/deaths",
        type: String,
        custom: isNumberOrNR
    },
    "riskEstimates.$.riskMid": {
        label: "Risk estimate",
        type: Number,
        decimal: true,
        optional: true
    },
    "riskEstimates.$.riskLow": {
        label: "95% lower CI",
        type: Number,
        decimal: true,
        optional: true
    },
    "riskEstimates.$.riskHigh": {
        label: "95% upper CI",
        type: Number,
        decimal: true,
        optional: true
    },
    "riskEstimates.$.riskEstimated": {
        label: "Working-group calculation",
        type: Boolean
    },
    "riskEstimates.$.inTrendTest": {
        label: "Estimate in Trend Test",
        type: Boolean
    },
    covariates: {
        label: "Covariates controlled",
        type: [String],
        minCount: 1
    },
    covariatesControlledText: {
        label: "Covariates controlled notes",
        type: String,
        optional: true
    },
    notes: {
        label: "General notes",
        type: String,
        optional: true
    },
    parent_id: {
        type: SimpleSchema.RegEx.Id,
        denyUpdate: true
    }
}, extraNTP, tblBuilderCollections.base, tblBuilderCollections.table));
