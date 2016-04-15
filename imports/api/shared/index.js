import { MechanisticEvidence } from './mechanistic';


let tblBuilderCollections = {
    evidenceTypes: [
        MechanisticEvidence,
    ],
    evidenceLookup: {
        mechanisticEvidence: {
            collection: MechanisticEvidence,
            requiredUpdateFields: [],
            excel_method: 'mechanisticEvidenceExcelDownload',
            excel_fn: 'mechanistic.xlsx',
        },
    },
};

export default tblBuilderCollections;
