import { helper } from '../helper';
import { dictionary } from '../dictionary';
import { Instruction, TickData } from '../models';
import { DataRepo } from '../repos/data-repo';
import { InstructionRepo } from '../repos/instruction-repo';
import { QuoteRepo } from '../repos/quote-repo';
import { ManageRepo } from '../repos/manage-repo';
import { TradingRepo } from '../repos/trading-repo';
import { JoyinTableActions } from '../join-table-actions';

const Classes = {

    numberCtr: 'number-ctr',
    disabledNumberCtr: 'diabled-number-ctr',
    laythis: 'layui-this',
    layshow: 'layui-show',
    hidden: 'is-hidden',
};

const UnitNames = {

    algo: 'algo',
    apply: 'apply',
    basket: 'basket',
    batch: 'batch',
    constr: 'constr',
    equal: 'equal',
    future: 'future',
    normal: 'normal',
    option: 'option',
    pledge: 'pledge',
    repo: 'repo',
    scale: 'scale',
};

/**
 * 按步长对数值取整
 * @param {Number} val 
 * @param {Number} step 
 */
function trimByStep(val, step) {

    if (isNaN(val) || val <= 0) {
        return 0;
    }
    else if (step >= 1) {
        return step * Math.floor(val / step);
    }
    else {

        return val;

        // let times = 10;
        // let precision = 1;
        // while ((step * times) < 1) {

        //     times = times * 10;
        //     precision = precision + 1;
        // }
        // return step * (+val.toFixed(precision) * times / step);
    }
}

class TradingUnit {

    /**
     * 是否当前指令OK
     */
    get isContextInstrucOk() {
        return !!this.instruction;
    }

    /**
     * 当前交易单元，进行交易时，是否需要tick数据进行支持（默认true，可于子类重写）
     */
    get isTickRequired() {
        return true;
    }

    /**
     * 是否当前TICK数据OK
     */
    get isContextTickOk() {
        return this.contextTick instanceof TickData;
    }

    /** 指令交易标的所属市场代码 */
    get marketId() {
        return this.instruction.marketId;
    }

    /** 是否指令交易标的，为上交所 */
    get isShSecMarket() {
        return this.instruction.isShSecMarket;
    }

    /** 是否指令交易标的，为上交所科创板 */
    get isShKcbDept() {
        return this.instruction.isShKcbDept;
    }

    /** 是否指令交易标的，为深交所创业板 */
    get isSzCybDept() {
        return this.instruction.isSzCybDept;
    }

    /** 是否指令交易标的，为深交所 */
    get isSzSecMarket() {
        return this.instruction.isSzSecMarket;
    }

    /** 是否指令交易标的，为上期所 */
    get isShFutureMarket() {
        return this.instruction.isShFutureMarket;
    }

    /** 是否指令交易标的，为大商所 */
    get isDceFutureMarket() {
        return this.instruction.isDceFutureMarket;
    }

    /** 指令资产类型 */
    get assetType() {
        return this.instruction.assetType;
    }

    /** 指令交易方向 */
    get directionId() {
        return this.instruction.direction;
    }

    /** 是否为买入方向 */
    get isBuy() {
        return this.instruction.direction == dictionary.direction.buy.code;
    }

    /** 是否为卖出方向 */
    get isSell() {
        return this.instruction.direction == dictionary.direction.sell.code;
    }

    /** 是否按照数量交易 */
    get isByVolume() {
        return this.instruction.isByVolume;
    }

    /** 是否按照金额交易 */
    get isByAmount() {
        return this.instruction.isByAmount;
    }

    /**
     * 指令价格模式，是否为市价
     */
    get isMarketPrice() {
        return this.instruction.isMarketPrice;
    }

    /**
     * 指令价格模式，是否为固定价格
     */
    get isFixedPrice() {
        return this.instruction.isFixedPrice;
    }

    /**
     * 指令价格模式，是否为限价
     */
    get isLimitedPrice() {
        return this.instruction.isLimitedPrice;
    }

    /**
     * 指令剩余可用数量
     */
    get leftVolume() {
        return this.instruction.leftVolume;
    }

    /**
     * 指令剩余可用金额
     */
    get leftAmount() {
        return this.instruction.leftAmount;
    }

    /**
     * 是否为质押式回购
     */
    get isPledgeRepo() {
        return this.assetType == dictionary.assetType.standardVoucher.code;
    }

    /** 是否为正回购方向 */
    get isPositiveRepo() {
        return this.directionId == dictionary.direction.positiveRepo.code;
    }

    /** 是否为逆回购方向 */
    get isReversedRepo() {
        return this.directionId == dictionary.direction.reversedRepo.code;
    }
    
    /**
     * 是否为债券
     */
    get isBond() {
        return this.assetType == dictionary.assetType.bond.code;
    }

    /**
     * 是否为基金
     */
    get isFund() {
        return this.assetType == dictionary.assetType.fund.code;
    }

    /**
     * 是否为股票
     */
    get isStock() {
        return this.assetType == dictionary.assetType.stock.code;
    }

    /** 单元高度 */
    get unitHeight() {
        return 380;
    }

    /** 是否显示下单列表 */
    get showOrder() {
        return false;
    }

    get dataRepo() {
        return this._dataRepo || (this._dataRepo = new DataRepo());
    }

    get instrucRepo() {
        return this._instrucRepo || (this._instrucRepo = new InstructionRepo());
    }

    get quoteRepo() {
        return this._quoteRepo || (this._quoteRepo = new QuoteRepo());
    }

    get manageRepo() {
        return this._manageRepo || (this._manageRepo = new ManageRepo());
    }

    get trdRepo() {
        return this._trdRepo || (this._trdRepo = new TradingRepo());
    }

    /** 当前指令最大可操作规模（数量或金额） */
    get maxVolumeAmount() {

        const instruc = this.instruction;
        return instruc ? (instruc.isByVolume ? instruc.leftVolume : instruc.leftAmount) : 0;
    }

    /** 当前产品单位 */
    get unitlabel() {

        const instruc = this.instruction;
        const AST = dictionary.assetType;

        if (!instruc || instruc.assetType == AST.stock.code) {
            return AST.stock.unit;
        }
        else if (instruc.assetType == AST.fund.code) {
            return AST.fund.unit;
        }
        else if (instruc.assetType == AST.bond.code) {
            return AST.bond.unit;
        }
        else if (instruc.assetType == AST.future.code) {
            return AST.future.unit;
        }
        else {
            return AST.standardVoucher.unit;
        }
    }

    get classes() {
        return Classes;
    }

    static get Classes() {
        return Classes;
    }

    static get messages() {

        return {

            decidedOk: undefined,
            insAbsent: '指令缺失',
            tickAbsent: 'TICK数据缺失',
            zeroVolume: '指令可用数量 = 0',
            zeroAmount: '指令可用金额 = 0',
        };
    }

    /**
     * 交易单元代号
     */
    static get UnitNames() {
        return UnitNames;
    }

    /**
     * 设置为本交易单元的名称代号
     * @param {*} unitName 
     */
    setUnitName(unitName) {
        this.unitName = unitName;
    }

    /**
     * @param {String} identifier 分配给该交易单元的识别号
     * @param {Function} form_submitter 表单数据提交，数据处理方法 function(form_data) 
     */
    constructor(identifier, form_submitter) {

        this.settings = { rowheight: 24 };

        /** 标题元素 */
        this.$title = document.getElementById('tab-' + identifier);
        
        /** 内容元素 */
        this.$content = document.getElementById('tab-content-' + identifier);

        /** 基于layui的form表单选择器名称 */
        this.formFilter = 'form-' + identifier;

        /** 基于layui的form表单提交按钮选择器名称 */
        this.submitFilter = `submit-${ identifier }-form`;

        /** 表单数据提交处理方法 */
        this.submitter = form_submitter;
        
        /** form表单元素本身 */
        this.$form = this._attachFormSubmit();

        /**
         * 扩展表格方法
         */
        helper.extend(this, JoyinTableActions);

        /**
         * 完成交易单元构建
         */
        this.build();
    }

    /**
     * 
     * @param {NodeList<HTMLElement>} $selects 
     * @param {*} data_dict 
     * @param {Boolean} selectFirst 
     */
    static fillSelects($selects, data_dict, selectFirst = true) {

        var options = [];
        if (!selectFirst) {
            options.push('<option value=""></option>');
        }

        if (data_dict instanceof Array) {

            for (let item of data_dict) {
                options.push(`<option value="${ item.code }">${ item.codemean || item.mean }</option>`);
            }
        }
        else {

            for (let key in data_dict) {
                options.push(`<option value="${ data_dict[key].code }">${ data_dict[key].codemean || data_dict[key].mean }</option>`);
            }
        }

        for (let idx = 0; idx < $selects.length; idx++) {
            $selects[idx].innerHTML = options.join('');
        }
    }


    getPromptInfo(lable, type) {

        let promptInfo = `${lable}, 验证不通过`;

        switch (type) {

            case 0:
                promptInfo = `${lable}, 非数值`;
                break;
            case 1:
                promptInfo = `${lable}, 请输入正数`;
                break;
            case 2:
                promptInfo = `${lable}, 请输入整数`;
                break;
            case 3:
                promptInfo = `${lable}, 请输入正整数`;
                break;
            case 4:
                promptInfo = `${lable}, 请输入最小价差${ this.contextPriceStep }的整数倍`;
                break;
            case 5:
                promptInfo = `${lable}, 请输入数量步长${ this.contextVolumeStep }的整数倍`;
                break;
            default:
                break;
        }

        return promptInfo;
    }

    /**
     * 针对竞价性质的交易单元，依托指令，计算适合的价格模式
     */
    computePriceModes() {
        
        let ETP = dictionary.entrustProp;
        let DIR = dictionary.direction;
        let AST = dictionary.assetType;

        let asset = this.assetType;
        let direction = this.directionId;

        let xnormal = { code: ETP.normal.code, mean: ETP.normal.mean };
        let xpledge = { code: ETP.pledge.code, mean: ETP.pledge.mean };

        if ([AST.bond, AST.standardVoucher].some(item => item.code == asset)) {
            return [xnormal];
        }
        else if ([DIR.openLong, DIR.openShort, DIR.closeLong, DIR.closeShort, DIR.closeTodayLong, DIR.closeTodayShort].some(item => item.code == direction)) {
            return [xnormal];
        }
        else if ([DIR.seal, DIR.unseal].some(item => item.code == direction)) {
            return [xpledge];
        }
        else if ([DIR.buy, DIR.sell, DIR.allocateShare, DIR.positiveRepo, DIR.reversedRepo].some(item => item.code == direction)) {

            if (!this.isMarketPrice) {
                return [xnormal];
            }
            else if (AST.future.code == asset) {

                let xmodes = [

                    { code: ETP.normal.code, mean: ETP.normal.mean },
                    { code: ETP.anyPrice.code, mean: ETP.anyPrice.mean },
                ];
                
                return xmodes;
            }
            
            if (this.isShSecMarket) {

                let xmodes = [

                    { code: ETP.normal.code, mean: ETP.normal.mean },
                    { code: ETP.best5_to_cancel.code, mean: ETP.best5_to_cancel.mean },
                    { code: ETP.best5_to_limit.code, mean: ETP.best5_to_limit.mean },
                ];
    
                if (this.isShKcbDept) {
    
                    xmodes.push({ code: ETP.own_first.code, mean: ETP.own_first.mean });
                    xmodes.push({ code: ETP.counterparty.code, mean: ETP.counterparty.mean });
                    xmodes.push({ code: ETP.closeFixed.code, mean: ETP.closeFixed.mean });
                }

                return xmodes;
            }
            else {

                let xmodes = [
    
                    { code: ETP.normal.code, mean: ETP.normal.mean },
                    { code: ETP.counterparty.code, mean: ETP.counterparty.mean },
                    { code: ETP.own_first.code, mean: ETP.own_first.mean },
                    { code: ETP.immediate_to_cancel.code, mean: ETP.immediate_to_cancel.mean },
                    { code: ETP.fill.code, mean: ETP.fill.mean },
                    { code: ETP.best5_to_cancel.code, mean: ETP.best5_to_cancel.mean },
                ];
    
                if (this.isSzCybDept) {
                    xmodes.push({ code: ETP.closeFixed.code, mean: ETP.closeFixed.mean });
                }

                return xmodes;
            }
        }
        else {
            return [];
        }
    }

    /**
     * 在特定价格模式（委托属性）下，价格是否可以更改
     * @param {*} price_mode 
     */
    isPriceChangableByMode(price_mode) {

        if (this.isShKcbDept || this.isSzCybDept) {

            /**
             * 对于沪市科创板，限价（竞价限价） | 市价类（保护限价），都需要输入价格
             */
            return true;
        }

        return price_mode == dictionary.entrustProp.normal.code;
    }

    /**
     * 按照合约之数量步长，对给定的数量进行向下取整
     * @param {Number} volume 
     * @param {Number} volumeStep 特殊的数量步长（依赖该特殊步长，进行数量的取整）
     */
    trimVolume(volume, volumeStep = undefined) {
        return isNaN(volume) || volume <= 0 ? 0 : trimByStep(volume, Number.isInteger(volumeStep) && volumeStep > 0 ? volumeStep : this.contextVolumeStep);
    }

    /**
     * 按金额交易时，根据下单金额、下单价格，计算可交易数量
     * @param {Number} amount 下单金额
     * @param {Number} price 下单价格
     * @param {Boolean} trimByStep 是否依赖数量步长进行取整，默认 = true
     */
    calculateVolume(amount, price, trimByStep = true) {

        if (isNaN(amount) || isNaN(price) || amount <= 0 || price <= 0) {
            return 0;
        }
        
        let volume_step = this.contextVolumeStep;
        if (trimByStep) {
            return volume_step * Math.floor( amount / price / volume_step); 
        }
        else{
            return Math.floor(amount / price); 
        }
    }

    /**
     * 用户价格是否合理
     * @param {*} userPrice 
     */
    isUserPriceLegal(userPrice) {
       
        if (isNaN(userPrice)) {
            return '委托价，非数值';
        }
        else if (userPrice <= 0) {
            return '委托价，非正数';
        }

        let insPrice = this.instruction.price;

        if (this.isLimitedPrice) {
                
            if (this.isBuy && userPrice > insPrice) {
                return `委托价${ userPrice } > 买入限价${ insPrice }`;
            }
            else if (this.isSell && userPrice < insPrice) {
                return `委托价${ userPrice } < 卖出限价${ insPrice }`;
            }
        }
        else if (this.isFixedPrice) {
            
            if (userPrice != insPrice) {
                return `委托价${ userPrice } != 指定价${ insPrice }`;
            }
        }
        else if (this.isMarketPrice) {
            // 在指令层面，价格模式 = 市价交易，则无具体限制，只要价格在行情涨跌停范围内
        }

        if (this.isContextTickOk) {

            let { ceiling, floor } = this.contextTick;

            if (userPrice > ceiling) {
                return `委托价${ userPrice } > 涨停价${ ceiling }`;
            }
            else if (userPrice < floor) {
                return `委托价${ userPrice } < 跌停价${ floor }`;
            }
            else if (!this.isLeastPriceSpread(userPrice)) {
                return `委托价${ userPrice }，非最小价差${ this.contextPriceStep }的整数倍`;
            }
        }

        return true;
    }

    /**
     * 按数量交易时，根据下单数量、下单价格，计算可订单金额
     * @param {Number} volume 
     * @param {Number} price 
     */
    calculateAmount(volume, price) {

        if (isNaN(volume) || isNaN(price) || volume <= 0 || price <= 0) {
            return 0;
        }
        else {
            return (volume * price).toFixed(2);
        }
    }

    /**
     * 根据指令当前价格，将指令金额，转换为给定价格对应的，最大可交易数量
     * @param {*} price 
     */
    amount2MaxVolume(price) {

        if (this.isByVolume) {
            return this.leftVolume;
        }

        if (isNaN(price) || price <= 0) {
            return 0;
        }
        else {

            let volume_step = this.contextVolumeStep;
            return volume_step * Math.floor(this.leftAmount / price / volume_step);
        }
    }
    
    /**
     * 交易单元自构建
     */
    build() {
        // console.error('method [build] not implemented');
    }

    /**
     * 返回该交易单元，表单验证规则
     */
    getValidateRule() {
        return {};
    }

    /**
     * 借助当前上下文指令，重置表单元素值
     */
    resetForm() {
        // console.error('method [resetForm] not implemented');
    }

    /**
     * 促使，交易单元表单信息，与指令保持一次数据同步
     */
    sync() {
        this.resetForm();
    }

    /**
     * 克隆当前指令数据
     * @returns {Instruction} 具有完整指令结构的数据（但非类型实例）
     */
    duplicateInstruc() {
        return helper.deepClone(this.instruction);
    }

    /**
     * 设置当前上下文指令对象
     * @param {Instruction} instruction 上下文指令信息
     */
    setInstruction(instruction) {

        this.firInsSelectFlag = true;

        /**
         * 设置初始化高度
         */
        if (this._initializedHeight === undefined) {

            this._initializedHeight = true;
            let uheight = this.unitHeight;
            this.$content.style.height = typeof uheight == 'number' ? uheight + 'px' : uheight;
        }

        /**
         * 当前上下文指令对象
         */
        this.instruction = instruction;
        this.contextPricePrecision = instruction.queryStockPricePrecision(instruction.tradePlat);
        this.contextPriceStep = instruction.queryStockPriceStep(instruction.tradePlat);
        this.contextVolumeStep = instruction.queryStockVolumeStep(instruction.tradePlat, instruction.direction);

        /**
         * 基于当前上下文指令，重置表单元素值域
         */
        this.resetForm();
    }

    /**
     * 重置表单字段的值: 价格、金额类字段
     */
    reSetElementValue(elemArr) {

        if (!(elemArr instanceof Array)) {
            return;
        }
        elemArr.forEach(item => { item.setValue(item.value); });
    }

    /**
     * 设置当前上下文合约行情数据
     * @param {TickData} tick_data 
     */
    setTick(tick_data) {

        /**
         * 当前上下文合约行情数据
         */
        this.contextTick = tick_data;

        if (this.firInsSelectFlag 
            && tick_data instanceof TickData 
            && tick_data.stockCode == this.instruction.stockCode
            && this.isMarketPrice
            && this.instruction.price == 0) {

                this.firInsSelectFlag = false;
                this.digestFirstTick(tick_data);
        }
    }

    /**
     * 设置当前上下文合约行情数据
     * @param {TickData} tick_data 
     */
    digestFirstTick(tick_data) {}

    /**
     * 自定义返回，格式化过后的，表单数据
     * @param {*} field_data 表单原始提交数据
     */
    customizeData(field_data) {
        return field_data;
    }

    showTab() {
        
        this.$title.classList.remove(Classes.laythis);
        this.$title.classList.remove(Classes.hidden);
        this.$content.classList.remove(Classes.layshow);
    }

    focusTab() {

        this.$title.classList.remove(Classes.hidden);
        this.$title.click();
        this.$content.classList.remove(Classes.hidden);
    }

    hide() {

        this.$title.classList.remove(Classes.laythis);
        this.$title.classList.add(Classes.hidden);
        this.$content.classList.remove(Classes.layshow);
    }

    /**
     * 设置标题TAB文件
     * @param {String} title 
     */
    setTitle(title) {
        this.$title.innerText = title;
    }

    /**
     * 表单元素赋值（整体赋值、局部赋值，均可）
     * @param {*} form_data 
     */
    setVal(form_data) {

        const form = layui.form;
        const cloned_data = helper.deepClone(form_data);
        form.val(this.formFilter, cloned_data);
    }

    /**
     * 判断价格是否为，最小价差的整数倍
     * @param {Number} price 
     */
    isLeastPriceSpread(price) {

        return typeof price == 'number'
                && price >= 0
                && Number.isInteger(Math.ceil(price * 1000000) / Math.ceil(this.contextPriceStep * 1000000));
    }

    /**
     * 判断数量是否为，最小数差的整数倍
     * @param {Number} volume 
     */
    isLeastVolumeSpread(volume) {
        
        return typeof volume == 'number'
                && volume >= 0 
                && Number.isInteger(volume) 
                && Number.isInteger(volume / this.contextVolumeStep);
    }

    /**
     * 检查委托数量，是否在允许的，最小 ~ 最大范围内
     * @param {Number} volume 委托数量
     * @param {Boolean} isMarketPrice 是否为市价模式
     */
    checkVolumeBoundary(volume, isMarketPrice) {

        let result = { isOk: true, message: null };
        let instruc = this.instruction;
        let setting = instruc.queryStockVolumeSetting(instruc.tradePlat, instruc.direction);
        
        if (!setting) {
            return result;
        }
        
        let platform = dictionary.platforms.find(item => item.code == setting.platform);
        if (!platform) {
            return result;
        }
        
        let platformName = platform.mean;

        if (volume < setting.minVolume) {

            result.isOk = false;
            result.message = `${platformName}，最低允许委托 ${helper.thousands(setting.minVolume)}，实际 ${helper.thousands(volume)}`;
        }
        else if (volume > setting.maxVolume) {

            result.isOk = false;
            result.message = `${platformName}，最多允许委托 ${helper.thousands(setting.maxVolume)}，实际 ${helper.thousands(volume)}`;
        }
        

        if (isMarketPrice) {

            if (volume < setting.minMarketVolume) {

                result.isOk = false;
                result.message = `${platformName}，市价模式下，最低允许委托 ${helper.thousands(setting.minMarketVolume)}，实际 ${helper.thousands(volume)}`;
            }
            else if (volume > setting.maxMarketVolume) {
    
                result.isOk = false;
                result.message = `${platformName}，市价模式下，最多允许委托 ${helper.thousands(setting.maxMarketVolume)}，实际 ${helper.thousands(volume)}`;
            }        
        }

        return result;
    }

    /**
     * 判断债券交易，价格是否超过上一日加权平均价的2%上下区间(上一日加权平均价，暂时取收盘价)
     * @param {*} orderData 
     */
    async checkPriceBoundary(orderData) {

        let entrustp = orderData.entrustPrice;
        if (typeof entrustp != 'number' || entrustp <= 0) {

            /**
             * 委托价格在交易单元，已经作过有效性检测，此处依然认为此价格合理（存在缺失的可能性？？）
             */
            this.submitter(orderData);
            return;
        }

        let stockCode = this.instruction.stockCode;
        let lastTick = await this.quoteRepo.queryLastTick(stockCode);
        let tickData = helper.isNotNone(lastTick) ? new TickData(lastTick, stockCode) : null;

        /**
         * 未获取到有效的行情，则无法验证该债券委托价格，是否超越上下限边界值
         */
        if (!tickData) {

            this.submitter(orderData);
            return;
        }

        let preclose = tickData.preclose;
        let maxp = preclose * 1.02;
        let minp = preclose * 0.98;

        /**
         * 委托价格，位于边界范围内
         */

        if (entrustp >= minp && entrustp <= maxp) {

            this.submitter(orderData);
            return;
        }

        let message;
        let precision = this.contextPricePrecision;

        if (entrustp < minp) {

            message = `当前价格 <span class="s-color-red">${ entrustp.toFixed(precision) }</span> 
                        小于上一日加权平均价的98% (<span class="s-color-red">${ minp.toFixed(precision) }</span>)，是否继续？`;
        }
        else {

            message = `当前价格 <span class="s-color-red">${ entrustp.toFixed(precision) }</span> 
                        大于上一日加权平均价的102% (<span class="s-color-red">${ maxp.toFixed(precision) }</span>)，是否继续？`;
        }

        layer.confirm(message, { icon: 3, title: '操作确认' }, (index) => {

            this.submitter(orderData);
            layer.close(index);
        });
    }

    /**
     * 当前交易单元，是否满足特定的判断条件
     * @param {*} order_info 
     */
    isCustomziedOk(order_info) {
        return true;
    }

    /**
     * 当前，如果为交易大宗的前提下，是否达到了所需要的最低交易规模（数量、金额维度）
     * @param {*} order_info 
     */
    hasReachedLeast(order_info) {
        return true;
    }

    /**
     * @returns {HTMLFormElement} 
     */
    _attachFormSubmit() {

        const form = layui.form;
        const thisObj = this;

        form.on(`submit(${ this.submitFilter })`, (data) => {

            try {

                /**
                 * 检查指令状态
                 */
                if (!thisObj.instruction.isReceived) {
                    
                    helper.showError('指令状态错误，暂不支持交易');
                    return false;
                }

                /**
                 * 检测上下文指令是否OK
                 */
                if (!thisObj.isContextInstrucOk) {

                    helper.showError(TradingUnit.messages.insAbsent);
                    return false;
                }
                
                /**
                 * 检测对行情有依赖的情况下，行情是否OK——————屏蔽该检测
                 */
                // if (thisObj.isTickRequired && !thisObj.isContextTickOk) {

                //     helper.showError(TradingUnit.messages.tickAbsent);
                //     return false;
                // }

                const field_data = data.field;
                const customized_data = thisObj.customizeData(field_data);

                /**
                 * 检查，最低交易规模
                 */

                const has_reached_least = thisObj.hasReachedLeast(customized_data);
                if (has_reached_least !== undefined && has_reached_least !== true) {

                    helper.showError(has_reached_least || '未达最低交易规模');
                    return false;
                }

                /**
                 * 检查，是否满足特别自定义条件
                 */

                const customized_result = thisObj.isCustomziedOk(customized_data);
                if (customized_result === false) {

                    helper.showError('自定义验证未通过，不能下单');
                    return false;
                }
                else if (typeof customized_result == 'string') {

                    helper.showError(customized_result);
                    return false;
                }

                if (typeof thisObj.submitter != 'function') {

                    helper.showError('该交易单元，未正确实现委托逻辑调用');
                    return false;
                }

                /**
                 * 是否为债券，在特定的交易场景，进行交易
                 */

                let uns = TradingUnit.UnitNames;
                let isBondAndUnitOk = (this.isBond || this.isPledgeRepo) && (this.unitName == uns.normal || this.unitName == uns.scale || this.unitName == uns.constr);

                if (isBondAndUnitOk) {
                    this.checkPriceBoundary(customized_data);
                }
                else {

                    /**
                     * 各项检测通过，提交数据
                     */
                    thisObj.submitter(customized_data);
                }
            }
            catch(ex) {
                console.error(ex);
            }

            return false;
        });

        return layui.$(`form[lay-filter='${ this.formFilter }']`)[0];
    }
}

/**
 * @returns {TradingUnit}
 */
function createEmptyUnit () {
    return null;
}

const DefaultNumberControlOptions = { 

    /** 当前交易单元对象 */
    unit: createEmptyUnit(),

    /** 单位，字符串 */
    unitLabel: null,

    /** 输入控件组 */
    $control: document.createElement('div'),

    /** 控件名称 */
    bizName: null,

    /** 是否作为普通文本（默认 = false）*/
    asText: false,

    /** 是否格式化为整数，默认格式化为浮点数（默认 = false）*/
    asInteger: false,

    /** 最大值（数值，或返回数值的function） */
    max: 0,

    /** 最小值（数值，或返回数值的function） */
    min: 0, 

    /** 步长值（数值，或返回数值的function） */
    step: 0,

    /** 数值精度 - 小数位数（数值>=0，或返回数值的function） */
    precision: 0,

    /** 是否启用千分位分隔符  */
    enableComma: false,

    /**
     * 回调（包含onkeydown，onchange，decrease button，increase button）
     * @param {Number} cur_value 
     */
    handler : function(cur_value) { /** not implemented */},
};

class BaseUserControl {

    /**
     * 获取当前值
     */
    get value() {
        throw new Error('not implemented');
    }

    /**
     * 设置为当前值
     * @param {*} value 
     */
    setValue(value) {
        throw new Error('not implemented');
    }

    /**
     * 展示该选择控件
     */
    show() {
        this.$control.classList.remove(Classes.hidden);
    }

    /**
     * 是否正常显示中
     * @returns {Boolean}
     */
    isShowing() {
        return !this.isHidden();
    }
    
    /**
     * 隐藏该选择控件
     */
    hide() {
        this.$control.classList.add(Classes.hidden);
    }

    /**
     * 是否已隐藏
     * @returns {Boolean}
     */
    isHidden() {
        return this.$control.classList.contains(Classes.hidden);
    }

    /**
     * 启用控件功能，可选择
     */
    enable() {
        this.isReadonly = false;
    }

    /**
     * 禁用控件功能，设为只读
     */
    disable() {
        this.isReadonly = true;
    }

    /**
     * @param {HTMLDivElement} $control 
     */
    constructor($control) {
        this.$control = $control;
    }
}

class NumberControl extends BaseUserControl {

    /**
     * @returns {Number}
     */
    get value() {

        if (this.asText === true) {
            return this.plainValue;
        }
        else {

            let val = this.$input.value.replace(/,/g, '');
            return val.length > 0 ? parseFloat(val) : 0;
        }
    }

    /**
     * 获取当前值（素颜）
     * @returns {String}
     */
    get plainValue() {
        return typeof this.$input.value == 'string' ? this.$input.value.trim() : '';
    }

    /**
     * 设置为当前值
     * @param {Number|String} value 
     */
    setValue(value) {

        if (value === undefined || value === null) {
            value = '';
        }

        if (this.asText === true) {

            this.$input.value = value;
            return;
        }

        let tvalue = value;
        let precision_val = typeof this.precision == 'function' ? this.precision() : this.precision;

        if (typeof value == 'number') {

            if (this.enableComma) {

                if (this.asInteger) {
                    tvalue = helper.thousandsInteger(value);
                }
                else {
                    tvalue = helper.thousandsDecimal(value, precision_val);
                }
            }
            else {

                if (this.asInteger) {
                    tvalue = parseInt(value);
                }
                else {
                    tvalue = parseFloat(value).toFixed(precision_val);
                }
            }
        }

        this.$input.value = tvalue;
    }

    /**
     * 更新单位
     * @param {String} value 
     */
    updateUnitLabel(value) {
        this.$unitLabel.textContent = value;
    }

    constructor(options = DefaultNumberControlOptions) {
        
        super(options.$control);
        this.unitIns = options.unit;
        this.bizName = options.bizName;
        this.asText = options.asText;
        this.asInteger = options.asInteger;
        this.unitLabel = options.unitLabel;
        this.enableComma = options.enableComma;
        this.$control.classList.add(Classes.numberCtr);
        this.$input = options.$control.querySelector('input');
        this.$descBtn = options.$control.querySelector('.decrease-button');
        this.$incrBtn = options.$control.querySelector('.increase-button');

        if (this.asText !== true && this.$incrBtn && this.$descBtn) {
            this.$control.classList.add('with-incr-desc');
        }

        this.min = options.min === undefined || options.min === null ? 0 : options.min;
        this.max = options.max === undefined || options.max === null ? 0 : options.max;
        this.step = options.step === undefined || options.step === null ? 0 : options.step;
        this.precision = options.precision === undefined || options.precision === null ? 0 : options.precision;
        this.handler = options.handler;

        this._createUnitLabel();
        this._bindEvents();
    }

    enable() {

        super.enable();
        this.$control.classList.remove(Classes.disabledNumberCtr);
        this.$input.removeAttribute('readonly');
        this.$input.classList.remove('layui-disabled');
    }

    disable() {

        super.disable();
        this.$control.classList.add(Classes.disabledNumberCtr);
        this.$input.setAttribute('readonly', true);
        this.$input.classList.add('layui-disabled');
    }

    _callback() {
        typeof this.handler == 'function' && this.handler.call(this.unitIns, this.value);
    }

    _createUnitLabel() {

        if (typeof this.unitLabel != 'string' || this.unitLabel.trim().length == 0) {
            return;
        }

        const $input_sib = this.$input.nextElementSibling;
        const $label = document.createElement('span');
        $label.textContent = this.unitLabel;
        $label.classList.add('unit-label');
        this.$unitLabel = $label;
        if ($input_sib) {
            $input_sib.parentElement.insertBefore($label, $input_sib);
        }
        else {
            this.$input.parentElement.appendChild($label);
        }
    }

    _bindEvents() {

        const thisObj = this;

        if (typeof this.handler == 'function') {

            /**
             * 暂时去掉输入控件的实时响应
             */

            // /**
            //  * 人工输入
            //  */
            // this.$input.onkeyup = () => {
            //     thisObj._callback();
            // };
            
            /**
             * 人工引起变更
             */
            this.$input.onchange = () => {
                thisObj._callback();
            };
        }

        /**
         * 仅为一般性数值输入控件，无需作递增|递减操作
         */
        if (!this.$descBtn || !this.$incrBtn) {
            return;
        }

        /**
         * 递减
         */
        this.$descBtn.onclick = () => {

            if (thisObj.isReadonly) {
                
                // helper.showError(this.bizName + '，递减已禁用');
                return;
            }

            let min_val = typeof thisObj.min == 'function' ? thisObj.min() : thisObj.min;
            let max_val = typeof thisObj.max == 'function' ? thisObj.max() : thisObj.max;
            let step_val = typeof thisObj.step == 'function' ? thisObj.step('desc') : thisObj.step;
            let cur = thisObj.value;

            if (step_val == 0) {
                
                helper.showError(`${ thisObj.bizName }，步长信息缺失`);
                return;
            }

            if (cur === min_val) {

                helper.showError(this.bizName + '，已经为最小值');
                return;
            }
            else if (isNaN(cur) || cur < min_val) {

                helper.showError(`${ thisObj.bizName }，最小值为${ min_val }`);
                thisObj.setValue(+min_val);
                thisObj._callback();
            }
            else {

                let expected = Math.max(min_val, cur - step_val);
                let decided = +Math.min(expected, max_val);
                thisObj.setValue(decided == max_val || decided == min_val ? decided : trimByStep(decided, step_val));
                thisObj._callback();
            }
        };
        
        /**
         * 递增
         */
        this.$incrBtn.onclick =() => {

            if (thisObj.isReadonly) {

                // helper.showError(this.bizName + '，递增已禁用');
                return;
            }

            let min_val = typeof thisObj.min == 'function' ? thisObj.min() : thisObj.min;
            let max_val = typeof thisObj.max == 'function' ? thisObj.max() : thisObj.max;
            let step_val = typeof thisObj.step == 'function' ? thisObj.step('inc') : thisObj.step;
            let cur = thisObj.value;

            if (step_val == 0) {

                helper.showError(`${ thisObj.bizName }，步长信息缺失`);
                return;
            }
            
            if (cur === max_val) {

                helper.showError(this.bizName+ '，已经为最大值');
                return;
            }
            else if (isNaN(cur) || cur > max_val) {

                helper.showError(`${ thisObj.bizName }，最大值为${ max_val }`);
                thisObj.setValue(+max_val);
                thisObj._callback();
            }
            else {
                
                let expected = Math.min(max_val, cur + step_val);
                let decided = +Math.max(expected, min_val);
                thisObj.setValue(decided == max_val || decided == min_val ? decided : trimByStep(decided, step_val));
                thisObj._callback();
            }
        };
    }
}

const DefaultSelectControlOptions = { 

    /** 当前交易单元对象 */
    unit: createEmptyUnit(),

    /** 输入控件组 */
    $control: document.createElement('div'),

    /**
     * onchange回调
     * @param {Number} cur_value 
     */
    handler : function(cur_value) { /** not implemented */},
};

class SelectControl extends BaseUserControl {

    get value() {
        return this.$select.value;
    }

    setValue(value) {
        
        this.$select.value = value;
        layui.form.render('select', this.unitIns.formFilter);
        return this;
    }

    constructor(options = DefaultSelectControlOptions) {
        
        super(options.$control);
        this.unitIns = options.unit;
        this.$select = options.$control.querySelector('select');
        this.$layuiSelect = layui.$(this.$select);
        this.handler = options.handler;
        this._bindEvents();
    }

    enable() {

        super.enable();
        this.$layuiSelect.attr('disabled', false);
        layui.form.render('select', this.unitIns.formFilter);
    }

    disable() {

        super.disable();
        this.$layuiSelect.attr('disabled', 'disabled');
        layui.form.render('select', this.unitIns.formFilter);
    }

    /**
     * 填充select选项
     * @param {Array|Object} data 
     * @param {Boolean} selectFirst 是否自动选中第一个选项（默认true）
     */
    fill(data, selectFirst = true) {

        TradingUnit.fillSelects([this.$select], data, selectFirst);
        return this;
    }

    _callback() {
        typeof this.handler == 'function' && this.handler.call(this.unitIns, this.value);
    }

    _bindEvents() {

        const thisObj = this;
        const layform = layui.form;
        const token = 'select-' + helper.makeToken();

        /**
         * 人工选择
         */

        this.$select.setAttribute('lay-filter', token);
        layform.on(`select(${ token })`, (data) => { thisObj._callback(); });
    }
}

/**
 * 用户选择要素
 */
class SelectElement extends SelectControl {

    constructor(options = DefaultSelectControlOptions) {

        super(options);

        let $parentNode = this.$select.parentNode;
        let $addElement = document.createElement("div");
        $addElement.setAttribute('class', 'addInformationContainer');
        $addElement.innerHTML = `<button type="button" class="addInformation-button">+</button>`;
        $parentNode.append($addElement);
        this.$addBtn = $parentNode.lastElementChild;

        this.$enable = true;
        this.$promptTitle = options.promptTitle;

        /**
         * 弹框确定按钮回调
         */
        this.promptHandle = options.promptHandle;

        /**
         * 弹框内容验证规则
         */
        this.promptVarify = options.promptVarify;
       
        this._bindSelectElementEvents();
    }

    disable() {

        super.disable();
        this.$enable = false;
    }

    enable() {

        super.enable();
        this.$enable = true;
    }

    _promptcallback(value) {
        typeof this.promptHandle == 'function' && this.promptHandle.call(this.unitIns, value);
    }

    _bindSelectElementEvents() {

        this.$addBtn.onclick = () => { 

            if (!this.$enable) {
                return;
            }

            layer.prompt({

                formType: 0,
                title: this.$promptTitle,
                value: '',
            }, (value, index, elem) => {

                if (typeof this.promptVarify == 'function') {

                    const varifyStr = this.promptVarify(value);                                                                                                                                                                                                                                                                                                                                         
                    if(typeof varifyStr == 'string') {

                        helper.msg(varifyStr);
                        return;
                    }
                }
                
                this._promptcallback(value);
                layer.close(index);
            });
        }
    }
}

export { TradingUnit, BaseUserControl, NumberControl, SelectControl, SelectElement };
