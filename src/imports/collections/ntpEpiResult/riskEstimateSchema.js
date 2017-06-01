import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { isNumberOrNR } from '/imports/api/validators';


export default new SimpleSchema({
    exposureCategory: {
        label: 'Exposure category or level',
        type: String,
        min: 1,
        popoverText: 'E.g., all exposed workers, second quartile of exposure, quantitative exposure level (always provide quantitative information when available)',
    },
    numberExposed: {
        label: 'Exposed cases/deaths',
        type: String,
        custom: isNumberOrNR,
        popoverText: 'Deaths/cases for cohort studies; Cases for case-control studies. If unknown, enter \'NR\'',
    },
    riskMid: {
        label: 'Risk estimate',
        type: Number,
        decimal: true,
        optional: true,
        popoverText: 'Central risk reported for risk estimate',
    },
    riskLow: {
        label: '95% lower CI',
        type: Number,
        decimal: true,
        optional: true,
        popoverText: '95% lower confidence interval risk estimate',
    },
    riskHigh: {
        label: '95% upper CI',
        type: Number,
        decimal: true,
        optional: true,
        popoverText: '95% upper confidence interval risk estimate',
    },
    riskEstimated: {
        label: 'WG calculation?',
        type: Boolean,
        popoverText: 'Calculations by the working-group (WG), not study-authors',
    },
    inTrendTest: {
        label: 'Estimate in trend-test',
        type: Boolean,
        popoverText: 'Risk estimate included in trend-test',
    },
    showInPlot: {
        label: 'Show in plot',
        type: Boolean,
        popoverText: 'Show in plot',
    },
});
