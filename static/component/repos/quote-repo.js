import { ConstrQuote,  ScaleQuote, ScaleCloseQuote, RepoQuote } from '../models';
import { BaseRepo } from './base-repo';
import { helper } from '../helper';

class QuoteRepo extends BaseRepo {

    constructor() {
        super();
    }

    /**
     * 查询合约行情（针对普通交易）
     * @param {String} stock_code
     */
    queryLastTick(stock_code) {
        
        return new Promise((resolve, reject) => {

            axios.get('/quote/tick?stock_code=' + stock_code, {tipMsg:'查询合约行情失败'}).then(
                resp => {resolve(resp.data.data);},
                error => { reject(error); },
            );
        });
    }

    /**
     * 查询合约行情（针对普通交易）
     * @param {String} stock_code
     */
    queryLastXtradeTick(stock_code) {

        var codes = stock_code.split(',');
        var converted_code = codes.length > 1 ? codes.map(x => helper.convertStockCodeOut(x)).join(',') : helper.convertStockCodeOut(codes[0]);
        var params = { instruments: converted_code };
        return new Promise((resolve, reject) => {

            axios.get('http://local.gaoyusoft.com:8100/quote/v1/tick/last?appplt=web', { params: params }).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 查询大宗盘中行情
     * @param {*} account_id
     * @param {*} stock_code 
     * @returns {{ errorCode: 0, errorMsg: null, data: [ScaleQuote] }}
     */
    queryScaleQuotes(account_id, stock_code, tipMsg) {

        return new Promise((resolve, reject) => {

            axios.get('/entrust/integrated/bulk_quote', { params: { account_id, stock_code, tipMsg } }).then(
                resp => { resolve(this._formalizeDatasetResponse(resp, ScaleQuote)); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 查询大宗盘后行情
     * @param {*} account_id 
     * @param {*} stock_code 
     * @returns {{ errorCode: 0, errorMsg: null, data: [ScaleCloseQuote] }}
     */
    queryScaleCloseQuotes(account_id, stock_code, tipMsg) {

        return new Promise((resolve, reject) => {

            axios.get('/entrust/integrated/bulk_close_quote', { params: { account_id, stock_code, exchange_type: 1, tipMsg } }).then(
                resp => { resolve(this._formalizeDatasetResponse(resp, ScaleCloseQuote)); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 查询质押式协议回购行情
     * @param {*} account_id 
     * @returns {{ errorCode: 0, errorMsg: null, data: [RepoQuote] }}
     */
    queryRepoQuotes(account_id, tipMsg) {

        return new Promise((resolve, reject) => {

            axios.get('/entrust/integrated/repurchase_quote', { params: { action_in: 1, user_id: this.traderId, account_id, tipMsg } }).then(
                resp => { resolve(this._formalizeDatasetResponse(resp, RepoQuote)); },
                error => { reject(error); },
            );

            // let resp = {};
            // resp.data ={ data: repoQuotes};
            // resolve(this._formalizeDatasetResponse(resp, RepoQuote));
        });
    }

    /**
     * 查询固定收益行情
     * @param {*} account_id 
     * @param {*} stock_code 
     * @returns {{ errorCode: 0, errorMsg: null, data: [ConstrQuote] }}
     */
    queryConstrQuotes(account_id, stock_code) {

        return new Promise((resolve, reject) => {

            axios.get('/entrust/integrated/fixed_income_quote', { params: { account_id, stock_code, exchange_type: 1 } }).then(
                resp => { resolve(this._formalizeDatasetResponse(resp, ConstrQuote)); },
                error => { reject(error); },
            );
        });
    }
}

export { QuoteRepo };