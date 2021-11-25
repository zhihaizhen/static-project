import { helper } from '../helper';
import { dictionary } from '../dictionary';
import { Instruction, AlgoOrderInfo } from '../models';
import { TradingUnit, NumberControl, SelectControl } from './trading-unit';

class FormData {

    /**
     * @param {Instruction} instruc 
     */
    constructor(instruc) {

        this.portfolioName = instruc.portfolioName;
        this.accountName = instruc.tradeAccountId;
        this.stockCodeName = instruc.stockCodeName;
        this.direction = instruc.direction;
        this.algoType = dictionary.algoTypes[0].code;

        this.volume = instruc.leftVolume;
        this.amount = instruc.leftAmount;

        this.startTime = '09:30:00';
        this.endTime = '15:00:00';

        /** 是否可以超越结束时间，继续进行交易，以完成期望的交易总规模 */
        this.isEndTimeOverRunnable = 'false';
        /** 是否可在涨跌停极端价格场景下，进行下单交易 */
        this.isExtremePriceAcceptable = 'false';
    }
}

/**
 * 算法交易单元
 */
class AlgorithmUnit extends TradingUnit {

    get latestPrice() {

        let price = this.isContextTickOk ? this.contextTick.latest : this.isContextInstrucOk ? this.instruction.price : 0;
        return Math.max(price, 0.0000000001);
    }

    get unitHeight() {
        return 320;
    }

    /**
     * @param {String} identifier
     * @param {Function} submitter
     */
    constructor(identifier, submitter) {
        
        super(identifier, submitter);
        this.setUnitName(TradingUnit.UnitNames.algo);
    }

    build() {

        this.directionCtr = new SelectControl({ unit: this, $control: this.$form.querySelector('.direction') });
        this.directionCtr.fill(dictionary.direction);
        this.directionCtr.disable();

        this.algoTypeCtr = new SelectControl({ unit: this, $control: this.$form.querySelector('.algo-type') });
        this.algoTypeCtr.fill(dictionary.algoTypes);

        this.volumeCtr = new NumberControl({
            
            unit: this,
            $control: this.$form.querySelector('.volume'),
            bizName: '交易总数',
            unitLabel: '股',
            enableComma: true,
            asInteger: true,
            max: () => { return this.leftVolume; },
            step: () => { return this.contextVolumeStep; },
            handler: this._handleVolumeChange.bind(this),
        });

        this.amountCtr = new NumberControl({
            
            unit: this,
            unitLabel: '元',
            enableComma: true,
            $control: this.$form.querySelector('.amount'),
            bizName: '金额',
            step: 0.0001,
            handler: this._handleAmountChange.bind(this),
        });

        this.$startTime = this.$form.querySelector('.start-time input');
        this.$endTime = this.$form.querySelector('.end-time input');

        const thisObj = this;
        layui.use('laydate', function () {

            layui.laydate.render({ elem: thisObj.$startTime, type: 'time' });
            layui.laydate.render({ elem: thisObj.$endTime, type: 'time' });
        });

        /**
         * 重置按钮
         */
        var $ctr_reset_btn = layui.$(`form button[lay-filter='reset-form-algorithm']`);
        $ctr_reset_btn[0].onclick = this.resetForm.bind(this);
    }

    getValidateRule() {

        return {

            volume4Algorithm: (val_str, $control) => { return this._validateVolume(val_str, $control); },
            amount4Algorithm: (val_str, $control) => { return this._validateAmount(val_str, $control); },
            startTime4Algorithm: (val_str, $control) => { return this._validateStartTime(val_str, $control); },
            endTime4Algorithm: (val_str, $control) => { return this._validateEndTime(val_str, $control); },
        };
    }

    resetForm() {

        this.volumeCtr.updateUnitLabel(this.unitlabel);

        if (this.isByVolume) {

            this.volumeCtr.enable();
            this.amountCtr.disable();
        }
        else {

            this.volumeCtr.disable();
            this.amountCtr.enable();
        }
        
        const formd = new FormData(this.instruction);
        this.setVal(formd);
        this._handlePriceChange();
    }

    customizeData(field_data) {
        
        const instruc = this.instruction;
        const ordinfo = new AlgoOrderInfo({

            instructionId: instruc.id,
            portfolioId: instruc.portfolioId,
            userId: instruc.tradeId,
            username: instruc.traderName,
            accountId: instruc.acctNo,
            entrustBs: instruc.bsFlag,
            entrustProp: instruc.bsProp,
            stockCode: instruc.stockCode,
            entrustVolume: this.volumeCtr.value,
            algoType: this.algoTypeCtr.value,
            startTime: this.$startTime.value,
            endTime: this.$endTime.value,
            isEndTimeOverRunnable: field_data.isEndTimeOverRunnable == true.toString(),
            isExtremePriceAcceptable: field_data.isExtremePriceAcceptable == true.toString(),
            tipMsg: '算法交易下单失败'
        });

        ordinfo.latestPrice = this.latestPrice;
        ordinfo.floorPrice = this.isContextTickOk ? this.contextTick.floor : 0;
        ordinfo.ceilingPrice = this.isContextTickOk ? this.contextTick.ceiling : 0;
        return ordinfo;
    }

    _validateVolume(val_str, $control) {

        if (this.isByAmount) {

            /**
             * 针对按金额交易，评估出来的交易总数，为只读
             */
            return;
        }

        let total_volume = this.leftVolume;
        let volume = this.volumeCtr.value;

        if (total_volume <= 0) {
            return TradingUnit.messages.zeroVolume;
        }
        else if (volume === total_volume) {
            return TradingUnit.messages.decidedOk;
        }

        /**
         * 交易总数，无论按数量，或者金额，都必须最终为有效数值
         */

        if (isNaN(volume)) {
            return '交易总数，非数值';
        }
        else if (volume <= 0) {
            return '交易总数，非正值';
        }
        else if (!Number.isInteger(volume)) {
            return '交易总数，非整数';
        }
        else if (volume > total_volume) {
            return `交易总数${ volume }大于可用数量${ total_volume }`;
        }
        else if (!this.isLeastVolumeSpread(volume)) {
            return `委托数量${ volume }，必须为数量步长${ this.contextVolumeStep }的整数倍`;
        }

        let boundaryResult = this.checkVolumeBoundary(volume);
        if (!boundaryResult.isOk) {
            return boundaryResult.message;
        }
    }
    
	_validateAmount(val_str, $control) {

        let amount = this.amountCtr.value;

        /**
         * 交易总额，无论按数量，或者金额，都必须最终为有效数值
         */

        if (isNaN(amount)) {
            return '交易总额，非数值';
        }
        else if (amount <= 0) {
            return '交易总额，非正值';
        }
        
        if (this.isByVolume) {

            /**
             * 针对按数量交易，评估出来的交易总额，为只读
             */
            return;
        }
        
        if (this.leftAmount == 0) {
            return Level2Unit.messages.zeroAmount;
        }

        let price = this.latestPrice;
        if (isNaN(price)) {
            return '委托价，非数值，无法评估交易总数';
        }

        let { ceiling, floor } = this.contextTick;
        if (price > ceiling || price < floor) {
            return `价格不在跌停${ floor } ~ 涨停${ ceiling } 范围内，无法评估交易总数`;
        }

        let total_amount = this.leftAmount;
        if (amount > total_amount) {
            return `交易总额 > 可用金额${ total_amount }`;
        }
    }
    
	_validateStartTime(val_str, $control) {

        let start_time = this.$startTime.value;
        if (!start_time || !/^\d{2}:\d{2}:\d{2}$/.test(start_time)) {
            return '开始时间格式不正确';
        }
    }
    
	_validateEndTime(val_str, $control) {
        
        let start_time = this.$startTime.value;
        let end_time = this.$endTime.value;

        if (!end_time || !/^\d{2}:\d{2}:\d{2}$/.test(end_time)) {
            return '结束时间格式不正确';
        }

        if (end_time <= start_time) {
            return `开始时间${ start_time } >= 结束时间${ end_time }`;
        }
    }

    _handlePriceChange() {
        this.isByVolume ? this._handleVolumeChange() : this._handleAmountChange();
    }

    _handleVolumeChange() {
        this.amountCtr.setValue(this.calculateAmount(this.volumeCtr.value, this.latestPrice));
    }

    _handleAmountChange() {
        this.volumeCtr.setValue(this.calculateVolume(this.amountCtr.value, this.latestPrice));
    }
}

export { AlgorithmUnit };