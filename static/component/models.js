import { dictionary } from './dictionary';
import { helper } from './helper';

function mapEntrustProp(direction, asset_type) {

    let matched = dictionary.directions.find(item => item.code == direction);
    if (matched === undefined) {
        return direction;
    }

    if (typeof matched.bsProp == 'string' || typeof matched.bsProp == 'number') {
        return matched.bsProp;
    }
    else if (typeof matched.bsProp == 'function') {
        return matched.bsProp(direction, asset_type);
    }
    else {
        return direction;
    }
}

class PriceSetting {

    constructor(struc) {

        let minPrice = struc.minPrice;

        /** 交易场所ID */
        this.marketId = struc.tradeMarket;
        /** 交易平台ID */
        this.platform = struc.tradePlat;
        /** 最小价差 */
        this.minStep = +minPrice;
        /** 最小价差，小数位数精度 */
        this.pricePrecision = minPrice.indexOf('.') < 0 ? 0 : minPrice.split('.')[1].length;
    }
}

class VolumeSetting {

    constructor(struc) {

        /** 交易场所ID */
        this.marketId = struc.tradeMarket;
        /** 交易平台ID */
        this.platform = struc.tradePlat;
        /** 交易方向（投管交易方向） */
        this.direction = struc.ps;
        
        // 以下多个字段，该市场 + 该交易方向，体现差异性

        /** 最小交易数量单元 */
        this.minStep = struc.minStep;
        /** 最小交易数量单位 */
        this.minStepUnit = struc.minStepUnit;
        /** 最低交易数量 */
        this.minVolume = struc.minNum;
        /** 市价下，最低交易数量 */
        this.minMarketVolume = struc.minNumMarket;
        /** 最大交易数量 */
        this.maxVolume = struc.maxNum;
        /** 市价下，最大交易数量 */
        this.maxMarketVolume = struc.maxNumMarket;
        /** 最低交易金额 */
        this.minAmount = +struc.minAmt;
        /** 最大交易金额 */
        this.maxAmount = +struc.maxAmt;
    }
}

/**
 * 指令数据结构
 */
class Instruction {

    /**
     * 是否为非法指令
     */
    get isIllegal() {

        /**
         * 指令完整性，业务逻辑 & 数理逻辑，验证
         */

        return !this.isApply 
            && !this.isBasket 
            && !this.isConstr 
            && !this.isFuture 
            && !this.isOption 
            && !this.isPledge 
            && !this.isRegular 
            && !this.isRepo 
            && !this.isScale;
    }

    /**
     * 是否允许放弃
     */
    get allow2Release() {
        return this.isReceived && this.finishedQuantity == 0;
    }

    /**
     * 是否为，待接收
     */
    get isPending() {
        return this.instrucStatus == dictionary.instatus.pending.code;
    }

    /**
     * 是否为，已接收
     */
    get isReceived() {
        return this.instrucStatus == dictionary.instatus.received.code;
    }

    /**
     * 是否为，已退回
     */
    get isRejected() {
        return this.instrucStatus == dictionary.instatus.rejected.code;
    }

    /**
     * 是否为，已关闭
     */
    get isClosed() {
        return this.instrucStatus == dictionary.instatus.closed.code;
    }

    /**
     * 是否为，已撤回
     */
    get isRecalled() {
        return this.instrucStatus == dictionary.instatus.recalled.code;
    }

    /**
     * 是否为已完成状态
     */
    get isCompleted() {
        return this.progress == 1 || this.instrucStatus == dictionary.instatus.completed.code;
    }
    
    /**
     * 是否指令价格为限价，交易员可以更优价格下单
     */
    get isLimitedPrice() {
        return typeof this.price == 'number' && this.price > 0 && this.priceMode == dictionary.priceMode.limited.code;
    }

    /**
     * 是否指令价格被固定，不允许后期修改
     */
    get isFixedPrice() {
        return typeof this.price == 'number' && this.price >= 0 && this.priceMode == dictionary.priceMode.fixed.code;
    }

    /**
     * 是否指令价格未指定，由交易员自行决定（涨跌停范围内）
     */
    get isMarketPrice() {
        return this.priceMode == dictionary.priceMode.market.code;
    }

    /** 是否指令交易标的，为上交所 */
    get isShSecMarket() {
        return this.marketId == dictionary.market.shsec.code;
    }

    /** 是否指令交易标的，为深交所 */
    get isSzSecMarket() {
        return this.marketId == dictionary.market.szsec.code;
    }

    /** 是否指令交易标的，为沪市科创板 */
    get isShKcbDept() {
        return this.isShSecMarket && typeof this.stockCode == 'string' && this.stockCode.startsWith('688');
    }

    /** 是否指令交易标的，为深市创业板 */
    get isSzCybDept() {
        return this.isSzSecMarket && typeof this.stockCode == 'string' && this.stockCode.startsWith('300');
    }

    /** 是否指令交易标的，为上期所 */
    get isShFutureMarket() {
        return this.marketId == dictionary.market.shfe.code;
    }

    /** 是否指令交易标的，为大商所 */
    get isDceFutureMarket() {
        return this.marketId == dictionary.market.dce.code;
    }

    constructor(struc) {

        let stock_code = struc.finprodMarketId;
        let stock_name = struc.finprodAbbr;
        let entrust_volume = struc.entrustNum;
        let entrust_amount = struc.entrustAmt;

        /**
         * 设置价格步长、数量步长、最大（小）买卖单位、最大（小）买卖金额
         */
        this._setStockInfo(struc.minPriceAndMinTrdUnitLimitBean);

        /**
         * 投管系统，命令为 left 字样，含义为已完成
         */
        let latest_finished = struc.entrustLeftAmt;
        let platform = struc.tradePlat;
        let asset_type = struc.assetType;
        let first_repo_direction = struc.firstRepoPs;
        let direction = this._calculateDirection(struc.ps, first_repo_direction);
        let direction_info = dictionary.directions.find(x => x.code == direction);
        let repo_type = struc.assetType1;
        let repo_operation = this._calculateRepOperation(struc.ps, first_repo_direction);
        let frozen_quantity = struc.frozenQuantity;

        /** 指令ID(主键) */
        this.id = struc.entrustId;
        /** 组合代码 */
        this.portfolioId = struc.portfolioId;
        /** 组合名称 */
        this.portfolioName = struc.portfolioName;


        /** 金融产品代码 */
        this.finprodId = struc.finprodId;
        /** 场内证券代码 */
        this.stockCode = stock_code;
        /** 金融产品简称 */
        this.stockName = stock_name;
        /** 用于显示的合约完整名称 */
        this.stockCodeName = stock_code ? `${ stock_code } | ${ stock_name }` : undefined;
        /** 用于显示的目标合约完整名称（仅基金交换有效） */
        this.targetStockCodeName = this.targetStockCode ? `${ this.targetStockCode } | ${ this.targetStockName }` : undefined;
        /** 金融产品全称 */
        this.stockFullName = struc.finprodName;
        /** 目标金融产品代码（仅基金转换有效） */
        this.targetFinprodId = struc.tarFinprodId;
        /** 目标金融产品市场代码（仅基金转换有效） */
        this.targetStockCode = struc.tarinprodMarketId;
        /** 目标金融产品简称（仅基金转换有效） */
        this.targetStockName = struc.tarinprodAbbr;


        /** 网点代码 */
        this.acctNo = struc.acctNo;
        /** 证券账户代码 */
        this.accountId = struc.secAcctId;
        /** 资金账号 */
        this.tradeAccountId = struc.busiAcctNo;
        /** 股东代码 */
        this.stockholderId = struc.stockHolderNo;
        /** 证券账户名称 */
        this.accountName = struc.secAcctName;
        /** 户名 */
        this.accountBelongerName = struc.acctName;


        /** 资产类型 */
        this.assetType = asset_type;
        /** 回购类型 */
        this.repoType = repo_type;
        /** 协议回购属性（操作类型） - 仅针对协议回购有效 */
        this.repoOperation = repo_operation;
        /** 交易所ID */
        this.marketId = struc.tradeMarket;
        /** 交易平台ID */
        this.tradePlat = platform;
        /** 投管交易方向 */
        this.direction = direction;
        /** 投管交易方向名称 */
        this.directionName = (direction_info || {}).mean;
        /** 交易层面，买卖标识（恒生交易方向） */
        this.bsFlag = (direction_info || {}).bsFlag;
        /** 交易层面，买卖属性 */
        this.bsProp = mapEntrustProp(direction, asset_type);
        /** 价格模式ID */
        this.priceMode = struc.priceMode;
        /** 币种 */
        this.ccy = struc.ccy;
        /** 交易对手 */
        this.counterId = struc.counterId;
        /** 交易对手名称 */
        this.counterName = struc.counterName;
        /** 交易对手席位 */
        this.counterSeat = struc.counterSeat;
        /** 对手方交易员 */
        this.counterTrader = struc.counterTrader;
        /** 对手方联系方式 */
        this.counterTel = struc.counterInfo;
        /** 对手方交易商代码 */
        this.counterDealerId = struc.counterDealerId;


        /** 约定号 */
        this.appointmentNumber = struc.appointmentNumber;
        /** 成交编号 */
        this.dealNo = struc.dealNo;
        /** 初始交易编号 */
        this.trdMatchId = struc.trdMatchId;
        /** 交易所请求号 */
        this.exchangeRequestId = struc.quoterefId;


        /** 指令有效期，开始日 */
        this.startDate = struc.vdate;
        /** 指令有效期，结束日 */
        this.endDate = struc.mdate;
        /** 期限天数 */
        this.termDays = struc.termDays;
        /** 期限天数2 */
        this.termDays2 = struc.termDays2;
        /** 实际占款天数 */
        this.occupyDays = struc.capDays;
        /** 质押式回购，首次结算日 */
        this.firstSettleDate = typeof struc.vPayDate == 'number' ? helper.formatDateTime(struc.vPayDate, 'yyyy-MM-dd') : struc.vPayDate;
        /** 质押式回购，到期结算日 */
        this.maturityDate = typeof struc.mPayDate == 'number' ? helper.formatDateTime(struc.mPayDate, 'yyyy-MM-dd') : struc.mPayDate;
        /** 质押式回购，利息 */
        this.interest = struc.mintamt;
        /** 质押式回购，到期结算金额 */
        this.maturitySettleAmount = struc.mTradeAmt;
        /** 补充协议 */
        this.remark = struc.remark;


        /** 指令总数量（按数量下单） */
        this.volume = typeof entrust_volume == 'number' ? parseInt(entrust_volume) : 0;
        /** 指令总金额（按金额下单） */
        this.amount = typeof entrust_amount == 'number' ? +entrust_amount.toFixed(2) : 0;
        /** 是否，按数量交易 */
        this.isByVolume = this.volume > 0;
        /** 是否，按金额交易 */
        this.isByAmount = !this.isByVolume;
        /** 已完成数量|金额（适配数量和金额两种场景） */
        this.finishedQuantity = (this.isByVolume > 0 ? parseInt(latest_finished) : latest_finished) || 0;
        /** 冻结数量数量|金额（适配数量和金额两种场景） */
        this.frozenQuantity = (this.isByVolume > 0 ? parseInt(frozen_quantity) : frozen_quantity) || 0;
        /** 最低成交金额 */
        this.minAmt = struc.minAmt;
        /** 委托价格 */
        this.price = struc.entrustPrice;
        /** 全价（全价，只针对债券有效） */
        this.fullPrice = struc.fullPrice;
        /** 委托状态（指令状态） */
        this.instrucStatus = struc.entrustStatus;
        /** 投资经理ID */
        this.managerId = struc.invManagerId;
        /** 交易员ID */
        this.tradeId = struc.tradeId;
        /** 本方交易员 */
        this.ourTrader = struc.ourTrader;
        /** 交易员姓名 */
        this.traderName = struc.traderName;
        /** 委托日期 */
        this.tradeDate = struc.tradeDate;
        /** 清算速度 */
        this.settleSpeed = struc.settleSpeed;
        /** 申购类型 */
        this.purchType = struc.purchType;
        /** 审批标志 */
        this.approverFlag = struc.approverFlage == '1';
        /**申报类型（大宗交易） */
        this.dealMode = struc.dealMode;
        /** 回购质押券列表 */
        this.pledgeList = this._extractPledges(struc.pledgeList);
        /** 篮子交易项列表 */
        this.basketList = this._extractBaskets(struc.basketList);
        /** 提取转换数量和金额交易信息 */
        this._progressize();
        /** 特殊化处理 */
        this._specialize();

        /** 债券面额 */
        let bondPaperValue = 100;
        /** 转股数量（债转股）*/
        this.conNum = Math.floor(this.leftVolume * bondPaperValue / this.price);
        /** 标准券单张面额 */
        let standardBondPaperValue = 100;
        /** 标准券数量 */
        this.standardBondVolume = Math.floor(this.leftVolume * this.price / standardBondPaperValue);

        if (this.isFuture) {

            /**重新设置交易方向*/
            this.direction = struc.derivativeBsDir;
            /** 重新设置交易层面，买卖标识（恒生交易方向） */
            let direction_info = dictionary.directions.find(x => x.code == struc.derivativeBsDir);
            this.bsFlag = (direction_info || {}).bsFlag;
            /** 投机套保标志*/
            this.hedgeFlag = '';
            /**开平标志*/
            this.offsetFlag = struc.derivativeOcFlag =='01' ? '0' : '1';
            
        }
    }

    /**
     * 设置合约价格，小数位数精度，和最小变动步长
     * @param {{ errorCode: Number, errorMsg: String, stockCode: String, minPriceList: [], minTrdUnitLimitList: [] }} bean
     */
    _setStockInfo(bean) {

        if (!bean || bean.errorCode != 0) {

            /**
             * 是否合约信息缺失
             */
            this.isStockInfoAbsent = true;
            console.error('no stock info attached for instruction', bean.errorMsg, this);
        }

        /** 合约价格步长信息（视所在市场而不同） */
        this.priceSettings = this.isStockInfoAbsent ? [] : bean.minPriceList.map(item => new PriceSetting(item));

        /** 合约数量、金额步长信息（视所在市场而不同） */
        this.volumeSettings = this.isStockInfoAbsent ? [] : bean.minTrdUnitLimitList.map(item => new VolumeSetting(item));

        /** 是否为全价交易 */
        this.isFullPrice = bean ? bean.isFullPrice ? bean.isFullPrice : 'N' : "N";

        /** 合约乘数，期货计算时需要 */
        if (!this.isStockInfoAbsent) {
            this.volumeMultiple = bean.volumeMultiple ? bean.volumeMultiple : 1;
        }
        else {
            this.volumeMultiple = 1;
        }
    }

    /**
     * 查询合约价格步长
     * @param {String} platformId 交易平台ID
     * @param {String} dataType 价格设置成员变量
     */
    _queryStockPriceSetting(platformId, dataType) {

        let is4Step = dataType == 'step';
        
        if (this.dictPriceSetting === undefined) {
            this.dictPriceSetting = {};
        }

        let key = platformId;
        if (this.dictPriceSetting[key] === undefined) {
            this.dictPriceSetting[key] = this.priceSettings.find(item => item.platform == platformId);
        }

        let matched = this.dictPriceSetting[key];
        if (matched instanceof PriceSetting) {
            return is4Step ? matched.minStep : matched.pricePrecision;
        }
        
        if (this.isFuture && this.priceSettings.length > 0) {
            return is4Step ? this.priceSettings[0].minStep : this.priceSettings[0].pricePrecision;
        }
        
        return is4Step ? dictionary.assetType.option.priceStep : dictionary.assetType.option.pricePrecision;
    }

    /**
     * 查询合约价格步长
     * @param {String} platformId 交易平台ID
     */
    queryStockPriceStep(platformId) {
        return this._queryStockPriceSetting(platformId, 'step');
    }

    /**
     * 查询合约价格小数精度（展示时，需保留的小数位数）
     * @param {String} platformId 交易平台ID
     */
    queryStockPricePrecision(platformId) {
        return this._queryStockPriceSetting(platformId, 'precision');
    }

    /**
     * 查询合约数量步长
     * @param {String} platformId 交易平台ID
     * @param {String} direction 投管指令交易方向
     */
    queryStockVolumeStep(platformId, direction) {

        if (this.dictVolumeStep === undefined) {
            this.dictVolumeStep = {};
        }

        let key = `${platformId}/${direction}`;
        if (this.dictVolumeStep[key] === undefined) {
            this.dictVolumeStep[key] = this.volumeSettings.find(item => item.platform == platformId && item.direction == direction);
        }

        let matched = this.dictVolumeStep[key];
        if (matched instanceof VolumeSetting) {
            return matched.minStep;
        }

        if (this.isFuture && this.volumeSettings.length > 0 ) {
            return this.volumeSettings[0].minStep;
        }
        
        return dictionary.assetType.option.volumeStep;
    }

    /**
     * 查询合约数量步长、交易数量、交易金额边界设置
     * @param {String} platformId 交易平台ID
     * @param {String} direction 投管指令交易方向
     */
    queryStockVolumeSetting(platformId, direction) {
        return this.volumeSettings.find(item => item.platform == platformId && item.direction == direction);
    }

    /**
     * 当为协议回购的非首期类型的，其他5种回购操作类型，则将对应的原始首期回购的方向，作为现行方向
     * @param {*} direction 
     * @param {*} first_repo_direction 首期的交易方向
     */
    _calculateDirection(direction, first_repo_direction) {
        
        const oper = dictionary.repoOperation;
        if ([oper.renew, oper.terminate, oper.precede, oper.change, oper.release].some(item => item.code == direction)) {
            return first_repo_direction;
        }
        else {
            return direction;
        }
    }

    /**
     * 计算协议回购的操作类型
     * @param {*} direction 
     * @param {*} first_repo_direction 首期的交易方向
     */
    _calculateRepOperation(direction, first_repo_direction) {
        
        const dir = dictionary.direction;
        const oper = dictionary.repoOperation;

        if ([dir.positiveRepo, dir.reversedRepo].some(item => item.code == direction)) {
            return oper.establish.code;
        }
        else if ([oper.renew, oper.terminate, oper.precede, oper.change, oper.release].some(item => item.code == direction)) {
            return direction;
        }
        else {
            return undefined;
        }
    }

    /**
     * @param {Array<PledgedInstrument>} strucs 
     */
    _extractPledges(strucs) {
        return strucs instanceof Array ? strucs.map(x => new PledgedInstrument(this, x)) : [];
    }

     /**
     * @param {Array<BasketStock>} strucs 
     */
    _extractBaskets(strucs) {
        return strucs instanceof Array ? strucs.map(x => new BasketStock(x)) : [];
    }

    _progressize() {

        let byVolume = this.isByVolume;
        let byAmount = this.isByAmount;
        let amount = this.amount;
        let finished = this.finishedQuantity;
        let frozen = this.frozenQuantity;

        /** 按数量下单，剩余可用数量 */
        this.leftVolume = byVolume ? Math.max(0, this.volume - finished - frozen) : 0;
        /** 按金额下单，剩余可用金额 */
        this.leftAmount = byAmount ? +Math.max(0, amount - finished - frozen).toFixed(2) : 0;
        /** 指令进度（0 ~ 1） */
        this.progress = Math.min(1, byVolume ? (finished + frozen) / (this.volume || 1) : (finished + frozen) / (this.amount || 1));        
        /** 成交进度（0 ~ 1） */
        this.dealProgress = Math.min(1, byVolume ? finished / (this.volume || 1) : finished / (this.amount || 1));
    }

    _specialize() {

        /**
         * 固收全价容错处理
         */
        if (this.isConstr && typeof this.fullPrice != 'number') {
            this.fullPrice = this.price;
        }
       
    }
    
    /**
     * 是否交易平台信息缺失
     */
    isPlatformAbsent() {
        return helper.isNone(this.tradePlat);
    }

    /**
     * 是否为，买卖股债基
     */
    isBuySellStockBondFund() {

        let ast = dictionary.assetType;
        let dir = dictionary.direction;

        return [ast.stock, ast.bond, ast.fund].some(item => item.code == this.assetType)
                && [dir.buy, dir.sell].some(item => item.code == this.direction);
    }

    /**
     * 是否为，买卖债券
     */
    isBuySellBond() {

        let dir = dictionary.direction;
        return this.assetType == dictionary.assetType.bond.code
                && [dir.buy, dir.sell].some(item => item.code == this.direction);
    }

    /**
     * 是否为，质押券竞价式（正逆）回购
     */
    isCompeteRepo() {

        let dir = dictionary.direction;
        return this.assetType == dictionary.assetType.standardVoucher.code
                && this.repoType == dictionary.repoType.compete.code
                && [dir.positiveRepo, dir.reversedRepo].some(item => item.code == this.direction);
    }

    /**
     * 是否为，质押券协议（正逆）回购
     */
    isProtocolRepo() {

        let dir = dictionary.direction;
        return this.assetType == dictionary.assetType.standardVoucher.code
                && this.repoType == dictionary.repoType.protocol.code
                && [dir.positiveRepo, dir.reversedRepo].some(item => item.code == this.direction);
    }

    /**
     * 是否为竞价类的常见场景
     */
    isCommonCondition() {

        return (this.isBuySellStockBondFund() && helper.isNotNone(this.stockCode) || this.isCompeteRepo())
            && (this.tradePlat == dictionary.platform.hscompete.code || this.isPlatformAbsent());
    }

    /**
     * 是否为期权行权
     */
    isOptionExercise() {
        return this.assetType == dictionary.assetType.option.code && this.direction == dictionary.direction.exercise.code;
    }

    /**
     * 判断另一指令，是否和当前指令互为公平交易
     * @param {Instruction} other 另一指令
     */
    isOfEqualSibling(other) {

        let thisObj = this;

        return ((other.isRegular && thisObj.isRegular) || (other.isFuture && thisObj.isFuture))
            && other.stockCode == thisObj.stockCode
            && other.direction == thisObj.direction
            && other.tradeId == thisObj.tradeId
            && (other.isReceived || other.isPending)
            && !other.isCompleted;
    }

    /**
     * 是否支持，普通交易
     */
    get isRegular() {
        return this.isCommonCondition();
    }

    /**
     * 是否支持，篮子交易
     */
    get isBasket() {
        return helper.isNone(this.stockCode) && this.basketList.length > 0;
    }

    /**
     * 是否支持，申购类快速交易
     */
    get isApply() {

        let dir = dictionary.direction;
        let ast = dictionary.assetType;
        let assetType = this.assetType;
        let direction = this.direction;

        return (this.tradePlat == dictionary.platform.hscompete.code || this.isPlatformAbsent())
                && (assetType == ast.stock.code && [dir.apply, dir.allocateShare].some(item => item.code == direction)
                    || assetType == ast.bond.code && [dir.issue, dir.resale, dir.bond2Stock, dir.allocateBond, dir.apply].some(item => item.code == direction)
                    || assetType == ast.fund.code && direction == dir.subscribe.code)
                || this.isOptionExercise();
    }

    /**
     * 是否支持，质押出入库交易
     */
    get isPledge() {
        
        let dir = dictionary.direction;
        let ast = dictionary.assetType;

        return (this.direction == dir.seal.code && this.assetType == ast.bond.code
                || this.direction == dir.unseal.code && this.assetType == dictionary.assetType.standardVoucher.code)
                && (this.tradePlat == dictionary.platform.hscompete.code || this.isPlatformAbsent());
    }

    /**
     * 是否支持，固定收益交易
     */
    get isConstr() {
        return this.isBuySellBond() && this.tradePlat == dictionary.platform.shConstReturn.code;
    }

    /**
     * 是否支持，大宗交易
     */
    get isScale() {

        let plat = dictionary.platform;
        return (this.isBuySellStockBondFund() || this.isCompeteRepo())
                && [plat.shScale, plat.szProtocol].some(item => item.code == this.tradePlat);
    }

    /**
     * 是否支持，协议回购交易
     */
    get isRepo() {
        return this.isProtocolRepo();
    }

    /**
     * 是否支持，期货交易
     */
    get isFuture() {
        return this.assetType == dictionary.assetType.future.code;
    }

    /**
     * 是否支持，期货交易
     */
    get isOption() {
        return this.assetType == dictionary.assetType.option.code && !this.isOptionExercise();
    }
}

/**
 * 回购质押券
 */
class PledgedInstrument {

    /**
     * @param {Instruction} instruction 
     * @param {*} struc 
     */
    constructor(instruction, struc) {

        /** 下挂于指令的ID */
        this.id = struc.entrustId;
        /** 质押券代码 */
        this.pledgedStockCode = struc.finprodMarketId;
        /** 质押券名称 */
        this.pledgedStockName = struc.finprodAbbr;
        /** 质押券面额 */
        this.paperValue = +parseFloat(struc.pledgeFaceValue).toFixed(2);
         /** 已使用质押券数量 */
        this.usedPledgeNumber = parseInt(struc.usedPledgeNumber);
        /** 未使用质押券总数量 */
        this.totalVolume = parseInt(struc.pledgeNumber) - parseInt(struc.usedPledgeNumber);
        /** 允许最劣质押率（该值已乘以100） ~ 原始数值0 ~ 1，转换后0 ~ 100 */
        this.pledgeRatio = helper.safeMul(+parseFloat(struc.pledgeRatio).toFixed(4), 100);
        /** 质押金额（冗余字段，计算量 = 数量 * 质押率 * 面额） */
        this.totalAmount = parseFloat(struc.pledgeAmt) -  parseInt(struc.usedPledgeNumber) * parseFloat(struc.pledgeRatio) * parseFloat(struc.pledgeFaceValue);
        /** 交易所ID */
        this.unuse_tradeMarket = struc.tradeMarket;
        /** 质押券市场代码 */
        this.unuse_finprodMarketId = struc.finprodId;

        /**
         * 是否具备原质押券信息（仅以其中某个字段作为判断依据，即可）
         */
        let hasOldMembers = helper.isNotNone(struc.oldPledgeNumber);

        // 以下为原质押券信息

        if (hasOldMembers) {

            /** 质押券代码 */
            this.oldPledgedStockCode = struc.oldFinprodMarketId;
            /** 质押券名称 */
            this.oldPledgedStockName = struc.oldFinprodAbbr;
            /** 质押券面额 */
            this.oldPaperValue = +parseFloat(struc.oldPledgeFaceValue).toFixed(2);
            /** 质押券总数量 */
            this.oldTotalVolume = parseInt(struc.oldPledgeNumber);
            /** 允许最劣质押率 ~ 原始数值0 ~ 1，转换后0 ~ 100 */
            this.oldPledgeRatio = helper.safeMul(+parseFloat(struc.oldPledgeRatio).toFixed(4), 100);
            /** 质押金额（冗余字段，计算量 = 数量 * 质押率 * 面额） */
            this.oldTotalAmount = parseFloat(struc.oldPledgeAmt);

            /** 交易所ID */
            this.unuse_oldTradeMarket = struc.oldTradeMarket;
            /** 质押券市场代码 */
            this.unuse_oldFinprodMarketId = struc.oldFinprodId;
        }
    }
}

/**
 * 篮子交易项
 */
class BasketStock {

    /**
     * @param {*} struc 
     */
    constructor(struc) {

        this.id = struc.stockCode;
        this.stockCode = struc.stockCode;
        this.stockName = struc.stockName;
        this.leftVolume = struc.leftVolume;
        this.volume = struc.volume;
        this.leftAmount = struc.leftAmount;
        this.amount = struc.amount;
    }
}

/**
 * 固定收益行情
 */
class ConstrQuote {

    constructor(struc) {

        this.id = struc.orderNo;

        /**
         * 订单编号
         */
        this.orderNo = struc.orderNo;

        /**
         * 证券代码
         */
        this.stockCode = struc.stockCode;

        /**
         * 证券名称
         */
        this.stockName = struc.stockName;
        
        /**
         * 交易方向
         */
        this.direction = struc.entrustBs;

        /**
         * 报价数量
         */
        this.volume = struc.entrustVolume;

        /**
         * 净价价格
         */
        this.netPrice = struc.entrustPrice;

        /**
         * 全价价格
         */
        this.fullPrice = struc.fullPrice;

        /**
         * 到期收益率
         */
        this.yieldRate = struc.expireIncomeRate;

        /**
         * 申报时间
         */
        this.reportTime = struc.reportTime;

        /**
         * 销售商
         */
        this.agencyName = struc.agencyName;

        /**
         * 应记利息
         */
        this.interest = struc.interest;
    }
}

/**
 * 上行数据对象基类
 */
class UpingDto {

    constructor(struc) {

        this.entrustProp = struc.entrustProp;
        this.entrustBs = struc.entrustBs;
    }
}

/**
 * 下行数据对象基类
 */
class DowningDto {

    constructor(struc) {

        this.assetType = struc.assetType;
        this.entrustProp = struc.entrustProp;
        this.direction = struc.entrustBs;
    }
}

/**
 * 订单结构
 */
class Order extends DowningDto {

    constructor(struc) {

        super(struc);

        this.id = struc.id;
        this.instructionId = struc.instructionId;
        this.portfolioId = struc.portfolioId;
        this.portfolioName = struc.portfolioId || struc.portfolioName;
        this.userId = struc.userId;
        this.username = struc.username;
        this.accountId = struc.accountId;
        this.financeAccount = struc.financeAccount;
        this.accountName = struc.accountName;
        this.algorithmId = struc.algorithmId;
        this.relativeOrderId = struc.relativeOrderId;
        this.stockCode = struc.stockCode;
        this.stockName = struc.stockName;
        this.orderStatus = struc.orderStatus;
        this.entrustVolume = struc.entrustVolume;
        this.orderVolume = struc.orderVolume;
        this.orderPrice = struc.orderPrice;
        this.entrustPrice = struc.entrustPrice;
        this.orderBalance = struc.orderBalance;
        this.frozenBalance = struc.frozenBalance;
        this.frozenVolume = struc.frozenVolume;
        this.tradedBalance = struc.tradedBalance;
        this.tradedVolume = struc.tradedVolume;
        this.tradedPrice = struc.tradedPrice;
        this.cancelVolume = struc.cancelVolume;
        this.errorCode = struc.errorCode;
        this.errorMsg = struc.errorMsg;
        this.tradingDay = struc.tradingDay;
        this.ipMac = struc.ipMac;
        this.remark = struc.remark;
        this.createTime = struc.createTime;
        this.updateTime = struc.updateTime;
        this.entrustBalance  = struc.entrustBalance;

        /**
         * 扩展属性
         */

        this.totalAmount = this.orderVolume * this.orderPrice;
        this.isCompleted = dictionary.orderStatuses.findIndex(x => x.isCompleted && x.code == this.orderStatus) >= 0;
    }
}

/**
 * 委托基础结构
 */
class BaseEntrust extends DowningDto {

    constructor(struc) {

        super(struc);

        this.id = struc.id;
        this.parentOrderId = struc.parentOrderId;
        this.operateUser = struc.operateUser;
        this.instructionId = struc.instructionId;
        this.portfolioId = struc.portfolioId;
        this.portfolioName = struc.portfolioName;
        this.userId = struc.userId;
        this.username = struc.username;
        this.accountId = struc.accountId;
        this.financeAccount = struc.financeAccount;
        this.accountName = struc.accountName;
        this.market = struc.market;
        this.stockCode = struc.stockCode;
        this.stockName = struc.stockName;
        this.entrustStatus = struc.entrustStatus;
        this.entrustBalance = struc.entrustBalance;
        this.entrustVolume = struc.entrustVolume;
        this.entrustPrice = struc.entrustPrice;
        this.frozenBalance = struc.frozenBalance;
        this.frozenVolume = struc.frozenVolume;
        this.tradedBalance = struc.tradedBalance;
        this.tradedVolume = struc.tradedVolume;
        this.tradedPrice = struc.tradedPrice;
        this.cancelVolume = struc.cancelVolume;
        this.errorCode = struc.errorCode;
        this.errorMsg = struc.errorMsg;
        this.reportTime = struc.reportTime;
        this.tradeTime = struc.tradeTime;
        this.cancelTime = struc.cancelTime;
        this.localEntrustId = struc.localEntrustId;
        this.brokerEntrustId = struc.brokerEntrustId;
        this.origEntrustId = struc.origEntrustId;
        this.createTime = struc.createTime;
        this.updateTime = struc.updateTime;
        this.tradingDay = struc.tradingDay;
        this.ipMac = struc.ipMac;
        this.remark = struc.remark;

        /** 已完成进度（0 ~ 1） */
        this.progress = Math.min(1, parseInt(this.cancelVolume + this.tradedVolume) / (this.entrustVolume || 1));

        /**
         * 扩展属性
         */
        this.isCompleted = dictionary.entrustStatuses.some(x => x.isCompleted && x.code == this.entrustStatus);
    }
}

/**
 * 普通委托结构
 */
class Entrust extends BaseEntrust {

    constructor(struc) {

        super(struc);

        this.priceMode = struc.priceMode;
        this.managerId = struc.managerId;
        this.tradeId = struc.tradeId;
        this.entrustDate = struc.entrustDate;
        this.integratedEntrustId = struc.integratedEntrustId;
        this.offsetFlag = struc.offsetFlag;
        this.hedgeFlag = struc.hedgeFlag;
    }
}

/**
 * 大宗交易委托结构
 */
class ScaleEntrust extends BaseEntrust {

    constructor(struc) {

        super(struc);
        
        this.discount = struc.discount;
        this.transCode = struc.transCode;
        this.expireYearRate = struc.expireYearRate;
        this.pretermYearRate = struc.pretermYearRate;
        this.liaisonName = struc.liaisonName;
        this.liaisonTel = struc.liaisonTel;
        this.propSeatNo = struc.propSeatNo;
        this.contractId = struc.contractId;
        this.backDate = struc.backDate;
        this.compactTerm = struc.compactTerm;
        this.backBalance = struc.backBalance;
        this.origSerialNo = struc.origSerialNo;
        this.reductionType = struc.reductionType;
    }
}

/**
 * 成交数据结构
 */
class Exchange extends DowningDto {

    constructor(struc) {

        super(struc);

        this.id = struc.id;
        this.brokerTradeId = struc.brokerTradeId;
        this.entrustId = struc.entrustId;
        this.parentOrderId = struc.parentOrderId;
        this.instructionId = struc.instructionId;
        this.portfolioId = struc.portfolioId;
        this.accountId = struc.accountId;
        this.financeAccount = struc.financeAccount;
        this.accountName = struc.accountName;
        this.market = struc.market;
        this.stockCode = struc.stockCode;
        this.stockName = struc.stockName;
        this.tradedBalance = struc.tradedBalance;
        this.tradedVolume = struc.tradedVolume;
        this.tradedPrice = struc.tradedPrice;
        this.clearBalance = struc.clearBalance;
        this.tradingDay = struc.tradingDay;
        this.tradeTime = struc.tradeTime;
        this.localEntrustId = struc.localEntrustId;
        this.brokerEntrustId = struc.brokerEntrustId;
        this.discount = struc.discount;
        this.transCode = struc.transCode;
        this.propSeatNo = struc.propSeatNo;
        this.tradeType = struc.tradeType;
        this.createTime = struc.createTime;
        this.updateTime = struc.updateTime;

        this.priceMode = struc.priceMode;
        this.managerId = struc.managerId;
        this.tradeId = struc.tradeId;
        this.entrustDate = struc.entrustDate;

        this.offsetFlag = struc.offsetFlag;
        this.hedgeFlag = struc.hedgeFlag;
    }
}

/**
 * 普通订单信息
 */
class OrderInfo extends UpingDto {

    constructor(struc) {

        super(struc);

        this.instructionId = struc.instructionId;
        this.portfolioId = struc.portfolioId;
        this.userId = struc.userId;
        this.username = struc.username;
        this.accountId = struc.accountId;
        this.stockCode = struc.stockCode;
        this.entrustVolume = struc.entrustVolume;
        this.entrustPrice = struc.entrustPrice;
        this.fullPrice = struc.fullPrice;
        this.expireYearRate = struc.expireYearRate;
        this.pledgeRatio = struc.pledgeRatio;
        this.conNum = struc.conNum;
        this.tipMsg = struc.tipMsg;

        if (struc.offsetFlag || struc.hedgeFlag) {
            
            this.offsetFlag = struc.offsetFlag;
            this.hedgeFlag = struc.hedgeFlag;
        }
    }
}

/**
 * 算法订单信息
 */
class AlgoOrderInfo extends UpingDto {

    constructor(struc) {

        super(struc);

        this.instructionId = struc.instructionId;
        this.portfolioId = struc.portfolioId;
        this.userId = struc.userId;
        this.username = struc.username;
        this.accountId = struc.accountId;
        this.stockCode = struc.stockCode;
        this.entrustVolume = struc.entrustVolume;
        this.algoType = struc.algoType;
        this.startTime = struc.startTime;
        this.endTime = struc.endTime;
        this.isEndTimeOverRunnable = struc.isEndTimeOverRunnable;
        this.isExtremePriceAcceptable = struc.isExtremePriceAcceptable;
        this.tipMsg = struc.tipMsg;
    }
}

/**
 * 篮子订单信息
 */
class BasketOrderInfo extends UpingDto {

    constructor(struc) {

        super(struc);

        this.instructionId = struc.instructionId;
        this.portfolioId = struc.portfolioId;
        this.userId = struc.userId;
        this.username = struc.username;
        this.accountId = struc.accountId;
        this.algoType = struc.algoType;
        this.startTime = struc.startTime;
        this.endTime = struc.endTime;
        this.isEndTimeOverRunnable = struc.isEndTimeOverRunnable;
        this.isExtremePriceAcceptable = struc.isExtremePriceAcceptable;
        this.basketList = struc.basketList;
        this.tipMsg = struc.tipMsg;
        
    }
}

/**
 * 期货订单信息
 */
class FutureOrderInfo extends UpingDto {

    constructor(struc) {

        super(struc);

        this.instructionId = struc.instructionId;
        this.portfolioId = struc.portfolioId;
        this.userId = struc.userId;
        this.username = struc.username;
        this.accountId = struc.accountId;
        this.positionEffect = struc.positionEffect;
        this.priceMode = struc.priceMode;
        this.stockCode = struc.stockCode;
        this.entrustVolume = struc.entrustVolume;
        this.entrustPrice = struc.entrustPrice;
        this.tipMsg = struc.tipMsg;
        this.offsetFlag = struc.offsetFlag;
        this.hedgeFlag = struc.hedgeFlag;
    }
}

/**
 * 期权订单信息
 */
class OptionOrderInfo extends UpingDto {

    constructor(struc) {

        super(struc);

        this.instructionId = struc.instructionId;
        this.portfolioId = struc.portfolioId;
        this.userId = struc.userId;
        this.username = struc.username;
        this.accountId = struc.accountId;
        this.priceMode = struc.priceMode;
        this.stockCode = struc.stockCode;
        this.entrustVolume = struc.entrustVolume;
        this.entrustPrice = struc.entrustPrice;
        this.tipMsg = struc.tipMsg;
    }
}

class BatchOrderDetail {

    constructor(struc) {

        this.id = struc.id;
        this.orderId = struc.orderId;
        this.priceMode = struc.priceMode;
        this.beginPrice = struc.beginPrice;
        this.priceOffset = struc.priceOffset;
        this.beginVolume = struc.beginVolume;
        this.volumeOffset = struc.volumeOffset;
        this.entrustTimes = struc.entrustTimes;
        this.totalVolume = struc.totalVolume;
        // 每次间隔时间（单位，秒）
        this.stepTime = struc.stepTime;
        this.tipMsg = struc.tipMsg;
    }
}

/**
 * 批量订单信息
 */
class BatchOrderInfo extends OrderInfo {

    /**
     * @param {*} struc 
     * @param {BatchOrderDetail} detail_struc 
     */
    constructor(struc, detail_struc) {

        super(struc);
        this.batchInfo = new BatchOrderDetail(detail_struc || {});
    }

    /**
     * @param {BatchOrderDetail} detail 
     */
    setDetail(detail) {
        helper.extend(this.batchInfo, detail);
    }
}

/**
 * 大宗交易上行订单信息
 */
class ScaleOrderInfo extends UpingDto {

    constructor(struc) {

        super(struc);

        this.accountId = struc.accountId;
        this.portfolioId = struc.portfolioId;
        this.instructionId = struc.instructionId;
        this.userId = struc.userId;
        this.username = struc.username;
        this.stockCode = struc.stockCode;
        this.entrustVolume = struc.entrustVolume;
        this.entrustPrice = struc.entrustPrice;
        this.fullPrice = struc.fullPrice;
        this.expireYearRate = struc.expireYearRate;
        this.liaisonTel = struc.liaisonTel;
        this.liaisonName = struc.liaisonName;
        this.contractId = struc.contractId;
        this.propSeatNo = struc.propSeatNo;
        this.counterId = struc.counterId;
        this.tipMsg = struc.tipMsg;
    }
}

/**
 * 固收交易上行订单信息
 */
class ConstrOrderInfo extends UpingDto {

    constructor(struc) {

        super(struc);

        this.accountId = struc.accountId;
        this.portfolioId = struc.portfolioId;
        this.instructionId = struc.instructionId;
        this.userId = struc.userId;
        this.username = struc.username;
        this.stockCode = struc.stockCode;
        this.entrustVolume = struc.entrustVolume;
        this.discount = struc.discount;
        this.entrustPrice = struc.entrustPrice;
        this.fullPrice = struc.fullPrice;
        this.expireYearRate = struc.expireYearRate;
        this.liaisonTel = struc.liaisonTel;
        this.propSeatNo = struc.propSeatNo;
        this.liaisonName = struc.liaisonName;
        this.contractId = struc.contractId;
        this.tipMsg = struc.tipMsg;
    }
}

/**
 * 协议回购订单信息
 */
class RepoOrderInfo extends UpingDto {

    constructor(struc) {

        super(struc);
        
        for (let key in struc) {
            this[key] = struc[key];
        }
    }
}

/**
 * tick行情数据结构
 */
class TickData {

    constructor(tick, stockCode) {

        this.stockCode = stockCode;
        // this.stockName = stock_name;
        this.updateTime = tick.updateTime * 1000;
        this.open =  helper.isNumber(tick.openPrice) ? +tick.openPrice.toFixed(4) : 0;
        this.highest = helper.isNumber(tick.highPrice) ? +tick.highPrice.toFixed(4) : 0;
        this.lowest = helper.isNumber(tick.lowPrice) ? +tick.lowPrice.toFixed(4) : 0;
        this.latest = helper.isNumber(tick.lastPrice) ? +tick.lastPrice.toFixed(4) : 0;
        this.preclose = helper.isNumber(tick.preClosePrice) ? +tick.preClosePrice.toFixed(4) : 0;
        this.tradeVolume = tick.totalVolume || 0;
        this.tradeAmount = tick.totalAmount || 0;
        this.ceiling = helper.isNumber(tick.upperLimitPrice) ? +tick.upperLimitPrice.toFixed(4) : 0;
        this.floor = helper.isNumber(tick.lowerLimitPrice) ? +tick.lowerLimitPrice.toFixed(4) : 0;
        this.change = this.latest - this.preclose;
        this.changePercent = this.change / (this.preclose > 0 ? this.preclose : 1);

        /**
         * 卖出数量，顺序，1档 ~ 10档
         */
        this.sellVolumes = tick.askVolume instanceof Array ? tick.askVolume : [];

        /**
         * 卖出报价，顺序，1档 ~ 10档
         */
        this.sells = tick.askPrice instanceof Array ? tick.askPrice : [];

        /**
         * 买入数量，顺序，10档 ~ 1档
         */
        this.buyVolumes = tick.bidVolume instanceof Array ? tick.bidVolume : [];

        /**
         * 买入报价，顺序，10档 ~ 1档
         */
        this.buys = tick.bidPrice instanceof Array ? tick.bidPrice : [];
    }

}

/**
 * xtrade tick行情数据结构
 */
class XtradeTickData extends TickData {

    constructor(stock_code, stock_name, tick) {

        super({});

        /**
        [
            0 > 1.578031548E9,
            1 > 16.18, 
            2 > 16.26, 
            3 > 16.08, 
            4 > 16.21, 
            5 > 16.17, 
            6 > 10407984, 
            7 > 168363376,
            8 > 17.79, 
            9 > 14.55, 
			10 > [64200, 94600, 135000, 181500, 147600, 52900, 66000, 75500, 121800, 16600],
			11 > [16.22, 16.23, 16.24, 16.25, 16.26, 16.27, 16.28, 16.29, 16.3, 16.31],
			12 > [11700, 28167, 29600, 40200, 1800, 18200, 6926, 2400, 9900, 22000],
			13 > [16.21, 16.2, 16.19, 16.18, 16.17, 16.16, 16.15, 16.14, 16.13, 16.12]
		]
         */

        this.stockCode = stock_code;
        this.stockName = stock_name;

		this.updateTime = tick[0] * 1000;
        this.open = tick[1];
        this.highest = tick[2];
        this.lowest = tick[3];
        this.latest = tick[4];
        this.preclose = tick[5];
        this.tradeVolume = tick[6] || 0;
        this.tradeAmount = tick[7] || 0;
        this.ceiling = tick[8];
        this.floor = tick[9];
        this.change = this.latest - this.preclose;
        this.changePercent = this.change / (this.preclose > 0 ? this.preclose : 1);

        /**
         * 卖出数量，顺序，1档 ~ 10档
         */
        this.sellVolumes = tick[10] instanceof Array ? tick[10].reverse() : [];

        /**
         * 卖出报价，顺序，1档 ~ 10档
         */
        this.sells = tick[11] instanceof Array ? tick[11].reverse() : [];

        /**
         * 买入数量，顺序，10档 ~ 1档
         */
        this.buyVolumes = tick[12] instanceof Array ? tick[12] : [];

        /**
         * 买入报价，顺序，10档 ~ 1档
         */
        this.buys = tick[13] instanceof Array ? tick[13] : [];
    }
}

/**
 * 大宗盘中行情
 */
class ScaleQuote extends DowningDto {

    constructor(struc) {

        super(struc);

        this.id = struc.orderNo;

        /**
         * 证券代码
         */
        this.stockCode = struc.stockCode; 

        /**
         * 证券名称
         */
        this.stockName = struc.stockName; 

        /**
         * 顺序号
         */
        this.orderNo = struc.orderNo;

        /**
         * 席位编号
         */
        this.propSeatNo = struc.seatNo;

        /**
         * 申报类型
         */
        this.reportType = struc.entrustProp;

        /**
         * 委托方向
         */
        this.direction = struc.entrustBs;
        
        /**
         * 委托价格
         */
        this.entrustPrice = struc.entrustPrice;
        
        /**
         * 委托数量
         */
        this.entrustVolume = struc.entrustAmount;
        
        /**
         * 成交数量
         */
        this.businessAmount = struc.businessAmount;
        
        /**
         * 合约期限
         */
        this.compactTerm = struc.compactTerm;
        
        /**
         * 联系人姓名
         */
        this.liaisonName = struc.relationName;
        
        /**
         * 联系人电话
         */
        this.liaisonTel = struc.relationTel;
        
        /**
         * 约定号
         */
        this.contractId = struc.cbpconferId;
        
        /**
         * 申报时间
         */
        this.reportTime = struc.reportTime;
        
        /**
         * 定位串
         */
        this.positionStr = struc.positionStr;
        
        /**
         * 备注
         */
        this.remark = struc.remark;
    }
}

/**
 * 大宗盘后行情
 */
class ScaleCloseQuote extends DowningDto {
    
    constructor(struc) {

        super(struc);

        this.id = `${struc.stockCode}-${struc.exchangeType} `;
        /**
         * 证券代码
         */
        this.stockCode = struc.stockCode; 

        /**
         * 证券名称
         */
        this.stockName = struc.stockName; 

        /**
         * 交易类别
         */
        this.exchangeType = struc.exchangeType;
        
        /**
         * 成交金额
         */
        this.businessBalance = struc.businessBalance;
        
        /**
         * 成交数量
         */
        this.businessAmount = struc.businessAmount;
        
        /**
         * 当日收盘价
         */
        this.closePrice = struc.closingPrice;
        
        /**
         * 申买量一
         */
        this.buyAmount1 = struc.buyAmount1;
        
        /**
         * 申卖量一
         */
        this.saleAmount1 = struc.saleAmount1;
        
        /**
         * 加权平均价
         */
        this.avgPrice = struc.weightavg_price;
        
        /**
         * 申买量二
         */
        this.buyAmount2 = struc.buyAmount2;
        
        /**
         * 申卖量二
         */
        this.saleAmount2 = struc.saleAmount2;

    }
}

/**
 * 协议回购行情
 */
class RepoQuote extends DowningDto {

    constructor(struc) {

        super(struc);
        
        /**
         * 约定号
         */
        this.cbpconferId = struc.cbpconferId; 

        /**
         * 委托编号
         */
        this.entrustNo = struc.entrustNo;

        /**
         * 交易类别
         */
        this.exchangeType = struc.exchangeType;

        /**
         * 证券类别
         */
        this.stockType = struc.stockType;

        /**
         * 证券代码
         */
        this.stockCode = struc.stockCode;

        /**
         * 证券名称
         */
        this.stockName = struc.stockName;

        /**
         * 到期年收益率
         */
        this.expireYearRate = struc.expireYearRate;

        /**
         * 回购期限
         */
        this.repoTerm = struc.repoTerm;

        /**
         * 实际占款天数
         */
        this.fundUsedDays = struc.fundUsedDays; 

        /**
         * 首次交易日期
         */
        this.firstExchdate = struc.firstExchdate;

        /**
         * 回购日期
         */
        this.repurchaseDate = struc.repurchaseDate;

        /**
         * 交收结束日期
         */
        this.settleEndDate = struc.settleEndDate;

        /**
         * 成份股个数
         */
        this.componentNum = struc.componentNum;

        /**
         * 原质押券代码
         */
        this.oldImpawnCode = struc.oldImpawnCode;

        /**
         * 质押数量
         */
        this.impawnAmount = struc.impawnAmount;

        /**
         * 折算率系数
         */
        this.funderRatio = struc.funderRatio;

        /**
         * 质押金额
         */
        this.impawnBalance = struc.impawnBalance;

        /**
         * 前质押金额
         */
        this.prevImpawnBalance = struc.prevImpawnBalance;

        /**
         * 回购利息
         */
        this.profit = struc.profit;

        /**
         * 结算金额
         */
        this.settleBalance = struc.settleBalance;

        /**
         * 资产净值
         */
        this.assetNetValue = struc.assetNetValue;

        /**
         * 协议回购质权人类型
         */
        this.bprsrcStatus = struc.bprsrcStatus;

        /**
         * 原申请日期
         */
        this.origEntrustDate = struc.origEntrustDate;

        /**
         * 原约定号
         */
        this.origCbpconferId = struc.origCbpconferId;

        /**
         * 销售商代码
         */
        this.agencyNo = struc.agencyNo;

        /**
         * 交易员编号
         */
        this.traderId = struc.traderId;

        /**
         * 资产账户
         */
        this.fundAccount = struc.fundAccount;

        /**
         * 证券账号
         */
        this.stockAccount = struc.stockAccount;

        /**
         * 席位编号
         */
        this.seatNo = struc.seatNo;

        /**
         * 对方销售商
         */
        this.oppoAgency = struc.oppoAgency;

        /**
         * 对方交易员
         */
        this.oppoTraderId = struc.oppoTraderId;

        /**
         * 销售商名称
         */
        this.agencyName = struc.agencyName;

        /**
         * 定位串
         */
        this.positionStr = struc.positionStr;

        /**
         * 对方销售商名称
         */
        this.oppoAgencyName = struc.oppoAgencyName;

        /**
         * 对方申报账号
         */
        this.propStockAccount = struc.propStockAccount;

        /**
         * 对方席位号
         */
        this.propSeatNo = struc.propSeatNo;

        /**
         * 备注
         */
        this.remark = struc.remark;

        /**
         * 对方账户名称
         */
        this.propAccountName = struc.propAccountName;

        /**
         * 实际购回日期
         */
        this.realDateBack = struc.realDateBack;

        /**
         * 质权人名称
         */
        this.pledgeeName = struc.pledgeeName;
    }
}

/**
 * 账户信息
 */
class AccountInfo {

    constructor(struc){

        this.acctNo = struc.acctNo;
        this.accountName = struc.accountName;
        this.accountStatus = struc.status;
        this.stockExchangeNo = struc.stockExchangeNo;
        this.terminalList = [];
    }
}

/**
 * 终端信息
 */
class TerminalInfo {

    constructor(struc){

        this.id = struc.id;
        this.terminalName = struc.terminalName;
        this.terminalType = struc.terminalType;
        this.createTime = struc.createTime;
        this.terminalWeight = 0;
    }
}

/**
 * 账户-终端绑定信息
 */
class BindingInfo {

    constructor(struc) {

        this.id = struc.id;
        this.accountId = struc.accountId;
        this.terminalName = struc.terminalName;
        this.terminalWeight = struc.terminalWeight;
        this.createTime = struc.createTime;
    }
}

/**
 * 风控参数
 */
class RiskInfo {

    constructor(struc) {
        
        this.flow = struc.flow;
        this.totalCount = struc.totalCount;
        this.cancelRatio = struc.cancelRatio;
        this.selfTrade = struc.selfTrade;
        this.accountId = struc.accountId;
    }
}

export { 

    TickData, 
    XtradeTickData,
    Instruction, 
    PledgedInstrument,
    DowningDto,
    UpingDto,
    ConstrQuote, 
    Order, 
    BaseEntrust,
    Entrust, 
    ScaleEntrust, 
    Exchange, 
    OrderInfo,
    AlgoOrderInfo,
    FutureOrderInfo,
    OptionOrderInfo,
    BatchOrderDetail, 
    BatchOrderInfo, 
    ScaleOrderInfo,
    ConstrOrderInfo,
    RepoOrderInfo,
    ScaleQuote,
    ScaleCloseQuote,
    RepoQuote,
    BasketOrderInfo,
    AccountInfo,
    TerminalInfo,
    BindingInfo,
    RiskInfo
};
