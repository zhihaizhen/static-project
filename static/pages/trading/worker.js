
import { Instruction } from '../../component/models';
import { BaseModule } from './base';
import { ModuleInstruction } from './instruction';
import { ModuleDetail } from './detail';
import { ModuleOrdering } from './ordering';
import { ModuleRecords } from './records';

class ModuleWorker extends BaseModule {

    /**
     * @param {HTMLElement} $container 
     */
    constructor($container, { minstruc, mdetail, mordering, mrecords }) {

        super($container);
        this.minstruc = minstruc instanceof ModuleInstruction ? minstruc : null;
        this.mdetail = mdetail instanceof ModuleDetail ? mdetail : null;
        this.mordering = mordering instanceof ModuleOrdering ? mordering : null;
        this.mrecords = mrecords instanceof ModuleRecords ? mrecords : null;
    }

    /**
     * @param {Instruction} instruction
     * @param {String} trading_day
     */
    checkInstrucPass(instruction, trading_day) {

        if (instruction.isIllegal) {
            return { isOk: false, message: '无法确定交易单元' };
        }

        let start_date = instruction.startDate;
        let end_date = instruction.endDate;
        let isOk = true;
        let message = null;
        
        if (start_date > trading_day) {

            isOk = false;
            message = `开始日 ${ start_date } > 平台日 ${ trading_day }，暂不可交易`;
        }
        else if (end_date < trading_day) {

            isOk = false;
            message = `结束日 ${ end_date } < 平台日 ${ trading_day }，已过期`;
        }

        if (instruction.isPending) {
            
            isOk = false;
            message = '尚未接收，接收后方可交易';
        }
        else if (instruction.isRecalled) {
            
            isOk = false;
            message = '已被撤回';
        }
        else if (instruction.isClosed) {
            
            isOk = false;
            message = '已被关闭';
        }
        else if (instruction.isRejected) {
            
            isOk = false;
            message = '已被退回';
        }

        return { isOk, message };
    }

    /**
     * @param {Instruction} instruction 上下文指令
     */
    takeAction(instruction) {

        let checkResult = this.checkInstrucPass(instruction, this.tradingDay);

        if (checkResult.isOk) {
            this.$bottomPanel.style.visibility = 'visible';
        }
        else {
            this.$bottomPanel.style.visibility = 'hidden';
        }

        /**
         * 设置合适的引导文字
         */
        this.mdetail.setGuideline(checkResult.isOk, checkResult.message);

        /**
         * 可交易指令，向各个模块推送指令
         */

        this.mdetail.takeAction(instruction);        
        this.mordering.takeAction(instruction);
        this.mrecords.takeAction(instruction);
    }

    /**
     * 处理指令列表模块 & 下方详情与交易模块，纵向拖拽变化
     */
    handleTopSplit() {
        //
    }

    /**
     * 处理交易单元模块 & 今日数据模块，横向拖拽变化
     */
    handleBottomSplit() {

        this.mordering.expand();
        this.mrecords.expand();
    }

    /**
     * 创建分割器
     */
    setupSpliters() {

        Split([BaseModule.Selectors.tinstruc, BaseModule.Selectors.bottomp], {

            sizes: [30, 70],
            minSize: 100,
            direction: 'vertical',
            onDragEnd: this.handleTopSplit.bind(this),
        });

        Split([BaseModule.Selectors.leftp, BaseModule.Selectors.rightp], {

            sizes: [60, 40],
            minSize: 500,
            expandToMin: true,
            onDragEnd: this.handleBottomSplit.bind(this),
        });
    }

    /**
     * 为需要LEVEL2行情的交易单元，准备必备的LEVEL2展示DOM结构
     */
    static setupLevel2Doms() {

        let $contentRoot = document.querySelector('#content-root');
        let $unormal = $contentRoot.querySelector('#tab-content-normal');
        let $ubatch = $contentRoot.querySelector('#tab-content-batch');
        let $uequal = $contentRoot.querySelector('#tab-content-equal');
        let $ufuture = $contentRoot.querySelector('#tab-content-future');
        let $uoption = $contentRoot.querySelector('#tab-content-option');

        let $troot = document.querySelector('#template-root');
        let $level2 = $troot.querySelector('.level2-panel');
        
        $unormal.insertBefore($level2.cloneNode(true), $unormal.firstElementChild);
        $ubatch.insertBefore($level2.cloneNode(true), $ubatch.firstElementChild);
        $uequal.insertBefore($level2.cloneNode(true), $uequal.lastElementChild);
        $ufuture.insertBefore($level2.cloneNode(true), $ufuture.lastElementChild);
        $uoption.insertBefore($level2.cloneNode(true), $uoption.lastElementChild);

        /**
         * 销毁原始模版结构
         */

        $troot.parentNode.removeChild($troot);
    }

    build() {

        /**
         * 选中指令，展示于下方的交易面板 & 今日数据
         */

        this.$bottomPanel = this.$container.querySelector(BaseModule.Selectors.tradingp);
        this.setupSpliters();
    }
}

export { ModuleWorker };