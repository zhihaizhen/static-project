import { helper } from '../helper';
import { dictionary } from '../dictionary';
import { Instruction, ConstrQuote, ConstrOrderInfo } from '../models';
import { JoyinTable } from '../joyin-table';
import { TradingUnit, NumberControl, SelectControl, SelectElement } from './trading-unit';
import { BizHelper } from '../biz-helper';

const ConstrReportType = dictionary.constrReportType;

class FormData {

    /**
     * @param {Instruction} instruc 
     */
    constructor(instruc) {

        this.portfolioName = instruc.portfolioName;
        this.accountName = instruc.tradeAccountId;
        this.stockCodeName = instruc.stockCodeName;
        this.direction = instruc.direction;

        this.reportType = '';
        this.settleSpeed = instruc.settleSpeed;
        this.netPrice = instruc.price;
        // this.fullPrice = instruc.fullPrice == 0 ? instruc.price : instruc.fullPrice; // 已走算法服务计算
        this.volume = instruc.leftVolume;
        this.iceVolume = instruc.iceVolume || 0;
        this.amount = instruc.amount;
        this.yieldRate = instruc.yieldRate || 0;
        
        this.contact = instruc.ourTrader;
        this.counterTrader = instruc.counterTrader;
        this.counterBroker = instruc.counterDealerId;
        this.contractId = instruc.appointmentNumber;
        this.counterId = instruc.counterId;
        this.counterName = instruc.counterName;
    }
}

/**
 * 固定收益交易单元
 */
class ConstrUnit extends TradingUnit {

    /** 当前选中的申报类型 */
    get selectedReportType() {
        return this.reportTypeCtr.value;
    }

    /** 是否为，定价申报 */
    get isMethodFixed() {
        return this.selectedReportType == ConstrReportType.fixedPrice.code;
    }

    /** 是否为，点击成交申报 */
    get isMethodClick2Trade() {
        return this.selectedReportType == ConstrReportType.click2Trade.code;
    }

    /** 是否为，可转换成交申报 */
    get isMethodConvertable() {
        return this.selectedReportType == ConstrReportType.convertableDeal.code;
    }

    /** 是否为，最优价成交申报 */
    get isMethodBestPrice() {
        return this.selectedReportType == ConstrReportType.bestPriceDeal.code;
    }

    /** 是否为，指定对手方成交申报 */
    get isMethodFixedCounter() {
        return this.selectedReportType == ConstrReportType.fixedCounter.code;
    }

    get isTickRequired() {
        return false;
    }

    get betterPrice() {

        // 根据合约信息里的债券模式区分‘净价交易’和‘全价交易’；合约信息不完善，待完成 TODO
        return this.netPriceCtr.value;
    }

    /**
     * 利息（单位，元）
     */
    get interest() {
        
        if (this.counterQuote) {
            return this.counterQuote.fullPrice - this.counterQuote.netPrice;
        }
        else {
            return this.instruction.fullPrice == 0 ? 0 : this.instruction.fullPrice - this.instruction.price;
        }
    }

    /**
     * 交易对手是否已指定，不能更改
     */
    get isCounterFixed() {

        return helper.isNone(this.instruction.counterSeat) && 
               helper.isNotNone(this.instruction.appointmentNumber);
    }

    get unitHeight() {
        return 480;
    }

    /**
     * @param {String} identifier
     * @param {Function} submitter
     */
    constructor(identifier, submitter) {

        super(identifier, submitter);
        this.setUnitName(TradingUnit.UnitNames.constr);

        /**
         * 对手交易员list
         */
        this.CounterTraderList = [];
    }

    identifyRecord(record) {
        return record.id;
    }

    build() {

        this._createTable();

        /**
         * 方向
         */
        this.directionCtr = new SelectControl({ unit: this,  $control: this.$form.querySelector('.direction') });
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
         * 清算速度
         */
        this.speedCtr = new SelectControl({ 
            unit: this,  
            $control: this.$form.querySelector('.settle-speed'),
            handler: this._handleSpeedModeChange.bind(this),
        });
        this.speedCtr.fill(dictionary.settleSppeds);

        /**
         * 净价价格
         */
        this.netPriceCtr = new NumberControl({
            
            unit: this,
            bizName: '净价价格',
            unitLabel: '元',
            $control: this.$form.querySelector('.net-price'),
            max: () => { return this.isContextTickOk ? this.contextTick.ceiling : 999999999; },
            step: () => { return this.contextPriceStep; },
            precision: () => { return this.contextPricePrecision; },
            handler: this._handleNetPriceChange.bind(this),
        });

        /**
         * 全价价格
         */
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
            max: () => { return this.amount2MaxVolume(this.netPriceCtr.value); },
            step: () => { return this.contextVolumeStep; },
            handler: this._handleVolumeChange.bind(this),
        });

        /**
         * 冰山数量
         */
        this.iceVolumeCtr = new NumberControl({
            
            unit: this,
            bizName: '冰山委托数量',
            unitLabel: '股',
            enableComma: true,
            asInteger: true,
            $control: this.$form.querySelector('.ice-volume'),
            max: () => { return this.amount2MaxVolume(this.netPriceCtr.value); },
            step: () => { return this.contextVolumeStep; },
            handler: this._handleIceVolumeChange.bind(this),
        });

        /**
         * 金额
         */
        this.amountCtr = new NumberControl({
            
            unit: this,
            bizName: '委托金额',
            unitLabel: '元',
            enableComma: true,
            $control: this.$form.querySelector('.amount'),
            handler: this._handleAmountChange.bind(this),
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
         * 交易对手
         */
        this.counterPartyCtr = new SelectControl({ 

            unit: this, 
            $control: this.$form.querySelector('.counter-id'),
            handler: this._handleCounterSelectChange.bind(this)
        });

        /**
         * 对手交易员
         */
        this.counterTraderCtr = new SelectElement({ 

            unit: this, 
            $control: this.$form.querySelector('.counterTrader'),
            promptTitle: '新增对手交易员',
            promptHandle: this._addCounterTrader.bind(this),
            promptVarify: this._validateCounter.bind(this)
        });

        this.contactCtr = new NumberControl({ unit: this, $control: this.$form.querySelector('.contact') });
        this.counterBrokerCtr = new NumberControl({ unit: this, $control: this.$form.querySelector('.counter-broker') });
        this.contractIdCtr = new NumberControl({ unit: this, $control: this.$form.querySelector('.contract-id') });

        this._bindComponentEvents();        
    }

    _handleCounterSelectChange(value) {

        this._requestCounterTraders(value);
    }

    /**
     * 添加对手交易员
     * @param {String} traderId 
     */
    async _addCounterTrader(traderId) {

        let resp = await this.manageRepo.addCounterTrader(traderId, this.counterPartyCtr.value);

        if (resp.errorCode != 0) {
            helper.showError('对手交易员添加失败！');
            return;
        }

        const traderList = this.CounterTraderList.filter(item => { return item.code != traderId });
        this.counterTraderCtr.fill([{code: traderId, mean: traderId}, ...traderList]);
        layui.form.render('select', this.formFilter);

    }

    _bindComponentEvents() {
        
        /** 重置按钮 */
        var $ctr_reset_btn = layui.$(`form button[lay-filter='reset-form-constr']`);
        $ctr_reset_btn[0].onclick = this.manualReset.bind(this);
    }

    _createTable() {

        this.tquote = new JoyinTable(document.getElementById('table-constr-quote'), this.identifyRecord, this, {
            
            tableName: 'joyin-table-constr-quote',
            headerHeight: this.settings.rowheight,
            rowHeight: this.settings.rowheight,
            footerHeight: this.settings.rowheight,
            pageSize: 999999,
            rowSelected: this.handleQuoteRowCheck.bind(this),
        });

        this.tquote.setMaxHeight(160);
    }

    getValidateRule() {

        return {

            netPrice4Constr: (val_str, $control) => { return this._validateNetPrice(val_str, $control); },
            fullPrice4Constr: (val_str, $control) => { return this._validateFullPrice(val_str, $control); },
            volume4Constr: (val_str, $control) => { return this._validateVolume(val_str, $control); },
            iceVolume4Constr: (val_str, $control) => { return this._validateIceVolume(val_str, $control); },
            amount4Constr: (val_str, $control) => { return this._validateAmount(val_str, $control); },
            yieldRate4Constr: (val_str, $control) => { return this._validateYieldRate(val_str, $control); },

            contact4Constr: (val_str, $control) => { return this._validateContact(val_str, $control); },
            counterBroker4Constr: (val_str, $control) => { return this._validateBroker(val_str, $control); },
            counter4Constr: (val_str, $control) => { return this._validateCounter(val_str, $control); },
            contractId4Constr: (val_str, $control) => { return this._validateContractId(val_str, $control); },
        };
    }

    _validateNetPrice() {

        let net_price = this.netPriceCtr.value;

        if (isNaN(net_price)) {
            return '净价，非数值';
        }
        else if (net_price <= 0) {
            return '净价，非正值';
        }
        else if (!this.isLeastPriceSpread(net_price)) {
            return `净价${ net_price }，非最小价差${ this.contextPriceStep }的整数倍`;
        }
    }

    _validateFullPrice() {

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
            return '委托数量 <= 0';
        }
        else if (!Number.isInteger(volume)) {
            return '委托数量，非整数';
        }

        if (volume > total_volume) {
            return `委托数量 > 可用数量${ total_volume }`;
        }
        else if (volume < total_volume && !this.isLeastVolumeSpread(volume)) {
            return `委托数量${ volume }，必须为数量步长${ this.contextVolumeStep }的整数倍`;
        }

        const cterq = this.counterQuote;
        if (!cterq) {
            return;
        }

        if (cterq.reportType == ConstrReportType.fixedCounter.code && volume > cterq.volume) {
            return `委托数量 > 对手盘委托数量${ cterq.volume }`;
        }
        else if(volume > this.counterQuote.volume){
            return `委托数量 > 行情数量${ this.counterQuote.volume }`;
        }

        let boundaryResult = this.checkVolumeBoundary(volume);
        if (!boundaryResult.isOk) {
            return boundaryResult.message;
        }
    }

    _validateIceVolume() {

        let volume = this.volumeCtr.value;
        let ice_volume = this.iceVolumeCtr.value;

        if (isNaN(ice_volume)) {
            return '冰山数量，非数值';
        }
        else if (ice_volume < 0) {
            return '冰山数量 < 0';
        }
        else if (!Number.isInteger(ice_volume)) {
            return '冰山数量，非整数';
        }
        else if (ice_volume > volume) {
            return `冰山数量${ ice_volume } > 委托数量${ volume }`;
        }
        else if (!this.isLeastVolumeSpread(ice_volume)) {
            return `冰山数量${ ice_volume }，非数量步长${ this.contextVolumeStep }的整数倍`;
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
            return '净价金额，非数值';
        }
        else if (amount <= 0) {
            return '竞价金额，非正值';
        }
        else if (amount > total_amount) {
            return `委托金额 > 可用金额${ total_amount }`;
        }
        
        let net_price = this.netPriceCtr.value;
        if (isNaN(net_price)) {
            return '净价，非数值，无法评估委托数量';
        }

        const cterq = this.counterQuote;
        if (!cterq) {
            return;
        }

        const cter_amount = cterq.volume * cterq.netPrice;
        if (cterq && cterq.reportType == ConstrReportType.fixedCounter.code && amount > cter_amount) {
            return `净价金额${ amount } > 对手盘委托金额${ cter_amount }`;
        }
    }

    _validateYieldRate() {

        let yield_rate = this.yieldRateCtr.value;
        if (isNaN(yield_rate)) {
            return '到期收益率，非数值';
        }
    }

    _validateContact() {

        if (this.contactCtr.isShowing() && this.contactCtr.plainValue.length != 6) {
            return '本方交易员，必须为6位字符';
        }
    }

    _validateCounter(value = null) {

        if (value == null) {
            value = this.counterTraderCtr.value;
        }

        if (this.counterTraderCtr.isShowing() && value.length != 6) {
            return '对手交易员，必须为6位字符';
        }
    }

    _validateBroker() {

        if (this.counterBrokerCtr.isShowing() && this.counterBrokerCtr.plainValue.length != 3) {
            return '对手方交易商，必须为3位字符';
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

    _handleSpeedModeChange() {
        this.algorithmQuery({ netPrice: this.netPriceCtr.value, volume: this.volumeCtr.value });
    }

    _handleNetPriceChange() {
        this.algorithmQuery({ netPrice: this.netPriceCtr.value, volume: this.volumeCtr.value });
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

    _handleIceVolumeChange() {
        //
    }

    _handleAmountChange() {
        this.volumeCtr.setValue(this.calculateVolume(this.amountCtr.value, this.betterPrice));
    }

    manualReset() {

        this.clearContextQuote();
        this.resetControls();
    }

    /**
     * 算法查询，债券的净价、全价、到期收益率
     */
    async algorithmQuery(criteria) {

        if (this.counterQuote) {
            return;
        }
        const settleSpeed = this.speedCtr.value;
        let result = await BizHelper.computePrices(this.instruction, criteria, settleSpeed);

        if (result.isByNetPrice) {
                
            this.fullPriceCtr.setValue(result.fullPrice);
            this.yieldRateCtr.setValue(result.yield);
        }
        else if (result.isByFullPrice) {

            this.netPriceCtr.setValue(result.netPrice);
            this.yieldRateCtr.setValue(result.yield);
        }
        else {

            this.netPriceCtr.setValue(result.netPrice);
            this.fullPriceCtr.setValue(result.fullPrice);
        }

        this.isByVolume ? this._handleVolumeChange() : this._handleAmountChange();
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

        this.netPriceCtr.enable();
        this.speedCtr.enable();
        /**
         * 
         * @param {Array<NumberControl>} $controls 
         */
        function hideControls($controls) {
            $controls.forEach($ctr => { $ctr.$control.classList.add(TradingUnit.Classes.hidden); });
        }

        /**
         * 根据所选择的申报类型，隐藏不需要的控件
         */

        if (this.isMethodFixed) {
            hideControls([this.counterBrokerCtr, this.counterTraderCtr, this.contractIdCtr]);
        }
        else if (this.isMethodClick2Trade) {

            this.speedCtr.disable();
            this.netPriceCtr.disable();
            this.fullPriceCtr.disable();
            this.yieldRateCtr.disable();
            hideControls([this.iceVolumeCtr, this.counterBrokerCtr, this.counterTraderCtr]);
        }
        else if (this.isMethodConvertable) {
            hideControls([this.iceVolumeCtr, this.counterBrokerCtr, this.counterTraderCtr, this.contractIdCtr]);
        }
        else if (this.isMethodBestPrice) {
            hideControls([this.iceVolumeCtr, this.counterBrokerCtr, this.counterTraderCtr, this.contractIdCtr]);
        }
        else if (this.isMethodFixedCounter) {
            hideControls([this.iceVolumeCtr]);
        }

        if (!this.counterPartyCtr.value) {
            this.counterTraderCtr.hide();
        }
    }

    /**
     * 填充申报类型，填充后，将默认选中第一个选项
     * @param {Array | Object} types 固收申报类型数组 [{ code: xxx, mean: xxx }]
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
     * @param {ConstrQuote} quote
     */
    setAsContextQuote(quote) {
        this.counterQuote = quote;
    }

    clearContextQuote() {
        delete this.counterQuote;
    }

    clearQuotes() {
        this.tquote.clearTable();
    }

    resetControls() {

        const instruc = this.instruction;
        
        /**
         * 表单重新赋值
         */
        const formd = new FormData(instruc);
        // formd.settleSpeed = dictionary.settleSpped.t0.code;
        this.setVal(formd);
        this.netPriceCtr.setValue(instruc.price);
        this.volumeCtr.updateUnitLabel(this.unitlabel);
        this.iceVolumeCtr.updateUnitLabel(this.unitlabel);

        if (helper.isNotNone(formd.counterId)) {

            this.counterPartyCtr.fill([{ code: formd.counterId, mean: formd.counterName}]);
            this.counterPartyCtr.disable();
            this.counterPartyCtr.$select.removeAttribute('lay-search', ''); 

            this._requestCounterTraders(formd.counterId);
        }
        else {

            if (helper.isNotNone(formd.counterTrader)) {
                
                this.CounterTraderList = [{ code: formd.counterTrader, mean: formd.counterTrader }];
                this.counterTraderCtr.fill(this.CounterTraderList);
            }

            this.counterPartyCtr.enable();
            this.counterPartyCtr.$select.setAttribute('lay-search', '');
            this._getCounterList();
        }

        /**
         * 根据是否已指定交易对手，填充不同的申报类型、可选状态
         */
        
        if (this.isCounterFixed) {
            this.resetReportType([ConstrReportType.fixedCounter], true);
        }
        else {
            this.resetReportType([ConstrReportType.fixedCounter]);
        }

        /**
         * 根据交易手段，设置数量控件、金额控件，的可输入性
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

        if (this.isFixedPrice) {

            this.fullPriceCtr.disable();
            this.yieldRateCtr.disable();
        }
        else {

            this.fullPriceCtr.enable();
            this.yieldRateCtr.enable();
        }

        if (this.isBond) {
            this.algorithmQuery({ netPrice: this.netPriceCtr.value, fullPrice: this.fullPriceCtr.value, volume: this.volumeCtr.value });
        }
    }

    /**
     * 查询交易对手list
     */
    async _getCounterList(){
        
        const resp = await this.manageRepo.queryCounterList();
        const counterList = resp.data ? resp.data : [];
        const cList = counterList.map(counter => { return { 'code': counter.counterId, 'mean': counter.counterName } });
        this.counterPartyCtr.fill([{ code: '', mean: '请选择'}, ...cList]);
        layui.form.render('select', this.formFilter);
    }

    /**
     * 查询对手交易员
     * @param {*} counterId 
     */
    async _requestCounterTraders(counterId) {

        if (!counterId) {

            this.counterTraderCtr.hide();
            return;
        }

        this.counterTraderCtr.show();
        const resp = await this.manageRepo.queryCounterTrader(counterId);
        const resArr = resp.data ? resp.data : [];
        const traderList = resArr.map(counter => { return { code: counter.counterTraderId, mean: counter.counterTraderId } });
        const insTraderId = this.instruction.counterTrader;

        if (!!insTraderId) {

            const fList = traderList.filter(item => { return item.code != insTraderId; });
            this.CounterTraderList = [{ code: insTraderId, mean: insTraderId }, ...fList];
        }
        else {
            this.CounterTraderList = traderList;
        }
       
        this.counterTraderCtr.fill(this.CounterTraderList);
        layui.form.render('select', this.formFilter);
    }

    async requestQuotes() {

        const instruc = this.instruction;
        const resp = await this.quoteRepo.queryConstrQuotes(instruc.acctNo, instruc.stockCode);
        
        if (resp.errorCode != 0) {

            helper.showError(`固收行情数据，调用异常( ${ resp.errorMsg } )`);
            return;
        }

        this.tquote.refill(resp.data);
    }

    resetForm() {

        this.tquote.unselectRow();
        this.clearContextQuote();
        this.clearQuotes();
        this.requestQuotes();
        this.resetControls();
        this._toggleShowInputs();
    }

    fitTableColumnWith() {
        this.tquote.fitColumnWidth();
    }

    handleReportTypeChange() {
        this._toggleShowInputs();
    }

    /**
     * @param {ConstrQuote} quote
     */
    handleQuoteRowCheck(quote) {

        const instruc = this.instruction;

        /**
         * 检查是否，相同委托方向
         */
        if (instruc.bsFlag == quote.direction) {

            helper.showError('请选择对手方进行申报');
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
        this.resetReportType([ConstrReportType.click2Trade], true);

        /**
         * 重写表单输入项 - 除申报类型以外
         */
        this._rewriteByQuote(quote);
    }

    /**
     * @param {ConstrQuote} quote 
     */
    _rewriteByQuote(quote) {

        const instruc = this.instruction;
        const net_price = quote.netPrice;
        const full_price = quote.fullPrice;
        const yiel_rate = +quote.yieldRate;

        /**
         * 设置更好的价格
         */

        this.netPriceCtr.setValue(net_price);
        this.fullPriceCtr.setValue(full_price);
        this.yieldRateCtr.setValue(yiel_rate * 100);

        /**
         * 设置最大可交易数量
         */

        if (this.isByVolume) {

            const final_volume = Math.min(quote.volume, this.leftVolume);
            this.volumeCtr.setValue(final_volume);
            this.amountCtr.setValue(this.calculateAmount(final_volume, full_price));
        }
        else {

            const volume = this.calculateVolume(instruc.leftAmount, full_price);
            const better_volume = Math.min(quote.volume, volume);
            this.volumeCtr.setValue(better_volume);
            this.amountCtr.setValue(this.calculateAmount(better_volume, full_price));
        }        

        /**
         * 其他输入项
         */
        this.contractIdCtr.setValue(quote.orderNo);
    }

    customizeData(form_data) {

        const formd = new FormData({});
        helper.extend(formd, form_data);
        const instruc = this.instruction;

        const ordinfo = new ConstrOrderInfo({

            accountId: instruc.acctNo,
            portfolioId: instruc.portfolioId,
            instructionId: instruc.id,
            userId: instruc.tradeId,
            username: instruc.traderName,
            stockCode: instruc.stockCode,
            entrustProp: this.reportTypeCtr.value,
            entrustBs: instruc.bsFlag,
            entrustVolume: this.volumeCtr.value,
            discount: this.iceVolumeCtr.value,
            entrustPrice: this.netPriceCtr.value,
            fullPrice: this.fullPriceCtr.isShowing() ? this.fullPriceCtr.value : 0,
            expireYearRate: this.yieldRateCtr.isShowing() ? this.yieldRateCtr.value : 0,
            liaisonTel: this.contactCtr.isShowing() ? formd.contact : undefined,
            propSeatNo: this.counterBrokerCtr.isShowing() ? formd.counterBroker : undefined,
            liaisonName: this.counterTraderCtr.isShowing() ? formd.counterTrader : undefined,
            contractId: this.contractIdCtr.isShowing() ? formd.contractId : undefined,
            tipMsg: '固定收益交易下单失败'
        });

        return ordinfo;
    }
}

export { ConstrUnit };