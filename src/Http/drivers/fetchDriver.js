
import HttpUtil from './../HttpUtil';
import { tryParseJson } from 'js-helpers/dist/json/tryParseJson';
import { encodeQueryData } from 'js-helpers/dist/request/queryStringParameter';

class fetchDriver {
    constructor(options) {
        this.options = fetchDriver.prepareSettings(options);
    }

    handle() {
        return import(/* webpackChunkName: "vendors/fetch" */'whatwg-fetch').then(() => {
            return new Promise(((res, rej) => {
                fetch(this.options.url, this.options)
                    .then(checkStatus)
                    .then((response) => {
                        response.text().then((text) => {
                            res({
                                data: tryParseJson(text),
                                status: response.status,
                                statusText: response.statusText,
                                headers: response.headers,
                                config: this.options,
                                request: response
                            });
                        });
                    })
                    .catch((err) => {

                        const error = new Error(err.message);

                        error.config = this.options;

                        if(!err.response && err.message === 'timeout') {
                            error.request = {}; //jqXHR
                        }

                        if(err.response && fetchDriver.requestHasStatusFromServer(err.response.status)) {

                            err.response.text().then((text) => {
                                error.request = {
                                    status: err.response.status
                                }; //jqXHR
                                error.response = {
                                    data: tryParseJson(text),
                                    status: err.response.status,
                                    headers: err.response.headers
                                };
                                rej(error);
                            });

                        } else {
                            rej(error);
                        }
                    });
            }));
        });
    }

    static prepareSettings(options) {
        const {
            method = 'GET', url, data = {}, responseType: dataType = 'json', withCredentials = 'same-origin', ...rest
        } = options;

        const restOptions = fetchDriver.handleXhr(rest);

        const settings = {
            method, url: fetchDriver.prepareUrl(method, url, data), body: fetchDriver.prepareData(method, data), ...restOptions
        };

        settings.headers = { ...(settings.headers || {}), ...fetchDriver.prepareDataType(dataType) };

        /** for sending cookies **/
        settings.credentials = withCredentials;

        if(HttpUtil.isFormData(settings.body)) {
            //https://stackoverflow.com/questions/39280438/fetch-missing-boundary-in-multipart-form-data-post
            delete settings.headers['Content-Type'];
        }

        return settings;
    }

    static prepareData(method, data) {

        if(method==='GET') return undefined;

        if(HttpUtil.isFormData(data)) return data;

        /** ie9 not support File we must upload with formData **/
        /** and we must have formData polyfill and create formData **/
        /** on getting data from form **/
        if(!window.File || !HttpUtil.hasFiles(data)) return JSON.stringify(data);

        return HttpUtil.objectToFormData(data);
    }

    static prepareUrl(method, url, data) {
        if (method !== 'GET') return url;

        return `${url}?${encodeQueryData(data)}`;
    }


    static requestHasStatusFromServer(status) {
        return status > 0;
    }


    static handleXhr(options) {
        const { onUploadProgress, ...rest } = options;

        if(!onUploadProgress) return rest;

        // fetch specification doesn't contain functionality
        // that allows implementing progress indicators

        return rest;
    }

    static prepareDataType(dataType) {
        switch (dataType) {
            case 'json':
                return {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json, text/javascript, */*; q=0.01'
                };
            default:
                return {};
        }
    }

}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error
    }
}

function parseJSON(response) {
    return response.data.text().then((text) => {
        response.data = text;
        return response;
    });
}

function timeoutPromise(ms, promise) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error("promise timeout"))
        }, ms);
        promise.then(
            (res) => {
                clearTimeout(timeoutId);
                resolve(res);
            },
            (err) => {
                clearTimeout(timeoutId);
                reject(err);
            }
        );
    })
}

export default fetchDriver;
