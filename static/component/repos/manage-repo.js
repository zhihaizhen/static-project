import { BaseRepo } from './base-repo';

class ManageRepo extends BaseRepo {

    constructor() {
        super();
    }

    /**
     * 查询交易对手
     * @param {*} counter_id
     * @returns {{ errorCode: 0, errorMsg: null, data: [Object] }}
     */
    queryCounterList(counter_id = '') {

        return new Promise((resolve, reject) => {

            axios.get('/counter/counterPartyInfo', { params: { counter_id, tipMsg:'查询交易对手信息失败' } }).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 查询对手交易员信息
     * @param {*} counterId 
     * @returns {{ errorCode: 0, errorMsg: null, data: [object] }}
     */
    queryCounterTrader(counterId) {

        return new Promise((resolve, reject) => {

            axios.get('/counter/counterTraderInfo', { params: { counter_id: counterId }}).then(
                
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 查询本方交易员,暂无接口
     * @param {*} counterId
     * @returns {{ errorCode: 0, errorMsg: null, data: [object] }}
     */
    queryOurTrader(counterId) {
       
        return new Promise((resolve, reject) => {

            // axios.get('/counter/ourTraderInfo', { params: { counter_id: counterId }}).then(
            //     
            //     resp => { resolve(resp.data); },
            //     error => { reject(error); },
            // );
            
            resolve({ errorCode: 0, errorMsg:'success', data: [] });
        }); 
    }

    /**
     * 查询对手席位
     * @param {*} counterId
     * @returns {{ errorCode: 0, errorMsg: null, data: [object] }}
     */
    queryOppoSeat(counterId) {

        return new Promise((resolve, reject) => {

            axios.get('/counter/counterSeatInfo', { params: { counter_id: counterId }}).then(
                
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 添加对手交易员
     * @param {*} counterId
     * @param {*} counterTraderId
     * @returns {{ errorCode: 0, errorMsg: null }}
     */
    addCounterTrader(counterId, counterTraderId) {

        return new Promise((resolve, reject) => {

            axios.post(`/counter/addCounterTrader?counter_id=${counterId}&counter_trader_id=${counterTraderId}`).then(
                
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }
    
    /**
     * 添加本方交易员
     * @param {*} counterId
     * @param {*} ourTraderId
     * @returns {{ errorCode: 0, errorMsg: null }}
     */
    addOurTrader(counterId, ourTraderId) {

        return new Promise((resolve, reject) => {

            // axios.post(`counter/addOurTrader?counter_id=${counterId}&counter_ourtrader_id=${ourTraderId}`).then(

            //     resp => { resolve(resp.data); },
            //     error => { reject(error); },
            // );
            resolve({errorCode: 0});
        });
    }

    /**
     * 添加对手席位
     * @param {*} counterId
     * @param {*} counterSeatId
     * @returns {{ errorCode: 0, errorMsg: null }}
     */
    addOppoSeat(counterId, counterSeatId) {

        return new Promise((resolve, reject) => {

            axios.post(`/counter/addCounterSeat?counter_id=${counterId}&counter_seat_id=${counterSeatId}`).then(
                
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }
}

export { ManageRepo };