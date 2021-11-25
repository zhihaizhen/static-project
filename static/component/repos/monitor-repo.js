import { BaseRepo } from './base-repo';
import { Category } from '../models/monitor';

class MonitorRepo extends BaseRepo {

    constructor() {
        super();
    }

    /**
     * 查询最新的分类监控数据
     * @param {*} categoryName 分类名称（缺省代表全部，否则仅返回指定分类）
     * @param {*} snapshotTime 上一次的查询时间戳（缺省代表所有已记录数据），格式 = UTC字串
     * @returns {{ errorCode: 0, errorMsg: null, data: Array<Category> }}
     */
    query(categoryName, snapshotTime) {

        return new Promise((resolve, reject) => {

            axios.get('/monitor/dynamic', { params: { category_name: categoryName || '', snapshot_time: snapshotTime || '', user_id: this.joyinUserId, tipMsg:'查询监控数据信息失败' } }).then(
                resp => { resolve(this._formalizeDatasetResponse(resp, Category)); },
                error => { reject(error); },
            );
        });
    }
}

export { MonitorRepo };