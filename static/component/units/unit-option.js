import { helper } from '../helper';
import { dictionary } from '../dictionary';
import { OptionOrderInfo, XtradeTickData } from '../models';
import { SiblingOptionsSeeker } from '../mock-data/mock-option-instructions';
import { CompeteUnit } from './unit-compete.js';
import { JoyinTable } from '../joyin-table';

class BasicQuote {

    constructor(stock_code, stock_name) {

        this.stockCode = stock_code;
        this.stockName = stock_name;
        this.innerValue = null;
        this.timeValue = null;
        this.tradeVolume = null;
        this.percentage = null;
        this.sellVolume = null;
        this.sellPrice = null;
        this.buyVolume = null;
        this.buyPrice = null;
        this.latestPrice = null;
    }
}

class OptQuote {

    /**
     * @param {String} long_stock_code 
     * @param {String} short_stock_code 
     */
    static MakePk(long_stock_code, short_stock_code) {
        return long_stock_code + '/' + short_stock_code;
    }

    /**
     * @param {BasicQuote} long_quote 
     * @param {BasicQuote} short_quote 
     * @param {Number} strike_price 
     */
    constructor(long_quote, short_quote, strike_price) {
        
        this.id = OptQuote.MakePk(long_quote.stockCode, short_quote.stockCode);
        this.strikePrice = strike_price;
        this.trimedStrikePrice = strike_price.toFixed(4);

        for(let prop_name in long_quote) { this['long-' + prop_name] = long_quote[prop_name]; }
        for(let prop_name in short_quote) { this['short-' + prop_name] = short_quote[prop_name]; }
    }
}

/**
 * 期权交易单元
 */
class OptionUnit extends CompeteUnit {

    /**
     * @param {String} identifier
     * @param {Function} submitter
     */
    constructor(identifier, submitter) {

        super(identifier, submitter);
        this.setUnitName(CompeteUnit.UnitNames.option);
    }

    /**
     * @param {OptQuote} record 
     */
    identifyQuote(record) {
        return record.id;
    }

    seekTargetStockPrice() {
        return this.isContextTickOk ? this.contextTick.latest : 0;
    }
    
    build() {

        super.build();

        this.$tquotePane = document.querySelector('.tquote-panel');
        this.tableQuote = new JoyinTable(this.$tquotePane.querySelector('table'), this.identifyQuote, this, {
            
            tableName: 'joyin-table-option-quote',
            headerHeight: this.settings.rowheight,
            rowHeight: this.settings.rowheight,
            footerHeight: this.settings.rowheight,
            pageSize: 999999,
            rowSelected: this.handleRowSelect.bind(this),
        });

        this.tableQuote.setMaxHeight(400);
        this.$btnQuote = this.$form.querySelector('.btn-open-quote');
        this.$btnQuote.onclick = this.handleOpenQuoteRequest.bind(this);
    }

    
    getValidateRule() {

        return {

            price4Option: (val_str, $control) => { return this._validatePrice(val_str, $control); },
            volume4Option: (val_str, $control) => { return this._validateVolume(val_str, $control); },
            amount4Option: (val_str, $control) => { return this._validateAmount(val_str, $control); },
        };
    }

    makeStrikePriceCellClass() {
        return 'cell-strike-price';
    }

    /**
     * @param {Number} time_value 
     * @param {OptQuote} record 
     */
    makeTimeValueCellClass(time_value, record) {
        return time_value > 0 ? 's-bg-red' : time_value < 0 ? 's-bg-green' : '';
    }

    /**
     * @param {Number} inner_value 
     * @param {OptQuote} record 
     */
    makeInnerValueCellClass(inner_value, record) {
        return inner_value > 0 ? 's-bg-red' : '';
    }

    /**
     * @param {Number} field_value 
     * @param {OptQuote} record 
     */
    makePosNegCellClass(field_value, record) {

        let percentage = record['long-percentage'];
        return percentage > 0 ? 's-bg-red' : percentage < 0 ? 's-bg-green' : '';
    }

    /**
     * @param {Number} field_value 
     * @param {OptQuote} record 
     */
    makePosNegCellClass2(field_value, record) {

        let percentage = record['short-percentage'];
        return percentage > 0 ? 's-bg-red' : percentage < 0 ? 's-bg-green' : '';
    }

    /**
     * @param {OptQuote} record 
     */
    handleRowSelect(record) {

        //
    }

    handleOpenQuoteRequest() {

        event.cancelBubble = true;
        
        if (this._isTQuoteInitialized === undefined) {

            this._isTQuoteInitialized = true;
            this.$tquotePane.classList.remove('is-hidden');
        }
        
        const thisObj = this;
        const instruc = this.instruction;
        const layer = layui.layer;
        this.$tquotePane.classList.remove('is-hidden');

        layer.open({

            type: 1, 
            title: `${instruc.targetStockCode}/${instruc.targetStockName} ~ 期权T型报价`,
            closeBtn: false,
            area: '1600px',
            maxHeight: '450px',
            shade: 0.8,
            id: 'unit_option_tquote',
            btn: ['关闭'],
            btnAlign: 'r',
            moveType: 1,
            content: layui.$('.tquote-panel'),

            success: function(layero) {
                thisObj.fillOptions();
            },

            yes: function (layer_idx, layero) {

                layer.close(layer_idx);
                thisObj.tableQuote.scroll2Top();
                thisObj.$tquotePane.classList.add('is-hidden');
                thisObj.closeTQuote();
            },
        });
    }

    fillOptions() {

        const thisObj = this;
        const mainStockCode = this.instruction.targetStockCode;
        const neighbors = SiblingOptionsSeeker(mainStockCode);
        const quotes = neighbors.map(x => new OptQuote(new BasicQuote(x.longStockCode, x.longStockName), new BasicQuote(x.shortStockCode, x.shortStockName), x.strikePrice));

        this.neighborOptions = neighbors;
        this.tableQuote.refill(quotes);
        
        this.closeTQuote();
        this.updateQuote();
        this._jobQuoteUpdate = setInterval(() => { thisObj.updateQuote(); }, 1000 * 5);
    }

    async updateQuote() {

        if (this._isRequestingTick) {
            return;
        }

        try {

            /**
             * 
             * @param {Object} container 
             * @param {String} prefix 
             * @param {XtradeTickData} tick_data 
             */
            function mergeChange(container, prefix, tick_data) {

                container[prefix + 'latestPrice'] = tick_data.latest;
                container[prefix + 'percentage'] = tick_data.changePercent;
                container[prefix + 'tradeVolume'] = tick_data.tradeVolume;
                container[prefix + 'sellVolume'] = tick_data.sellVolumes[4];
                container[prefix + 'sellPrice'] = tick_data.sells[4];
                container[prefix + 'buyVolume'] = tick_data.buyVolumes[0];
                container[prefix + 'buyPrice'] = tick_data.buys[0];
            }

            this._isRequestingTick = true;
            const big_map = {};
            const all_codes = [];

            this.neighborOptions.forEach(x => {

                all_codes.push(x.longStockCode);
                all_codes.push(x.shortStockCode);
            });

            while (all_codes.length > 0) {

                let batch_codes = all_codes.splice(0, 50);
                let resp = await this.quoteRepo.queryLastXtradeTick(batch_codes.join(','));
                let tick_map = resp.data;
                helper.extend(big_map, tick_map);
            }

            const isTickOk = this.isContextInstrucOk;
            const targetStockPrice = this.seekTargetStockPrice();

            this.neighborOptions.forEach(item => {

                let row_pk = OptQuote.MakePk(item.longStockCode, item.shortStockCode);
                let matched_long = big_map[helper.convertStockCodeOut(item.longStockCode)];
                let matched_short = big_map[helper.convertStockCodeOut(item.shortStockCode)];
                let hot_change = { id: row_pk };
                let has_any_change = false;

                if (matched_long) {

                    let tick_data = new XtradeTickData(item.longStockCode, item.longStockName, matched_long);
                    let inner_value = isTickOk ? Math.max(0, targetStockPrice - item.strikePrice) : null;
                    let prefix = 'long-';
                    mergeChange(hot_change, prefix, tick_data);
                    hot_change[prefix + 'innerValue'] = isTickOk ? inner_value : null;
                    hot_change[prefix + 'timeValue'] = isTickOk ? tick_data.latest - inner_value : null;
                    has_any_change = true;
                }

                if (matched_short) {

                    let tick_data = new XtradeTickData(item.shortStockCode, item.shortStockName, matched_short);
                    let inner_value = isTickOk ? Math.max(0, item.strikePrice - targetStockPrice) : null;
                    let prefix = 'short-';
                    mergeChange(hot_change, prefix, tick_data);
                    hot_change[prefix + 'innerValue'] = isTickOk ? inner_value : null;
                    hot_change[prefix + 'timeValue'] = isTickOk ? tick_data.latest - inner_value : null;
                    has_any_change = true;
                }

                if (has_any_change) {
                    this.tableQuote.updateRow(hot_change);
                }
            });
        }
        catch (ex) {
            console.error(ex);
        }
        finally {
            this._isRequestingTick = false;
        }
    }

    closeTQuote() {

        if (this._jobQuoteUpdate) {

            clearInterval(this._jobQuoteUpdate);
            delete this._jobQuoteUpdate;
        }
    }

    customizeData(field_data) {

        const instruc = this.instruction;
        const ordinfo = new OptionOrderInfo({

            instructionId: instruc.id,
            portfolioId: instruc.portfolioId,
            userId: instruc.tradeId,
            username: instruc.traderName,
            accountId: instruc.acctNo,
            entrustBs: instruc.bsFlag,
            entrustProp: this.priceModeCtr.value,
            priceMode: dictionary.priceMode.fixed.code,
            stockCode: instruc.stockCode,
            entrustVolume: this.volumeCtr.value,
            entrustPrice: this.priceCtr.value,
            tipMsg: '期权交易下单失败',
        });

        return ordinfo;
    }
}

export { OptionUnit };