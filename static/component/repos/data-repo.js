
import { AccountInfo, TerminalInfo, BindingInfo, RiskInfo } from '../models';
import { BaseRepo } from './base-repo';
import { helper } from '../helper';

class DataRepo extends BaseRepo {

    constructor() {
        super();
    }

    /**
     * 获取系统启用公平交易标识
     * @param {} instruc_id 
     */
    requestEqualFlag() {

        return new Promise((resolve, reject) => {

            axios.get(`/common/fairtrade?user_id=${ this.joyinUserId }`,{ params: { tipMsg: '公平交易标识查询失败' }}).then(resp => {
                
                var resp_data = resp.data;
                if (resp_data.errorCode == 0 && !!resp_data.data[0]) {
                    resolve(resp_data.data[0]);
                }
                else {
                    helper.showError('公平交易标识信息获取失败');
                }
            },
            error => { reject(error); });
        });
    }

    /**
     * 净价、全价、到期收益率算法查询
     * @param {*} paramObj 
     */
    algorithmQuery(criteria, type) {

        return new Promise((resolve, reject) => {

            axios.post(`/instruction/expireIncomeRate?calculate_type=${type}`, criteria).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 账户查询
     * @param {*} account_id
     * @param {*} user_id
     * @returns {{ errorCode: 0, errorMsg: null, data: [AccountInfo] }}
     */
    queryAccountList(account_id) {

        return new Promise((resolve, reject) => {

            axios.get('/account', { params: { user_id: this.joyinUserId, account_id, tipMsg:'查询账户数据失败' } }).then(
                resp => { resolve(this._formalizeDatasetResponse(resp, AccountInfo)); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 终端查询
     * @param {*} terminal_name
     * @param {*} user_id
     * @returns {{ errorCode: 0, errorMsg: null, data: [TerminalInfo] }}
     */
    queryTerminalList(terminal_name) {

        return new Promise((resolve, reject) => {

            axios.get('/terminal', { params: { user_id: this.joyinUserId, terminal_name, tipMsg:'查询终端数据失败' } }).then(
                resp => { resolve(this._formalizeDatasetResponse(resp, TerminalInfo)); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 终端创建
     * @param {*} terminalName
     * @returns {{ errorCode: 0, errorMsg: null, data: Number }}
     */
    addTerminal(terminalName) {

        return new Promise((resolve, reject) => {

            axios.post(`/add/terminal?user_id=${ this.joyinUserId }`, { terminalName }).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 绑定终端查询
     *  @param {*} account_id
     * @param {*} terminal_name
     * @param {*} user_id
     * @returns {{ errorCode: 0, errorMsg: null, data: BindingInfo }}
     */
    queryAccountTerminalMap(account_id, terminal_name) {

        return new Promise((resolve, reject) => {

            axios.get('/terminalMapping', { params: { user_id: this.joyinUserId,account_id, terminal_name, tipMsg:'映射终端(查询)失败' } }).then(
                resp => {resolve(this._formalizeDatasetResponse(resp, BindingInfo)); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 绑定终端
     * @param {Array} mapList
     * @returns {{ errorCode: 0, errorMsg: null, data: Number }}
     */
    addAccountTerminalMap(mapList) {

        return new Promise((resolve, reject) => {

            axios.post(`add/terminalMapping?user_id=${this.joyinUserId}`, mapList).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 解除绑定终端
     * @param {String} bindId
     * @returns {{ errorCode: 0, errorMsg: null, data: Number }}
     */
    deleteAccountTerminalMap(bindId) {

        return new Promise((resolve, reject) => {

            axios.delete(`delete/terminalMapping?user_id=${this.joyinUserId}&id=${bindId}`, {}).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 终端删除
     * @param {*} terminalName
     * @returns {{ errorCode: 0, errorMsg: null, data: Number }}
     */
    deleteTerminal(terminalName) {

        return new Promise((resolve, reject) => {

            axios.delete(`/delete/terminal?user_id=${this.joyinUserId}&terminal_name=${terminalName}`, {}).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 终端更新
     * @param {*} terminalName
     * @param {*} terminalType
     * @returns {{ errorCode: 0, errorMsg: null, data: Number }}
     */
    updateTerminal(terminalName, terminalType) {

        return new Promise((resolve, reject) => {

            axios.put(`/update/terminal?user_id=${this.joyinUserId}&terminal_name=${terminalName}`, {terminalName,terminalType}).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 获取平台日
     */
    queryPlatDate(){

        return new Promise((resolve, reject) => {
            
            axios.get('/common/sysdate', { params: { user_id: this.joyinUserId, tipMsg:'平台日获取失败' } }).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 获取系统监控观察项，参数值
     */
    monitorSys() {

        return new Promise((resolve, reject) => {
            
            axios.get(`/monitor?user_id=${this.joyinUserId}`).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 查询账号风控信息
     * @param {String} account_id 
     * @returns {{ errorCode: 0, errorMsg: null, data: RiskInfo }
     */
    queryRiskInfo(account_id) {

        return new Promise((resolve, reject) => {

            axios.get('/account/risk', { params: { account_id, tipMsg: '查询风控信息失败' } }).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

  
    /**
     * 增加账号风控信息
     * @param {RiskInfo} riskData 
     * @returns {{ errorCode: 0, errorMsg: null, data: RiskInfo }
     */
    addRiskInfo(riskData) {

        return new Promise((resolve, reject) => {

            axios.post(`/account/risk/add?user_id=${this.joyinUserId}`, riskData).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 修改账号风控信息
     * @param {RiskInfo} riskData 
     * @returns {{ errorCode: 0, errorMsg: null, data: RiskInfo }
     */
    updateRiskInfo(riskData) {

        return new Promise((resolve, reject) => {

            axios.put(`/account/risk/update?user_id=${this.joyinUserId}`, riskData).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

    /**
     * 删除账号风控信息
     * @param {String} account_id
     * @returns {{ errorCode: 0, errorMsg: null, data: String }}
     */
    deleteRiskInfo(account_id) {

        return new Promise((resolve, reject) => {

            axios.delete(`/account/risk/delete`, { params: {account_id} }).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }

}

export { DataRepo };