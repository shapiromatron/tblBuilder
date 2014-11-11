Tables = new Meteor.Collection('tables');
Reference = new Meteor.Collection('reference');
MechanisticEvidence = new Meteor.Collection('mechanisticEvidence');
ExposureEvidence = new Meteor.Collection('exposureEvidence');
AnimalEvidence = new Meteor.Collection('animalEvidence');
AnimalEndpointEvidence = new Meteor.Collection('animalEndpointEvidence');
GenotoxEvidence = new Meteor.Collection('genotoxEvidence');
MechQuantEvidence = new Meteor.Collection('mechQuantEvidence');
EpiDescriptive = new Meteor.Collection('epiDescriptive');
EpiResult = new Meteor.Collection('epiResult');
ReportTemplate = new Meteor.Collection('reportTemplate');

// Project-level shared-options
tblRoleOptions = ["projectManagers", "teamMembers", "reviewers"];
browserWhitelist = ["Chrome", "Firefox", "Mozilla"];

tblTypeOptions = [
    "Mechanistic Evidence Summary",
    "Epidemiology Evidence",
    "Exposure Evidence",
    // "Animal Bioassay Evidence",
    // "Genotoxicity Evidence",
    // "Mechanistic Quantitative Evidence"
];


// Reference shared-options
referenceTypeOptions = ["PubMed", "Other"];


// Exposure evidence shared options
exposureScenarios = [
    "Occupational",
    "Environmental"
];

exposureScenariosOccupational = [
    "Occupational"
];

samplingApproaches = [
    "Personal",
    "Environmental",
    "Biological",
    "Other",
    "Not-specified"
];

exposureLevelDescriptions = [
    "Arithmetic mean",
    "Geometric mean",
    "Median",
    "Other",
    "Not-reported"
];


// Epidemiology evidence shared options
epiStudyDesignOptions = [
    "Cohort",
    "Nested Case-Control",
    "Case-Control",
    "Ecological"
];

CaseControlTypes = [
    "Case-Control",
    "Nested Case-Control"
];

exposureAssessmentTypeOptions = [
    "JEM",
    "questionnaire",
    "company records",
    "personal monitoring",
    "environmental monitoring",
    "modelling",
    "expert assessment",
    "other (specify in exposure assessment notes)"
];


// Mechanistic evidence shared options
mechanisticEvidenceSections = [
    {section: "toxicokinetics", sectionDesc: "Toxicokinetics"},
    {section: "mechanisms",     sectionDesc: "Major mechanisms"},
    {section: "targetSites",    sectionDesc: "Toxicity confirming target tissue/site"},
    {section: "susceptibility", sectionDesc: "Susceptibility"},
    {section: "other",          sectionDesc: "Additional relevant data"}
];

mechanisticEvidenceCategories = [
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
];
