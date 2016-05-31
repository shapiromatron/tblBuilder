import _ from 'underscore';

let isNumberOrNR = function() {
    if (this.isSet && (this.value === 'NR' || _.isFinite(this.value))) {
        return undefined;
    } else {
        return 'numOrNR';
    }
};

export { isNumberOrNR };
