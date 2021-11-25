import { helper } from "../helper";

/**
 * 表格汇总信息
 */
class TableSummary {

    constructor(struc) {

        /** 表格名称 */
        this.name = struc.name;
        /** 内含数据量 */
        this.count = struc.count;
    }
}

export { TableSummary };
