import { BaseRepo } from './base-repo';
import { TableSummary } from '../models/table-summary';
import { helper } from '../helper';
import { JoyinTable } from '../joyin-table';

class RuntimeRepo extends BaseRepo {

    constructor() {
        super();
    }

    /**
     * 查询数据库表格列表（包含表名、数据行数信息等）
     * @returns {{ errorCode: Number, errorMsg: String, data: Array<TableSummary> }}
     */
    queryTables() {

        return new Promise((resolve, reject) => {

            axios.get('/cache/monitor').then(
                
                resp => {

                    let result = resp.data;
                    let map = result.data || {};
                    let keys = helper.dictKey2Array(map);
                    resolve({

                        errorCode: result.errorCode, 
                        errorMsg: result.errorMsg, 
                        data: keys.map(key => new TableSummary({ name: key, count: map[key] })),
                    });
                },
                error => { reject(error); },
            );
        });
    }

    /**
     * 操作数据同步(数据库与内存，相互同步)
     * @param {String} tableName 
     * @param {Number} operation 
     * @returns {{ errorCode: Number, errorMsg: String }}
     */
    manipulate(tableName, operation) {

        return new Promise((resolve, reject) => {
                    axios.post(`/monitor/cache/recover?user_id=${this.joyinUserId}&service_name=${tableName}&type=${operation}`).then(
                        (resp) => { resolve(resp.data); },
                        (error) => { reject(error); });
        });
    }

    /**
     * 清空内存数据
     * @param {String} tableName 
     * @returns {{ errorCode: Number, errorMsg: String }}
     */
    truncate(tableName, operation) {

        return new Promise((resolve, reject) => {
                    axios.delete(`/monitor/cache?user_id=${this.joyinUserId}&service_name=${tableName}`).then(
                        (resp) => { resolve(resp.data); },
                        (error) => { reject(error); });
        });
    }

    /**
     * 查询某一个数据库表内含数据
     * @param {String} tableName
     * @param {Number} page
     * @param {Number} count
     * @returns {{ errorCode: Number, errorMsg: String, data: Object }}
     */
    queryRecords(tableName, page, count) {

        return new Promise((resolve, reject) => {
            axios.get(`/monitor/cache?user_id=${this.joyinUserId}&service_name=${tableName}&page=${page}&count=${count}`).then(
                (resp) => { resolve(resp.data); },
                (error) => { reject(error); });
        });
    }

    /**
     * 添加（或修改）表数据
     * @param {String} tableName 
     * @param {Array} records 
     * @returns {{ errorCode: Number, errorMsg: String }}
     */
    updateRecords(tableName, records) {

        return new Promise((resolve, reject) => {
            axios.put(`/monitor/cache?user_id=${this.joyinUserId}&service_name=${tableName}`, records).then(
                (resp) => { resolve(resp.data); },
                (error) => { reject(error); });
        });
    }

    /**
     * 删除表数据
     * @param {String} tableName 
     * @param {Array<String>} ids 
     * @returns {{ errorCode: Number, errorMsg: String }}
     */
    deleteRecords(tableName, ids) {

        return new Promise((resolve, reject) => {
            axios.delete(`/monitor/cache/delete?user_id=${this.joyinUserId}&service_name=${tableName}`, { data: ids }).then(
                (resp) => { resolve(resp.data); },
                (error) => { reject(error); });
        });
    }
}

export { RuntimeRepo };