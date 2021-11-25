import { helper } from '../helper';
import { dictionary } from '../dictionary';
import { Instruction, ScaleCloseQuote, ScaleOrderInfo, ScaleQuote, TickData } from '../models';
import { JoyinTable } from '../joyin-table';
import { TradingUnit, NumberControl, SelectControl, SelectElement } from './trading-unit';
import { BizHelper } from '../biz-helper';

const ScaleReportType = dictionary.scaleReportType;

class FormData {

    /**
    * @param {Instruction} instruc 
    */
    constructor(instruc) {
    
        this.portfolioName = instruc.portfolioName;
        this.accountName = instruc.tradeAccountId;
        this.stockCodeName = instruc.stockCodeName;
        this.direction = instruc.direction;
        
        this.reportType = this.mapReportType(instruc.dealMode);
        this.price = instruc.price;
        this.volume = instruc.leftVolume;
        this.amount = instruc.leftAmount;
        
        // this.contact = instruc.tradeId;
        // this.contactTel = instruc.counterTel;
        
        this.counterSeat = instruc.counterSeat;
        this.contractId = instruc.appointmentNumber;
        this.counterId = instruc.counterId;
        this.counterName = instruc.counterName;
        this.counterId = '';

    }

    mapReportType (rType) {

        const reportTypeArr = dictionary.scaleReportTypes.filter( x => x.code == rType);
        return reportTypeArr && reportTypeArr.length > 0 ? reportTypeArr[0].code : '';
    }
}

/**
 * 大宗交易单元
 */
class ScaleUnit extends TradingUnit {

    /** 当前选中的申报类型 */
    get selectedReportType() {
        return this.reportTypeCtr.value;
    }

    /** 是否为，意向申报(1/6) */
    get isMethodIntent() {
        return this.selectedReportType == ScaleReportType.intent.code;
    }

    /** 是否为，定价申报(2/6) */
    get isMethodFixed() {
        return this.selectedReportType == ScaleReportType.fixed.code;
    }

    /** 是否为，点击成交申报(3/6) */
    get isMethodClick2Trade() {
        return this.selectedReportType == ScaleReportType.click2Trade.code;
    }

    /** 是否为，成交申报(4/6) */
    get isMethodTrade() {
        return this.selectedReportType == ScaleReportType.trade.code;
    }
    
    /** 是否为，收盘价固定价格申报(5/6) */
    get isMethodClose() {
        return this.selectedReportType == ScaleReportType.fixed2Close.code;
    }

    /** 是否为，日均价固定价格申报(6/6) */
    get isMethodCloseAvg() {
        return this.selectedReportType == ScaleReportType.fixed2Avg.code;
    }

    /** 交易对手是否已指定（同时指定了席位号、约定号或指定了对手信息），默认为：成交申报 */
    get isCounterFixed() {

        return ( helper.isNotNone(this.instruction.counterSeat) && 
               helper.isNotNone(this.instruction.appointmentNumber) ) ||
               helper.isNotNone(this.instruction.counterId);
    }

    /** 是否具备盘后行情 */
    get hasCloseQuotes() {
        return this.tcloseQuote.rowCount > 0;
    }

    get betterPrice() {

        // 根据合约信息里的债券模式区分‘净价交易’和‘全价交易’；合约信息不完善，待完成 TODO
        // return this.isPledgeRepo ? 100 : this.isBond ? this.fullPriceCtr.value : this.priceCtr.value;
        return this.isPledgeRepo ? 100 : this.priceCtr.value;
    }

    get unitHeight() {
        return 430;
    }

    get isTickRequired() {
        return true;
    }

    /**是否开启盘后交易时间验证，供测试人员测试 */
    get openCloseTrade() {
        return false;
    }

    /**
     * @param {String} identifier
     * @param {Function} submitter
     */
    constructor(identifier, submitter) {

        super(identifier, submitter);
        this.setUnitName(TradingUnit.UnitNames.scale);

        /**
         * 是否指定了申报类型
         */
        this.isAssignReportType = false;

        /**
         * 对手交易员list
         */
        this.CounterSeatList = [];
    }

    /**
     * @param {ScaleQuote | ScaleCloseQuote} record 
     */
    identifyRecord(record) {
        return record.id;
    }

    build() {

        this._createTable();

        /**
         * 方向
         */
        this.directionCtr = new SelectControl({ unit: this, $control: this.$form.querySelector('.direction') });
        this.directionCtr.fill(dictionary.direction);
        this.directionCtr.disable();

        /**
         * 申报类型
         */
        this.reportTypeCtr = new SelectControl({

            unit: this, 
            $control: this.$form.querySelector('.report-type'),
            handler: this.handleReportTypeChange.bind(this),
        });

        /**
         * 价格
         */
        this.priceCtr = new NumberControl({
            
            unit: this,
            bizName: '委托价格',
            unitLabel: '元',
            $control: this.$form.querySelector('.price'),
            max: 999999999,
            step: () => { return this.contextPriceStep; },
            precision: () => { return this.contextPricePrecision; },
            handler: this._handlePriceChange.bind(this),
        });

        /**
         * 全价价格
         */
        this.fullPriceCtr = new NumberControl({
            
            unit: this,
            bizName: '全价价格',
            unitLabel: '元',
            $control: this.$form.querySelector('.full-price'),
            max: () => { return 999999999; },
            step: () => { return this.contextPriceStep; },
            precision: () => { return this.contextPricePrecision; },
            handler: this._handleFullPriceChange.bind(this),
        });

        /**
         * 到期收益率
         */
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
         * 数量
         */
        this.volumeCtr = new NumberControl({
            
            unit: this,
            bizName: '委托数量',
            unitLabel: '股',
            enableComma: true,
            asInteger: true,
            $control: this.$form.querySelector('.volume'),
            max: () => { return this.amount2MaxVolume(this.priceCtr.value); },
            step: () => { return this.contextVolumeStep; },
            handler: this._handleVolumeChange.bind(this),
        });

        /**
         * 金额
         */
        this.amountCtr = new NumberControl({
            
            unit: this,
            bizName: '委托金额',
            unitLabel: '元',
            $control: this.$form.querySelector('.amount'),
            handler: this._handleAmountChange.bind(this),
        });

        /**
         * 交易对手
         */
        this.counterIdCtr = new SelectControl({

            unit: this, 
            $control: this.$form.querySelector('.counter-id'),
            handler: this._handleCounterSelectChange.bind(this)
        });

        this.seatCtr = new SelectElement({ 
            
            unit: this, 
            bizName: '对手席位', 
            $control: this.$form.querySelector('.seat-num'),
            promptTitle: '新增对手席位',
            promptHandle: this._addCounterSeat.bind(this),
            promptVarify: this._validateCounterSeat.bind(this) 
        });

        this.contactCtr = new NumberControl({ unit: this, bizName: '联系人', $control: this.$form.querySelector('.contact') });
        this.contactTelCtr = new NumberControl({ unit: this, bizName: '联系方式', $control: this.$form.querySelector('.contact-tel') });
        this.contractIdCtr = new NumberControl({ unit: this, bizName: '约定号', $control: this.$form.querySelector('.contract-id') });

        this._bindComponentEvents();
    }

    _bindComponentEvents() {

        /**
         * 盘后行情刷新
         */

        var $ctr_refresh = document.getElementById('user-toolkit-3');
        $ctr_refresh.classList.add(this.classes.hidden);
        var $ctr_refresh_btn = $ctr_refresh.querySelector('a');
        $ctr_refresh_btn.onclick = this.requestCloseQuotes.bind(this);
        this.$ctrRefreshTime = $ctr_refresh.querySelector('.refresh-time');
        this.$ctrRefresh = $ctr_refresh;

        /**
         * 盘中行情TAB、盘后行情TAB，切换
         */

        var $first_tab = this.$content.querySelector('.scale-quote-tab li:first-child');
        var $last_tab = this.$content.querySelector('.scale-quote-tab li:last-child');

        $first_tab.onclick = () => { this._switchTab(true); };

        $last_tab.onclick =  () => { this._switchTab(false); };
        
        /**
         * 重置按钮
         */

        var $ctr_reset_btn = layui.$(`form button[lay-filter='reset-form-scale']`);
        $ctr_reset_btn[0].onclick = this.manualReset.bind(this);
    }
    
    _createTable() {

        this.tquote = new JoyinTable(document.getElementById('table-scale-quote-1'), this.identifyRecord, this, {
            
            tableName: 'joyin-table-scale-quote',
            headerHeight: this.settings.rowheight,
            rowHeight: this.settings.rowheight,
            footerHeight: this.settings.rowheight,
            pageSize: 999999,
            rowSelected: this.handleQuoteRowCheck.bind(this),
        });

        this.tcloseQuote = new JoyinTable(document.getElementById('table-scale-quote-2'), this.identifyRecord, this, {
            
            tableName: 'joyin-table-scale-close-quote',
            headerHeight: this.settings.rowheight,
            rowHeight: this.settings.rowheight,
            footerHeight: this.settings.rowheight,
            pageSize: 999999,
            rowSelected: this.handleCloseRowCheck.bind(this),
        });

        this.tquote.setMaxHeight(160);
        this.tcloseQuote.setMaxHeight(160);
    }

    getValidateRule() {
        
        return {

            reportType4Scale: (val_str, $control) => { return this._validateReportType(val_str, $control); },
            price4Scale: (val_str, $control) => { return this._validatePrice(val_str, $control); },
            fullPrice4Scale: (val_str, $control) => { return this._validateFullPrice(val_str, $control); },
            yieldRate4Scale: (val_str, $control) => { return this._validateYieldRate(val_str, $control); },
            volume4Scale: (val_str, $control) => { return this._validateVolume(val_str, $control); },
            amount4Scale: (val_str, $control) => { return this._validateAmount(val_str, $control); },
            contact4Scale: (val_str, $control) => { return this._validateContact(val_str, $control); },
            contactTel4Scale: (val_str, $control) => { return this._validateContactTel(val_str, $control); },
            counterId4Scale: (val_str, $control) => { return this._counterId4Scale(val_str, $control); },
            counterSeat4Scale: (val_str, $control) => { return this._validateCounterSeat(val_str, $control); },
            contractId4Scale: (val_str, $control) => { return this._validateContractId(val_str, $control); },
        };
    }

    _handleCounterSelectChange(value) {
        this._requestCounterSeats(value);
    }

    async _addCounterSeat(seatId) {

        let resp = await this.manageRepo.addOppoSeat(this.counterIdCtr.value, seatId);

        if (resp.errorCode != 0) {
            helper.errorMsg('对手席位添加失败！');
            return;
        }

        const seatList = this.CounterSeatList.filter(item => { return item.code != seatId });
        this.seatCtr.fill([{code: seatId, mean: seatId}, ...seatList]);
        layui.form.render('select', this.formFilter);
    }

    /**
     * 查询对手席位
     * @param {*} counterId 
     */
    async _requestCounterSeats(counterId) {

        if (!counterId) {

            this.seatCtr.hide();
            return;
        }

        const resp = await this.manageRepo.queryOppoSeat(counterId);
        const resArr = resp.data ? resp.data : [];
        const seatList = resArr.map(counter => { return { code: counter.counterSeatId, mean: counter.counterSeatId } });
        const insCounterSeat = this.instruction.counterSeat;

        if (helper.isNotNone(insCounterSeat)) {

            const fList = seatList.filter(item => { return item.code != insCounterSeat; });
            this.CounterSeatList = [{ code: insCounterSeat, mean: insCounterSeat }, ...fList];
        }
        else {
            this.CounterSeatList = seatList;
        }
       
        this.seatCtr.fill(this.CounterSeatList);
        layui.form.render('select', this.formFilter);
    }

    _validateReportType() {

        if ((this.isMethodClose || this.isMethodCloseAvg)) {

            if (!this.isCloseTradableTime()) {
                return '当前时间非盘后交易时段';
            }
            else if (!this.hasCloseQuotes) {
                return '盘后行情缺失，无法下单';
            }
        }
    }

    _validatePrice() {

        let price = this.priceCtr.value;
        
        if (isNaN(price)) {
            return '委托价，非数值';
        }
        else if (price <= 0) {
            return '委托价，非正值';
        }
        else if (!this.isLeastPriceSpread(price)) {
            return `委托价${ price }，非最小价差${ this.contextPriceStep }的整数倍`;
        }

        const insPrice = this.instruction.price;

        if (this.isLimitedPrice) {
                
            if ((this.isBuy || this.isPositiveRepo) && price > insPrice) {
                return `委托价${ price }不能大于指令限价${ insPrice }`;
            }
            else if ((this.isSell || this.isReversedRepo) && price < insPrice) {
                return `委托价${ price }不能小于指令限价${ insPrice }`;
            }
        }
      
        if (this.isFixedPrice) {
            
            if (price != insPrice) {
                return `委托价${ price }不等于指定价${ insPrice }`;
            }
        }

        if (this.isFund || this.isStock) {

            if (this.isContextTickOk) {

                const { ceiling, floor } = this.contextTick;
                
                if (price > ceiling) {
                    return `委托价${price}大于涨停价${ ceiling }`;
                }

                if (price < floor) {
                    return `委托价${price}小于跌停价${ floor }`;
                }
            }
        }

        /* 新增需求，验证规则待确认，暂不开放 this.isBond || this.isPledgeRepo*/
        if (false) {

            if (this.isContextTickOk) { 

                const maxp = this.contextTick.preclose * 1.3;
                const minp = this.contextTick.preclose * 0.7;
                const maxs = this.isBuy || this.isPositiveRepo ? this.contextTick.buys[1] : this.contextTick.sells[4];
                const mins = this.isBuy || this.isPositiveRepo ? this.contextTick.buys[4] : this.contextTick.sells[1];
                const precision = this.contextPricePrecision;
                
                if (price > maxp) {
                    return `委托价${price}大于上一日加权平均价的130% (<span class="s-color-red">${ maxp.toFixed(precision) }</span>)`;
                }

                if (price < minp) {
                    return `委托价${price}小于上一日加权平均价的70% (<span class="s-color-red">${ minp.toFixed(precision) }</span>)`;
                }

                if (price > maxs) {
                    return `委托价${price}大于行情最高价 (<span class="s-color-red">${ maxs.toFixed(precision) }</span>)`;
                }

                if (price < mins) {
                    return `委托价${price}小于行情最低价 (<span class="s-color-red">${ mins.toFixed(precision) }</span>)`;
                }
            }
        }

        const cterq = this.counterQuote;

        if (!cterq) {
            return;
        }
        
        const entrustPrice = +cterq.entrustPrice.toFixed(this.contextPricePrecision);  
        if (cterq.reportType == ScaleReportType.fixed.code && price != entrustPrice) {
            return `委托价${ price } 不等于 对手盘报价${ entrustPrice }`;
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

        if (isNaN(volume)) {
            return '委托数量，非数值';
        }
        else if (volume <= 0) {
            return '委托数量，非正值';
        }
        else if (!Number.isInteger(volume)) {
            return '委托数量，非整数';
        }
        else if (volume > total_volume) {
            return `委托数量 > 可用数量${ total_volume }`;
        }
        else if (!this.isLeastVolumeSpread(volume)) {
            return `委托数量${ volume }，必须为数量步长${ this.contextVolumeStep }的整数倍`;
        }

        const cterq = this.counterQuote;
        if (!cterq) {
            return;
        }

        if (cterq.reportType == ScaleReportType.fixed.code && volume > cterq.entrustVolume) {
            return `委托数量${ volume }大于对手盘委托数量${ cterq.entrustVolume }`;
        }

        let boundaryResult = this.checkVolumeBoundary(volume);
        if (!boundaryResult.isOk) {
            return boundaryResult.message;
        }
    }
    
	_validateAmount() {

        if (this.isByVolume) {
            return;
        }
        
        let amount = this.amountCtr.value;
        let total_amount = this.leftAmount;

        if (total_amount <= 0) {
            return TradingUnit.messages.zeroAmount;
        }

        if (isNaN(amount)) {
            return '委托金额，非数值';
        }
        else if (amount <= 0) {
            return '委托金额，非正值';
        }
        else if (amount > total_amount) {
            return `委托金额 > 可用金额${ total_amount }`;
        }

        let price = this.priceCtr.value;
        if (isNaN(price)) {
            return '委托价，非数值，无法评估委托数量';
        }

        const cterq = this.counterQuote;
        if (!cterq) {
            return;
        }

        const cter_amount = cterq.entrustVolume * cterq.entrustPrice;
        if (cterq && cterq.reportType == ScaleReportType.fixed.code && amount > cter_amount) {
            return `委托金额${ amount } > 对手盘委托金额${ cter_amount }`;
        }
    }

    _validateContact() {

        if (this.contactCtr.isShowing() && this.contactCtr.plainValue.length == 0) {
            return '联系人必填';
        }
    }

    _validateContactTel() {
                
        if (this.contactTelCtr.isShowing() && this.contactTelCtr.plainValue.length == 0) {
            return '联系方式必填';
        }
    }

    _counterId4Scale() {

        if (this.counterIdCtr.isShowing() && this.counterIdCtr.value.length == 0) {
            return '交易对手必填';
        }
    }

    _validateCounterSeat() {
                
        if (!this.seatCtr.isShowing()) {
            return;
        }

        if (this.seatCtr.value.length == 0) {
            return '对手席位必填';
        }
        else if (this.seatCtr.value.length > 6) {
            return '交易对手席位号，最多只能为6位字符';
        }
    }

    _validateContractId() {
                
        if (!this.contractIdCtr.isShowing()) {
            return;
        }

        if (this.contractIdCtr.plainValue.length == 0) {
            return '约定号必填';
        }
        else if (this.contractIdCtr.plainValue.length > 6) {
            return '约定号最多6位字符';
        }
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

    _handlePriceChange() {

        if (this.isBond) {
            this.algorithmQuery({ netPrice: this.priceCtr.value, volume: this.volumeCtr.value });
        }
        else {
            this.isByVolume ? this._handleVolumeChange() : this._handleAmountChange();
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

    manualReset() {
        
        this.clearContextQuote();
        this.resetControls();
    }

    /**
     * 根据场景，显示或隐藏部分控件
     */
    _toggleShowInputs() {

        if (this.$controlPackage === undefined) {

            /** 需要动态显示和隐藏的一批控件的根元素 */
            this.$controlPackage = this.$form.querySelector('.control-package');
        }

        /**
         * 先恢复所有控件的显示
         */
        var $sub_nodes = this.$controlPackage.childNodes;
        for (var idx = 0; idx < $sub_nodes.length; idx++) {
            
            var $ctr = $sub_nodes[idx];
            $ctr.tagName && $ctr.classList.remove(TradingUnit.Classes.hidden);
        }

        /**
         * 
         * @param {Array<NumberControl>} $controls 
         */
        function hideControls($controls) {
            $controls.forEach($ctr => { $ctr.$control.classList.add(TradingUnit.Classes.hidden); });
        }
        
        if (this.isBond) {

            this.fullPriceCtr.show();
            this.yieldRateCtr.show();
        }
        else {

            this.fullPriceCtr.hide();
            this.yieldRateCtr.hide();
        }

        this.priceCtr.enable();
        this.fullPriceCtr.enable();
        this.yieldRateCtr.enable();

        this.seatCtr.enable();
        this.contractIdCtr.enable();

        /**
         * 根据所选择的申报类型，隐藏不需要的控件
         */
        if (this.isMethodIntent) {

            hideControls([this.seatCtr, this.contractIdCtr, this.counterIdCtr]);
            this._switchTab(true); 
        }
        else if (this.isMethodFixed) {

            hideControls([this.seatCtr, this.contractIdCtr, this.counterIdCtr]);
            this._switchTab(true);
        }
        else if (this.isMethodClick2Trade) {

            hideControls([this.contactCtr, this.contactTelCtr]);
            this.priceCtr.disable();
            this.fullPriceCtr.disable();
            this.yieldRateCtr.disable();

            this.seatCtr.disable();
            this.contractIdCtr.disable();
            this._switchTab(true);
        }
        else if (this.isMethodTrade) {

            hideControls([this.contactCtr, this.contactTelCtr]);
            // this.counterQuote && this.priceCtr.disable();
            this._switchTab(true);
        }
        else if (this.isMethodClose) {

            hideControls([this.contactCtr, this.contactTelCtr, this.seatCtr, this.contractIdCtr,this.counterIdCtr]);
            this.priceCtr.disable();
            this.fullPriceCtr.disable();
            this.yieldRateCtr.disable();
            this.setDefaultCloseInfo();
            this._switchTab(false);
        }
        else if (this.isMethodCloseAvg) {

            hideControls([this.contactCtr, this.contactTelCtr, this.seatCtr, this.contractIdCtr,this.counterIdCtr]);
            this.priceCtr.disable();
            this.fullPriceCtr.disable();
            this.yieldRateCtr.disable();
            this.setDefaultCloseInfo();
            this._switchTab(false);
        }
    }

    /**
     * 填充申报类型，填充后，将默认选中第一个选项
     * @param {Array | Object} types 大宗申报类型数组 [{ code: xxx, mean: xxx }]
     * @param {*} is_disabled 是否为禁用状态
     */
    resetReportType(types, is_disabled = false) {

        /**
         * 填充申报类型列表
         */
        this.reportTypeCtr.fill(types);

        /**
         * 根据参数，禁用或启用，申报类型列表的，选择功能
         */
        if (is_disabled) {
            this.reportTypeCtr.disable();
        }
        else {
            this.reportTypeCtr.enable();
        }

        /**
         * 根据场景，显示或隐藏部分控件
         */
        this._toggleShowInputs();
    }

    /**
     * @param {ScaleQuote} quote 
     */
    setAsContextQuote(quote) {
        this.counterQuote = quote;
    }

    clearContextQuote() {
        delete this.counterQuote;
    }

    clearQuotes() {

        this.tquote.clearTable();
        this.tcloseQuote.clearTable();
    }

    resetControls() {

        const instruc = this.instruction;
        /**
         * 表单重新赋值
         */
        const formd = new FormData(instruc);
        this.setVal(formd);
        this.volumeCtr.updateUnitLabel(this.unitlabel);

        this.reSetElementValue([ this.priceCtr ]);

        if(this.isPledgeRepo) {
            this.priceCtr.updateUnitLabel('%');
        }
        else {
            this.priceCtr.updateUnitLabel('元');
        }

        if (this.isBond) {

            this.priceCtr.$control.children[0].textContent = '净价价格';
            this.algorithmQuery({ netPrice: this.priceCtr.value, fullPrice: this.fullPriceCtr.value, volume: this.volumeCtr.value });
        }
        else {

            this.priceCtr.$control.children[0].textContent = '委托价格';
        }

        const decideReportTypes = this._decideReportTypes();

        /**
         * 根据市场，填充不同的申报类型
         */
        this.resetReportType(decideReportTypes);

        /**
         * 交易对手，如果指令上指定了，不要让交易员改，因为这个是过风控的
         */
        if(helper.isNotNone(formd.counterId)) {

            this.counterIdCtr.fill([{ code: formd.counterId, mean: formd.counterName }]);
            this.counterIdCtr.disable();
            this._requestCounterSeats(formd.counterId);
        }
        else{

            if (helper.isNotNone(formd.counterSeat)) {
                this.CounterSeatList = [{ code: formd.counterSeat, mean: formd.counterSeat }];
            }

            this.counterIdCtr.enable();
            this._requestCounterList();
        }

        const assignType = dictionary.scaleReportTypes.filter(x => { return x.code == formd.reportType});
        if (assignType.length > 0) {
            
            this.isAssignReportType = true;
            this.reportTypeCtr.fill(assignType);
            this.reportTypeCtr.disable();
            this._toggleShowInputs();
        }
        else {

            this.isAssignReportType = false;
            this.reportTypeCtr.enable();

            const isContainTrade = decideReportTypes.some(x => { return x.code == ScaleReportType.trade.code});
            /**
             * 根据是否已指定交易对手、交易市场
             * 1. 填充不同的申报类型、可选状态
             */
            if (this.isCounterFixed && isContainTrade) {

                this.reportTypeCtr.setValue(ScaleReportType.trade.code);
                this._toggleShowInputs();
            }
        }

        /**
         * 根据交易手段，设置数量\金额
         */
        if (this.isByVolume) {

            this.volumeCtr.enable();
            this.amountCtr.disable();
            this._handleVolumeChange();
        }
        else {

            this.volumeCtr.disable();
            this.amountCtr.enable();
            this._handleAmountChange();
        }

        if((this.isSzSecMarket && 
            this.assetType != dictionary.assetType.standardVoucher.code && 
            this.assetType != dictionary.assetType.bond.code) ||
            (this.openCloseTrade && this.isCloseTradableTime())) {
            this._switchTab(false);
        }
        else{
            this._switchTab(true);
        }
    }

    /**
     * 查询交易对手list
     */
    async _requestCounterList(){
    
        const resp = await this.manageRepo.queryCounterList(this.instruction.counterId);
        const counterList = resp.data ? resp.data : [];
        const cList = counterList.map(counter => { return { 'code': counter.counterId, 'mean': counter.counterName } });
        cList.length > 0 && this._requestCounterSeats(cList[0].code);

        this.counterIdCtr.fill(cList);
        layui.form.render('select', this.formFilter);
    }

    /**
     * 
     * @param {Boolean} flag 
     */
    _switchTab(flag = true){

        const $first_tab = this.$content.querySelector('.scale-quote-tab li:first-child');
        const $last_tab = this.$content.querySelector('.scale-quote-tab li:last-child');
        const $table1 = document.getElementById('table-scale-quote-1');
        const $table2 = document.getElementById('table-scale-quote-2');
        const cls_this = this.classes.laythis;
        const cls_hide = this.classes.hidden;
        if(flag){

            $first_tab.classList.add(cls_this);
            $last_tab.classList.remove(cls_this);
            this.$ctrRefresh.classList.add(cls_hide);
            $table1.classList.remove(cls_hide);
            $table2.classList.add(cls_hide);
            this.tquote.fitColumnWidth();
        }
        else{

            $first_tab.classList.remove(cls_this);
            $last_tab.classList.add(cls_this);
            this.$ctrRefresh.classList.remove(cls_hide);
            $table1.classList.add(cls_hide);
            $table2.classList.remove(cls_hide);
            this.tcloseQuote.fitColumnWidth();
        }
    }

    _decideReportTypes() {
        
        const ST = ScaleReportType;
        let initiative_quotes = [ST.intent, ST.fixed, ST.trade, ST.fixed2Close, ST.fixed2Avg];

        if (this.isShSecMarket) {
            initiative_quotes = [ST.intent, ST.trade, ST.fixed2Close];
        }
        else {

            if(this.assetType == dictionary.assetType.stock.code || this.assetType == dictionary.assetType.fund.code) {
                initiative_quotes =[ ST.fixed2Close, ST.fixed2Avg];
            }
        }

        return initiative_quotes;
    }

    /**
     * @param {ScaleQuote} rowData 
     */
    formatDayAvgPrice(rowData) {

        const avg_price = rowData.avgPrice;
        return this.isSzSecMarket ? (typeof avg_price == 'number' ? avg_price : 0).toFixed(3) : '--';
    }

    /**
     * 请求大宗盘中行情
     */
    async requestQuotes() {

        const instruc = this.instruction;
        const resp = await this.quoteRepo.queryScaleQuotes(instruc.acctNo, instruc.stockCode, '大宗行情查询');
        
        if (resp.errorCode != 0) {

            helper.showError(`大宗行情数据，调用异常( ${ resp.errorMsg } )`);
            return;
        }

        let quoteRepoList = resp.data ? resp.data : [];
        quoteRepoList.forEach(item => { item.assetType = this.assetType; });
        this.tquote.refill(quoteRepoList);
        this.fitTableColumnWith();
    }

    /**
     * 请求大宗盘后行情
     */
    async requestCloseQuotes() {

        this.$ctrRefreshTime.textContent = '最后刷新 ' + new Date().format('yyyy-MM-dd hh:mm:ss');
        const instruc = this.instruction;
        const resp = await this.quoteRepo.queryScaleCloseQuotes(instruc.acctNo, instruc.stockCode, '大宗盘后行情查询');

        if (resp.errorCode != 0) {

            helper.showError(`大宗盘后行情数据，调用异常( ${ resp.errorMsg } )`);
            return;
        }

        this.closeMarketList = resp.data ? resp.data : [];
        this.closeMarketList.forEach((item, index) => { item['id'] = index; });
        this.tcloseQuote.refill(this.closeMarketList);
        this.fitTableColumnWith();

        if (this.openCloseTrade && this.isCloseTradableTime()) { 
            this.resetReportType([ScaleReportType.fixed2Close]);
        }
    }

    setDefaultCloseInfo() {

        if (!!this.closeMarketList && this.closeMarketList.length > 0) {

            const marketInfo = this.closeMarketList[0];
            const reportType = this.reportTypeCtr.value;
            const price = reportType == ScaleReportType.fixed2Close.code ? marketInfo.closePrice : marketInfo.avgPrice;
            this.priceCtr.setValue(price);
            this._handlePriceChange();
        }
    }

    resetForm() {

        this.clearContextQuote();
        this.clearQuotes();
        this.resetControls();
        this.requestQuotes();
        this.requestCloseQuotes();
    }

    /**
     * 是否为大宗盘后交易时段
     */
    isCloseTradableTime() {

        let time = new Date().format('hhmmss');
        return this.openCloseTrade ? '150000' <= time && time <= '153000' : true;
    }

    /**
     * 交易量是否达到最低要求
     * @param {ScaleOrderInfo} ordinfo 
     */
    hasReachedLeast(ordinfo) {
        
        const ATY = dictionary.assetType;
        const asset_type = this.assetType;
        const entrust_volume = parseInt(ordinfo.entrustVolume);
        const entrust_amount = parseInt(ordinfo.entrustVolume) * parseFloat(ordinfo.entrustPrice);

        if (asset_type == ATY.stock.code) {
            return entrust_volume >= 300000 || (entrust_amount) >= 2000000 ? true : '股票交易，不低于30万股或者交易金额不低于200万人民币';
        }
        else if (asset_type == ATY.fund.code) {
            return entrust_volume >= 2000000 || (entrust_amount) >= 2000000 ? true : '基金交易，不低于200万份或者交易金额不低于200万人民币';
        }
        else if (asset_type == ATY.bond.code) {

            if (this.isShSecMarket) {
                return entrust_volume >= 10000 || (entrust_amount) >= 1000000 ? true : '上交所债券交易，数量应当不低于10000张，或者交易金额不低于100万元';
            }
            else {
                return entrust_volume >= 5000 || (entrust_amount) >= 500000 ? true : '深交所债券交易，不低于5000张或者交易金额不低于50万元人民币';
            }
        }
        else if (asset_type == ATY.standardVoucher.code) {

            if (this.isShSecMarket) {
                return entrust_volume >= 10000 || (entrust_amount) >= 1000000 ? true : '上交所债券质押式回购交易，数量应当不低于10000张，或者交易金额不低于100万元';
            }
            else {
                return entrust_volume >= 5000 ? true : '深交所债券质押式回购交易，不低于5000张';
            }
        }
    }

    fitTableColumnWith() {

        this.tquote.fitColumnWidth();
        this.tcloseQuote.fitColumnWidth();
    }

    handleReportTypeChange() {
        this._toggleShowInputs();
    }

    /**
     * @param {ScaleQuote} quote
     */
    handleQuoteRowCheck(quote) {

        const instruc = this.instruction;

        if(this.isAssignReportType) {
           
            helper.showError('指令已指定申报类型，不可变更');
            return;
        }

        /**
         * 检查是否，相同委托方向
         */
        if (instruc.bsFlag == quote.direction) {

            helper.showError('请选择对手方进行申报');
            return;
        }

        /**
         * 检查是否，不可识别的申报类型
         */
        
        const rptype = quote.reportType;
        const isIntent = rptype == ScaleReportType.intent.code;
        const isFixed = rptype == ScaleReportType.fixed.code;

        if (!isIntent && !isFixed) {

            console.error('unexpected report type > ' + rptype, quote);
            helper.showError('非预期，大宗行情申报类型，代码' + rptype);
            return;
        }

        if (this.isCounterFixed) {
            
            helper.showError('指令已限制交易对手，不可变更');
            return;
        }

        /**
         * 设置为，当前对手盘行情
         */
        this.setAsContextQuote(quote);
       
        if (isIntent || this.marketId == dictionary.market.shsec.code) {

            /**
             * 填充适当的申报类型，不锁死
             */
            this.resetReportType(this._decideReportTypes());

            /**
             * 点击意向申报时 （仅作表单的辅助性输入，不作成交锁死）
             * 1. 填充表单输入框
             * 2. 将申报类型置为【成交申报】，但不锁死
             * 3. 用户可随意更改输入框值，申报类型
             */
            this.reportTypeCtr.setValue(ScaleReportType.trade.code);

            /**
             * 根据场景，显示或隐藏部分控件
             */
            this._toggleShowInputs();

        }
        else {

            /**
             * 对手方为定价申报，本方应锁死为，点击成交申报
             */
            this.resetReportType([ScaleReportType.click2Trade], true);
        }

        /**
         * 重写表单输入项 - 除申报类型以外
         */
        this._rewriteByQuote(quote);
    }

    /**
     * @param {ScaleQuote} quote
     */
    handleCloseRowCheck(quote) {

        if (this.isAssignReportType) {
           
            helper.showError('指令已指定申报类型，不可变更');
            return;
        }

        /**
         * 检查是否盘后交易时间
         */
        if (!this.isCloseTradableTime()) {

            helper.showError('盘后交易时间段为15:00至15:30');
            return;
        }
        
        /**
         * 填充适当的申报类型，不锁死
         */
        this.resetReportType(this._decideReportTypes());

        this.reportTypeCtr.setValue(ScaleReportType.fixed2Close.code);
        
        /**
         * 根据场景，显示或隐藏部分控件
         */
        this._toggleShowInputs();
        /**
         * 重写表单输入项 - 除申报类型以外
         */
        this._rewriteByCloseQuote(quote);
    }

     /**
     * @param {ScaleQuote} quote 
     */
    async _rewriteByCloseQuote(quote) {

        let quote_price = this.reportTypeCtr.value == ScaleReportType.fixed2Avg.code ? quote.avgPrice : quote.closePrice;
        
        this.priceCtr.setValue(quote_price);
        this.isBond && await this.algorithmQuery({ netPrice: this.priceCtr.value, volume: this.volumeCtr.value });

        if (this.isByVolume) {

            this.volumeCtr.setValue(this.leftVolume);
            this.amountCtr.setValue(this.calculateAmount(this.leftVolume, this.betterPrice));
        }
        else {

            this.volumeCtr.setValue(this.calculateVolume(this.leftAmount, this.betterPrice));
            this.amountCtr.setValue(this.leftAmount);
        }     
    }

    /**
     * @param {ScaleQuote} quote 
     */
    async _rewriteByQuote(quote) {

        this.priceCtr.setValue(quote.entrustPrice);
        this.isBond && await this.algorithmQuery({ netPrice: this.priceCtr.value, volume: this.volumeCtr.value });

        /**
         * 设置最大可交易数量
         */
        if (this.isByVolume) {

            const final_volume = Math.min(quote.entrustVolume, this.leftVolume);
            this.volumeCtr.setValue(final_volume);
            this.amountCtr.setValue(this.calculateAmount(final_volume, this.betterPrice));
        }
        else {

            const volume = this.calculateVolume(this.leftAmount, this.betterPrice);
            const better_volume = Math.min(quote.entrustVolume, volume);
            this.volumeCtr.setValue(better_volume);
            this.amountCtr.setValue(this.calculateAmount(better_volume, this.betterPrice));
        }        

        this.contactCtr.setValue(quote.liaisonName || '');
        this.contactTelCtr.setValue(quote.liaisonTel || '');
        this.seatCtr.setValue(quote.propSeatNo || '');
        this.contractIdCtr.setValue(quote.contractId || '');
    }

    isCustomziedOk(){
        
        const entrust_price = this.priceCtr.value;
        const instruc_price = this.instruction.price;

        if (this.isLimitedPrice) {

            if (this.isPledgeRepo && this.isPositiveRepo && entrust_price > instruc_price) {
                return `委托价格${ entrust_price }大于限价${ instruc_price }`;
            }
            
            if (this.isPledgeRepo && this.isReversedRepo && entrust_price < instruc_price) {
                return `委托价格${ entrust_price }小于限价${ instruc_price }`;
            }
        }

        return true;
    }

    customizeData(form_data) {

        const formd = new FormData({});
        helper.extend(formd, form_data);
        const instruc = this.instruction;

        const ordinfo = new ScaleOrderInfo({

            accountId: instruc.acctNo,
            portfolioId: instruc.portfolioId,
            instructionId: instruc.id,
            userId: instruc.tradeId,
            username: instruc.traderName,
            entrustBs: instruc.bsFlag,
            entrustProp: formd.reportType,
            stockCode: instruc.stockCode,
            entrustVolume: this.volumeCtr.value,
            entrustPrice: this.priceCtr.value,
            fullPrice: this.fullPriceCtr.isShowing() ? this.fullPriceCtr.value : 0,
            expireYearRate: this.yieldRateCtr.isShowing() ? this.yieldRateCtr.value : 0,
            liaisonName: this.contactCtr.isShowing() ? formd.contact : undefined,
            liaisonTel: this.contactTelCtr.isShowing() ? formd.contactTel : undefined,
            contractId: this.contractIdCtr.isShowing() ? formd.contractId : undefined,
            propSeatNo: this.seatCtr.isShowing() ? formd.counterSeat : undefined,
            counterId: this.counterIdCtr.isShowing() ? formd.counterId : undefined,
            tipMsg: '大宗交易下单失败'
        });
        return ordinfo;
    }
}

export { ScaleUnit };