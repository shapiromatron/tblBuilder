import {appFlavor} from '/imports/utilities';


var getTableTypes = function(){
    switch(appFlavor()){
    case 'demo':
        return [
            'Exposure Evidence',
            'NTP Epidemiology Evidence',
            'Epidemiology Evidence',
            'NTP Animal Bioassay Evidence',
            'Animal Bioassay Evidence',
            'Genotoxicity-other',
            'Mechanistic Evidence Summary',
            'Genotoxicity-exposed Humans',
        ];
    case 'iarc':
        return [
            'Exposure Evidence',
            'Epidemiology Evidence',
            'Animal Bioassay Evidence',
            'Genotoxicity-other',
            'Mechanistic Evidence Summary',
            'Genotoxicity-exposed Humans',
        ];
    case 'ntp':
        return [
            'Exposure Evidence',
            'NTP Epidemiology Evidence',
            'NTP Animal Bioassay Evidence',
            'Genotoxicity-other',
            'Mechanistic Evidence Summary',
            'Genotoxicity-exposed Humans',
        ];
    default:
        throw 'Unknown app flavor';
    }
};

let typeOptions = getTableTypes(),
    roleOptions = [
        'projectManagers',
        'teamMembers',
        'reviewers',
    ],
    routePaths = {
        'Mechanistic Evidence Summary': 'mechanisticMain',
        'Epidemiology Evidence': 'epiMain',
        'NTP Epidemiology Evidence': 'ntpEpiMain',
        'Exposure Evidence': 'exposureMain',
        'Animal Bioassay Evidence': 'animalMain',
        'NTP Animal Bioassay Evidence': 'ntpAnimalMain',
        'Genotoxicity-other': 'genotoxMain',
        'Genotoxicity-exposed Humans': 'genotoxHumanExposureMain',
    },
    unstartedStatuses = ['unknown', 'not started'],
    statusOptions = {
        'unknown':     'statusUnknown',
        'not started': 'statusNotStarted',
        'in progress': 'statusInProgress',
        'complete':    'statusComplete',
        'QA ongoing':  'statusQAOngoing',
        'QA complete': 'statusQAComplete',
    };

export { typeOptions };
export { roleOptions };
export { routePaths };
export { unstartedStatuses };
export { statusOptions };
