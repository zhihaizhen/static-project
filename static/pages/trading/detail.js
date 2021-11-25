
import { JoyinTableActions } from '../../component/join-table-actions';
import { helper } from '../../component/helper';
import { Instruction } from '../../component/models';
import { BaseModule } from './base';

const Properties = [

    ['stockName', '资产名称'],
    ['stockCode', '资产代码'],
    ['assetType', '资产类型', JoyinTableActions.formatAssetType],
    ['repoType', '回购类型', JoyinTableActions.formatRepoType],
    ['direction', '委托方向', JoyinTableActions.formatInstrucDirection],
    [null, '目标类型', function(ins) { return ins instanceof Instruction && ins.isByVolume ? '数量指令' : '金额指令'; }],
    ['volume', '指令数量', JoyinTableActions.formatUnitedVolume],
    ['leftVolume', '剩余指令数量'],
    ['amount', '指令金额', function(ins) { return ins instanceof Instruction && ins.isByAmount ? helper.thousands(ins.amount) : ''; }],
    ['leftAmount', '剩余指令金额'],
    ['finishedQuantity', '已完成'],
    ['priceMode', '价格模式', JoyinTableActions.formatPriceMode],
    ['price', '指令价格', JoyinTableActions.formatPrice],
    ['fullPrice', '全价'],
    ['minAmt', '最低成交金额'],
    ['instrucStatus', '指令状态', JoyinTableActions.formatInstrucStatus],
    ['managerId', '投资经理'],
    ['accountId', '证券账户代码'],
    ['accountName', '证券账户名称'],
    ['tradeAccountId', '资金账号'],
    ['accountBelongerName', '资金账号名称'],
    ['stockholderId', '股东代码'],
    ['marketId', '交易所', JoyinTableActions.formatMarket],
    ['tradePlat', '交易平台', JoyinTableActions.formatPlatform],
    ['ccy', '币种'],
    ['counterName', '交易对手'],
    ['counterTrader', '对手方交易员'],
    ['counterTel', '对手方联系方式'],
    ['counterDealerId', '对手方交易商'],
    ['appointmentNumber', '约定号'],
    ['dealNo', '成交编号'],
    //['trdMatchId', '交易编号'],
    ['tradeId', '交易员编号'],
    ['startDate', '指令开始日期'],
    ['endDate', '指令结束日期'],
    ['termDays', '期限天数'],
    ['termDays2', '期限天数2'],
    ['firstSettleDate', '首期结算日', function (ins) { return ins instanceof Instruction && ins.isRepo ? ins.firstSettleDate : ''; }],
    ['maturityDate', '到期结算日', function (ins) { return ins instanceof Instruction && ins.isRepo ? ins.maturityDate : ''; }],
    ['traderName', '交易员姓名'],
    //['tradeDate', '指令日期'],
    ['settleSpeed', '清算速度'],
    ['purchType', '申购类型'],
    ['targetFinprodId', '目标产品代码'],
    ['targetStockCode', '目标产品市场代码'],
    ['targetStockName', '目标产品简称'],
];

const LocalClasses = {

    success: 'success',
    error: 'error',
};

class ModuleDetail extends BaseModule {

    /**
     * @param {HTMLElement} $container 
     */
    constructor($container) {
        super($container);
    }

    /**
     * 执行指令详情更新
     * @param {Instruction} instruction 
     */
    updateContent(instruction) {

        function makeSingle(label, property_value) {
    
            return `<div class="detail-item">
                        <div class="item-lable">${ label }</div>
                        <div class="item-value" title="${ property_value }"> ${ property_value } </div>
                    </div>`;
        };

        let results = [];
        let body_width = parseInt((document.body.clientWidth - 60) / 250);
        let pIndex = 0;

        Properties.forEach(item => {

            let property_name = item[0];
            let label = item[1];
            let formatter = item[2];
            
            let property_value = typeof formatter == 'function' ? formatter(instruction, instruction[property_name], property_name) : instruction[property_name];
            if (helper.isNotNone(property_value) && property_value !== 0) {

                results.push(makeSingle(label, property_value));
                if (pIndex++ <= body_width - 2) {
                    results.push(`<div class="divide-line" style="position:absolute; left:${ pIndex * 260 }px" ></div>`);
                }
            }
        });

        this.$inner.innerHTML = results.join('');
    }

    /**
     * @param {Instruction} instruction 上下文指令
     */
    takeAction(instruction) {

        if (this.initializedDom === undefined) {

            this.initializedDom = true;
            this.$container.classList.remove(BaseModule.Classes.hidden);
        }

        this.updateContent(instruction);
    }

    /**
     * 设置指令可交易状态信息
     * @param {Boolean} isOk 
     * @param {String} message 
     */
    setGuideline(isOk, message) {

        let $guideline = this.$guideline;

        if (isOk) {

            $guideline.textContent = `指令[${this.instruction.id}] ~ 详情信息`;
            $guideline.classList.remove(LocalClasses.error);
            $guideline.classList.add(LocalClasses.success);
        }
        else {

            $guideline.textContent = `该指令[${this.instruction.id}] ~ ${message}`;
            $guideline.classList.remove(LocalClasses.success);
            $guideline.classList.add(LocalClasses.error);
        }
    }

    /**
     * 切换完整/简单展示风格
     */
    toggleView() {

        var $icon = this.$expander.querySelector('i');
        var up_class = 'layui-icon-up';
        var down_class = 'layui-icon-down';
        var expanded = 'expanded';

        if ($icon.classList.contains(up_class)) {
            
            $icon.classList.remove(up_class);
            $icon.classList.add(down_class);
            this.$container.classList.remove(expanded);
        }
        else {
            
            $icon.classList.remove(down_class);
            $icon.classList.add(up_class);
            this.$container.classList.add(expanded);
        }
    }

    build() {

        this.$container.classList.add(BaseModule.Classes.hidden);
        this.$inner = this.$container.querySelector('#detail-panel-inner');
        this.$guideline = this.$container.querySelector('#detail-guideline');
        this.$expander = this.$container.querySelector('#expander');
        this.$expander.onclick = this.toggleView.bind(this);
    }
}

export { ModuleDetail };