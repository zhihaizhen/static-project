import { helper } from '../helper';
import { dictionary } from '../dictionary';
import { Instruction, BasketOrderInfo } from '../models';
import { TradingUnit, SelectControl } from './trading-unit';
import { JoyinTable } from '../joyin-table';

class FormData {

    /**
     * @param {Instruction} instruc 
     */
    constructor(instruc) {

        let first = instruc.basketList[0];

        this.portfolioName = instruc.portfolioName;
        this.accountName = instruc.tradeAccountId;
        this.stockCodeName = first ? `${ first.stockCode }/${ first.stockName }，等${ instruc.basketList.length }个` : '';
        this.direction = instruc.direction;
        this.algoType = dictionary.algoTypes[0].code;

        this.startTime = '09:30:00';
        this.endTime = '15:00:00';

        /** 是否可以超越结束时间，继续进行交易，以完成期望的交易总规模 */
        this.isEndTimeOverRunnable = 'false';
        /** 是否可在涨跌停极端价格场景下，进行下单交易 */
        this.isExtremePriceAcceptable = 'false';
    }
}

/**
 * 篮子交易单元
 */
class BasketUnit extends TradingUnit {

    get latestPrice() {

        let price = this.isContextTickOk ? this.contextTick.latest : this.isContextInstrucOk ? this.instruction.price : 0;
        return Math.max(price, 0.0000000001);
    }

    get unitHeight() {
        return 320;
    }

    get isTickRequired() {
        return false;
    }

    /**
     * @param {String} identifier
     * @param {Function} submitter
     */
    constructor(identifier, submitter) {

        super(identifier, submitter);
        this.setUnitName(TradingUnit.UnitNames.basket);
    }

    build() {
        this._createTable();
        this.directionCtr = new SelectControl({ unit: this, $control: this.$form.querySelector('.direction') });
        this.directionCtr.fill(dictionary.direction);
        this.directionCtr.disable();

        this.algoTypeCtr = new SelectControl({ unit: this, $control: this.$form.querySelector('.algo-type') });
        this.algoTypeCtr.fill(dictionary.algoTypes);


        this.$startTime = this.$form.querySelector('.start-time input');
        this.$endTime = this.$form.querySelector('.end-time input');

        const thisObj = this;
        layui.use('laydate', function () {

            layui.laydate.render({ elem: thisObj.$startTime, type: 'time' });
            layui.laydate.render({ elem: thisObj.$endTime, type: 'time' });
        });

        const submitBtn = document.getElementById('submit-basket-form');
        submitBtn.addEventListener('click',e => {
            // this.resetBasketTable();
        });

        /**
         * 重置按钮
         */
        var $ctr_reset_btn = layui.$(`form button[lay-filter='reset-form-basket']`);
        $ctr_reset_btn[0].onclick = this.resetForm.bind(this);
    }

    _createTable() {

        this.tbasket = new JoyinTable(document.getElementById('table-basket-quote'), this.identifyRecord, this, {
            
            tableName: 'joyin-table-basket-quote',
            headerHeight: this.settings.rowheight,
            rowHeight: this.settings.rowheight,
            footerHeight: this.settings.rowheight,
            pageSize: 999999,
        });

        this.tbasket.setMaxHeight(130);

    }

    resetBasketTable(){
        this.instruction.basketList.forEach(item => {
            this.tbasket.updateRow({id:item.id,leftVolume:0,leftAmount:0});
        })
    }

    identifyRecord(record) {
        return record.id;
    }

    getValidateRule() {

        return {

            startTime4Algorithm: (val_str, $control) => { return this._validateStartTime(val_str, $control); },
            endTime4Algorithm: (val_str, $control) => { return this._validateEndTime(val_str, $control); },
        };
    }

    resetForm() {

        this.tbasket.refill(this.instruction.basketList);
        const formd = new FormData(this.instruction);
        this.setVal(formd);
    }

    customizeData(field_data) {
        
        const instruc = this.instruction;
        const ordinfo = new BasketOrderInfo({

            instructionId: instruc.id,
            portfolioId: instruc.portfolioId,
            userId: instruc.tradeId,
            username: instruc.traderName,
            accountId: instruc.acctNo,
            entrustBs: instruc.bsFlag,
            entrustProp: instruc.bsProp,
            algoType: this.algoTypeCtr.value,
            startTime: this.$startTime.value,
            endTime: this.$endTime.value,
            isEndTimeOverRunnable: field_data.isEndTimeOverRunnable == true.toString(),
            isExtremePriceAcceptable: field_data.isExtremePriceAcceptable == true.toString(),
            basketList: instruc.basketList.filter(item => {
                return item.leftVolume > 0;
            }),
            tipMsg: '篮子交易下单失败',
        });

        ordinfo.latestPrice = this.latestPrice;
        ordinfo.floorPrice = this.isContextTickOk ? this.contextTick.floor : 0;
        ordinfo.ceilingPrice = this.isContextTickOk ? this.contextTick.ceiling : 0;
        
        return ordinfo;
    }

    isCustomziedOk(){
        
        const bObj = this.instruction.basketList.find(function(ele) {
            return ele.leftVolume > 0;
        });
        if(!!bObj){
            return true;
        }
        else{
            return '暂无可交易数据';
        }
    }

	_validateStartTime(val_str, $control) {

        let start_time = this.$startTime.value;
        if (!start_time || !/^\d{2}:\d{2}:\d{2}$/.test(start_time)) {
            return '开始时间格式不正确';
        }
    }
    
	_validateEndTime(val_str, $control) {
        
        let start_time = this.$startTime.value;
        let end_time = this.$endTime.value;

        if (!end_time || !/^\d{2}:\d{2}:\d{2}$/.test(end_time)) {
            return '结束时间格式不正确';
        }

        if (end_time <= start_time) {
            return `开始时间${ start_time } >= 结束时间${ end_time }`;
        }
    }

    fitTableColumnWith(){
        this.tbasket.fitColumnWidth();  
    }

}

export { BasketUnit };