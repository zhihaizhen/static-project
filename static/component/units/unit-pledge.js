import { OrderInfo, Instruction } from '../models';
import { TradingUnit, NumberControl, SelectControl } from './trading-unit';
import { dictionary } from '../dictionary';
import { helper } from '../helper';

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
        this.ratio = instruc.price;
        this.standardBondVolume = instruc.standardBondVolume;
    }
}

/**
 * 质押（出入库）交易单元
 */
class PledgeUnit extends TradingUnit {

    get unitHeight() {
        return 160;
    }

    /**
     * @param {String} identifier
     * @param {Function} submitter
     */
    constructor(identifier, submitter) {

        super(identifier, submitter);
        this.setUnitName(TradingUnit.UnitNames.pledge);
    }

    build() {

        this.volumeCtr = new NumberControl({

            unit: this,
            $control: this.$form.querySelector('.volume'),
            enableComma: true,
            asInteger: true,
            unitLabel: '张',
        });

        this.volumeCtr.disable();
        this.$volumeLabel = this.volumeCtr.$control.querySelector('label');

        this.ratioCtr = new NumberControl({

            unit: this,
            $control: this.$form.querySelector('.ratio'),
            unitLabel: '%',
        });

        this.ratioCtr.disable();

        this.standardBondVolumeCtr = new NumberControl({

            unit: this,
            $control: this.$form.querySelector('.standardBondVolume'),
            enableComma: true,
            asInteger: true,
            unitLabel: '张',
        });

        this.standardBondVolumeCtr.disable();

        this.directionCtr = new SelectControl({ unit: this, $control: this.$form.querySelector('.direction') });
        this.directionCtr.fill(dictionary.direction);
        this.directionCtr.disable();

        
        /**
         * 重置按钮
         */
        // var $ctr_reset_btn = layui.$(`form button[lay-filter='reset-form-pledge']`);
        // $ctr_reset_btn[0].onclick = this.resetForm.bind(this);
    }

    resetForm() {

        const instruc = this.instruction;
        const is_seal = instruc.direction == dictionary.direction.seal.code;
        const title_content = is_seal ? '质押入库' : '质押出库';

        /** 申购、认购、赎回、增发、配售、行权、等业务均使用该交易单元，设置符合场景的title */
        this.setTitle(title_content);

        const formd = new FormData(instruc);
        this.setVal(formd);
        
    }

    getValidateRule() {

        return {
            volumePledge: (val_str, $control) => { return this._validateVolume(val_str, $control); },
        };
    }

    _validateVolume(val_str, $control) {

        if (this.isByAmount) {
            return;
        }

        let volume = this.volumeCtr.value;
        let total_volume = this.leftVolume;

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
        else if (!this.isLeastVolumeSpread(volume)) {
            return `委托数量${ volume }，必须为数量步长${ this.contextVolumeStep }的整数倍`;
        }

        let boundaryResult = this.checkVolumeBoundary(volume);
        if (!boundaryResult.isOk) {
            return boundaryResult.message;
        }
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
            entrustVolume: instruc.leftVolume,
            entrustPrice: instruc.price,
            tipMsg:'质押交易下单失败',
        });

        return ordinfo;
    }
}

export { PledgeUnit };