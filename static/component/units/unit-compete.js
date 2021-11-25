import { helper } from '../helper';
import { dictionary } from '../dictionary';
import { Instruction, TickData } from '../models';
import { Level2Unit, NumberControl, SelectControl } from './unit-level2';

class CompeteFormData {

    /**
     * @param {Instruction} instruc 
     */
    constructor(instruc) {

        this.portfolioName = instruc.portfolioName;
        this.accountName = instruc.tradeAccountId;
        this.stockCodeName = instruc.stockCodeName;
        this.direction = instruc.direction;
        this.priceMode = null;
        this.price = instruc.price;
        this.volume = instruc.leftVolume;
        this.amount = instruc.leftAmount;
    }
}

class CompeteUnit extends Level2Unit {

    get unitHeight() {
        return 320;
    }

    get betterPrice() {
        return this.isPledgeRepo ? 100 : this.priceCtr.value;
    }

    /** 当前是否选择的市价模式 */
    get isMarketPriceSelected() {
        return this.priceModeCtr.value != dictionary.entrustProp.normal.code;
    }

    /**
     * @param {String} identifier
     * @param {Function} submitter
     */
    constructor(identifier, submitter) {
        super(identifier, submitter);
    }

    build() {

        super.build();

        this.directionCtr = new SelectControl({

            unit: this,
            $control: this.$form.querySelector('.direction'),
        });

        this.directionCtr.fill(dictionary.direction);
        this.directionCtr.disable();

        this.priceModeCtr = new SelectControl({

            unit: this,
            $control: this.$form.querySelector('.price-mode'),
            handler: this.handlePriceModeChange.bind(this),
        });
        
        this.priceCtr = new NumberControl({
            
            unit: this,
            $control: this.$form.querySelector('.price'),
            bizName: '委托价格',
            unitLabel: '元',
            max: () => { return this.isContextTickOk ? this.contextTick.ceiling : 999999999; },
            min: () => { return this.isContextTickOk ? this.contextTick.floor : 0; },
            step: () => { return this.contextPriceStep; },
            precision: () => { return this.contextPricePrecision; },
            handler: this._handlePriceChange.bind(this),
        });

        this.volumeCtr = new NumberControl({
            
            unit: this,
            $control: this.$form.querySelector('.volume'),
            bizName: '委托数量',
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
            $control: this.$form.querySelector('.amount'),
            bizName: '金额',
            enableComma: true,
            handler: this._handleAmountChange.bind(this),
        });
    }

    resetForm() {

        this.level2.$header.textContent = this.instruction.stockCodeName;
        this.volumeCtr.updateUnitLabel(this.unitlabel);

        if (this.isByVolume) {

            this.volumeCtr.enable();
            this.amountCtr.disable();
        }
        else {

            this.volumeCtr.disable();
            this.amountCtr.enable();
        }

        if (this.isFixedPrice) {

            this.priceModeCtr.disable();
            this.priceCtr.disable();
        }
        else {

            this.priceModeCtr.enable();
            this.priceCtr.enable();
        }

        /** 当前符合的价格模式 */
        let modes = this.computePriceModes();
        this.priceModeCtr.fill(modes);
        let formd = new CompeteFormData(this.instruction);
        
        /** 设置默认的价格模式 */
        formd.priceMode = modes.length > 0 ? modes[0].code : null;
        /** 对初始合约指令委托数量，进行取整后填入 */
        formd.volume = this.trimVolume(formd.volume);
        this.setVal(formd);

        this.reSetElementValue([ this.priceCtr ]);

        /** 适合当前场景到价格模式（委托属性） */
        this.modes = modes;

        /**
         * 初始化后，模拟一次价格模式切换，同步价格状态
         */
        this.handlePriceModeChange();
        this._handlePriceChange();
    }

    /**
     * @param {TickData} tick_data 
     */
    digestFirstTick(tick_data) {

        if (this.isFixedPrice || this.isLimitedPrice) {

            /**
             * 当指令价格模式字段，值域 = 指定价格/限价，则价格模式的变动，不能影响下单价格（理论上，固定价格的指令，价格模式应当被限制不可变更）
             */
            return;
        }

        let price_mode = this.priceModeCtr.value;

        if (this.modes.some(x => x.code == price_mode)) {
            
            let can_change_price = this.isPriceChangableByMode(price_mode);

            if (can_change_price) {

                this.priceCtr.setValue(tick_data.latest);
                this.priceCtr.enable();
            }
            else {
                
                this.priceCtr.setValue(this.isBuy ? tick_data.ceiling : tick_data.floor);
                this.priceCtr.disable();
            }
        }
        else {

            this.priceCtr.setValue(tick_data.latest);
            this.priceCtr.enable();
        }
        
        this._handlePriceChange(); 
    }

    setTick(tick_data) {
        super.setTick(tick_data);
    }

    setAsPrice(price) {

        if (this.isFixedPrice) {

            helper.showError('指令价格不允许修改');
            return;
        }
        
        this.priceCtr.setValue(price);
        this._handlePriceChange();
    }

    _validatePrice(val_str, $control) {
        
        let price = this.priceCtr.value;
        if (isNaN(price) || price <= 0) {
            return this.getPromptInfo(this.priceCtr.bizName, 1);
        }
        
        if (this.isContextTickOk) {

            let { ceiling, floor } = this.contextTick;
            if (price > ceiling) {
                return `委托价 > 涨停价${ ceiling }`;
            }
            else if (price < floor) {
                return `委托价 < 跌停价${ floor }`;
            }
        }
        
        if(!this.isLeastPriceSpread(price)) {
            return this.getPromptInfo(this.priceCtr.bizName, 4);
        }
    }

    _validateVolume(val_str, $control) {

        if (this.isByAmount) {

            /**
             * 针对按金额交易，评估出来的委托数量，为只读
             */
            return;
        }

        let total_volume = this.leftVolume;
        let volume = this.volumeCtr.value;
        
        if (total_volume <= 0) {
            return Level2Unit.messages.zeroVolume;
        }
        else if (volume === total_volume) {
            return Level2Unit.messages.decidedOk;
        }

        /**
         * 委托数量，无论按数量，或者金额，都必须最终为有效数值
         */

        if (isNaN(volume) || volume <= 0 || !Number.isInteger(volume)) {
            return this.getPromptInfo(this.volumeCtr.bizName, 3);
        }
        else if (volume > total_volume) {
            return `委托数量 > 可用数量${ total_volume }`;
        }
        else if (!this.isLeastVolumeSpread(volume)) {
            return this.getPromptInfo(this.volumeCtr.bizName, 5);
        }

        if (this.isShKcbDept) {
            return this._validateKcbPolicy(total_volume, volume);
        }

        let boundaryResult = this.checkVolumeBoundary(volume, this.isMarketPriceSelected);
        if (!boundaryResult.isOk) {
            return boundaryResult.message;
        }
    }

    /**
     * 验证科创板数量规则
     * @param {Number} total 
     * @param {Number} volume 
     */
    _validateKcbPolicy(total, volume) {

        let least = 200;
        let marketAlmost = 50000;
        let almost = 100000;

        if (total <= least) {
            
            if (volume != total) {
                return `科创板股票，低于${least}时，需一次性全部交易`;
            }
        }
        else {

            if (volume < least) {
                return `科创板标的，最少交易数量 = ${least}`;
            }
            else {

                if (this.isMarketPrice && volume > marketAlmost) {
                    return `科创板标的，市价模式下，最多交易数量 = ${helper.thousandsInteger(marketAlmost)}`;
                }
                else if (volume > almost) {
                    return `科创板标的，最多交易数量 = ${helper.thousandsInteger(almost)}`;
                }
            }
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
            return Level2Unit.messages.zeroAmount;
        }
        else if (amount > total_amount) {
            return `委托金额 > 可用金额${ total_amount }`;
        }

        let price = this.priceCtr.value;
        if (isNaN(price)) {
            return '委托价，非数值，无法评估委托数量';
        }

        let { ceiling, floor } = this.contextTick;
        if (price > ceiling || price < floor) {
            return `价格不在跌停${ floor } ~ 涨停${ ceiling } 范围内，无法评估委托数量`;
        }
    }

    handlePriceModeChange() {

        if (this.isFixedPrice) {

            /**
             * 当指令价格模式字段，值域 = 指定价格，则价格模式的变动，不能影响下单价格（理论上，固定价格的指令，价格模式应当被限制不可变更）
             */
            return;
        }
        
        let price_mode = this.priceModeCtr.value;
        this.priceCtr.setValue(this.instruction.price);

        if (this.modes.some(x => x.code == price_mode)) {

            let can_change_price = this.isPriceChangableByMode(price_mode);
            can_change_price ? this.priceCtr.enable() : this.priceCtr.disable();
            let tickPrice = !this.isLimitedPrice && this.isContextTickOk ? can_change_price ? this.contextTick.latest : (this.isBuy ? this.contextTick.ceiling : this.contextTick.floor) : this.instruction.price;
            this.priceCtr.setValue(tickPrice);
        }
        else {

            if(this.isContextTickOk) {
                this.priceCtr.setValue(this.contextTick.latest);
            }
            this.priceCtr.enable();
        }
        
        this._handlePriceChange(); 
    }

    _handlePriceChange() {
        this.isByVolume ? this._handleVolumeChange() : this._handleAmountChange();
    }

    _handleVolumeChange() {
        this.amountCtr.setValue(this.calculateAmount(this.volumeCtr.value, this.betterPrice));
    }

    _handleAmountChange() {
        this.volumeCtr.setValue(this.calculateVolume(this.amountCtr.value, this.betterPrice));
    }
}

export { CompeteUnit, CompeteFormData };