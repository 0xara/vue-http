import HttpBase from './HttpBase';

class Http extends HttpBase {
    constructor(options = {}) {
        super();
        this.setOptions(options);
    }

    setOptions(options) {
        const { name = '', driver = '', ...settings } = options;

        this.name = name;
        this.driver = driver;
        this.options = { ...settings, driver };

        return this;
    }

    get(url, data = {}, options = {}) {
        return new Http().setOptions({
            method: 'get', url, data, ...options
        }).submit();
    }

    post(url, data = {}, options = {}) {
        return new Http().setOptions({
            method: 'post', url, data, ...options
        }).submit();
    }

    put(url, data = {}, options = {}) {
        return new Http().setOptions({
            method: 'put', url, data, ...options
        }).submit();
    }

    patch(url, data = {}, options = {}) {
        return new Http().setOptions({
            method: 'patch', url, data, ...options
        }).submit();
    }

    delete(url, data = {}, options = {}) {
        return new Http().setOptions({
            method: 'delete', url, data, ...options
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
        HttpBase.defaults = options;
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
