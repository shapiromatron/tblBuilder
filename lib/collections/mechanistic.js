var instanceMethods = {};
MechanisticEvidence = new Meteor.Collection('mechanisticEvidence', {
    transform: function (doc) {
        return  _.extend(Object.create(instanceMethods), doc);
    }
});


// collection class methods/attributes
_.extend(MechanisticEvidence, {
    evidenceSections: [
        {section: "toxicokinetics",     sectionDesc: "Toxicokinetics"},
        {section: "characteristics",    sectionDesc: "Key characteristics"},
        {section: "targetSites",        sectionDesc: "Toxicity confirming target tissue/site"},
        {section: "susceptibility",     sectionDesc: "Susceptibility"},
        {section: "other",              sectionDesc: "Additional relevant data"}
    ],
    evidenceCategories: [
        "Electrophilicity",
        "Genotoxicity",
        "Altered Repair Genomic Instability",
        "Chronic Inflamation Oxidative Stress",
        "Receptor Mediated",
        "Proliferation or Death",
        "Immunosupression",
        "Epigentic",
        "Immortalization",
        "Other"
    ],
    evidenceOptions: [
        "++",
        "+",
        "+/-",
        "-",
        "I"
    ]
});


tblBuilderCollections.attachSchema(MechanisticEvidence, _.extend({
    subheading: {
        label: "Subheading",
        type: String,
        optional: true
    },
    references: {
        label: "References",
        type: [SimpleSchema.RegEx.Id]
    },
    text: {
        label: "Supporting evidence",
        type: String,
        optional: true,
        custom: function() {
            var isRequired = (!this.field('subheading').isSet) && (this.value === "");
            if (isRequired) return "required";
        }
    },
    animalInVitro: {
        label: "Animal in vitro",
        type: String,
        allowedValues: MechanisticEvidence.evidenceOptions
    },
    animalInVivo: {
        label: "Animal in vivo",
        type: String,
        allowedValues: MechanisticEvidence.evidenceOptions
    },
    humanInVitro: {
        label: "Human in vitro",
        type: String,
        allowedValues: MechanisticEvidence.evidenceOptions
    },
    humanInVivo: {
        label: "Human in vivo",
        type: String,
        allowedValues: MechanisticEvidence.evidenceOptions
    },
    section: {
        type: String,
        optional: true
    },
    parent: {
        type: SimpleSchema.RegEx.Id,
        optional: true
    }
}, tblBuilderCollections.base, tblBuilderCollections.table));
