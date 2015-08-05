var clsMethods = {
        dataClass: [
            "Non-mammalian",
            "Mammalian and human in vitro",
            "Animal in vivo",
            "Human in vivo"
        ],
        phylogeneticClasses: [
            "Acellular systems",
            "Prokaryote (bacteria)",
            "Lower eukaryote (yeast, mold)",
            "Insect",
            "Plant systems",
            "Other (fish, worm, bird, etc)"
        ],
        mammalianTestSpecies: [
            "Human",
            "Non-human mammalian"
        ],
        sexes: [
            "Male",
            "Female",
            "Male and female"
        ],
        resultOptions: [
            " + ",
            "(+)",
            "+/-",
            "(-)",
            " - ",
            "Not tested"
        ]
    },
    instanceMethods = {};


GenotoxEvidence = new Meteor.Collection('genotoxEvidence', {
  transform: function (doc) {
    return  _.extend(Object.create(instanceMethods), doc);
  }
});
_.extend(GenotoxEvidence, clsMethods);



var reqNonMamm = function() {
        var isRequired = (this.field('dataClass').value === "Non-mammalian") &&
                (this.value === "");
        if (isRequired) return "required";
    },
    reqAcellular = function() {
        var isRequired = (this.field('dataClass').value === "Non-mammalian") &&
                (this.field('phylogeneticClass').value === "Acellular systems") &&
                (this.value === "");
        if (isRequired) return "required";
    },
    reqNotAcellular = function() {
        var isRequired = (this.field('dataClass').value === "Non-mammalian") &&
                (this.field('phylogeneticClass').value !== "Acellular systems") &&
                (this.value === "");
        if (isRequired) return "required";
    },
    reqMammVitro = function() {
        var isRequired = (this.field('dataClass').value === "Mammalian and human in vitro") &&
                (this.value === "");
        if (isRequired) return "required";
    },
    reqAniVivo = function() {
        var isRequired = (this.field('dataClass').value === "Animal in vivo") &&
                (this.value === "");
        if (isRequired) return "required";
    },
    reqHumanVivo = function() {
        var isRequired = (this.field('dataClass').value === "Human in vivo") &&
                (this.value === "");
        if (isRequired) return "required";
    },
    reqExpVivo = function() {
        var isRequired = ((this.field('dataClass').value === "Animal in vivo") ||
                          (this.field('dataClass').value === "Non-mammalian" &&
                           this.field('phylogeneticClass').value === "Other (fish, worm, bird, etc)")) &&
                (this.value === "");
        if (isRequired) return "required";
    };

tblBuilderSchema.attachSchema(GenotoxEvidence, _.extend({
    // first row
    referenceID: {
        label: "Reference",
        type: SimpleSchema.RegEx.Id
    },
    dataClass: {
        label: "Data class",
        type: String,
        allowedValues: GenotoxEvidence.dataClass
    },
    agent: {
        label: "Agent",
        type: String,
        min: 1
    },

    // second row
    phylogeneticClass: {
        label: "Data class",
        type: String,
        allowedValues: GenotoxEvidence.phylogeneticClasses,
        optional: true,
        custom: reqNonMamm
    },
    testSystem: {
        label: "Test system",
        type: String,
        optional: true,
        custom: reqAcellular
    },
    speciesNonMamm: {
        label: "Species",
        type: String,
        optional: true,
        custom: reqNotAcellular
    },
    strainNonMamm: {
        label: "Strain",
        type: String,
        optional: true,
        custom: reqNotAcellular
    },
    testSpeciesMamm: {
        label: "Test species class",
        type: String,
        allowedValues: GenotoxEvidence.mammalianTestSpecies,
        optional: true,
        custom: reqMammVitro
    },
    speciesMamm: {
        label: "Species",
        type: String,
        optional: true,
        custom: reqMammVitro
    },
    tissueCellLine: {
        label: "Tissue, cell-line",
        type: String,
        optional: true,
        custom: reqMammVitro
    },
    species: {
        label: "Species",
        type: String,
        optional: true,
        custom: reqAniVivo
    },
    strain: {
        label: "Strain",
        type: String,
        optional: true,
        custom: reqAniVivo
    },
    sex: {
        label: "Sex",
        type: String,
        allowedValues: GenotoxEvidence.sexes,
        optional: true,
        custom: reqAniVivo
    },
    tissueAnimal: {
        label: "Tissue",
        type: String,
        optional: true,
        custom: reqAniVivo
    },
    tissueHuman: {
        label: "Tissue",
        type: String,
        optional: true,
        custom: reqHumanVivo
    },
    cellType: {
        label: "Cell type",
        type: String,
        optional: true
    },
    exposureDescription: {
        label: "Description of exposed and controls",
        type: String,
        optional: true,
        custom: reqHumanVivo
    },

    // third row
    endpoint: {
        label: "Endpoint",
        type: String,
        min: 1
    },
    endpointTest: {
        label: "Endpoint test",
        type: String,
        min: 1
    },
    dualResult: {
        label: "Dual result",
        type: Boolean,
        defaultValue: false
    },
    dosingDuration: {
        label: "Duration",
        type: String,
        optional: true,
        custom: reqExpVivo
    },
    dosingRoute: {
        label: "Route",
        type: String,
        optional: true,
        custom: reqAniVivo
    },
    dosingRegimen: {
        label: "Dosing regimen",
        type: String,
        optional: true,
        custom: reqAniVivo
    },

    // fourth row
    result: {
        label: "Result",
        type: String,
        allowedValues: GenotoxEvidence.resultOptions
    },
    led: {
        label: "LED or HID",
        type: String,
        optional: true
    },
    units: {
        label: "Dosing units",
        type: String,
        min: 1
    },
    resultMetabolic: {
        label: "Result (no metabolic activation)",
        type: String,
        allowedValues: GenotoxEvidence.resultOptions
    },
    resultNoMetabolic: {
        label: "Result (no metabolic activation)",
        type: String,
        allowedValues: GenotoxEvidence.resultOptions
    },
    dosesTested: {
        label: "Doses tested",
        type: String,
        optional: true,
        custom: reqExpVivo
    },
    significance: {
        label: "Significance",
        type: String,
        optional: true
    },

    // fifth row
    comments: {
        label: "Comments",
        type: String,
        optional: true
    }
}, tblBuilderSchema.base, tblBuilderSchema.table));
