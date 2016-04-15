import _ from 'underscore';

_.extend(tblBuilderCollections, {
    evidenceTypes: [
        ExposureEvidence,
        EpiDescriptive,
        EpiResult,
        NtpEpiDescriptive,
        NtpEpiResult,
        AnimalEvidence,
        AnimalEndpointEvidence,
        GenotoxEvidence,
    ],
    evidenceLookup: {
        'exposureEvidence': {
            collection: ExposureEvidence,
            collection_name: 'exposureEvidence',
            excel_method: 'exposureEvidenceDownload',
            excel_fn: 'exposure.xlsx',
            requiredUpdateFields: ['exposureScenario'],
        },
        'epiDescriptive': {
            collection: EpiDescriptive,
            collection_name: 'epiDescriptive',
            excel_method: 'epiEvidenceDownload',
            excel_fn: 'epi.xlsx',
            nested_collection: EpiResult,
            nested_collection_name: 'epiResult',
            requiredUpdateFields: ['studyDesign'],
        },
        'epiResult': {
            collection: EpiResult,
            requiredUpdateFields: [],
        },
        'ntpEpiDescriptive': {
            collection: NtpEpiDescriptive,
            collection_name: 'ntpEpiDescriptive',
            excel_method: 'ntpEpiEvidenceDownload',
            excel_fn: 'epi.xlsx',
            requiredUpdateFields: ['studyDesign'],
            nested_collection: NtpEpiResult,
        },
        'ntpEpiResult': {
            collection: NtpEpiResult,
            requiredUpdateFields: [],
        },
        'animalEvidence': {
            collection: AnimalEvidence,
            collection_name: 'animalEvidence',
            excel_method: 'animalEvidenceDownload',
            excel_fn: 'animal.xlsx',
            nested_collection: AnimalEndpointEvidence,
            nested_collection_name: 'animalEndpointEvidence',
            requiredUpdateFields: [],
        },
        'animalEndpointEvidence': {
            collection: AnimalEndpointEvidence,
            requiredUpdateFields: [],
        },
        'genotoxEvidence': {
            collection: GenotoxEvidence,
            collection_name: 'genotoxEvidence',
            excel_method: 'genotoxEvidenceDownload',
            excel_fn: 'genotox.xlsx',
            requiredUpdateFields: [],
        },
    },
});
