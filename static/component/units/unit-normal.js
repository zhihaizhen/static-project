import { helper } from '../helper';
import { OrderInfo, TickData } from '../models';
import { NumberControl } from './unit-level2';
import { CompeteUnit } from './unit-compete.js';
import { BizHelper } from '../biz-helper';

/**
 * 普通交易单元
 */
class NormalUnit extends CompeteUnit {

    get unitHeight() {
        return 320;
    }

    get betterPrice() {
        
        // 根据合约信息里的债券模式区分‘净价交易’和‘全价交易’；合约信息不完善，待完成 TODO
        // return this.isBond ? this.fullPriceCtr.value : super.betterPrice;
        return super.betterPrice;
    }

    /**
     * @param {String} identifier
     * @param {Function} submitter
     */
    constructor(identifier, submitter) {

        super(identifier, submitter);
        this.setUnitName(CompeteUnit.UnitNames.normal);
    }

    build() {

        super.build();

        this.fullPriceCtr = new NumberControl({
            
            unit: this,
            bizName: '全价价格',
            unitLabel: '元',
            $control: this.$form.querySelector('.full-price'),
            max: () => { return this.isContextTickOk ? this.contextTick.ceiling : 999999999; },
            step: () => { return this.contextPriceStep; },
            precision: () => { return this.contextPricePrecision; },
            handler: this._handleFullPriceChange.bind(this),
        });

        this.repoRateCtr = new NumberControl({
            
            unit: this,
            bizName: '回购利率',
            unitLabel: '%',
            min: 0,
            max: 999999999,
            $control: this.$form.querySelector('.repo-rate'),
            step: () => { return this.contextPriceStep; },
            precision: () => { return this.contextPricePrecision; },
        });

        this.yieldRateCtr = new NumberControl({
            
            unit: this,
            bizName: '到期收益率',
            unitLabel: '%',
            min: 0,
            max: 999999999,
            step: 0.01,
            precision: 2,
            $control: this.$form.querySelector('.yield-rate'),
            handler: this._handleYieldRateChange.bind(this),
        });

        /**
         * 重置按钮
         */
        var $ctr_reset_btn = layui.$(`form button[lay-filter='reset-form-normal']`);
        $ctr_reset_btn[0].onclick = this.normalFormReset.bind(this);
    }

    setAsPrice(price) { 

        if (!this.isPledgeRepo) {

            if (this.instruction.isFullPrice) {

                this.fullPriceCtr.setValue(price);
                this._handlePriceChange();
            }
            else {
                super.setAsPrice(price);
            } 
        }
        else {

            if (this.isFixedPrice) {

                helper.showError('回购利率不允许修改');
                return;
            }

            this.repoRateCtr.setValue(price);
        }
    }

    resetForm() {

        super.resetForm();

        this.reSetElementValue([ this.repoRateCtr ]);

        if (this.isBond) {

            this.fullPriceCtr.show();
            this.yieldRateCtr.show();

            this.priceCtr.$control.children[0].textContent = '净价价格';
            this.algorithmQuery({ netPrice: this.priceCtr.value, fullPrice: this.fullPriceCtr.value, volume: this.volumeCtr.value });
        }
        else {

            this.priceCtr.$control.children[0].textContent = '委托价格';
            this.fullPriceCtr.hide();
            this.yieldRateCtr.hide();
        }

        if (this.isFixedPrice) {

            this.fullPriceCtr.disable();
            this.yieldRateCtr.disable();
        }
        else {

            this.fullPriceCtr.enable();
            this.yieldRateCtr.enable();
        }

        if (this.isPledgeRepo) {

            this.priceCtr.hide();
            this.repoRateCtr.show();
        }
        else {

            this.priceCtr.show();
            this.repoRateCtr.hide();
        }
    }

    /**
     * @param {TickData} tick_data 
     */
    digestFirstTick(tick_data) {
        
        if (!this.isPledgeRepo) {
            return;
        }

        let price_mode = this.priceModeCtr.value;

        if (this.modes.some(x => x.code == price_mode)) {
            
            let can_change_price = this.isPriceChangableByMode(price_mode);
            if (can_change_price) {

                this.repoRateCtr.setValue(tick_data.latest);
                this.repoRateCtr.enable();
            }
            else {
                
                this.repoRateCtr.setValue(this.isPositiveRepo ? tick_data.ceiling : tick_data.floor);
                this.repoRateCtr.disable();
            }
        }
        else {

            this.repoRateCtr.setValue(tick_data.latest);
            this.repoRateCtr.enable();
        }
    }

    normalFormReset() {
        this.resetForm();  
    }

    /**
     * 算法查询，债券的净价、全价、到期收益率
     */
    async algorithmQuery(criteria) {

        let result = await BizHelper.computePrices(this.instruction, criteria);

        if (result.isByNetPrice) {
                
            this.fullPriceCtr.setValue(result.fullPrice);
            this.yieldRateCtr.setValue(result.yield);
        }
        else if (result.isByFullPrice) {

            this.priceCtr.setValue(result.netPrice);
            this.yieldRateCtr.setValue(result.yield);
        }
        else {

            this.priceCtr.setValue(result.netPrice);
            this.fullPriceCtr.setValue(result.fullPrice);
        }        

        this.isByVolume ? this._handleVolumeChange() : this._handleAmountChange();
    }

    getValidateRule() {

        return {
            
            price4Normal: (val_str, $control) => { return this._validatePrice(val_str, $control); },
            fullPrice4Normal: (val_str, $control) => { return this._validateFullPrice(val_str, $control); },
            repoRate4Normal: (val_str, $control) => { return this._validateRepoRate(val_str, $control); },
            yieldRate4Normal: (val_str, $control) => { return this._validateYieldRate(val_str, $control); },
            volume4Normal: (val_str, $control) => { return this._validateVolume(val_str, $control); },
            amount4Normal: (val_str, $control) => { return this._validateAmount(val_str, $control); },
        };
    }

    _validatePrice(val_str, $control) {

        if (this.priceCtr.isHidden()) {
            return;
        }

        let result_message = this.isUserPriceLegal(this.priceCtr.value);
        if (typeof result_message == 'string') {
            return result_message;
        }
    }

    _validateFullPrice() {

        if (this.fullPriceCtr.isHidden()) {
            return;
        }

        // let net_price = this.priceCtr.value;
        let full_price = this.fullPriceCtr.value;

        if (isNaN(full_price) || full_price <= 0) {
            return this.getPromptInfo(this.fullPriceCtr.bizName, 1);
        }
        else if (!this.isLeastPriceSpread(full_price)) {
            return this.getPromptInfo(this.fullPriceCtr.bizName, 4);
        }
        // else if ((full_price - net_price) != this.interest) {
        //     return `全价${ full_price } - 净价${ net_price } ！= 百元债券利息${ this.interest }`;
        // }
    }

    _validateRepoRate(val_str, $control) {

        if (this.repoRateCtr.isHidden()) {
            return;
        }
        
        let repoRate = this.repoRateCtr.value;
        let instrucRate = this.instruction.price;

        if (isNaN(repoRate) || repoRate <= 0) {
            return this.getPromptInfo(this.repoRateCtr.bizName, 1);
        }

        if (!this.isLeastPriceSpread(repoRate)) {
            return `回购利率${ repoRate }，非基本利率变动差值${ this.contextPriceStep }的整数倍`;
        }

        /**
         * todo：对于质押式回购，回购利率一定需要指定，价格模式实际上此时无效
         * 多个涉及质押式回购交易的交易单元，均需要处理相同的逻辑，待代码优化过程中，将多个交易单元的逻辑代码，进行重整
         */
        if (this.isMarketPrice) {
            return;
        }
        else if (this.isFixedPrice) {

            if (repoRate != instrucRate) {
                return `回购利率${ repoRate }不等于指定回购利率${ instrucRate }`;
            }
        }
        else if (this.isLimitedPrice) {

            if (this.isPositiveRepo && repoRate > instrucRate) {
                return `正回购利率 ${ repoRate }，不能大于指令回购利率 ${ instrucRate }`;
            }
            else if (this.isReversedRepo && repoRate < instrucRate) { 
                return `逆回购利率 ${ repoRate }，不能小于指令回购利率 ${ instrucRate }`;
            }
        }
    }

    _validateYieldRate() {

        if (this.yieldRateCtr.isHidden()) {
            return;
        }

        let yield_rate = this.yieldRateCtr.value;
        if (isNaN(yield_rate)) {
            return this.getPromptInfo(this.yieldRateCtr.bizName, 0);
        }
    }
    
	_validateAmount(val_str, $control) {

        let amount = this.amountCtr.value;

        /**
         * 委托金额，无论按数量，或者金额，都必须最终为有效数值
         */

        if (isNaN(amount) || amount <= 0) {

            return this.getPromptInfo(this.amountCtr.bizName, 1);
        }
        
        if (this.isByVolume) {

            /**
             * 针对按数量交易，评估出来的委托金额，为只读
             */
            return;
        }
        
        let total_amount = this.leftAmount;
        if (total_amount == 0) {
            return '指令可用数量 = 0';
        }
        else if (amount > total_amount) {
            return `委托金额 > 可用金额${ total_amount }`;
        }

        if (this.isPledgeRepo) {
            return;
        }

        let price = this.priceCtr.value;
        if (isNaN(price)) {
            return '委托价，非数值，无法评估委托数量';
        }

        // let { ceiling, floor } = this.contextTick;
        // if (price > ceiling || price < floor) {
        //     return `价格不在跌停${ floor } ~ 涨停${ ceiling } 范围内，无法评估委托数量`;
        // }
    }

    _handlePriceChange() {

        if (!this.isBond) {
            super._handlePriceChange();
        }
        else {
            this.algorithmQuery({ netPrice: this.priceCtr.value, volume: this.volumeCtr.value });
        }
    }

    _handleFullPriceChange() {
        this.algorithmQuery({ fullPrice: this.fullPriceCtr.value, volume: this.volumeCtr.value });
    }

    _handleYieldRateChange() {
        this.algorithmQuery({ yield: this.yieldRateCtr.value, volume: this.volumeCtr.value });
    }

    _handleVolumeChange() {
        this.amountCtr.setValue(this.calculateAmount(this.volumeCtr.value, this.betterPrice));
    }

    _handleAmountChange() {
        this.volumeCtr.setValue(this.calculateVolume(this.amountCtr.value, this.betterPrice));
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
            entrustProp: this.priceModeCtr.value,
            stockCode: instruc.stockCode,
            entrustVolume: this.volumeCtr.value,
            entrustPrice: this.isPledgeRepo ? this.repoRateCtr.value : this.priceCtr.value,
            fullPrice: this.fullPriceCtr.isShowing() ? this.fullPriceCtr.value : 0,
            expireYearRate: this.yieldRateCtr.isShowing() ? this.yieldRateCtr.value : 0,
            tipMsg: '普通交易下单失败'
        });
        
        return ordinfo;
    }
}

export { NormalUnit };