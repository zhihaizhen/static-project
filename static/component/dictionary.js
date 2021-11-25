import { helper } from "./helper";

const SampleItem = { code: 0, mean: 'sample' };

const HsDir = {

    buy: { code: 1, mean: '买入' },
    sell: { code: 2, mean: '卖出' },
};

const EntrustProp = {

    normal: { mean: '限价委托', code: '0' },
    allotment: { mean: '配股', code: '1', isQuick: true },
    apply: { mean: '申购', code: '3', isQuick: true },
    addissue: { mean: '配售', code: '5', isQuick: true },
    change_to_stock: { mean: '转股', code: '7', isQuick: true },
    resale: { mean: '回售', code: '8', isQuick: true },
    allocateGiveUp: { mean: '配售放弃', code: 'B', isQuick: true },
    allocateCorrect: { mean: '配售冲正', code: 'G', isQuick: true },
    redeem: { mean: '赎回', code: 'L', isQuick: true },
    etf_apply: { mean: 'etf申赎', code: 'N', isQuick: true },
    counterparty: { mean: '对手方最优价格', code: 'Q' },
    best5_to_limit: { mean: '最优五档即时成交剩余转限价', code: 'R' },
    own_first: { mean: '本方最优价格', code: 'S' },
    immediate_to_cancel: { mean: '即时成交剩余撤销', code: 'T' },
    best5_to_cancel: { mean: '最优五档即时成交剩余撤销', code: 'U' },
    fill: { mean: '全额成交或撤单', code: 'V' },
    closeFixed: { mean: '盘后固定价格委托', code: 'PFP' },
    
    repurchase: { mean: '回购', code: '4' },
    pledge: { mean: '质押出入质', code: 'f' },

    scale_intent: { mean: '意向申报', code: 'a', isScale: true },
    scale_fixed: { mean: '定价申报', code: 'b', isScale: true },
    scale_limit_price: { mean: '限价委托', code: 'd', isScale: true },
    scale_confirm: { mean: '成交申报', code: 'c', isScale: true },
    scale_click: { mean: '点击成交申报', code: 'e', isScale: true },
    scale_large_after_closing: { mean: '盘后大宗委托', code: 'ABT', isScale: true },
    scale_by_close: { mean: '收盘价固定价格申报', code: 'AFC', isScale: true },
    scale_by_avg: { mean: '日均价固定价格申报', code: 'AFW', isScale: true },

    national_debt_price: { mean: '国债价格招标', code: 'BIP' },
    national_debt_rate: { mean: '国债利率招标', code: 'BIY' },

    lofs: { mean: '上证LOF认购', code: 'LFS' },
    lofc: { mean: '上证LOF申购', code: 'LFC' },
    lofr: { mean: '上证LOF赎回', code: 'LFR' },
    loft: { mean: '上证LOF转托管', code: 'LFT' },
    lofp: { mean: '上证LOF母基金分拆', code: 'LFP' },
    lofm: { mean: '上证LOF子基金合并', code: 'LFM' },

    monetary_fund_apply: { mean: '货币基金申购', code: 'OFC' },
    monetary_fund_ransom: { mean: '货币基金赎回', code: 'OFR' },

    repo_bpa: { mean: '上海协议回购意向申报', code: 'BPA', isRepo: true },
    repo_bpb: {  mean: '上海协议回购成交申报', code: 'BPB', isRepo: true },
    repo_bph: {  mean: '上海协议回购成交申报确认', code: 'BPH', isRepo: true },
    repo_bpc: {  mean: '上海协议回购到期续作申报', code: 'BPC', isRepo: true },
    repo_bpn: {  mean: '深圳债券质押协议回购初始交易', code: 'BPN', isRepo: true },

    repo_opa: { mean: '限价即时全部成交否则撤单', code: 'OPA', isRepo: true },
    repo_opb: { mean: '市价即时成交剩余撤单', code: 'OPB', isRepo: true },
    repo_opc: { mean: '市价即时全部成交否则撤单', code: 'OPC', isRepo: true },
    repo_opd: { mean: '市价剩余转限价', code: 'OPD', isRepo: true },

    repo_bpd: { mean: '上海协议回购解除质押', code: 'BPD', isRepo: true },
    repo_bpe: { mean: '上海协议回购换券申报', code: 'BPE', isRepo: true },
    repo_bpf: { mean: '上海协议回购提前终止申报', code: 'BPF', isRepo: true },
    repo_bpg: { mean: '上海协议回购到期确认申报', code: 'BPG', isRepo: true },

    repo_bpi: { mean: '上海协议回购成交申报拒绝', code: 'BPI', isRepo: true },
    repo_bpj: { mean: '上海协议回购到期续做申报确认', code: 'BPJ', isRepo: true },
    repo_bpk: { mean: '上海协议回购到期续做申报拒绝', code: 'BPK', isRepo: true },
    repo_bpl: { mean: '上海协议回购解除质押确认', code: 'BPL', isRepo: true },
    repo_bpm: { mean: '上海协议回购解除质押拒绝', code: 'BPM', isRepo: true },
    repo_bpo: { mean: '上海协议回购换券申报确认', code: 'BPO', isRepo: true },
    repo_bpp: { mean: '上海协议回购换券申报拒绝', code: 'BPP', isRepo: true },
    repo_bpq: { mean: '上海协议回购提前终止申报确认', code: 'BPQ', isRepo: true },
    repo_bps: { mean: '上海协议回购提前终止申报拒绝', code: 'BPS', isRepo: true },
    repo_bpr: { mean: '深圳债券质押协议回购购回交易', code: 'BPR', isRepo: true },
    repo_bpt: { mean: '深圳债券质押协议回购到期续做', code: 'BPT', isRepo: true },

    constr_fixed_price: { mean: '定价申报', code: 'FI1', isConstr: true },
    constr_click: { mean: '点击成交申报', code: 'FI3', isConstr: true },
    constr_fixed_counter: { mean: '指定对手方成交申报', code: 'FI9', isConstr: true },
    constr_convert: { mean: '可转换成交申报', code: 'FI100JY', isConstr: true },
    constr_best: { mean: '最优价成交申报', code: 'FI101JY', isConstr: true },

    rna: { mean: '约定购回补充交易', code: 'RNA' },
    rnb: { mean: '约定购回回补交易', code: 'RNB' },
    rne: { mean: '约定购回初始交易', code: 'RNE' },
    rnl: { mean: '约定购回零碎股购回', code: 'RNL' },
    rnp: { mean: '约定购回配股权证购回', code: 'RNP' },
    rnr: { mean: '约定购回购回交易', code: 'RNR' },

    anyPrice: { mean: '任意价', code: 'FU1' },
};

const dictionary = {
    
    /**
     * 交易场所
     */
    market: {

        shsec: { code: '03', mean: '上海证券交易所' },
        szsec: { code: '04', mean: '深圳证券交易所' },
        shfe: { code: '51', mean: '上期所' },
        dce: { code: '52', mean: '大商所' },
        zgqhsec: { code: '12', mean: '中国金融期货交易所' },
    },
    
    markets: [SampleItem],
    
    /**
     * 交易平台
     */
    platform: {

        hscompete: { code: '02', mean: '沪深竞价撮合平台', classname: 'layui-bg-blue' },
        shConstReturn: { code: '03', mean: '上海固定收益平台', classname: 'layui-bg-green' },
        shScale: { code: '04', mean: '上海大宗交易平台', classname: 'layui-bg-green' },
        szProtocol: { code: '05', mean: '深圳综合协议平台', classname: 'layui-bg-orange' },
    },

    platforms: [{ code: null, mean: null, classname: null }],
    
    /**
     * 资产类型
     */
    assetType: {

        bond: { code: 'F01', mean: '债券', unit: '张', pricePrecision: 3, priceStep: 0.001, volumeStep: 1 },
        fund: { code: 'F02', mean: '基金', unit: '份', pricePrecision: 3, priceStep: 0.001, volumeStep: 1 },
        standardVoucher: { code: 'F07', mean: '质押式回购', unit: '张', pricePrecision: 3, priceStep: 0.001, volumeStep: 10 },
        stock: { code: 'F11', mean: '股票', unit: '股', pricePrecision: 2, priceStep: 0.01, volumeStep: 100 },
        option: { code: 'F18', mean: '期权', unit: '份', pricePrecision: 4, priceStep: 0.0001, volumeStep: 1 },
        future: { code: 'F20', mean: '期货', unit: '手', pricePrecision: 3, priceStep: 0.001, volumeStep: 1 },
    },

    assetTypes: [{ code: 'sample', mean: 'sample', unit: null, pricePrecision: 0, priceStep: 0, volumeStep: 0 }],

    /**
     * 回购类型
     */
    repoType: {

        protocol: { code: 'H01', mean: '质押式协议回购' },
        compete: { code: 'H02', mean: '质押式竞价回购' },
        treasuryFutures: {code: 'FU01', mean: '国债期货'},
        stockIndexFutures: {code: 'FU02', mean: '股指期货'},
    },

    repoTypes: [SampleItem],

    /**
     * 协议回购操作属性
     */
    repoOperation: {

        establish: { code: 'service-will-never-set', mean: '首期' },
        renew: { code: 'T56', mean: '到期续作' },
        terminate: { code: 'T95', mean: '到期购回' },
        precede: { code: 'T96', mean: '提前购回' },
        change: { code: 'T94', mean: '中途换券' },
        release: { code: 'T93', mean: '解除质押' },
    },

    repoOperations: [{ code: null, mean: null }],

    /**
     * 普通交易方向
     */
    direction: {

        buy: { code: 'T01', mean: '买入', bsFlag: HsDir.buy.code, bsProp: EntrustProp.normal.code },
        sell: { code: 'T02', mean: '卖出', bsFlag: HsDir.sell.code, bsProp: EntrustProp.normal.code },
        apply: { code: 'T04', mean: '申购', bsFlag: HsDir.buy.code, bsProp: EntrustProp.apply.code },
        redeem: { code: 'T06', mean: '赎回', bsFlag: HsDir.sell.code, bsProp: EntrustProp.redeem.code },
        issue: { code: 'T47', mean: '增发（配售）', bsFlag: HsDir.buy.code, bsProp: EntrustProp.addissue.code },
        resale: { code: 'T03', mean: '行权-回售', bsFlag: HsDir.sell.code, bsProp: EntrustProp.resale.code },
        allocateShare: { code: 'T46', mean: '配股', bsFlag: HsDir.buy.code, bsProp: EntrustProp.allotment.code },
        bond2Stock: { code: 'T49', mean: '债转股', bsFlag: HsDir.sell.code, bsProp: EntrustProp.change_to_stock.code },
        subscribe: { code: 'T52', mean: '认购', bsFlag: HsDir.buy.code, bsProp: EntrustProp.apply.code },
        
        positiveRepo: { code: '03', mean: '正回购', bsFlag: HsDir.buy.code, bsProp: EntrustProp.repurchase.code },
        reversedRepo: { code: '04', mean: '逆回购', bsFlag: HsDir.sell.code, bsProp: EntrustProp.repurchase.code },

        seal: { code: 'T68', mean: '质押入库', bsFlag: HsDir.sell.code, bsProp: EntrustProp.pledge.code },
        unseal: { code: 'T69', mean: '质押出库', bsFlag: HsDir.buy.code, bsProp: EntrustProp.pledge.code },
        allocateBond: { code: 'T97', mean: '配债', bsFlag: HsDir.buy.code, bsProp: EntrustProp.addissue.code },
        exercise: { code: 'T99', mean: '行权', bsFlag: HsDir.sell.code },

        openLong: { code: 'TF01', mean: '开多', bsFlag: HsDir.buy.code },
        closeShort: { code: 'TF02', mean: '平空', bsFlag: HsDir.buy.code },
        closeTodayShort: { code: 'TF03', mean: '平今空', bsFlag: HsDir.buy.code },
        openShort: { code: 'TF04', mean: '开空', bsFlag: HsDir.sell.code },
        closeLong: { code: 'TF05', mean: '平多', bsFlag: HsDir.sell.code },
        closeTodayLong: { code: 'TF06', mean: '平今多', bsFlag: HsDir.sell.code },
    },

    directions: [{ code: 0, mean: null, bsFlag: 0, bsProp: 0 }],
    hsdirection: HsDir,
    hsdirections: [SampleItem],

    positionEffect: {

        start: { code: -1, mean: 'start' },
        open: { code: 0, mean: '开仓' },
        close: { code: 1, mean: '平仓' },
        force: { code: 2, mean: '强平' },
        closeToday: { code: 3, mean: '平今' },
        closeYesterday: { code: 4, mean: '平昨' },
        forceDecrease: { code: 5, mean: '强减' },
        localClose: { code: 6, mean: '本地强平' },
        end: { code: 7, mean: 'end' },
    },

    positionEffects: [SampleItem],
    entrustProp: EntrustProp,
    entrustProps: [{ code: 0, mean: null, isQuick: undefined, isScale: undefined, isConstr: undefined, isRepo: undefined }],

    hedgeSign: {
        
        speculation: {code: 1, mean: '投机'},
        profit: {code: 2, mean: '套利'},
        safeguard: {code: 3, mean: '套保'},
    },

    hedgeSignes: [SampleItem],

    offsetSign: {

        open: { code: 0, mean: '开仓' },
        close: { code: 1, mean: '平仓' },
    },

    offsetSigns: [SampleItem],

    /** 委托价格不优于指令价格时的处理模式 */
    fmepbti: {
        prohibit: {code: '01', mean: '禁止' },
        eliminate: {code: '02', mean: '剔除该指令并继续' },
    },

    fmepbtis: [SampleItem],

    /** 未接收指令是否必须参与公平交易 */
    fmwui: {
        yes: {code: '01', mean: '是'},
        no: {code: '02', mean: '否'},
    },

    fmwuis: [SampleItem],
    
    /**
     * 报价类型
     */
    priceMode: {

        fixed: { code: 'PRM01', mean: '指定价格' },
        limited: { code: 'PRM02', mean: '限价' },
        market: { code: 'PRM03', mean: '市价' },
    },

    priceModes: [SampleItem],

    /**
     * 大宗交易申报类型
     */
    scaleReportType: {

        intent: { code: EntrustProp.scale_intent.code, mean: EntrustProp.scale_intent.mean },
        fixed: { code: EntrustProp.scale_fixed.code, mean: EntrustProp.scale_fixed.mean, szonly: true },
        click2Trade: { code: EntrustProp.scale_click.code, mean: EntrustProp.scale_click.mean, szonly: true },
        trade: { code: EntrustProp.scale_confirm.code, mean: EntrustProp.scale_confirm.mean },
        fixed2Close: { code: EntrustProp.scale_by_close.code, mean: EntrustProp.scale_by_close.mean, close: true },
        fixed2Avg: { code: EntrustProp.scale_by_avg.code, mean: EntrustProp.scale_by_avg.mean, szonly: true, close: true },
    },

    scaleReportTypes: [{ code: 0, mean: null, shonly: false, szonly: false, close: false }],

    /**
     * 固定收益申报类型
     */
    constrReportType: {

        fixedPrice: { code: EntrustProp.constr_fixed_price.code, mean: EntrustProp.constr_fixed_price.mean },
        click2Trade: { code: EntrustProp.constr_click.code, mean: EntrustProp.constr_click.mean },
        convertableDeal: { code: EntrustProp.constr_convert.code, mean: EntrustProp.constr_convert.mean },
        bestPriceDeal: { code: EntrustProp.constr_best.code, mean: EntrustProp.constr_best.mean },
        fixedCounter: { code: EntrustProp.constr_fixed_counter.code, mean: EntrustProp.constr_fixed_counter.mean },
    },

    constrReportTypes: [SampleItem],

    /**
     * 指令状态
     */
    instatus: {

        pending: { code: '02', mean: '待接收' },
        received: { code: '03', mean: '已接收' },
        completed: { code: '04', mean: '已完成' },
        rejected: { code: '05', mean: '已退回' },
        closed: { code: '06', mean: '已关闭' },
        recalled: { code: '07', mean: '已撤回' },
    },

    instatuses: [SampleItem],

    /**
     * 订单状态
     */
    orderStatus: {

        created: { code: 0, mean: '新建' },
        pending_review: { code: 1, mean: '待复核'},
        not_review: { code: 2, mean: '复核拒绝'},
        continue: { code: 10, mean: '进行中' },
        done: { code: 20, mean: '委托完成', isCompleted: true },
        stopping: { code: 30, mean: '已停止', isCompleted: true  },
    },

    orderStatuses: [{ code: -1, mean: 'sample', isCompleted: false }],

    /**
     * 委托状态
     */
    entrustStatus: {

        created: { code: -10, mean: '新建' },
        unreported: { code: 0, mean: '未报' },
        to_report: { code: 1, mean: '待报' },
        reported: { code: 2, mean: '已报' },
        reported_to_cancel: { code: 3, mean: '已报待撤' },
        partial_traded_to_cancel: { code: 4, mean: '部成待撤' },
        partial_success: { code: 5, mean: '部成' },
        partial_traded_canceled: { code: 6, mean: '部撤', isCompleted: true },
        canceled: { code: 7, mean: '已撤', isCompleted: true },
        succeeded: { code: 8, mean: '已成', isCompleted: true },
        invalid: { code: 9, mean: '柜台废单', isCompleted: true },
        system_invalid: { code: 10, mean: '内部废单', isCompleted: true },
        abnormal_canceled:{code: 11, mean: '异常已撤', isCompleted: true},

        pending_approval: { code: -9, mean: '待审批' },
        not_risk: { code: 15, mean: '风控拒绝', isCompleted: true },
        not_approval: { code: 12, mean: '审批拒绝', isCompleted: true},
        pending_review: { code: -8, mean: '待复核' },
        pending_revoke: { code: -6, mean: '待撤审' },
        not_review: { code: 13, mean: '复核拒绝', isCompleted: true },
        not_revoke: { code: 14, mean: '撤销拒绝', isCompleted: true },
    },

    entrustStatuses: [{ code: 0, mean: 'sample', isCompleted: false }],

    /**
     * 清算速度
     */
    settleSpped: {

        t0: { code: 0, mean: 'T+0' },
        t1: { code: 1, mean: 'T+1' },
    },

    settleSppeds: [SampleItem],

    /**
     * 算法交易，之算法类型
     */
    algoTypes: [

        { code: '101', mean: 'TWAP_Plus' },
        { code: '102', mean: 'VWAP_Plus' },
        { code: '103', mean: 'TWAP_Core' },
        { code: '104', mean: 'VWAP_Core' },
        { code: '105', mean: 'POV_Core' },
        { code: '201', mean: 'Passthru' },
    ],

    /**
     * 市场级别
     */
    marketLevel: {

        firmarket: { code: '01', mean: '一级市场' },
        secmarket: { code: '02', mean: '二级市场' },
    },
    
    marketLevels: [SampleItem],

    /**
     * 终端级别
     */
    terminalType: {

        stockTerminal: { code: '01', mean: '股票终端' },
        futureTerminal: { code: '02', mean: '期货终端' },
        optionTerminal: { code: '03', mean: '股票期权终端' },
        bondTerminal: { code: '04', mean: '债券终端' },
        otherTerminal: { code: '05', mean: '其它终端' }
    },
    
    terminalTypes: [SampleItem],

};

/**
 * @param {Array} set 
 * @param {*} dict 
 */
function fillSet(set, dict) {

    set.length = 0;
    for(let key in dict) {
        let item = dict[key];
        if (helper.isNotNone(item.code) && helper.isNotNone(item.mean)) {
            item.codemean = `[${ item.code }] ${ item.mean }`;
        }
        set.push(item);
    }
}

fillSet(dictionary.markets, dictionary.market);
fillSet(dictionary.marketLevels, dictionary.marketLevel);
fillSet(dictionary.platforms, dictionary.platform);
fillSet(dictionary.assetTypes, dictionary.assetType);
fillSet(dictionary.repoTypes, dictionary.repoType);
fillSet(dictionary.repoOperations, dictionary.repoOperation);
fillSet(dictionary.directions, dictionary.direction);
fillSet(dictionary.hsdirections, dictionary.hsdirection);
fillSet(dictionary.positionEffects, dictionary.positionEffect);
fillSet(dictionary.entrustProps, dictionary.entrustProp);
fillSet(dictionary.instatuses, dictionary.instatus);
fillSet(dictionary.orderStatuses, dictionary.orderStatus);
fillSet(dictionary.entrustStatuses, dictionary.entrustStatus);
fillSet(dictionary.settleSppeds, dictionary.settleSpped);
fillSet(dictionary.priceModes, dictionary.priceMode);
fillSet(dictionary.scaleReportTypes, dictionary.scaleReportType);
fillSet(dictionary.constrReportTypes, dictionary.constrReportType);
fillSet(dictionary.terminalTypes, dictionary.terminalType);

export { dictionary };