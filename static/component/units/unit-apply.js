import { helper } from '../helper';
import { dictionary } from '../dictionary';
import { Instruction, OrderInfo } from '../models';
import { TradingUnit, SelectControl } from './trading-unit';
import { JoyinTableActions } from '../join-table-actions';
import { NumberControl } from './unit-level2';

class FormData {

    /**
     * @param {Instruction} instruc 
     */
    constructor(instruc) {

        this.portfolioName = instruc.portfolioName;
        this.accountName = instruc.tradeAccountId;
        this.stockCodeName = instruc.stockCodeName;
        this.direction = instruc.direction;
        this.volume = instruc.leftVolume;
        this.amount = instruc.leftAmount;
        this.conNum = instruc.conNum;
        this.price = instruc.price;
    }
}

/**
 * 申购类交易单元
 */
class ApplyUnit extends TradingUnit {

    get unitHeight() {
        return 180;
    }

    get isTickRequired() {
        return false;
    }

    get isAllocateShare() {
        return this.instruction.direction == dictionary.direction.allocateShare.code;
    }

    /**
     * @param {String} identifier
     * @param {Function} submitter
     */
    constructor(identifier, submitter) {

        super(identifier, submitter);
        this.setUnitName(TradingUnit.UnitNames.apply);
    }

    build() {

        this.directionCtr = new SelectControl({ unit: this, $control: this.$form.querySelector('.direction') });
        this.directionCtr.fill(dictionary.direction);
        this.directionCtr.disable();

        this.priceCtr = new NumberControl({

            unit: this,
            $control: this.$form.querySelector('.price'),
            unitLabel: '元',
            step: () => { return this.contextPriceStep; },
            precision: () => { return this.contextPricePrecision; },
        });

        this.volumeCtr = new NumberControl({

            unit: this,
            enableComma: true,
            asInteger: true,
            $control: this.$form.querySelector('.volume'),
            unitLabel: '股',
        });

        this.amountCtr = new NumberControl({

            unit: this,
            enableComma: true,
            $control: this.$form.querySelector('.amount'),
            unitLabel: '元',
            step: () => { return this.contextPriceStep; },
            precision: () => { return this.contextPricePrecision; },
        });

        
        this.conNumCtr = new NumberControl({

            unit: this,
            $control: this.$form.querySelector('.conNum'),
            unitLabel: '股',
        });

    }

    getValidateRule() {

        return {

            price4Apply: (val_str, $control) => { return this._validatePrice(val_str, $control); },
            volume4Apply: (val_str, $control) => { return this._validateVolume(val_str, $control); },
            amount4Apply: (val_str, $control) => { return this._validateAmount(val_str, $control); },
        };
    }

    resetForm() {

        /**
         * 申购、认购、赎回、增发、配售、行权、等业务均使用该交易单元，设置符合场景的title
         */

        const instruc = this.instruction;
        this.setTitle(JoyinTableActions.formatInstrucDirection(instruc));
        this.volumeCtr.updateUnitLabel(this.unitlabel);

        const formd = new FormData(instruc);
        this.setVal(formd);

        this.reSetElementValue([ this.priceCtr, this.amountCtr ]);
        this._sync();
        this.formdata = formd;

        if (instruc.direction != dictionary.direction.bond2Stock.code) {

            this.conNumCtr.$control.classList.add(TradingUnit.Classes.hidden);
            this.amountCtr.$control.classList.remove(TradingUnit.Classes.hidden);
        }
        else {
            
            this.conNumCtr.$control.classList.remove(TradingUnit.Classes.hidden);
            this.amountCtr.$control.classList.add(TradingUnit.Classes.hidden);
        }
    }

    setTick(tick_data) {
        super.setTick(tick_data);
    }

    customizeData(field_data) {

        const instruc = this.instruction;
        const ordinfo = new OrderInfo({

            instructionId: instruc.id,
            portfolioId: instruc.portfolioId,
            userId: instruc.tradeId,
            username: instruc.traderName,
            accountId: instruc.acctNo,
            entrustBs: instruc.bsFlag,
            entrustProp: instruc.bsProp,
            stockCode: instruc.stockCode,
            entrustVolume: this.volumeCtr.value,
            entrustPrice: this.priceCtr.value,
            conNum: this.conNumCtr.value,
            tipMsg : '申购下单失败'
        });
        return ordinfo;
    }

    _sync() {

        let cur_price = this.priceCtr.value;
        let cur_volume = this.volumeCtr.value;
        let cur_amount = this.amountCtr.value;

        /**
         * 按金额交易，初始化时，将数量换算为数量
         */
        if (this.isByAmount) {

            if(this.isAllocateShare) {
                this.volumeCtr.setValue(this.calculateVolume(cur_amount, cur_price, false));
            }
            else {
                this.volumeCtr.setValue(this.calculateVolume(cur_amount, cur_price));
            }
          

            /**
             * 金额，使用换算后的数量，反算回来
             */
            cur_volume = this.volumeCtr.value;
            if (cur_volume > 0) {
                this.amountCtr.setValue(this.calculateAmount(cur_volume, cur_price));
            }
        }
        else {
            
            /**
             * 按数量交易，将数量对应的金额，进行呈现
             */
            this.amountCtr.setValue(this.calculateAmount(cur_volume, cur_price));
        }

    }

    isCustomziedOk(){ 

        const instruc = this.instruction;
        const volume = this.volumeCtr.value;
        if(instruc.direction == dictionary.direction.bond2Stock.code && volume % 10 != 0) {
            return '可转债总面值必须是1000的整数倍';
        }
        return true;
    }

    _validatePrice(val_str, $control) {

        let price = this.priceCtr.value;
        if (isNaN(price)) {
            return '委托价，非数值';
        }
        else if (price <= 0) {
            return '委托价，非正值';
        }
        // 申购类取消该check -----20200813
        // else if (!this.isLeastPriceSpread(price)) {
        //     return `委托价${ price }，非最小价差${ this.contextPriceStep }的整数倍`;
        // }
    }

    _validateVolume(val_str, $control) {

        if (this.isByAmount) {
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
         * 委托数量，无论按数量，或者金额，都必须最终为有效数值
         */

        if (isNaN(volume)) {
            return '委托数量，非数值';
        }
        else if (volume <= 0) {
            return '委托数量，非正值';
        }
        else if (!Number.isInteger(volume)) {
            return '委托数量，非整数';
        }
        else if (this.isAllocateShare) {

            /**
             * 对于配股，最小单位为1股
             */
            return;
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
         * 委托金额，无论按数量，或者金额，都必须最终为有效数值
         */

        if (isNaN(amount)) {
            return '委托金额，非数值';
        }
        else if (amount <= 0) {
            return '委托金额，非正值';
        }
    }
}

export { ApplyUnit };