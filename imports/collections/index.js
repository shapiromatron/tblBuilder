import ExposureEvidence from './exposure';
import EpiDescriptive from './epiDescriptive';
import EpiResult from './epiResult';
import NtpEpiDescriptive from './ntpEpiDescriptive';
import NtpEpiResult from './ntpEpiResult';
import NtpEpiConfounder from './ntpEpiConfounder';
import AnimalEvidence from './animalEvidence';
import AnimalEndpointEvidence from './animalResult';
import NtpAnimalEvidence from './ntpAnimalEvidence';
import NtpAnimalEndpointEvidence from './ntpAnimalEndpointEvidence';
import GenotoxEvidence from './genotox';
import MechanisticEvidence from './mechanistic';


let tblBuilderCollections = {
    evidenceTypes: [
        ExposureEvidence,
        EpiDescriptive,
        EpiResult,
        NtpEpiDescriptive,
        NtpEpiResult,
        NtpEpiConfounder,
        AnimalEvidence,
        AnimalEndpointEvidence,
        NtpAnimalEvidence,
        NtpAnimalEndpointEvidence,
        GenotoxEvidence,
        MechanisticEvidence,
    ],
    evidenceLookup: {
        exposureEvidence: {
            collection: ExposureEvidence,
            collection_name: 'exposureEvidence',
            excel_method: 'exposureEvidenceDownload',
            excel_fn: 'exposure.xlsx',
            requiredUpdateFields: ['exposureScenario'],
        },
        epiDescriptive: {
            collection: EpiDescriptive,
            collection_name: 'epiDescriptive',
            excel_method: 'epiEvidenceDownload',
            excel_fn: 'epi.xlsx',
            nested_collection: EpiResult,
            nested_collection_name: 'epiResult',
            requiredUpdateFields: ['studyDesign'],
        },
        epiResult: {
            collection: EpiResult,
            requiredUpdateFields: [],
        },
        ntpEpiDescriptive: {
            collection: NtpEpiDescriptive,
            collection_name: 'ntpEpiDescriptive',
            excel_method: 'ntpEpiEvidenceDownload',
            excel_fn: 'epi.xlsx',
            requiredUpdateFields: ['studyDesign'],
            nested_collection: NtpEpiResult,
        },
        ntpEpiResult: {
            collection: NtpEpiResult,
            requiredUpdateFields: [],
        },
        ntpEpiConfounder: {
            collection: NtpEpiConfounder,
            collection_name: 'ntpEpiConfounder',
            requiredUpdateFields: [],
        },
        animalEvidence: {
            collection: AnimalEvidence,
            collection_name: 'animalEvidence',
            excel_method: 'animalEvidenceDownload',
            excel_fn: 'animal.xlsx',
            nested_collection: AnimalEndpointEvidence,
            nested_collection_name: 'animalEndpointEvidence',
            requiredUpdateFields: [],
        },
        animalEndpointEvidence: {
            collection: AnimalEndpointEvidence,
            requiredUpdateFields: [],
        },
        ntpAnimalEvidence: {
            collection: NtpAnimalEvidence,
            collection_name: 'ntpAnimalEvidence',
            excel_method: 'ntpAnimalEvidenceDownload',
            excel_fn: 'animal.xlsx',
            nested_collection: NtpAnimalEndpointEvidence,
            nested_collection_name: 'ntpAnimalEndpointEvidence',
            requiredUpdateFields: [],
        },
        ntpAnimalEndpointEvidence: {
            collection: NtpAnimalEndpointEvidence,
            requiredUpdateFields: [],
        },
        genotoxEvidence: {
            collection: GenotoxEvidence,
            collection_name: 'genotoxEvidence',
            excel_method: 'genotoxEvidenceDownload',
            excel_fn: 'genotox.xlsx',
            requiredUpdateFields: [],
        },
        mechanisticEvidence: {
            collection: MechanisticEvidence,
            requiredUpdateFields: [],
            excel_method: 'mechanisticEvidenceExcelDownload',
            excel_fn: 'mechanistic.xlsx',
        },
    },
};

export default tblBuilderCollections;
