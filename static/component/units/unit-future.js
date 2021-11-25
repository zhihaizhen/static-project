import { dictionary } from '../dictionary';
import { FutureOrderInfo } from '../models';
import { CompeteUnit } from './unit-compete.js';

/**
 * 期货交易单元
 */
class FutureUnit extends CompeteUnit {

    get unitHeight() {
        return 320;
    }

    /**
     * @param {String} identifier
     * @param {Function} submitter
     */
    constructor(identifier, submitter) {

        super(identifier, submitter);
        this.setUnitName(CompeteUnit.UnitNames.future);
    }

    build() {

        super.build();

        let offsetFlagCtr = this.$form.querySelector('#future-offsetFlag');
        let hedgeFlagCtr = this.$form.querySelector('#future-hedgeFlag');
        let inputOffsetFlag = '';
        let inputhedgeFlag = '';

        for (let key in dictionary.offsetSign) {
            inputOffsetFlag += `<input type="radio" name="offsetFlag" value="${dictionary.offsetSign[key].code}" title="${dictionary.offsetSign[key].mean}"></input>`;
        }

        offsetFlagCtr.innerHTML = inputOffsetFlag;

        for (let key in dictionary.hedgeSign) {
            inputhedgeFlag += `<input type="radio" name="hedgeFlag" value="${dictionary.hedgeSign[key].code}" title="${dictionary.hedgeSign[key].mean}"></input>`;
        }

        hedgeFlagCtr.innerHTML = inputhedgeFlag;

        /**
         * 重置按钮
         */
        var $ctr_reset_btn = layui.$(`form button[lay-filter='reset-future-form']`);
        $ctr_reset_btn[0].onclick = this.normalFormReset.bind(this);
    }

    normalFormReset() {
        this.resetForm();  
    }

    resetForm() {

        super.resetForm();

        if (this.instruction.repoType  == dictionary.repoType.treasuryFutures.code) {
            this.priceCtr.updateUnitLabel('元');
        }
        else if (this.instruction.repoType  == dictionary.repoType.stockIndexFutures.code) {
            this.priceCtr.updateUnitLabel('点');
        }
        
        this.setInitialValue();
    }

    /**
     * 平仓，投机套保标志设置初始值，并在有值的情况下不允许修改
     */
    setInitialValue() {

        let instruction = this.instruction;

        layui.form.val("form-future", { 

            offsetFlag: instruction.offsetFlag ? instruction.offsetFlag : dictionary.offsetSign.open.code,
            hedgeFlag: instruction.hedgeFlag ? instruction.hedgeFlag : dictionary.hedgeSign.speculation.code,
        });

        let offsetFlagStatus = document.querySelectorAll('input[name = "offsetFlag"]');
        let hedgeFlagStatus = document.querySelectorAll('input[name = "hedgeFlag"]');

        if (instruction.offsetFlag) {
            offsetFlagStatus.forEach(item => item.disabled = true);
        }
        else {
            offsetFlagStatus.forEach(item => item.disabled = false);
        }

        if (instruction.hedgeFlag) {
            hedgeFlagStatus.forEach(item => item.disabled = true);
        }
        else {
            hedgeFlagStatus.forEach(item => item.disabled = false);
        }

        layui.form.render('radio');
    }

    getValidateRule() {

        return {

            price4Future: (val_str, $control) => { return this._validatePrice(val_str, $control); },
            volume4Future: (val_str, $control) => { return this._validateVolume(val_str, $control); },
            amount4Future: (val_str, $control) => { return this._validateAmount(val_str, $control); },
        };
    }

    _handlePriceChange() {
        this.isByVolume ? this._handleVolumeChange() : this._handleAmountChange();
    }

    _handleVolumeChange() {

        let priceCtrValue = this.priceCtr.value;
        let volumeCtrValue = this.volumeCtr.value;

        if (!priceCtrValue) {
            this.priceCtr.setValue(0);
        }
        if (!volumeCtrValue) {
            this.volumeCtr.setValue(0);
        }

        this.amountCtr.setValue(this.calculateAmount(this.volumeCtr.value, this.betterPrice) * this.instruction.volumeMultiple);
    }

    _handleAmountChange() {

        let priceCtrValue = this.priceCtr.value;
        let volumeCtrValue = this.volumeCtr.value;
        let amountCtrValue = this.amountCtr.value;

        if (!priceCtrValue) {
            this.priceCtr.setValue(0);
        }
        if (!volumeCtrValue) {
            this.volumeCtr.setValue(0);
        }
        if (amountCtrValue) {
            this.amountCtr.setValue(0);
        }

        this.volumeCtr.setValue(this.calculateVolume(this.amountCtr.value, this.betterPrice) * this.instruction.volumeMultiple);
    }

    customizeData(field_data) {

        const instruc = this.instruction;
        const formValue = layui.form.val('form-future');
        let formOffsetFlag = formValue.offsetFlag;
        let formHedgeFlag = formValue.hedgeFlag;

        const ordinfo = new FutureOrderInfo({

            instructionId: instruc.id,
            portfolioId: instruc.portfolioId,
            userId: instruc.tradeId,
            username: instruc.traderName,
            accountId: instruc.acctNo,
            entrustBs: instruc.bsFlag,
            entrustProp: this.priceModeCtr.value,
            stockCode: instruc.stockCode,
            entrustVolume: this.volumeCtr.value,
            entrustPrice: this.priceCtr.value,
            offsetFlag: formOffsetFlag,
            hedgeFlag: formHedgeFlag,
            tipMsg: '期货交易下单失败',
        });

        return ordinfo;
    }
}

export { FutureUnit };