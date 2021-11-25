import { helper } from '../helper';
import { dictionary } from '../dictionary';
import { JoyinTable } from '../joyin-table';
import { Level2Unit, NumberControl } from './unit-level2';
import { OrderInfo, Instruction, FutureOrderInfo } from '../models';
import { SelectControl } from './trading-unit';
import { BizHelper } from '../biz-helper';

const DefaultHandlers = {

    /**
     * 检索互为公平交易，的所有指令（包含自身在内）
     * @returns {Array<Instruction>}
     */
    siblingSeeker: function () { throw new Error('not implemented'); },

    /**
     * 互为公平交易的列条条目，被选中事件
     * @param {Instruction} instruction
     */
    siblingSelected: function (instruction) { throw new Error('not implemented'); },
};

class EqualSibling {

    get finalPrice() {
        return this.isPledgeRepo ? 100 : this.orderPrice;
    }

    /**
     * @param {Instruction} instruc 
     * @param {Function} volumeStepProvider
     */
    constructor(instruc, volumeStepProvider) {

        this.volumeStepProvider = volumeStepProvider;

        this.instructId = instruc.id;
        this.portfolioId = instruc.portfolioId;
        this.portfolioName = instruc.portfolioName;
        this.accountId = instruc.accountId;
        this.accountName = instruc.tradeAccountId;
        this.stockCode = instruc.stockCode;
        this.stockName = instruc.stockName;
        this.direction = instruc.direction;
        this.isByVolume = instruc.isByVolume;
        this.isByAmount = instruc.isByAmount;
        this.isPledgeRepo = instruc.assetType == dictionary.assetType.standardVoucher.code;

        let total_volume = instruc.volume;
        let left_volume = instruc.leftVolume;
        let total_amount = instruc.amount;
        let left_amount = instruc.leftAmount;

        /** 指令原始总数量 */
        this.totalVolume = this.isByVolume ? total_volume : 0;
        /** 指令剩余可用数量 */
        this.leftVolume = this.isByVolume ? left_volume : 0;
        /** 指令原始总金额 */
        this.totalAmount = this.isByAmount ? total_amount : 0;
        /** 指令剩余可用金额 */
        this.leftAmount = this.isByAmount ? left_amount : 0;

        /** 指令价格模式 */
        this.priceMode = instruc.priceMode;
        /** 指令价格 */
        this.price = instruc.price >= 0 ? instruc.price : 0;
        /** 实际下单价格 */
        this.orderPrice = 0;
        /** 实际下单数量 */
        this.orderVolume = 0;
        /** 实际下单数量，占总下单数量，的比例 */
        this.orderRatio = 0;

        /** 可用下单数量
         * 1. 按数量下单，则为剩余可用总数量
         * 2. 按金额下单，则为剩余可用金额、当前委托价格，换算+最小数量单位，取整而来
         */
        this.allowedVolume = this.recalculateVolume();
        /** 可用下单数量，占所有公平指令，的比例 */
        this.allowedRatio = 0;
        /** 实际下单金额 */
        this.orderAmount = this.recalculateAmount();

        /** 是否为期货交易 */
        this.isFuture = instruc.isFuture;

        if (this.isFuture) {
            /** 开平标志 */
            this.offsetFlag = instruc.offsetFlag;
            /** 投机套保标志 */
            this.hedgeFlag = instruc.hedgeFlag;
        }
    }

    /**
     * 动态计算可用下单总数量
     * 1. 数量指令，则为原始可用数量
     * 2. 金额指令，则为原始可用金额，与下单价格，进行实时动态运算的结果
     */
    recalculateVolume() {

        if (this.isByVolume) {
            return this.leftVolume;
        }
        
        if (this.isByAmount) {

            if(this.price == 0) {
                return 0;
            }

            let volume_step = this.volumeStepProvider();
            return volume_step * Math.floor(this.leftAmount / this.price / volume_step);
        }
    }

    /**
     * 计算实际下单金额
     */
    recalculateAmount() {
        return this.orderVolume > 0 && this.orderPrice > 0 ? this.orderVolume * this.finalPrice : 0;
    }
}

/**
 * 公平交易单元
 */
class EqualUnit extends Level2Unit {

    get unitHeight() {
        return 480;
    }

    get showOrder() {
        return false;
    }

    get betterPrice() {

        // 根据合约信息里的债券模式区分‘净价交易’和‘全价交易’；合约信息不完善，待完成 TODO
        // return this.isPledgeRepo ? 100 : this.isBond ? this.fullPriceCtr.value : this.priceCtr.value;
        return this.isPledgeRepo ? 100 : this.priceCtr.value;
    }

    /**
     * @param {String} identifier
     * @param {Function} submitter
     */
    constructor(identifier, submitter, handlers = DefaultHandlers) {

        super(identifier, submitter);
        this.setUnitName(Level2Unit.UnitNames.equal);

        /**
         * @returns {Array<Instruction>}
         */
        function allocateSet() {
            return [];
        }

        /**
         * @returns {Array<EqualSibling>}
         */
        function allocateSet2() {
            return [];
        }
        
        this.handlers = handlers;
        this.volumeStepProvider = _ => { return this.contextVolumeStep; };

        /**
         * 互为公平交易的指令
         */
        this.instructions = allocateSet();

        /**
         * 互为公平交易的指令，对应转换后的本地数据结构
         */
        this.siblings = allocateSet2();

        /**
         * 状态信息
         */
        this.states = {

            /** 当前，可用总数量（1.数量指令的可用数量 + 2.金额指令按某一价格下单，换算出来的可用数量） */
            allVolume: 0 
        };
    }

    /**
     * 
     * @param {EqualSibling} record 
     */
    identifyRecord(record) {
        return record.instructId;
    }

    /**
     * 设置为选中
     * @param {EqualSibling} selected 
     */
    setAsSelected(selected) {
        this.selected = selected;
    }

    /**
     * 请求公平指令列表最新数据，并更新本地列表数据
     */
    async request2Update() {

        if (this.siblings.length == 0) {
            return;
        }

        let instruction_ids = this.siblings.map(item => item.instructId);
        let resp = await this.instrucRepo.queryInstructions(instruction_ids);
        if (resp.errorCode != 0) {

            console.error(instruction_ids, resp);
            return;
        }

        console.info('equal unit request & update items', instruction_ids, resp.data);
        resp.data.forEach(item => {

            let sibling = new EqualSibling(item, this.volumeStepProvider);
            
            /**
             * 1. 仅作指令原始数据信息更新，本地变动引起的数据，不自动调整，
             * 2. 如出现数据溢出，则需要交易员人工纠偏
             */
            this.tequal.updateRow({

                instructId: sibling.instructId,
                isByVolume: sibling.isByVolume,
                isByAmount: sibling.isByAmount,
                totalVolume: sibling.totalVolume,
                leftVolume: sibling.leftVolume,
                totalAmount: sibling.totalAmount,
                leftAmount: sibling.leftAmount,
                priceMode: sibling.priceMode,
                price: sibling.price,
                allowedVolume: sibling.allowedVolume,
            });
        });
    }

    start2Refresh() {

        return setInterval(async () => {

            if (this._isRequesting) {
                return;
            }

            this._isRequesting = true;
            await this.request2Update();
            this._isRequesting = false;

        }, 1000 * 10);
    }

    build() {

        /** 委托价格不优于指令价格时的处理模式 */
        this.FMEPBTI = window.FairModeEntrustPriceBestThanInstruction ? window.FairModeEntrustPriceBestThanInstruction : '01';
        /** 未接收指令是否必须参与公平交易 */
        this.FMWUI = window.FairModeWithUnacceptInstruction ? window.FairModeWithUnacceptInstruction : '01';
        super.build();
        this._createTable();
        this.refreshJob = this.start2Refresh();

        this.directionCtr = new SelectControl({ unit: this, $control: this.$form.querySelector('.direction') });
        this.directionCtr.fill(dictionary.direction);
        this.directionCtr.disable();

        this.priceCtr = new NumberControl({
            
            unit: this,
            bizName: '价格',
            unitLabel: '元',
            $control: this.$form.querySelector('.price'),
            max: () => { return this.isContextTickOk ? this.contextTick.ceiling : 999999999; },
            min: () => { return this.isContextTickOk ? this.contextTick.floor : 0; },
            step: () => { return this.contextPriceStep; },
            precision: () => { return this.contextPricePrecision; },
            handler: this._handlePriceChange.bind(this),
        });

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

        this.priceModeCtr = new SelectControl({

            unit: this,
            $control: this.$form.querySelector('.price-mode'),
            handler: this.handlePriceModeChange.bind(this),
        });

        this.volumeCtr = new NumberControl({
            
            unit: this,
            bizName: '委托数量',
            unitLabel: '股',
            enableComma: true,
            asInteger: true,
            max: 999999999,
            $control: this.$form.querySelector('.volume'),
            step: () => { return this.contextVolumeStep; },
            handler: this._handleVolumeChange.bind(this),
        });

        this.realVolumeCtr = new NumberControl({
            
            unit: this,
            bizName: '试算数量',
            unitLabel: '股',
            enableComma: true,
            asInteger: true,
            $control: this.$form.querySelector('.real-volume'),
        });

        this.realVolumeCtr.disable();

        this.amountCtr = new NumberControl({
            
            unit: this,
            unitLabel: '元',
            $control: this.$form.querySelector('.amount'),
            bizName: '金额',
            step: 0.0001,
            handler: this._handleAmountChange.bind(this),
        });

        this.realAmountCtr = new NumberControl({
            
            unit: this,
            bizName: '试算金额',
            unitLabel: '元',
            $control: this.$form.querySelector('.real-amount'),
        });

        this.repoRateCtr = new NumberControl({
            
            unit: this,
            bizName: '回购利率',
            unitLabel: '%',
            $control: this.$form.querySelector('.repo-rate'),
            max: 100,
            min: 0,
            step: 0.01,
            precision: 2,
            handler: this._handleRepoRateChange.bind(this),
        });

        this.offsetFlag = new NumberControl({
            unit: this,
            bizName: '开平',
            $control: this.$form.querySelector('.offsetFlag'),
        });

        this.hedgeFlag = new NumberControl({
            unit: this,
            bizName: '投机套保标志',
            $control: this.$form.querySelector('.hedgeFlag'),
        });

        this.realAmountCtr.disable();

        let offsetFlagCtr = this.$form.querySelector('#equal-offsetFlag');
        let hedgeFlagCtr = this.$form.querySelector('#equal-hedgeFlag');
        let inputOffsetFlag = '';
        let inputhedgeFlag = '';

        for (let key in dictionary.offsetSign) {
            inputOffsetFlag += `<input type="radio" name="equalOffsetFlag" value="${dictionary.offsetSign[key].code}" title="${dictionary.offsetSign[key].mean}"></input>`;
        }

        offsetFlagCtr.innerHTML = inputOffsetFlag;

        for (let key in dictionary.hedgeSign) {
            inputhedgeFlag += `<input type="radio" name="equalHedgeFlag" value="${dictionary.hedgeSign[key].code}" title="${dictionary.hedgeSign[key].mean}"></input>`;
        }

        hedgeFlagCtr.innerHTML = inputhedgeFlag;

        

        /**
         * 重置按钮
         */
        var $ctr_reset_btn = layui.$(`form button[lay-filter='reset-form-equal']`);
        $ctr_reset_btn[0].onclick = this.resetForm.bind(this);
    }

    getValidateRule() {

        return {

            price4Equal: (val_str, $control) => { return this._validatePrice(val_str, $control); },
            fullPrice4Equal: (val_str, $control) => { return this._validateFullPrice(val_str, $control); },
            yieldRate4Equal: (val_str, $control) => { return this._validateYieldRate(val_str, $control); },
            volume4Equal: (val_str, $control) => { return this._validateVolume(val_str, $control); },
            amount4Equal: (val_str, $control) => { return this._validateAmount(val_str, $control); },
            repoRate4Equal: (val_str, $control) => { return this._validateRepoRate(val_str, $control); },
        };
    }

    resetForm() {

        /** 当前符合的价格模式 */
        let modes = this.computePriceModes();
        this.priceModeCtr.fill(modes);
        /** 适合当前场景到价格模式（委托属性） */
        this.modes = modes;
        const instruc = this.instruction;

        this._extractSiblings();
        this._resetControls();

        if (this.isBond) {

            this.fullPriceCtr.show();
            this.yieldRateCtr.show();
            this.priceCtr.$control.children[0].textContent = '净价价格';
        }
        else {

            this.priceCtr.$control.children[0].textContent = '委托价格';
            this.fullPriceCtr.hide();
            this.yieldRateCtr.hide();
        }

        if (this.isPledgeRepo) {

            this.priceCtr.hide();
            this.repoRateCtr.show();

            let user_volume = this.volumeCtr.value;
    
            if (isNaN(user_volume) || user_volume <= 0) {
                this.amountCtr.setValue(0);
            }
    
            this.amountCtr.setValue(this.calculateAmount(user_volume, this.betterPrice));
            this._handleRepoRateChange();
        }
        else {

            this.priceCtr.show();
            this.repoRateCtr.hide();
            /**
             * 形成公平交易的多个指令，可能同时包含按数量、按金额，混合的下单方式，造成：
             * 1.表单经过reset，最优下单价格，大概率已经产生变更
             * 2.跨公平指令，形成的汇总可交易总数量，可能会随着价格变动，而发生变动
             * 3.模拟一次价格变动，实现：实现每个指令，按当前价格的，可交易数量的，重新运算
             */
            this._handlePriceChange();
        }

        if ( instruc.isFuture) {

            if (this.instruction.repoType  == dictionary.repoType.treasuryFutures.code) {
                this.priceCtr.updateUnitLabel('元');
            }
            else if (this.instruction.repoType  == dictionary.repoType.stockIndexFutures.code) {
                this.priceCtr.updateUnitLabel('点');
            }

            this.offsetFlag.show();
            // this.hedgeFlag.show();
            this.amountCtr.disable();
            let offsetFlagStatus = document.querySelectorAll('input[name = "equalOffsetFlag"]');
            let hedgeFlagStatus = document.querySelectorAll('input[name = "equalHedgeFlag"]');

            layui.form.val("form-equal", { 

                equalOffsetFlag: instruc.offsetFlag ? instruc.offsetFlag : dictionary.offsetSign.open.code,
                equalHedgeFlag: instruc.hedgeFlag ? instruc.hedgeFlag : dictionary.hedgeSign.speculation.code,
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

            let user_volume = this.volumeCtr.value;
            this.amountCtr.setValue(user_volume * this.betterPrice * instruc.volumeMultiple);

            layui.form.render('radio');
        }
        else {

            this.priceCtr.updateUnitLabel('元');
            this.offsetFlag.hide();
            this.hedgeFlag.hide();
            this.amountCtr.enable();
        }

        if (this.isFixedPrice) {

            this.priceModeCtr.disable();
            this.priceCtr.disable();
            this.repoRateCtr.disable();
            this.fullPriceCtr.disable();
            this.yieldRateCtr.disable();
        }
        else {

            this.priceModeCtr.enable();
            this.priceCtr.enable();
            this.repoRateCtr.enable();
            this.fullPriceCtr.enable();
            this.yieldRateCtr.enable();
        }
    }

    isCustomziedOk() {

        let siblings = this.handlers.siblingSeeker();
        
        if (this.FMWUI == dictionary.fmwui.no.code) {
            siblings = siblings.filter(item => item.isPending == false);
        }

        let pendings = siblings.filter(item => item.isPending);
        return pendings.length == 0 ? true : `存在需要执行公平交易但未接收的指令，请先接收指令！[${ pendings.map(item => item.id).join('/') }]`;
    }

    /**
     * @param {TickData} tick_data 
     */
    digestFirstTick(tick_data) {

        if (this.isFixedPrice) {

            /**
             * 当指令价格模式字段，值域 = 指定价格，则价格模式的变动，不能影响下单价格（理论上，固定价格的指令，价格模式应当被限制不可变更）
             */
            return;
        }

        let price_mode = this.priceModeCtr.value;
        let can_change_price = this.isPriceChangableByMode(price_mode);

        if (can_change_price) {

            /**
             * 显示指定价格，不从行情带入
             */
            return;
        }

        if (this.modes.some(x => x.code == price_mode)) {
            
            this.priceCtr.setValue(this.isBuy ? tick_data.ceiling : tick_data.floor);
            this.priceCtr.disable();
        }
        else {

            this.priceCtr.setValue(tick_data.latest);
            this.priceCtr.enable();
        }
        
        this._handlePriceChange(); 
    }

    _extractSiblings() {

        let instructions = this.handlers.siblingSeeker();

        if (this.FMWUI == dictionary.fmwui.no.code) {
            instructions = instructions.filter(item => item.isPending == false);
        }

        let siblings = instructions.map(item => new EqualSibling(item, this.volumeStepProvider));

        this.instructions.clear();
        this.instructions.merge(instructions);
        this.siblings.clear();
        this.siblings.merge(siblings);
        this.tequal.refill(siblings);
    }

    _resetControls() {

        const instruc = this.instruction;
        const siblings = this.siblings;

        this.level2.$header.textContent = instruc.stockCodeName;
        this.volumeCtr.updateUnitLabel(this.unitlabel);
        this.realVolumeCtr.updateUnitLabel(this.unitlabel);

        let best_price = 0;
        let priceds = siblings.filter(x => x.price > 0);
        let all_volume = siblings.sum(x => x instanceof EqualSibling ? x.allowedVolume : 0);

        if (priceds.length > 0) {
            best_price = this.isBuy || this.isPositiveRepo ? priceds.min(x => x.price) : priceds.max(x => x.price);
        }

        this.setVal({

            stockName: instruc.stockCodeName,
            direction: instruc.direction,
            price: best_price,
            volume: all_volume,
            amount: Math.max(0, this.calculateAmount(all_volume, best_price)),
        });

        this.reSetElementValue([ this.priceCtr ]);
    }

    /**
     * 重设当前公平交易的汇总信息
     */
    _summarize() {

        let priceCtr_value = this.priceCtr.value;
        let instruc = this.instruction;
        
        this.siblings.forEach(sib => {

            if (this.FMEPBTI == dictionary.fmepbti.eliminate.code) {
                
                if (sib.price > priceCtr_value) {
                    sib.allowedVolume = 0;
                }
                
                let priceMode = dictionary.priceMode;
    
                if (instruc.priceMode == priceMode.market.code && sib.priceMode == priceMode.limited.code) {
                    sib.allowedVolume = 0;
                }
            }
        });

        const siblings = this.siblings;
        const all_volume = siblings.sum(x => x instanceof EqualSibling ? x.allowedVolume : 0);
        this.states.allVolume = all_volume;

        if (all_volume == 0) {

            siblings.forEach(sib => {
                this.tequal.updateRow({ instructId: sib.instructId, allowedRatio: 0 });
            });
        }
        else {
            
            siblings.forEach(sib => {
                this.tequal.updateRow({ instructId: sib.instructId, allowedRatio: +(sib.allowedVolume / all_volume).toFixed(4) });
            });
        }
    }

    setAsPrice(price) {
        
        this.priceCtr.setValue(price);
        this._handlePriceChange();
    }

    customizeData(field_data) {

        const instruc = this.instruction;
        let user_volume = this.volumeCtr.value > this.states.allVolume ? this.realVolumeCtr.value : this.volumeCtr.value;
        let isFutureOrd = this.instruction.isFuture;
        let ordinfo;

        if (isFutureOrd) {

            const formValue = layui.form.val('form-equal');
            let formOffsetFlag = formValue.equalOffsetFlag;
            let formHedgeFlag = formValue.equalHedgeFlag;

            ordinfo = new FutureOrderInfo({

                instructionId: instruc.id,
                portfolioId: instruc.portfolioId,
                userId: instruc.tradeId,
                username: instruc.traderName,
                accountId: instruc.acctNo,
                entrustBs: instruc.bsFlag,
                entrustProp: this.priceModeCtr.value,
                stockCode: instruc.stockCode,
                entrustVolume: user_volume,
                entrustPrice: this.priceCtr.value,
                offsetFlag: formOffsetFlag,
                hedgeFlag: formHedgeFlag,
                tipMsg: '期货交易下单失败',
            });
        }
        else {
            
            ordinfo = new OrderInfo({
    
                instructionId: instruc.id,
                portfolioId: instruc.portfolioId,
                userId: instruc.tradeId,
                username: instruc.traderName,
                accountId: instruc.acctNo,
                entrustBs: instruc.bsFlag,
                entrustProp: this.priceModeCtr.value,
                stockCode: instruc.stockCode,
                entrustVolume: user_volume,
                entrustPrice: this.isPledgeRepo ? this.repoRateCtr.value : this.priceCtr.value,
                fullPrice: this.fullPriceCtr.isShowing() ? this.fullPriceCtr.value : 0,
                expireYearRate: this.yieldRateCtr.isShowing() ? this.yieldRateCtr.value : 0,
                tipMsg : '公平交易下单失败'
            });
        }

        return ordinfo;
    }

    _createTable() {

        this.tequal = new JoyinTable(document.getElementById('table-equal'), this.identifyRecord, this, {
            
            tableName: 'joyin-table-equal',
            headerHeight: this.settings.rowheight,
            rowHeight: this.settings.rowheight,
            footerHeight: this.settings.rowheight,
            rowSelected: this._handleEqualRowSelect.bind(this),
            pageSize: 999999,
        });

        this.tequal.setMaxHeight(110);
    }

    /**
     * @param {EqualSibling} record 
     */
    _handleEqualRowSelect(record) {

        let changed = false;

        if (this.selected instanceof EqualSibling) {
            
            if (this.selected !== record) {

                this.setAsSelected(record);
                changed = true;
            }
        }
        else {
            
            this.setAsSelected(record);
            if (record.instructId != this.instruction.id) {
                changed = true;
            }
        }

        if (changed) {

            let matched = this.instructions.find(x => x.id == record.instructId);
            this.handlers.siblingSelected(matched);
        }
        else {
            console.info('selected sibling no change', this.instruction, this.selected, record);
        }
    }

    fitTableColumnWith(){
        this.tequal.fitColumnWidth();
    }

    _validatePrice(val_str, $control) {

        if (this.priceCtr.isHidden()) {
            return;
        }
        let price = this.priceCtr.value;
        
        if (isNaN(price)) {
            return '委托价，非数值';
        }
        else if (price <= 0) {
            return '委托价，非正值';
        }

        if (this.isContextTickOk) {

            let { ceiling, floor } = this.contextTick;
            if (price > ceiling) {
                return `委托价${ price } > 涨停价${ ceiling }`;
            }
            else if (price < floor) {
                return `委托价${ price } < 跌停价${ floor }`;
            }
        }

        if (!this.isLeastPriceSpread(price)) {
            return `委托价${ price }，非最小价差${ this.contextPriceStep }的整数倍`;
        }

        if (this.FMEPBTI == dictionary.fmepbti.eliminate.code) {
            return;
        }

        let priceds = this.siblings.filter(x => x.price > 0);
        if (priceds.length == 0) {
            return;
        }

        if (this.isBuy) {
            
            let best_buy_price = priceds.min(x => x.price);
            if (best_buy_price > 0 && price > best_buy_price) {
                
                this.priceCtr.setValue(best_buy_price);
                return `买入价${ price } > 最大可承受，买入价${ best_buy_price }`;
            }
        }
        else {

            let best_sell_price = priceds.max(x => x.price);
            if (best_sell_price > 0 && price < best_sell_price) {

                this.priceCtr.setValue(best_sell_price);
                return `卖出价${ price } < 最小可承受，卖出价${ best_sell_price }`;
            }
        }
    }

    _validateFullPrice() {

        if (this.fullPriceCtr.isHidden()) {
            return;
        }

        let full_price = this.fullPriceCtr.value;

        if (isNaN(full_price)) {
            return '全价，非数值';
        }
        else if (full_price <= 0) {
            return '全价，非正值';
        }
        else if (!this.isLeastPriceSpread(full_price)) {
            return `全价${ full_price }，非最小价差${ this.contextPriceStep }的整数倍`;
        }
    }

    _validateYieldRate() {

        if (this.yieldRateCtr.isHidden()) {
            return;
        }

        let yield_rate = this.yieldRateCtr.value;
        if (isNaN(yield_rate)) {
            return '到期收益率，非数值';
        }
    }

    _validateVolume(val_str, $control) {

        let all_volume = this.states.allVolume;
        if (all_volume == 0) {
            return '无可用数量';
        }

        let user_volume = this.volumeCtr.value;
        if (isNaN(user_volume)) {
            return '委托数量，非数值';
        }
        else if (user_volume <= 0) {
            return '委托数量，非正值';
        }
        else if (!Number.isInteger(user_volume)) {
            return '委托数量，非整数';
        }
        else if (!this.isLeastVolumeSpread(user_volume)) {
            return `委托数量${ user_volume }，必须为数量步长${ this.contextVolumeStep }的整数倍`;
        }

        if (this.isByAmount && user_volume > this.states.allVolume) {
            return `金额/价格，换算数量${ user_volume }大于最大可用数量${ this.states.allVolume }`
        }
    }

	_validateAmount(val_str, $control) {

        let user_amount = this.amountCtr.value;

        if (isNaN(user_amount)) {
            return '委托金额，非数值';
        }
        else if (user_amount <= 0) {
            return '委托金额，非正值';
        }
    }

    _validateRepoRate(val_str, $control) {

        if (this.repoRateCtr.isHidden()) {
            return;
        }
        
        let repoRate = this.repoRateCtr.value;

        if (isNaN(repoRate)) {
            return '回购利率，非数值';
        }
        else if (repoRate <= 0) {
            return '回购利率，非正值';
        }
        else if (repoRate > 100) {
            return '回购利率，有效值0% ~ 100%之间';
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

            if(!can_change_price && this.isContextTickOk) {
                this.priceCtr.setValue(this.isBuy ? this.contextTick.ceiling : this.contextTick.floor);
            }
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
        
        let user_price = this.priceCtr.value;

        if (isNaN(user_price) || user_price < 0) {
            user_price = 0;
        }

        if (this.isBond) {
            this.algorithmQuery({ netPrice: user_price, volume: this.volumeCtr.value });
        }
        else {
            this._priceChangeCallBack();
        }
    }

    _handleFullPriceChange() {
        this.isBond && this.algorithmQuery({ fullPrice: this.fullPriceCtr.value, volume: this.volumeCtr.value });
    }

    _handleYieldRateChange() {
        this.isBond && this.algorithmQuery({ yield: this.yieldRateCtr.value, volume: this.volumeCtr.value });
    }

    _priceChangeCallBack() {

        let user_price = this.betterPrice;
        let user_volume = this.volumeCtr.value;

        /**
         * 由价格更新引起的变化，进行摊派
         */
        this.siblings.forEach(sib => {

            /**
             * 如果指令按金额交易，则可交易的数量，依赖价格进行反算可用数量，故：需要先更新价格，随后取出的价格量，才为变更后的价格量
             */
            this.tequal.updateRow({

                instructId: sib.instructId, 
                orderPrice: user_price,
            });

            /**
             * 基于新的价格量，汇总下单金额，和最大可用数量
             */
            this.tequal.updateRow({

                instructId: sib.instructId,
                allowedVolume: sib.recalculateVolume(),
                orderAmount: sib.recalculateAmount(),
            });

            /**
             * 判断是否出现，最大可交易数量 < 订单数量
             */

            if (sib.orderVolume > sib.allowedVolume) {

                this.tequal.updateRow({

                    instructId: sib.instructId,
                    orderVolume: sib.allowedVolume,
                    orderRatio: sib.allowedVolume == 0 ? 0 : 1,
                });

                /**
                 * 订单金额，对订单数量直接依赖，待订单数量变更已记录，再行更新
                 */

                this.tequal.updateRow({

                    instructId: sib.instructId,
                    orderAmount: sib.recalculateAmount(),
                });
            }
        });

        /**
         * 1. 摊派到每个指令的数量、金额，可能已发生变更
         * 2. 当前公平交易集合数据进行占比更新，汇总信息的更新
         */
        this._summarize();
        this._rebalance();
        this._updateReal();

        if (this.isByVolume) {
            
            if (isNaN(user_price) || isNaN(user_volume)) {
                this.amountCtr.setValue(0);
            }
            else if (this.instruction.isFuture) {
                this.amountCtr.setValue(Math.max(0, this.calculateAmount(user_volume, user_price) * this.instruction.volumeMultiple));
            }
            else {
                this.amountCtr.setValue(Math.max(0, this.calculateAmount(user_volume, user_price)));
            }

        }
        else {

            let all_volume = this.states.allVolume;
            let decided_volume = this._decideVolume();
    
            if (decided_volume > all_volume) {
                helper.showError(`金额/价格(${ user_price })，换算数量${ decided_volume }大于最大可用数量${ all_volume }`);
            }
    
            this.volumeCtr.setValue(decided_volume);
        }
    }

    _handleRepoRateChange() {

        const user_rate = this.repoRateCtr.value;
        /**
         * 由价格更新引起的变化，进行摊派
         */
        this.siblings.forEach(sib => {

            /**
             * 更新下单价格
             */
            this.tequal.updateRow({

                instructId: sib.instructId, 
                orderPrice: user_rate,
            });

            /**
             * 判断是否出现，最大可交易数量 < 订单数量
             */

            if (sib.orderVolume > sib.allowedVolume) {

                this.tequal.updateRow({

                    instructId: sib.instructId,
                    orderVolume: sib.allowedVolume,
                    orderRatio: sib.allowedVolume == 0 ? 0 : 1,
                });

                /**
                 * 订单金额，对订单数量直接依赖，待订单数量变更已记录，再行更新
                 */

                this.tequal.updateRow({

                    instructId: sib.instructId,
                    orderAmount: sib.recalculateAmount(),
                });
            }
        });

        /**
         * 1. 摊派到每个指令的数量、金额，可能已发生变更
         * 2. 当前公平交易集合数据进行占比更新，汇总信息的更新
         */
        this._summarize();
        this._rebalance();
        this._updateReal();
    }

    _handleVolumeChange() {
        
        let user_price = this.betterPrice;
        let user_volume = this.volumeCtr.value;
        
        if (isNaN(user_price) || isNaN(user_volume)) {
            this.amountCtr.setValue(0);
        }
        else if (this.instruction.isFuture) { 
            this.amountCtr.setValue(Math.max(0, this.calculateAmount(user_volume, user_price) * this.instruction.volumeMultiple));
        }
        else {
            this.amountCtr.setValue(Math.max(0, this.calculateAmount(user_volume, user_price)));
        }

        this._rebalance();
        this._updateReal();
    }

    _handleAmountChange() {

        let all_volume = this.states.allVolume;
        let user_price = this.betterPrice;
        let decided_volume = this._decideVolume();

        if (decided_volume > all_volume) {
            helper.showError(`金额/价格(${ user_price })，换算数量${ decided_volume } > 最大可用数量${ all_volume }`);
        }

        this.volumeCtr.setValue(decided_volume);
        this._rebalance();
        this._updateReal();
    }

    _decideVolume() {

        let user_price = this.betterPrice;
        let user_amount = this.amountCtr.value;

        if (isNaN(user_price) || user_price <= 0 || isNaN(user_amount) || user_amount <= 0) {
            return 0;
        }

        let volume_step = this.contextVolumeStep;
        let decided = volume_step * Math.floor(user_amount / user_price / volume_step);
        return decided;
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
        
        this._priceChangeCallBack();
    }

    /**
     * 改变下单数量、金额后，重新摊派总下单量（额）到每条指令上
     */
    _rebalance() {

        const instruc = this.instruction;
        let all_volume = this.states.allVolume;
        let volume_step = this.contextVolumeStep;
        let user_volume = this.volumeCtr.value;
        let priceCtr_value = this.priceCtr.value;

        if (!helper.isNumber(user_volume)) {
            user_volume = 0;
        }

        this.siblings.forEach(sib => {

            let allowed_volume = sib.allowedVolume;
            
            if (this.FMEPBTI == dictionary.fmepbti.eliminate.code) {
                
                if (sib.price > priceCtr_value) {
                    allowed_volume = 0;
                }
                
                let priceMode = dictionary.priceMode;

                if (instruc.priceMode == priceMode.market.code && sib.priceMode == priceMode.limited.code) {
                    allowed_volume = 0;
                }
            }

            let order_volume = all_volume == 0 ? 0 : volume_step * Math.ceil(user_volume * allowed_volume / all_volume / volume_step);
            
            if (order_volume > allowed_volume) {
                order_volume = allowed_volume;
            }

            this.tequal.updateRow({

                instructId: sib.instructId,
                orderVolume: order_volume,
            });

            /**
             * 订单金额，对订单数量直接依赖，待订单数量变更已记录，再行更新
             */

            this.tequal.updateRow({

                instructId: sib.instructId,
                orderAmount: sib.recalculateAmount(),
            });
        });

        let tequalData = this.tequal.extractAllRecords();
        let total_order_volume = tequalData.sum(x => x.orderVolume);
        
        tequalData.forEach(item => {

            this.tequal.updateRow({

                instructId: item.instructId,
                orderRatio: total_order_volume == 0 ? 0 : +(item.orderVolume / total_order_volume).toFixed(4),
            })
        })
    }

    /**
     * 更新试算的实际下单量
     */
    _updateReal() {

        let total_volume = this.siblings.sum(x => x instanceof EqualSibling && x.orderVolume >= 0 ? x.orderVolume : 0);
        let total_amount = this.siblings.sum(x => x instanceof EqualSibling && x.orderAmount >= 0 ? x.orderAmount : 0);
        this.realVolumeCtr.setValue(total_volume);
        this.realAmountCtr.setValue(total_amount);
    }
}

export { EqualUnit };