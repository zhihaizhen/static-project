import { helper } from "../helper";

/**
 * 数据样本
 */
class DataSample {

    constructor(serieses) {

        /**
         * 有序数据点序列
         */
        this.points = !(serieses instanceof Array) ? [] : serieses.map(item => {

            return {

                pointx: item.recordTime,
                pointy: item.recordValue,
            };
        });
    }
}

/**
 * 后台监控数据指标项
 */
class Category {

    constructor(struc) {

        /** 分类名称 */
        this.name = struc.categoryName;
        /** 该分类数据，指定前端数据刷新间隔时间 */
        this.frequency = struc.scheduleTime;
        /** 该分类数据，最近一次的查询时间（每次轮询查询后，更新该标志时间，作为下一次增量查询的基准时间） */
        this.snapshotTime = struc.snapshotTime;

        /**
         * 该分类，包含的指标数据样本
         */
        let map = struc.recordListMap;
        let typedMap = {};

        for (var seriesName in map) {
            typedMap[seriesName] = new DataSample(map[seriesName]);
        }

        this.seriesMap = typedMap;
    }

    /**
     * 是否至少有一个指标，且该指标包含了一些数据
     */
    containsAny() {

        let map = this.seriesMap;
        
        for (let key in map) {

            let samp = map[key];
            if (samp instanceof DataSample && samp.points.length > 0) {
                return true;
            }
        }

        return false;
    }
}


export { Category, DataSample };
