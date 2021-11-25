
import { helper } from '../helper';

function ConfigRepoModule () {

    const moduleStates = {

        /** last http request error time */
        lastErrorTime: null,
    };
    
    axios.defaults.timeout = 1000 * 30;
    axios.defaults.baseURL = window.ServiceBaseUrl;
    
    axios.interceptors.request.use(
    
        function (config) {
    
            if (!config.params) {
                config.params = {};
            }
    
            config.params['_'] = new Date().getTime();
    
            if (config.params && config.params.tipMsg) {
    
                config['tipMsg'] =  config.params.tipMsg; 
                delete config.params.tipMsg;
            }
            else if (config.data && config.data.tipMsg) {
    
                config['tipMsg'] =  config.data.tipMsg; 
                delete config.data.tipMsg;
            }
    
            return config;
        },
        
        function (error) { 
            Promise.reject(error); 
        }
    );
    
    axios.interceptors.response.use(
        
        response => {
    
            var resCode = response.data ? response.data.errorCode : 0;
            var resConfig = response.config;
            var tipMsg = resConfig.tipMsg ? resConfig.tipMsg : '';
            
            if (resCode === 404) {
                helper.showError(`${tipMsg}错误信息：服务器找不到请求的网页`);
            }
            else if (resCode === 400) {
                helper.showError(`${tipMsg}错误信息：服务器不理解请求的语法`);
            }
            else if (resCode === 500) {
                helper.showError(`${tipMsg}错误信息：服务器遇到错误，无法完成请求`);
            }
            else if (resCode !== 0 && resCode !== 200) {
                helper.showError(`${tipMsg}${resCode}/${response.data.errorMsg}`);
            }
    
            return response; 
        }, 
        
        error => {
    
            var resConfig = error.config;
            var tipMsg = '';
    
            if (!!resConfig) {
    
                if (resConfig.method == 'get' || resConfig.method == 'delete') {
                    tipMsg = resConfig.params.tipMsg ? resConfig.params.tipMsg + '：' : '';
                }
                else {
                    var data = JSON.parse(resConfig.data);
                    tipMsg = data.tipMsg ? data.tipMsg + '：' : '';
                }
            }
            
            var status = (error.request || error.response).status;
            var error_msg = null;
    
            if (error.message == 'Network Error') {
                error_msg = `${tipMsg} > http error > 网络连接错误`;
            }
            if (status >= 500) {
                // error_msg = `${tipMsg} > http error > 服务器未正确响应请求，错误码${status}`;
            }
            else if (status >= 400) {
                error_msg = `${tipMsg} > http error > 数据请求产生错误，错误码${status}`;
            }
    
            var ts = new Date().getTime();
            var show_allowed = moduleStates.lastErrorTime === null || (ts - moduleStates.lastErrorTime) > 1000;
    
            if (error_msg !== null && show_allowed) {
    
                moduleStates.lastErrorTime = ts;
                helper.showError(error_msg);
            }
            
            return Promise.reject({ httpCode: error.request.status, message: (error.response || {}).statusText }); 
        }
    );
}

if (window.hasConfigedRepoModule === undefined) {

    window.hasConfigedRepoModule = true;
    ConfigRepoModule();
}

class BaseRepo {

    /**
     * 当前指令归属交易员ID
     */
    get traderId() {
        return window.instructionTraderId || 0;
    }

    constructor() {
        
        this.joyinUserId = window.UserName;
        this.joyinUserRealName = window.RealName;
    }

    _formalizeDatasetResponse(resp, EntityType) {

        const resp_data = resp.data;
        return {

            errorCode: resp_data.errorCode, 
            errorMsg: resp_data.errorMsg, 
            data: !(resp_data.data instanceof Array) ? resp_data.data : resp_data.data.map(x => new EntityType(x)),
        };
    }
}

export { BaseRepo };