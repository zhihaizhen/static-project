import { helper } from '../helper';
import { dictionary } from '../dictionary';
import { Instruction, TickData, BatchOrderInfo } from '../models';
import { Level2Unit } from './unit-level2';
import { SelectControl, NumberControl } from './trading-unit';

const BatchPriceMode = {

    fixed: { code: 1, mean: '固定价格偏移' },
    buy1: { code: 2, mean: '买一价偏移' },
    sell1: { code: 3, mean: '卖一价偏移' },
    latest: { code: 4, mean: '最新价偏移' },
    market: { code: 5, mean: '市价' },
};

class FormData {

    /**
     * @param {Instruction} instruc 
     */
    constructor(instruc) {

        this.portfolioName = instruc.portfolioName;
        this.accountName = instruc.tradeAccountId;
        this.stockCodeName = instruc.stockCodeName;
        this.direction = instruc.direction;
        this.priceMode = BatchPriceMode.fixed.code;
        this.startPrice = instruc.price;

        this.priceOffset = 0;
        this.startVolume = 0;
        this.volumeOffset = 0;
        this.times = 1;
        this.sleepingTime = 5;
        /** 可用总数量 */
        this.totalVolume = 0;
        /** 可用总金额 */
        this.totalAmount = 0;
        /** 下单总数量 */
        this.orderVolume = 0;
        /** 下单总金额 */
        this.orderAmount = 0;
    }
}

/**
 * 批量交易单元
 */
class BatchUnit extends Level2Unit {

    /** 当前是否选择的市价模式 */
    get isMarketPriceSelected() {
        return this.priceModeCtr.value == BatchPriceMode.market.code;
    }

    /** 是否，需要提供，起始价格 */
    get isPriceRequired() {
        return this.priceModeCtr.value == BatchPriceMode.fixed.code;
    }

    /** 是否，需要提供，价格偏移 */
    get isPriceOffsetRequired() {
        return this.priceModeCtr.value != BatchPriceMode.market.code;
    }

    /** 是否，总可用数量，支持交易 */
    get isTotalVolumeAsExpected() {
        return this.totalVolumeCtr.value > 0;
    }

    get unitHeight() {
        return 475;
    }

    get showOrder() {
        return true;
    }

    /**
     * @param {String} identifier
     * @param {Function} submitter
     */
    constructor(identifier, submitter) {
        
        super(identifier, submitter);
        this.setUnitName(Level2Unit.UnitNames.batch);
    }

    build() {

        super.build();

        /**
         * 委托方向
         */

        this.directionCtr = new SelectControl({

            unit: this,
            $control: this.$form.querySelector('.direction'),
        });

        this.directionCtr.fill(dictionary.direction);
        this.directionCtr.disable();

        /**
         * 价格模式
         */
        this.priceModeCtr = new SelectControl({

            unit: this, 
            $control: this.$form.querySelector('.price-mode'), 
            handler: this._handlePriceModeChange.bind(this),
        });

        /**
         * 起始价格
         */
        this.startPriceCtr = new NumberControl({

            unit: this, 
            bizName: '起始价格',
            unitLabel: '元', 
            $control: this.$form.querySelector('.start-price'),
            max: () => { return this.isContextTickOk ? this.contextTick.ceiling : 999999999; },
            min: () => { return this.isContextTickOk ? this.contextTick.floor : 0; },
            step: () => { return this.contextPriceStep; },
            precision: () => { return this.contextPricePrecision; },
            handler: this._handleStartPriceChange.bind(this),
        });

        /**
         * 价格偏移
         */
        this.priceOffsetCtr = new NumberControl({

            unit: this, 
            bizName: '价格偏移',
            unitLabel: '元', 
            $control: this.$form.querySelector('.price-offset'),
            max: () => { return this.isContextTickOk ? this.contextTick.ceiling : 999999999; },
            min: () => { return this.isContextTickOk ? -this.contextTick.floor : 0; },
            step: () => { return this.contextPriceStep; },
            precision: () => { return this.contextPricePrecision; },
            handler: this._handlePriceOffsetChange.bind(this),
        });

        /**
         * 起始数量
         */
        this.startVolumeCtr = new NumberControl({

            unit: this, 
            bizName: '起始数量',
            unitLabel: '股', 
            enableComma: true,
            asInteger: true,
            $control: this.$form.querySelector('.start-volume'),
            max: 999999999,
            step: () => { return this.contextVolumeStep; },
            handler: this._handleStartVolumeChange.bind(this),
        });

        /**
         * 数量偏移
         */
        this.volumeOffsetCtr = new NumberControl({

            unit: this, 
            bizName: '数量偏移',
            unitLabel: '股', 
            enableComma: true,
            asInteger: true,
            $control: this.$form.querySelector('.volume-offset'),
            max: 999999999,
            step: () => { return this.contextVolumeStep; },
            handler: this._handleVolumeOffsetChange.bind(this),
        });

        /**
         * 委托笔数
         */
        this.timesCtr = new NumberControl({

            unit: this, 
            bizName: '委托笔数',
            unitLabel: '笔', 
            enableComma: true,
            asInteger: true,
            $control: this.$form.querySelector('.times'),
            max: 999999999,
            step: 1,
            handler: this._handleTimesChange.bind(this),
        });

        /**
         * 委托间隔
         */
        this.sleepingTimeCtr = new NumberControl({

            unit: this, 
            bizName: '委托间隔',
            unitLabel: '秒', 
            asInteger: true,
            $control: this.$form.querySelector('.sleeping-time'),
            max: 7200,
            min: 1,
            step: 5,
        });

        /**
         * 总可用数量
         */
        this.totalVolumeCtr = new NumberControl({

            unit: this, 
            bizName: '可用数量',
            unitLabel: '股',
            enableComma: true,
            asInteger: true,
            $control: this.$form.querySelector('.total-volume'),
        });

        /**
         * 总可用金额
         */
        this.totalAmountCtr = new NumberControl({

            unit: this, 
            bizName: '可用金额',
            unitLabel: '元',
            $control: this.$form.querySelector('.total-amount'),
        });

        /**
         * 试算委托总量
         */
        this.orderVolumeCtr = new NumberControl({

            unit: this, 
            bizName: '委托总量',
            unitLabel: '股',
            enableComma: true,
            asInteger: true,
            $control: this.$form.querySelector('.order-volume'),
        });

        /**
         * 试算委托总额
         */
        this.orderAmountCtr = new NumberControl({

            unit: this,
            bizName: '委托总额',
            unitLabel: '元',
            $control: this.$form.querySelector('.order-amount'),
        });

        /**
         * 开平仓标志
         */
        this.offsetFlag = new NumberControl({
            unit: this,
            bizName: '开平',
            $control: this.$form.querySelector('.batch-offsetFlag'),
        });

        this.hedgeFlag = new NumberControl({
            unit: this,
            bizName: '投机套保标志',
            $control: this.$form.querySelector('.batch-hedgeFlag'),
        });
        
        let offsetFlagCtr = this.$form.querySelector('#batch-offsetFlag');
        let hedgeFlagCtr = this.$form.querySelector('#batch-hedgeFlag');
        let inputOffsetFlag = '';
        let inputhedgeFlag = '';

        for (let key in dictionary.offsetSign) {
            inputOffsetFlag += `<input type="radio" name="batchOffsetFlag" value="${dictionary.offsetSign[key].code}" title="${dictionary.offsetSign[key].mean}"></input>`;
        }

        offsetFlagCtr.innerHTML = inputOffsetFlag;

        for (let key in dictionary.hedgeSign) {
            inputhedgeFlag += `<input type="radio" name="batchHedgeFlag" value="${dictionary.hedgeSign[key].code}" title="${dictionary.hedgeSign[key].mean}"></input>`;
        }

        hedgeFlagCtr.innerHTML = inputhedgeFlag;

        /**
         * 重置按钮
         */
        var $ctr_reset_btn = layui.$(`form button[lay-filter='reset-form-batch']`);
        $ctr_reset_btn[0].onclick = this.resetForm.bind(this);

        this._buildTimesShortcut();
    }

    _buildTimesShortcut() {

        if (this._timesBuilt) {
            return;
        }

        this._timesBuilt = true;
        const thisObj = this;
        let $time_shortcut = this.$form.querySelector('.times-shortcut');
        let $shcts = $time_shortcut.querySelector('.shortcuts');
        let members = [20, 10, 5, 3, 1];

        members.forEach(times => {

            let $shc = document.createElement('a');
            $shc.textContent = times + '笔';
            $shc.onclick = function () { thisObj._setAsTimes(times); };
            $shcts.appendChild($shc);
        });
    }

    resetForm() {

        const instruc = this.instruction;
        const bpm = BatchPriceMode;
        this.level2.$header.textContent = instruc.stockCodeName;
       
        if(this.assetType == dictionary.assetType.bond.code || this.assetType == dictionary.assetType.standardVoucher.code) {
            this.priceModeCtr.fill([bpm.fixed, bpm.buy1, bpm.sell1, bpm.latest]);
        }
        else {
            this.priceModeCtr.fill([bpm.fixed, bpm.buy1, bpm.sell1, bpm.latest, bpm.market]);
        }
       
        const formd = new FormData(instruc);

        /**
         * 设置总可用数量、可用金额
         */

        if (this.isByVolume) {
            formd.totalVolume = this.leftVolume;
        }
        else {
            formd.totalAmount = instruc.leftAmount;
        }

        this.setVal(formd);

        this.reSetElementValue([ this.startPriceCtr, this.priceOffsetCtr ]);
        
        /**
         * 根据场景，显影响应控件、启用禁用输入状态
         */

        if (this.isByVolume) {

            this.totalVolumeCtr.show();
            this.totalAmountCtr.hide();
            this.orderVolumeCtr.show();
            // this.orderAmountCtr.hide();
        }
        else {

            this.totalVolumeCtr.hide();
            this.totalAmountCtr.show();
            this.orderVolumeCtr.hide();
            // this.orderAmountCtr.show();
        }

        /**
         * mark：需求提出不需要试算下单额（实现上，采取隐藏，而非删除）
         */
        this.orderAmountCtr.hide();

        /**
         * 为值域设置合适的单位
         */

        const unit_label = this.unitlabel;
        this.totalVolumeCtr.updateUnitLabel(unit_label);
        this.startVolumeCtr.updateUnitLabel(unit_label);
        this.volumeOffsetCtr.updateUnitLabel(unit_label);
        this.orderVolumeCtr.updateUnitLabel(unit_label);

        if(this.isPledgeRepo) {
            
            this.startPriceCtr.updateUnitLabel('%');
            this.priceOffsetCtr.updateUnitLabel('%');
        }
        else {

            this.startPriceCtr.updateUnitLabel('元');
            this.priceOffsetCtr.updateUnitLabel('元');
        }

        if (instruc.isFuture) {

            /**
             * 期货暂时不出现批量交易所以不增加修改单位
             */
            // if (this.instruction.repoType  == dictionary.repoType.treasuryFutures.code) {
            //     this.startPriceCtr.updateUnitLabel('元');
            //     this.priceOffsetCtr.updateUnitLabel('元');
            // }
            // else if (this.instruction.repoType  == dictionary.repoType.stockIndexFutures.code) {
            //     this.startPriceCtr.updateUnitLabel('点');
            //     this.priceOffsetCtr.updateUnitLabel('点');
            // }
            this.offsetFlag.show();
            this.hedgeFlag.hide();
            // this.hedgeFlag.show();
            let offsetFlagStatus = document.querySelectorAll('input[name = "batchOffsetFlag"]');
            let hedgeFlagStatus = document.querySelectorAll('input[name = "batchHedgeFlag"]');
            layui.form.val("form-batch", { 

                batchOffsetFlag: instruc.offsetFlag ? instruc.offsetFlag : dictionary.offsetSign.open.code,
                batchHedgeFlag: instruc.hedgeFlag ? instruc.hedgeFlag : dictionary.hedgeSign.speculation.code,
            });

            if (instruc.offsetFlag) {

                offsetFlagStatus.forEach(item => item.disabled = true);
            }
            else {
                offsetFlagStatus.forEach(item => item.disabled = false);
            }

            if (instruc.hedgeFlag) {
                hedgeFlagStatus.forEach(item => item.disabled = true);
            }
            else {
                hedgeFlagStatus.forEach(item => item.disabled = false);
            }

            layui.form.render('radio');
        }
        else {

            this.offsetFlag.hide();
            this.hedgeFlag.hide();
        }

        /**
         * 模拟一次价格模式切换，同步价格值域状态
         */
        this._handlePriceModeChange();

        /**
         * 试算初始状态下的下单总数量，或总金额
         */
        this._resetOrderScale();
    }

    /**
     * @param {TickData} tick_data 
     */
    digestFirstTick(tick_data) {

        if (this.isPriceRequired) {

            this.startPriceCtr.setValue(tick_data.latest);
            this._resetOrderScale();
        }
    }

    setTick(tick_data) {
        super.setTick(tick_data);
    }

    setAsPrice(price) {

        if (this.priceModeCtr.value == BatchPriceMode.fixed.code) {

            this.startPriceCtr.setValue(price);
            this._handleStartPriceChange();
        }
    }

    _setAsTimes(times) {

        /**
         * 仅提供设置次数字段，暂不作其他联动
         */

        this.timesCtr.setValue(times);
        this._handleTimesChange();
    }

    getValidateRule() {

        return {

            startPrice4Batch: (val_str, $control) => {
                return this._validateStartPrice(val_str, $control);
            },

            priceOffset4Batch: (val_str, $control) => {
                return this._validatePriceOffset(val_str, $control);
            },

            startVolume4Batch: (val_str, $control) => {
                return this._validateStartVolume(val_str, $control);
            },

            volumeOffset4Batch: (val_str, $control) => {
                return this._validateVolumeOffset(val_str, $control);
            },

            times4Batch: (val_str, $control) => {
                return this._validateTimes(val_str, $control);
            },

            sleepingTime4Batch: (val_str, $control) => {
                return this._validateSleepingTime4Batch(val_str, $control);
            },
            
            orderVolume4Batch: (val_str, $control) => {
                return this._validateOrderVolume(val_str, $control);
            },

            orderAmount4Batch: (val_str, $control) => {
                return this._validateOrderAmount(val_str, $control);
            },

        };
    }

    customizeData(field_data) {

        let ep = dictionary.entrustProp;
        let instruc = this.instruction;
        let priceMode = this.priceModeCtr.value;
        let marketPriceProp = this.isShSecMarket ? ep.best5_to_limit.code : ep.counterparty.code;
        let batchEntrustProp = priceMode == BatchPriceMode.market.code ? marketPriceProp : ep.normal.code;
        
        let basic_info = {
    
            instructionId: instruc.id,
            portfolioId: instruc.portfolioId,
            userId: instruc.tradeId,
            username: instruc.traderName,
            accountId: instruc.acctNo,
            entrustBs: instruc.bsFlag,
            entrustProp: batchEntrustProp,
            stockCode: instruc.stockCode,

            /**
             * 具体数量和价格，已包含在批量订单详情部分
             */
            entrustVolume: this.orderVolumeCtr.value || 0,
            entrustPrice: this.startPriceCtr.value || 0,
            tipMsg: '批量交易下单失败'
        };

        if (this.instruction.isFuture) {
 
            const formValue = layui.form.val('form-batch');
            let formOffsetFlag = formValue.batchOffsetFlag;
            let formHedgeFlag = formValue.batchHedgeFlag;

            basic_info.offsetFlag = formOffsetFlag;
            basic_info.hedgeFlag = formHedgeFlag;
        }

        let detail_info = {

            id: null,
            priceMode: priceMode,
            beginPrice: this.startPriceCtr.value,
            priceOffset: this.priceOffsetCtr.value,
            beginVolume: this.startVolumeCtr.value,
            volumeOffset: this.volumeOffsetCtr.value,
            entrustTimes: this.timesCtr.value,
            stepTime: this.sleepingTimeCtr.value,
        };

        let ordinfo = new BatchOrderInfo(basic_info, detail_info);
        return ordinfo;
    }

    /**
     * 更新试算下单总量（只读）
     */
    _resetOrderScale() {

        if (this.isByVolume) {
            this.orderVolumeCtr.setValue(this._calculateBatchVolume());
        }
        else {
            this.orderAmountCtr.setValue(this._calculateBatchAmount());
        }
    }

    /**
     * 试算
     */
    _calculateBatchVolume() {

        /**
         * 起始数量
         */

        let start_volume = this.startVolumeCtr.value;
        if (isNaN(start_volume) || start_volume <= 0) {
            return 0;
        }

        /**
         * 数量偏移
         */

        let volume_offset = this.volumeOffsetCtr.value;
        if (isNaN(volume_offset)) {
            volume_offset = 0;
        }

        /**
         * 委托笔数
         */

        let times = this.timesCtr.value;
        if (isNaN(times) || times <= 1) {
            times = 1;
        }
        else if (!Number.isInteger(times)) {
            times = parseInt(times);
        }
        
        let batch_volume = 0;
        let cur_volume = start_volume;

        for (let cur_time = 1; cur_time <= times; cur_time++) {

            if (cur_time > 1) {
                cur_volume += volume_offset;
            }

            if (cur_volume <= 0) {
                break;
            }

            batch_volume += cur_volume;
        }

        return batch_volume;
    }

    _specifyModePrice() {

        let mode = this.priceModeCtr.value;
        let contxt_tick = this.contextTick;
        let proper_price = 0;

        if (mode == BatchPriceMode.latest.code) {
            proper_price = contxt_tick.latest;
        }
        else if (mode == BatchPriceMode.buy1.code)  {
            proper_price = contxt_tick.buys[0];
        }
        else if (mode == BatchPriceMode.sell1.code) {
            proper_price = contxt_tick.sells[0];
        }
        else {
            proper_price = this.isBuy ? contxt_tick.ceiling : contxt_tick.floor;
        }

        return proper_price;
    }

    _calculateBatchAmount() {

        /**
         * 起始价格
         */

        let start_price = 0;

        if (this.isPriceRequired) {

            start_price = this.startPriceCtr.value;
            if (isNaN(start_price) || start_price <= 0) {
                return 0;
            }
        }
        else {

            if (!this.isContextTickOk) {
                return 0;
            }
            else {
                start_price = this._specifyModePrice();
            }
        }

        /**
         * 价格偏移
         */

        let price_offset = 0;
        if (this.isPriceOffsetRequired) {

            price_offset = this.priceOffsetCtr.value;
            if (isNaN(price_offset)) {
                price_offset = 0;
            }
        }

        /**
         * 起始数量
         */

        let start_volume = this.startVolumeCtr.value;            
        if (isNaN(start_volume) || start_volume <= 0) {
            return 0;
        }

        /**
         * 数量偏移
         */

        let volume_offset = this.volumeOffsetCtr.value;
        if (isNaN(volume_offset)) {
            volume_offset = 0;
        }

        /**
         * 委托笔数
         */

        let times = this.timesCtr.value;
        if (isNaN(times) || times <= 1) {
            times = 1;
        }
        else if (!Number.isInteger(times)) {
            times = parseInt(times);
        }
        
        let batch_amount = 0;
        let cur_price = start_price;
        let cur_volume = start_volume;

        for (let cur_time = 1; cur_time <= times; cur_time++) {

            if (cur_time > 1) {

                cur_price += price_offset;
                cur_volume += volume_offset;
            }

            batch_amount += cur_price * cur_volume;
        }

        return batch_amount;
    }

    _handlePriceModeChange() {

        const unnecessary = '<无需输入>';

        if (this.isPriceRequired) {

            /** 提供给，固定价格模式的，默认交易价格 */
            let proper_price = this.instruction.price;
            this.startPriceCtr.enable();
            this.startPriceCtr.setValue(proper_price);
            this.priceOffsetCtr.enable();
            this.priceOffsetCtr.setValue(0);
        }
        else {
            
            this.startPriceCtr.disable();
            this.startPriceCtr.setValue(unnecessary);

            if (this.isPriceOffsetRequired) {

                this.priceOffsetCtr.enable();
                this.priceOffsetCtr.setValue(0);
            }
            else {
                this.priceOffsetCtr.disable();
                this.priceOffsetCtr.setValue(unnecessary);
            }
        }
    }

    _handleStartPriceChange() {
        this._resetOrderScale();
    }

    _handlePriceOffsetChange() {
        this._resetOrderScale();
    }

    _handleStartVolumeChange() {
        this._resetOrderScale();
    }

    _handleVolumeOffsetChange() {
        this._resetOrderScale();
    }

    _handleTimesChange() {
        this._resetOrderScale();
    }

    isCustomziedOk() {

        if (!this.isPriceRequired) {
            return true;
        }

        const entrustTimes  = this.timesCtr.value;
        const start_price = this.startPriceCtr.value;
        const offset_price = this.priceOffsetCtr.value;
        const instruc_price = this.instruction.price;

        if (this.isContextTickOk) {

            let { ceiling, floor } = this.contextTick;
            let batchTradeNum = -1;
            let batchTradePrice = 0;
            for (let i = 0; i < entrustTimes; i++) {

                batchTradePrice = start_price + offset_price * i;
                if (batchTradePrice > ceiling || batchTradePrice < floor) {

                    batchTradeNum = i;
                    break;
                }
            }

            if (batchTradeNum > -1) {
                return `第${ batchTradeNum + 1 }笔委托，委托价格${ batchTradePrice }不在跌停${ floor } ~ 涨停${ ceiling } 范围内`;
            }
        }
        
        if (this.isMarketPrice) {
            return true;
        }
        
        if (this.isBuy || (this.isPledgeRepo && this.isPositiveRepo)) {

            let batchBuyNum = -1;
            let batchBuyPrice = 0;
            for (let i = 0; i < entrustTimes; i++) {

                batchBuyPrice = start_price + offset_price * i;
                if (batchBuyPrice > instruc_price) {

                    batchBuyNum = i;
                    break;
                }
            }

            if (batchBuyNum > -1) {
                return `第${ batchBuyNum + 1 }笔委托，委托价格${ batchBuyPrice }大于限价${ instruc_price }`;
            }

            return true;
        }
        
        if (this.isSell || (this.isPledgeRepo && this.isReversedRepo)) {

            let batchSellNum = -1;
            let batchSellPrice = 0;
            for (let i = 0; i < entrustTimes; i++) {

                batchSellPrice = start_price + offset_price * i;
                if (batchSellPrice < instruc_price) {

                    batchSellNum = i;
                    break;
                }
            }

            if (batchSellNum > -1) { 
                return `第${ batchSellNum + 1 }笔委托，委托价格${ batchSellPrice }小于限价${ instruc_price }`;
            }

            return true;
        }

        return true;
    }

    _validateStartPrice(val_str, $control) {

        if (!this.isPriceRequired) {
            return;
        }

        let start_price = this.startPriceCtr.value;
        if (isNaN(start_price) || start_price <= 0) {
            return this.getPromptInfo(this.startPriceCtr.bizName, 1);
        }
        if (this.isContextTickOk) {

            let { ceiling, floor } = this.contextTick;
        
            if (start_price > ceiling) {
                return `开始价${ start_price } > 涨停价${ ceiling }`;
            }
            else if (start_price < floor) {
                return `开始价${ start_price } < 跌停价${ floor }`;
            }
        }
        
        if (!this.isLeastPriceSpread(start_price)) {
            return this.getPromptInfo(this.startPriceCtr.bizName, 4);
        }
    }

    _validatePriceOffset(val_str, $control) {

        if (!this.isPriceOffsetRequired) {
            return;
        }

        let price_offset = this.priceOffsetCtr.value;
        if (isNaN(price_offset)) {
            return this.getPromptInfo(this.priceOffsetCtr.bizName, 0);
        }
        else if (!this.isLeastPriceSpread(Math.abs(price_offset))) {
            return this.getPromptInfo(this.priceOffsetCtr.bizName, 4);
        }
    }

    _validateStartVolume(val_str, $control) {

        let start_volume = this.startVolumeCtr.value;

        if (isNaN(start_volume) || !Number.isInteger(start_volume) || start_volume <= 0) {
            return this.getPromptInfo(this.startVolumeCtr.bizName, 3);
        }
        else if (!this.isLeastVolumeSpread(start_volume)) {
            return this.getPromptInfo(this.startVolumeCtr.bizName, 5);
        }
        
        if (this.isByVolume) {

            let all_volume = this.leftVolume;
            if (start_volume > all_volume) {
                return `起始委托数量${ start_volume } > 可用数量${ all_volume }`;
            }
        }

        let boundaryResult = this.checkVolumeBoundary(start_volume, this.isMarketPriceSelected);
        if (!boundaryResult.isOk) {
            return boundaryResult.message;
        }
    }

    _validateVolumeOffset(val_str, $control) {

        let volume_offset = this.volumeOffsetCtr.value;

        if (isNaN(volume_offset) || !Number.isInteger(volume_offset)) {
            return this.getPromptInfo(this.volumeOffsetCtr.bizName, 2);
        }
        else if (!this.isLeastVolumeSpread(volume_offset)) {
            return this.getPromptInfo(this.volumeOffsetCtr.bizName, 5);
        }
    }

    _validateTimes(val_str, $control) {

        let times = this.timesCtr.value;

        if (isNaN(times) || !Number.isInteger(times) || times <= 0) {
            return this.getPromptInfo(this.timesCtr.bizName, 3);
        }
    }

    _validateSleepingTime4Batch(val_str, $control) {

        let sleeping_time = this.sleepingTimeCtr.value;

        if (isNaN(sleeping_time) || !Number.isInteger(sleeping_time) || sleeping_time <= 0) {
            return this.getPromptInfo(this.sleepingTimeCtr.bizName, 3);
        }
        else if (sleeping_time > 7200) {
            return '委托间隔，最大7200秒';
        }
    }

    _validateOrderVolume(val_str, $control) {

        /**
         * 按金额下单，对用户回显的是，涉单总金额
         */

        if (this.isByAmount) {
            return;
        }

        let total_left = this.leftVolume;
        let order_volume = this.orderVolumeCtr.value;

        if (isNaN(order_volume) || order_volume <= 0) {
            return this.getPromptInfo(this.orderVolumeCtr.bizName, 1);
        }

        /**
         * mark：
         * 1. 批量交易，最终的订单批次，在后台进行分批分次报送，试算数量，和最终后台实际成交数量，会存在差异
         * 2. 严格要求试算订单数量，一定要在总量范围内，极可能造成部分仓位不能完全交易的风险
         * 3. 故，不对是否超出数量上限，作检测（开始数量 > 总可用数量，除外 -- 开始数量的验证逻辑，已经覆盖）
         */

        if (order_volume > total_left) {
            return `下单总量${ helper.thousands(order_volume) } > 可用数量${ helper.thousands(total_left) }`;
        }
        
        if (!this.isLeastVolumeSpread(order_volume)) {
            return this.getPromptInfo(this.orderVolumeCtr.bizName, 5);
            
        }
    }

    _validateOrderAmount(val_str, $control) {

        /**
         * 按数量下单，对用户回显的是，涉单总数量
         */

        if (this.isByVolume) {
            return;
        }
        else if (this.orderAmountCtr.isHidden()) {
            return;
        }

        let total_left = this.leftAmount;
        let order_amount = this.orderAmountCtr.value;

        if (isNaN(order_amount) || order_amount <= 0) {
            return this.getPromptInfo(this.orderAmountCtr.bizName, 1);
        }

        /**
         * mark：
         * 1. 批量交易，最终的订单批次，在后台进行分批分次报送，试算金额，和最终后台实际成交金额，会存在差异
         * 2. 严格要求试算订单金额，一定要在总量范围内，极可能造成部分仓位不能完全交易的风险
         * 3. 故，不对是否超出金额上限，作检测
         */
        
        if (order_amount > total_left) {
            return `下单总金额${ helper.thousandsDecimal(order_amount) } > 可用总金额${ helper.thousandsDecimal(total_left) }`;
        }
    }
}

export { BatchUnit };