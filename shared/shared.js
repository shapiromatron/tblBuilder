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


tblTypeOptions = [
    "Mechanistic Evidence Summary",
    "Epidemiology Evidence",
    // "Exposure Evidence",
    // "Animal Bioassay Evidence",
    // "Genotoxicity Evidence",
    // "Mechanistic Quantitative Evidence"
];

tblRoleOptions = ["projectManagers", "teamMembers", "reviewers"];

referenceTypeOptions = ["PubMed", "Other"];

epiStudyDesignOptions = ["Cohort", "Nested Case-Control", "Case-Control", "Ecological"];

CaseControlTypes = ["Case-Control", "Nested Case-Control"];

exposureAssessmentTypeOptions = ["JEM",
                                 "questionnaire",
                                 "company records",
                                 "personal monitoring",
                                 "environmental monitoring",
                                 "modelling",
                                 "expert assessment",
                                 "other (specify in exposure assessment notes)"];

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

browserWhitelist = ["Chrome", "Firefox", "Mozilla"];
