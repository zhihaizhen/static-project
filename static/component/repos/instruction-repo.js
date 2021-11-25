
import { Instruction } from '../models';
import { BaseRepo } from './base-repo';
import { dictionary } from '../dictionary';
import { helper } from '../helper';

class InstructionRepo extends BaseRepo {

    constructor() {
        super();
    }

    /**
     * 查询指令列表
     * @param {String|Array<String>} instruction_id <optional> 单一指令ID | 指令ID数组 | 缺省/undefined
     * @returns {{ errorCode: 0, errorMsg: null, data: [Instruction] }}
     */
    queryInstructions(instruction_id = null) {

        let isBySingle = typeof instruction_id == 'string' && instruction_id.trim().length > 0;
        let isByList = instruction_id instanceof Array && instruction_id.length > 0;

        /**
         * 补全指令当中质押券合约代码与名称
         * @param {Array} instructions 
         */
        function repairPledgeRecords(instructions) {

            const ATY = dictionary.assetType;
            const MKT = dictionary.market;
            const SzMap = {

                'R-001': '131810',
                'R-002': '131811',
                'R-003': '131800',
                'R-004': '131809',
                'R-007': '131801',
                'R-014': '131802',
                'R-028': '131803',
                'R-091': '131805',
                'R-182': '131806',
            };

            instructions.forEach(ins => {

                let assset_type = ins.assetType;
                let repo_type = ins.assetType1;
                let is_pledge_type = assset_type == ATY.standardVoucher.code;
                
                if (!is_pledge_type || repo_type == dictionary.repoType.protocol.code) {
                    return;
                }

                /**
                 * 期限天数
                 */
                let term_days = ins.termDays;
                if (typeof term_days != 'number' || term_days <= 0) {
                    return;
                }

                if (term_days < 10) {
                    term_days = '00' + term_days;
                }
                else if (term_days >= 10 && term_days < 100) {
                    term_days = '0' + term_days;
                }
                else {
                    term_days = term_days.toString();
                }

                /**
                 * 交易所
                 */
                let trade_market = ins.tradeMarket;
                let is_sh = trade_market == MKT.shsec.code;
                let stock_code = is_sh ? (204 + term_days + '.SH') : (SzMap['R-' + term_days] || 'R-' + term_days) + '.SZ';
                let stock_name = is_sh ? ('GC' + term_days) : ('R-' + term_days);
                
                /** 金融产品代码 */
                ins.finprodId = stock_code;
                /** 场内证券代码 */
                ins.finprodMarketId = stock_code;
                /** 金融产品简称 */
                ins.finprodAbbr = stock_name;
                /** 金融产品全称 */
                ins.finprodName = stock_name;
            });
        }

        /**
         * 将返回数据结构（内含，分页信息、指令列表、质押券列表）标准化为数据
         */
        function standarizeInstructions(resp) {

            let pagingData = resp.data.data;
            let instructions = pagingData.etr_entrust_list;
            let pledges = pagingData.etr_pledge_list;

            if (!(instructions instanceof Array) || instructions.length == 0) {
                return [];
            }
            else if (!(pledges instanceof Array) || pledges.length == 0) {
                return instructions;
            }

            pledges.forEach(item => {

                let entrust_id = item.entrustId;
                let matched_instruc = instructions.find(x => x.entrustId == entrust_id);

                if (matched_instruc) {

                    if (!(matched_instruc.pledgeList instanceof Array)) {
                        matched_instruc.pledgeList = [];
                    }

                    matched_instruc.pledgeList.push(item);
                }
            });

            return instructions;
        }

        const thisObj = this;

        /**
         * 处理返回结果
         * @param {*} resp 
         * @param {Function} resolve 
         */
        function analyzeResp(resp, resolve) {

            let instruction_list = standarizeInstructions(resp);
            
            /**
             * 补全指令当中质押券合约代码与名称
             */
            repairPledgeRecords(instruction_list);

            let dto = {

                data: {

                    data: instruction_list,
                    errorCode: 0,
                    errorMsg: null,
                }
            };

            let data_resp = thisObj._formalizeDatasetResponse(dto, Instruction);
            resolve(data_resp);
        }

        let target_ids = isBySingle ? [instruction_id.trim()] : isByList ? instruction_id : [];

        return new Promise((resolve, reject) => {

            axios.get(`instruction/users?user_id=${ this.joyinUserId }&instruction_id=${ target_ids.join(',') }`,{ params: { tipMsg: '指令查询失败' }})
                 .then(resp => { analyzeResp(resp, resolve); }, error => { reject(error); });
        });
    }

    /**
     * 查询合约信息
     * @param {Array<String>} stock_codes 目标合约代码集合
     */
    queryStockConfig(stock_codes) {

        if (!Array.isArray(stock_codes)) {
            stock_codes = [stock_codes];
        }

        return new Promise((resolve, reject) => {

            axios.post(`/common/instrument?user_id=${ this.traderId }`, stock_codes).then(
                resp => { resolve(resp.data); }, 
                error => { reject(error); },
            );
        });
    }

    /**
     * 接收指令
     * @param {Array<Instruction>} instrucs 要接收的多个指令（单个指令，可不传数组）
     */
    accept(instrucs) {
        return this._treatInstruction(instrucs, 1);
    }

    /**
     * 放弃指令
     * @param {Array<Instruction>} instrucs 要放弃的多个指令（单个指令，可不传数组）
     */
    release(instrucs) {
        return this._treatInstruction(instrucs, 2);
    }

    /**
     * @param {Array<Instruction>} instrucs
     * @param {Number} action_flag
     */
    _treatInstruction(instrucs, action_flag) {
        
        if (!(instrucs instanceof Array)) {
            instrucs = [instrucs];
        }

        let post_data = instrucs.map(sid => ({ instructionId: sid.id, trader: sid.tradeId, recStatus: action_flag }));
        return new Promise((resolve, reject) => {
            
            axios.post(`instruction/confirm`, post_data).then(
                resp => { resolve(resp.data); },
                error => { reject(error); },
            );
        });
    }
}

export { InstructionRepo };