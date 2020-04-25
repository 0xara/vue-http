import HttpBase from './HttpBase';
import HttpUtil from './HttpUtil';

class Http extends HttpBase {
    constructor(options = {}) {
        super();
        this.init(options);
    }

    init(options) {
        const { name = '', driver = 'jquery', baseUrl = '', url, ...settings } = options;

        this.name = name;
        this.driver = driver;
        settings.method && (settings.method = settings.method.toUpperCase());
        this.options = { ...settings, driver, url: HttpUtil.urlGenerator(baseUrl, url) };

        return this;
    }

    get(url, data = {}, options = {}) {
        return new Http().init({
            method: 'get', url, data, ...(this.options || {}) ,...options
        }).submit();
    }

    post(url, data = {}, options = {}) {
        return new Http().init({
            method: 'post', url, data, ...(this.options || {}) ,...options
        }).submit();
    }

    put(url, data = {}, options = {}) {
        return new Http().init({
            method: 'put', url, data, ...(this.options || {}) ,...options
        }).submit();
    }

    patch(url, data = {}, options = {}) {
        return new Http().init({
            method: 'patch', url, data, ...(this.options || {}) ,...options
        }).submit();
    }

    delete(url, data = {}, options = {}) {
        return new Http().init({
            method: 'delete', url, data, ...(this.options || {}) ,...options
        }).submit();
    }

    submit() {
        return super.submit();
    }

    then(func) {
        this.handler.then((val) => {
            const value = func(val);

            this.resolve(!value, val);

            if(value) return value;
        });

        return this;
    }

    done(func) {
        this.handler.then((val) => {
            func(val);

            this.resolve(true, val);
        });

        return this;
    }

    catch(func) {
        this.handler.catch((val) => {
            const value = func(val);

            if(value) return value;

            this.resolve(true, val);
        });

        return this;
    }

    fail(func) {
        this.handler.catch((val) => {
            func(val);

            this.resolve(true, val);
        });

        return this;
    }

    always(func) {
        this.handler.then((val) => {
            const value = func(val);

            return value || val;
        });

        this.handler.catch((val) => {
            const value = func(val);

            if(value) return value;

            throw val;
        });

        return this;
    }

    static ajaxSetup(options = {}) {
        HttpBase.ajaxSetupObject = options;
    }

    static ajaxStop(func) {
        HttpBase.ajaxStopFunctions.push(func);
    }

    static ajaxStart(func) {
        HttpBase.ajaxStartFunctions.push(func);
    }

    static ajaxSuccess(func) {
        HttpBase.ajaxSuccessFunctions.push(func);
    }

    static ajaxError(func) {
        HttpBase.ajaxErrorFunctions.push(func);
    }

    static ajaxSend(func) {
        HttpBase.ajaxSendFunctions.push(func);
    }

    static ajaxComplete(func) {
        HttpBase.ajaxCompleteFunctions.push(func);
    }
}

export default Http;
