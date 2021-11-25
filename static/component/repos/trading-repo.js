
import {

    Instruction, 
    Order, 
    Entrust, 
    ScaleEntrust, 
    Exchange, 
    OrderInfo, 
    FutureOrderInfo,
    OptionOrderInfo,
    ScaleOrderInfo,
    ConstrOrderInfo,
    RepoOrderInfo,
    AlgoOrderInfo,
    BasketOrderInfo,
}

from '../models';
import { BaseRepo } from './base-repo';

class TradingRepo extends BaseRepo {

    constructor() {
        super();
    }

    /**
     * 查询异常委托
     * @param {Array} entrust_statuses 需要查询的委托状态
     * @returns {{ errorCode: 0, errorMsg: null, data: [Entrust] }}
     */
    queryExceptionalEntrusts(entrust_statuses) {

        return new Promise((resolve, reject) => {

            axios.get('/entrust/exception', { params: { user_id: this.joyinUserId, entrust_status: entrust_statuses.join(","), tipMsg: '查询异常委托数据失败' }}).then(
                            
                resp => {

                    let result = resp.data;
                    result.data = result.data.map(x => new Entrust(x));
                    resolve(result);
                },
                error => { reject(error); },
            );
        });
    }

    /**
     * 查询个人委托
     * @param {*} instruction_id 
     * @param {*} account_id 
     * @param {*} order_id 
     * @returns {{ errorCode: 0, errorMsg: null, data: [Entrust] }}
     */
    queryEntrusts(instruction_id, account_id, order_id) {

        return new Promise((resolve, reject) => {

            axios.get('/entrust', { params: { user_id: this.traderId, instruction_id, account_id, order_id, tipMsg: '查询委托数据失败' } }).then(

                resp => {

                    let result = resp.data;
                    let remote_entrusts = result.data.entrustList.map(x => new Entrust(x));
                    let remote_orders = result.data.orderList.map(x => new Order(x));
                    resolve(Object.assign(result, { data: { orderList: remote_orders, entrustList: remote_entrusts } }));
                },

                error => { reject(error); },
            );
        });
    }

    /**
     * 查询大宗交易订单下属委托
     * @param {*} instruction_id
     * @param {*} account_id
     * @param {*} order_id
     * @returns {{ errorCode: 0, errorMsg: null, data: [ScaleEntrust] }}
     */
    queryScaleEntrusts(instruction_id, account_id, order_id) {

        return new Promise((resolve, reject) => {

            axios.get('/entrust/integrated', { params: { user_id: this.traderId, instruction_id, account_id, order_id, tipMsg:'查询大宗委托数据失败' } }).then(
                resp => {resolve(this._formalizeDatasetResponse(resp, ScaleEntrust)); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 查询订单下属成交
     * @param {*} instruction_id
     * @param {*} account_id
     * @param {*} order_id
     * @param {*} entrust_id
     * @returns {{ errorCode: 0, errorMsg: null, data: [Exchange] }}
     */
    queryExchanges(instruction_id, account_id, order_id, entrust_id) {

        return new Promise((resolve, reject) => {

            axios.get('/trade', { params: { user_id: this.traderId, instruction_id, account_id, order_id, entrust_id, tipMsg:'查询成交数据失败' } }).then(
                
                resp => {

                    let remote_exchanges = this._formalizeDatasetResponse(resp, Exchange);
                    resolve(remote_exchanges);
                },

                error => { reject(error); },
            );
        });
    }

    /**
     * 委托查询
     * @returns {{ errorCode: 0, errorMsg: null, data: [Entrust] }}
     */
    queryHistoryEnstruts(param) {
        
        return new Promise((resolve, reject) => {

            const { historyType: history_type, startDay: start_day, endDay: end_day } = param;
            axios.get('/entrust/page', { params: { user_id: this.joyinUserId, history_type, start_day, end_day, tipMsg: '查询委托数据失败' } }).then(
                resp => {

                    let result = resp.data;
                    result.data.list = result.data.list.map(x => new Entrust(x));
                    resolve(result);                
                },
                error => { reject(error); },
            );
        });
    }

    /**
     * 成交查询
     * @returns {{ errorCode: 0, errorMsg: null, data: [Entrust] }}
     */
    queryHistoryExchanges(param) {
        
        return new Promise((resolve, reject) => {
            
            const { historyType: history_type, startDay: start_day, endDay: end_day, entrustId: entrust_id } = param;
            axios.get('/trade/page', { params: { user_id: this.joyinUserId, history_type, start_day, end_day, entrust_id, tipMsg: '查询成交数据失败' }}).then(
                resp => {

                    let result = resp.data;
                    if(Array.isArray(result.data)){
                        result.data = result.data.map(x => new Exchange(x));
                        
                    }
                    else{
                        result.data.list = result.data.list.map(x => new Exchange(x));
                    }
                    
                    resolve(result);                
                },
                error => { reject(error); },
            );
        });
    }

    /**
     * 普通下单
     * @param { OrderInfo | FutureOrderInfo | OptionOrderInfo | ScaleOrderInfo | ConstrOrderInfo | RepoOrderInfo | BasketOrderInfo} order
     * @param {Instruction} instruc
     */
    placeOrder(order, instruc) {

        if (order instanceof OrderInfo || order instanceof FutureOrderInfo) {

            if(order.instructionId.startsWith('JY-EXERCISE')){

                return new Promise((resolve, reject) => {
                    
                    this._simulatePlaceExerciseOrder(order, instruc);
                    let result = { errorCode: 0, errorMsg: null, data: {errorCode:0,errorMsg:''} };
                    resolve(result);
                });
            }
            else{

                return new Promise((resolve, reject) => {
                    
                    axios.post(`/order?user_id=${ this.traderId }`, order).then(
                        resp => { resolve(resp.data); },
                        error => { reject(error); },
                    );
                });
            }

        }
        else if (order instanceof AlgoOrderInfo) {

            return new Promise((resolve, reject) => {

                this._simulatePlaceAlgoOrder(order, instruc);
                resolve({ errorCode: 0, errorMsg: null, data: null });
            });
        }
        else if (order instanceof OptionOrderInfo) {

            return new Promise((resolve, reject) => {

                this._simulatePlaceOptionOrder(order, instruc);
                let result = { errorCode: 0, errorMsg: null, data: {errorCode:0,errorMsg:''} };
                resolve(result);
            });
        }
        else if (order instanceof BasketOrderInfo) {
            
            return new Promise((resolve, reject) => {

                this._simulatePlaceBasketOrder(order, instruc);
                let result = { errorCode: 0, errorMsg: null, data: {errorCode:0,errorMsg:''} };
                resolve(result);
            });
        }
        else {
            
            return new Promise((resolve, reject) => {

                axios.post(`/order/integratedEntrust?user_id=${ this.traderId }`, order).then(
                    resp => { resolve(resp.data); },
                    error => { reject(error); },
                );
            });
        }
    }

    /**
     * 撤订单（同时撤销下属所有委托）
     * @returns {{ errorCode: 0, errorMsg: Sting}} 
     */
    cancelOrder(order_id) {

        return new Promise((resolve, reject) => {

            axios.put(`/order/cancel?user_id=${ this.traderId }&order_id=${ order_id }`).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 撤委托
     * @param {*} entrust_id
     * @returns {{ errorCode: 0, errorMsg: Sting }} 
     */
    cancelEntrust(entrust_id) {

        return new Promise((resolve, reject) => {

            axios.put(`/entrust/cancel?user_id=${ this.traderId }&entrust_id=${ entrust_id }`).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 撤异常委托
     * @param {String} entrust_id 需要撤销得委托的entrust_id
     * @returns {{ errorCode: 0, errorMsg: Sting }} 
     */
    cancelAbnormalEntrust(entrust_id) {

        return new Promise((resolve, reject) => {
            
            axios.put(`/entrust/exception/cancel?user_id=${this.joyinUserId}&user_name=${this.joyinUserRealName}&entrust_id=${entrust_id}`, { params: { tipMsg: '撤销异常委托数据失败'} }).then(
                
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * @param {AlgoOrderInfo} order 
     * @param {Instruction} instruc 
     */
    _simulatePlaceAlgoOrder(order, instruc) {
        throw new Error('mock operation expired');
    }

    /**
     * @param {FutureOrderInfo} order 
     * @param {Instruction} instruc 
     */
    _simulatePlaceFutureOrder(order, instruc) {
        throw new Error('mock operation expired');
    }

    /**
     * @param {OrderInfo} order 
     * @param {Instruction} instruc 
     */
    _simulatePlaceExerciseOrder(order, instruc) {
        throw new Error('mock operation expired');
    }

    /**
     * @param {OptionOrderInfo} order 
     * @param {Instruction} instruc 
     */
    _simulatePlaceOptionOrder(order, instruc) {
        throw new Error('mock operation expired');
    }

    /**
     * @param {BasketOrderInfo} order 
     * @param {Instruction} instruc 
     */
    _simulatePlaceBasketOrder(order, instruc) {
        throw new Error('mock operation expired');
    }
}

export { TradingRepo };