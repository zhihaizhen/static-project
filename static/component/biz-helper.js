
import { helper } from './helper';
import { Instruction } from './models';
import { DataRepo } from './repos/data-repo';

/**
 * 市场分层性质
 */
const MarketLayer = {

    first: { code: '01', mean: '一级市场' },
    second: { code: '02', mean: '二级市场' },
};

/**
 * 查询条件类型
 */
const QueryType = { netPrice: 1, fullPrice: 2, yield: 3, error: 99 };

/**
 * 数据查询实例
 */
const dataRepoIns = new DataRepo();

/**
 * 净价 / 全价 / 到期收益率，查询条件结构
 */
class QueryData {

    /**
     * @param {Instruction} instruc 
     * @param {{ netPrice, fullPrice, volume, yield }} criteria 
     */
    constructor(instruc, criteria) {

        let defaultTo = 0;
        
        /** 合约标识，格式：资产类型_合约代码 */
        this.finprodId =`${instruc.assetType}_${instruc.stockCode}`;
        /** 交易市场代码 */
        this.tradeMarket = instruc.marketId;
        /** 交割日 (格式：yyyy-MM-dd)，默认设置为，指令委托日期 */
        this.settleDate = instruc.tradeDate;
        /** 券面总额 (固定算法 = 委托数量 * 100) */
        this.tradeAmt = criteria.volume * 100 || defaultTo;
        /** 净价价格 */
        this.unitCprice = criteria.netPrice || defaultTo;
        /** 全价总额 */
        this.fpriceAmt = (criteria.fullPrice || 0) * criteria.volume || defaultTo;
        /** 到期收益率 */
        this.yield = criteria.yield || defaultTo;
        /** 投資目的（暂且固定 = AC） */
        this.invAim = 'AC';
        /** 市场性质 */
        this.tradeMarketMode = MarketLayer.second.code;
        this.tipMsg = '净价/全价/到期收益率，查询错误';

        /**
         * 查询条件依赖的类型（净价=1，全价=2，到期收益率=3）
         */
        this.type = typeof criteria.netPrice == 'number' && criteria.netPrice > 0 ? QueryType.netPrice :
                    typeof criteria.fullPrice == 'number' && criteria.fullPrice > 0 && typeof criteria.volume == 'number' && criteria.volume > 0 ? QueryType.fullPrice :
                    typeof criteria.yield == 'number' && criteria.yield > 0 ? QueryType.yield : QueryType.error;

        let type = this.type;
        this.isByNetPrice = type == QueryType.netPrice;
        this.isByFullPrice = type == QueryType.fullPrice;
        this.isByYield = type == QueryType.yield;

        this.isError = type == QueryType.error;
    }
}

class CloudComputePriceResult {

    /**
     * @param {*} struc 
     * @param {QueryData} queryd 
     */
    constructor(struc, queryd) {

        /**
        
        样本数据

        {
            "status": "N",
            "createUser": "system",
            "createTime": 1589002325054,
            "updateUser": "system",
            "updateTime": 1589002325054,
            "finprodId": "F01_010107.SH",
            "settleDate": 1583251200000,
            "unitCprice": "99",
            "unitInt": "0.38515068",
            "unitFprice": "99.38515068",
            "cpriceAmt": "99000",
            "prinAmt": "100000",
            "intAmt": "385.15",
            "fpriceAmt": "99385.15",
            "tradeAmt": "100000",
            "yield": "5.0015758951",
            "invAim": "AC",
            "tradeMarket": "03",
            "tradeMarketMode": "02",
            "calculateField": "unitCprice",
            "integrateIntAmt": "0",
            "integrateFpriceAmt": "0",
            "integrateCpriceAmt": "0",
            "mdateStr": ""
        }

        */

        /** 全价总额 */
        this.fullPrice = struc.unitFprice;
        /** 净价价格 */
        this.netPrice = struc.unitCprice;
        /** 到期收益率 */
        this.yield = struc.yield;

        this.isByNetPrice = queryd.isByNetPrice;
        this.isByFullPrice = queryd.isByFullPrice
        this.isByYield = queryd.isByYield;
    }
}

const BizHelper = {

    /**
     * 换算净价价格、全价价格、到期收益率
     * @param {Instruction} instruc 
     * @param {{ netPrice, fullPrice, volume, yield }} criteria 
     * @param {Number} settleSpeed 
     */
    async computePrices(instruc, criteria, settleSpeed = 0) {
        
        let queryd = new QueryData(instruc, criteria);
        let errorResult = new CloudComputePriceResult({ unitFprice: 0, unitCprice: 0, yield: 0 }, queryd);

        if (queryd.isError) {
            return errorResult;
        }

        try {

            let resp_date = await dataRepoIns.queryPlatDate();

            if (resp_date.errorCode == 0) {

                let sdate = new Date(resp_date.data);
                let speed = +settleSpeed;
                let offset_ms = helper.isNumber(speed) && Number.isInteger(speed) ? speed * 24 * 60 * 60 * 1000 : 0;
                let date_obj = new Date(sdate.getTime() + offset_ms);
                queryd.settleDate = date_obj.format('yyyy-MM-dd');
            }

            let type = queryd.type;
            let resp_algo = await dataRepoIns.algorithmQuery(queryd, type);
            
            if (resp_algo.errorCode == 0) {
                
                let result = new CloudComputePriceResult(resp_algo.data, queryd);
                if (queryd.isByFullPrice) {
                    result.fullPrice = result.fullPrice / criteria.volume;
                }

                return result;
            }
            else {
                return errorResult;
            }
        }
        catch(ex) {
            return errorResult;
        }
    }
}

export { BizHelper };