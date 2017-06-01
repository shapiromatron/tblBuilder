import _ from 'underscore';


let isNumberOrNR = function() {
        if (this.isSet && (this.value === 'NR' || _.isFinite(this.value))) {
            return undefined;
        } else {
            return 'numOrNR';
        }
    },
    isNumericishString = function() {
        if (!this.isSet || this.value === null) return undefined;
        let v = this.value.replace(/[<,≤,=,≥,>]/g, '');
        if(isFinite(parseFloat(v))) return undefined;
        return 'numericish';
    };


export { isNumberOrNR };
export { isNumericishString };
