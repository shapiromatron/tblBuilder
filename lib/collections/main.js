_.extend(tblBuilderCollections, {
    evidenceTypes: [
        ExposureEvidence,
        EpiDescriptive,
        EpiResult,
        NtpEpiDescriptive,
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
            requiredUpdateFields: [],
        },
        "ntpEpiDescriptive": {
            collection: NtpEpiDescriptive,
            collection_name: "ntpEpiDescriptive",
            excel_method: "ntpEpiEvidenceDownload",
            excel_fn: "epi.xlsx",
            requiredUpdateFields: ["studyDesign"],
            nested_collection: NtpEpiResult,
        },
        "ntpEpiResult": {
            collection: NtpEpiResult,
            requiredUpdateFields: [],
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
            requiredUpdateFields: [],
        },
        "mechanisticEvidence": {
            collection: MechanisticEvidence,
            requiredUpdateFields: [],
            excel_method: "mechanisticEvidenceExcelDownload",
            excel_fn: "mechanistic.xlsx",
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
    tblBuilderCollections.evidenceLookup["ntpEpiDescriptive"].nested_template = Template.ntpEpiResultForm;
}
