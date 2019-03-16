

/*####################################################*/
/*##################### NORMUTIL  ####################*/
/*####################################################*/
VCP.NormUtil = function (dataHigh, dataLow, normalizedHigh, normalizedLow) {
    this.dataHigh = dataHigh;
    this.dataLow = dataLow;
    this.normalizedHigh = normalizedHigh || 1.0;
    this.normalizedLow = normalizedLow || 1.0;
};
VCP.NormUtil.prototype = {
    constructor: VCP.NormUtil,
    normalize: function (x) {
        return ((x - this.dataLow) / (this.dataHigh - this.dataLow))
        * (this.normalizedHigh - this.normalizedLow)
            + this.normalizedLow
    },
    denormalize: function (x) {
        return ((this.dataLow - this.dataHigh)
                    * x - this.normalizedHigh * this.dataLow
                    + this.dataHigh * this.normalizedLow)
                    / (this.normalizedLow - this.normalizedHigh)
    }
};
/*$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$*/
