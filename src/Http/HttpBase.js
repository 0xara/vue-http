
import { extend } from 'js-helpers/dist/object/extend';
import HttpUtil from './HttpUtil';
import defaults from './HttpDefaultOptions';
import jqueryDriver from './drivers/jqueryDriver';
import fetchDriver from './drivers/fetchDriver';
import unfetchDriver from './drivers/unfetchDriver';

const drivers = {
    jqueryDriver,
    fetchDriver,
    unfetchDriver
};


const $allProcessing = [];

const $ajaxStopFunctions = [];

const $ajaxStartFunctions = [];

const $ajaxSuccessFunctions = [];

const $ajaxErrorFunctions = [];

const $ajaxSendFunctions = [];

const $ajaxCompleteFunctions = [];

let $ajaxSetupObject = {};

class HttpBase {
    static get allProcessing() { return $allProcessing; }

    static get ajaxStopFunctions() { return $ajaxStopFunctions; }

    static get ajaxStartFunctions() { return $ajaxStartFunctions; }

    static get ajaxSuccessFunctions() { return $ajaxSuccessFunctions; }

    static get ajaxErrorFunctions() { return $ajaxErrorFunctions; }

    static get ajaxSendFunctions() { return $ajaxSendFunctions; }

    static get ajaxCompleteFunctions() { return $ajaxCompleteFunctions; }

    static get ajaxSetupObject() { return $ajaxSetupObject; }

    static set ajaxSetupObject(options) { $ajaxSetupObject = options; }

    constructor(options) {
        window.onunhandledrejection = (e) => {
            e.preventDefault ? e.preventDefault() : (e.returnValue = false);
        };
    }

    static prepareSettings(options = {}) {
        const defaultOptions = { ...defaults };

        const settings = extend(true, {}, defaultOptions, HttpBase.ajaxSetupObject, options);

        return HttpUtil.prepareMethodType(settings);
    }

    getSettings(key, def = null) {
        const settings = HttpBase.prepareSettings(this.options);

        return key ? settings[key] || def : settings;
    }

    static applyAjaxStop() {
        HttpBase.ajaxStopFunctions.forEach((item) => {
            item();
        });
    }

    static applyAjaxStart() {
        HttpBase.ajaxStartFunctions.forEach((item) => {
            item();
        });
    }

    static applyAjaxSuccess(instance, response) {
        HttpBase.ajaxSuccessFunctions.forEach((item) => {
            item(instance, response);
        });
    }

    static applyAjaxError(instance, error) {
        HttpBase.ajaxErrorFunctions.forEach((item) => {
            item(instance, error);
        });
    }

    static applyAjaxSend(instance) {
        HttpBase.ajaxSendFunctions.forEach((item) => {
            item(instance);
        });
    }

    static applyAjaxComplete(instance, val) {
        HttpBase.ajaxCompleteFunctions.forEach((item) => {
            item(instance, val);
        });
    }

    handle() {
        HttpBase.insertProcessToQueue(this);

        const driver = new drivers[`${this.driver}Driver`](this.getSettings());

        return (this.handler = driver.handle());
    }

    submit() {
        return this.handle().then((val = {}) => {
            this.resolve(true, val);

            val.instance = this;

            return val;
        })
            .catch((err) => {
                this.resolve(true, err);

                err.instance = this;

                throw err;
            });
    }

    static insertProcessToQueue(instance) {
        const index = HttpBase.allProcessing.indexOf(instance);

        if(index != -1) return;

        HttpBase.applyAjaxSend(instance);

        if(HttpBase.allProcessing.length == 0) { HttpBase.applyAjaxStart(); }

        HttpBase.allProcessing.push(instance);
    }

    static removeProcessToQueue(instance) {
        const index = HttpBase.allProcessing.indexOf(instance);

        if(index == -1) return;

        HttpBase.allProcessing.splice(index, 1);

        if(HttpBase.allProcessing.length == 0) { HttpBase.applyAjaxStop(); }
    }

    resolve(state = true, val) {
        this.resolved = state;

        if(state) {
            HttpBase.applyAjaxComplete(this, val);

            if(val instanceof Error) {
                HttpBase.applyAjaxError(this, val);
            } else{
                HttpBase.applyAjaxSuccess(this, val);
            }

            HttpBase.removeProcessToQueue(this);
        }
    }
}

export default HttpBase;
