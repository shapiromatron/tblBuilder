import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import {
    studyDesigns,
    sexes,
    ratings,
    biasDirection,
    biasDirectionPopoverText,
    ratingRationalePopoverText,
} from './constants';


export default {
    // #1: General information
    referenceID: {
        label: 'Reference',
        type: SimpleSchema.RegEx.Id,
    },
    additionalReferences: {
        label: 'References',
        type: [SimpleSchema.RegEx.Id],
        minCount: 0,
        popoverText: 'References of earlier updates or related publications',
    },
    studyDesign: {
        label: 'Data class',
        type: String,
        allowedValues: studyDesigns,
        popoverText: 'As reported',
    },
    // #2: Study design
    species: {
        label: 'Species',
        type: String,
        min: 1,
        popoverText: 'As reported',
        typeaheadMethod: 'searchNtpAnimalSpecies',
        placeholderText: 'Mouse, Rat, Hamster',
    },
    strain: {
        label: 'Strain',
        type: String,
        min: 1,
        popoverText: 'As reported',
        typeaheadMethod: 'searchNtpAnimalStrain',
        placeholderText: 'B6C3F1, F344',
    },
    sex: {
        label: 'Sex',
        type: String,
        allowedValues: sexes,
        popoverText: 'As reported',
    },
    ageAtStart: {
        label: 'Age at start',
        type: String,
        min: 1,
        popoverText: 'Age at start of exposure',
        placeholderText: '6-8 wk old, 2 mo old, newborn',
    },
    duration: {
        label: 'Duration',
        type: String,
        min: 1,
        popoverText: 'Exposure duration including additional observation time (if any)',
        placeholderText: '110 wk, 24 mo, lifetime',
    },
    'historicalDataAvailable': {
        label: 'Historical data available?',
        type: Boolean,
        popoverText: 'Is historical data for this species and strain available in this publication or another?',
    },
    // #3: Study design quality
    randomizationRating: {
        label: 'Bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
    },
    randomizationDirection:{
        label: 'Bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
    },
    randomizationRationale: {
        label: 'Bias rationale',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: ratingRationalePopoverText,
    },
    concurrentControlsRating: {
        label: 'Bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
    },
    concurrentControlsDirection:{
        label: 'Bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
    },
    concurrentControlsRationale: {
        label: 'Bias rationale',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: ratingRationalePopoverText,
    },
    animalModelSensitivityRating: {
        label: 'Bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
    },
    animalModelSensitivityDirection:{
        label: 'Bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
    },
    animalModelSensitivityRationale: {
        label: 'Bias rationale',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: ratingRationalePopoverText,
    },
    statisticalPowerRating: {
        label: 'Bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
    },
    statisticalPowerDirection:{
        label: 'Bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
    },
    statisticalPowerRationale: {
        label: 'Bias rationale',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: ratingRationalePopoverText,
    },
};
