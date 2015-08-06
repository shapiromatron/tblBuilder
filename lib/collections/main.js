_.extend(tblBuilderCollections, {
    evidenceTypes: [
        ExposureEvidence,
        EpiDescriptive,
        EpiResult,
        AnimalEvidence,
        AnimalEndpointEvidence,
        MechanisticEvidence,
        GenotoxEvidence
    ],
    evidenceLookup: {
        "exposureEvidence": {
            collection: ExposureEvidence,
            collection_name: "exposureEvidence",
            excel_method: "exposureEvidenceDownload",
            excel_fn: "exposure.xlsx",
            requiredUpdateFields: ["exposureScenario"]
        },
        "epiDescriptive": {
            collection: EpiDescriptive,
            collection_name: "epiDescriptive",
            excel_method: "epiEvidenceDownload",
            excel_fn: "epi.xlsx",
            nested_collection: EpiResult,
            nested_collection_name: "epiResult",
            requiredUpdateFields: ["studyDesign"]
        },
        "epiResult": {
            collection: EpiResult,
        },
        "animalEvidence": {
            collection: AnimalEvidence,
            collection_name: "animalEvidence",
            excel_method: "animalEvidenceDownload",
            excel_fn: "animal.xlsx",
            nested_collection: AnimalEndpointEvidence,
            nested_collection_name: "animalEndpointEvidence",
            requiredUpdateFields: []
        },
        "animalEndpointEvidence": {
            collection: AnimalEndpointEvidence,
        },
        "mechanisticEvidence": {
            collection: MechanisticEvidence,
        },
        "genotoxEvidence": {
            collection: GenotoxEvidence,
            collection_name: "genotoxEvidence",
            excel_method: "genotoxEvidenceDownload",
            excel_fn: "genotox.xlsx",
            requiredUpdateFields: []
        }
    }
})

if (Meteor.isClient){
    tblBuilderCollections.evidenceLookup["epiDescriptive"].nested_template = Template.epiResultForm;
    tblBuilderCollections.evidenceLookup["animalEvidence"].nested_template = Template.animalEndpointForm;
}
