
import HttpUtil from './../HttpUtil';
import { tryParseJson } from 'js-helpers/dist/json/tryParseJson';
import { extend } from 'js-helpers/dist/object/extend';


class jqueryDriver {
    constructor(options) {
        this.options = jqueryDriver.prepareSettings(options);
    }

    handle($ = window.$ ) {
        if(!$) {
            return this.importJqueryAndHandle();
        }

        return new Promise(((res, rej) => {
            $.ajax(this.options).done((data, textStatus, jqXHR) => {
                res({
                    data,
                    status: jqXHR.status,
                    statusText: textStatus,
                    headers: jqXHR.getAllResponseHeaders(),
                    config: this.options,
                    request: jqXHR
                });
            }).fail((jqXHR, textStatus, errorThrown) => {
                const error = new Error(textStatus);

                error.config = this.options;

                if(textStatus == 'timeout') {
                    error.request = jqXHR;
                }

                if(jqueryDriver.requestHasStatusFromServer(jqXHR.status)) {
                    error.request = jqXHR;
                    error.response = {
                        data: tryParseJson(jqXHR.responseText),
                        status: jqXHR.status,
                        headers: jqXHR.getAllResponseHeaders()
                    };
                }

                rej(error);
            });
        }));
    }

    importJqueryAndHandle() {
        return import(/* webpackChunkName: "vendors/jquery" */'jquery')
            .then((jquery)=> {window.$ = jquery;
                return this.handle(jquery);
            }).catch((err)=>{
                if(process.env.NODE_ENV === 'development') {
                    console.log(err)
                }
            })
    }

    static prepareSettings(options) {
        const {
            method: type = 'get', url, data = {}, responseType: dataType = 'json', ...rest
        } = options;

        const restOptions = jqueryDriver.handleXhr(rest);

        const settings = {
            type, url, data: jqueryDriver.prepareData(data), dataType, ...restOptions
        };

        if(HttpUtil.isFormData(settings.data)) {
            extend(settings, {
                cache: false, contentType: false, processData: false
            });
        }

        return settings;
    }

    static prepareData(data) {
        if(HttpUtil.isFormData(data)) return data;

        /** ie9 not support File we must upload with formData **/
        /** and we must have formData polyfill and create formData **/
        /** on getting data from form **/
        if(!window.File || !HttpUtil.hasFiles(data)) return data;

        return HttpUtil.objectToFormData(data);
    }

    static requestHasStatusFromServer(status) {
        return status > 0;
    }


    static handleXhr(options) {
        const { onUploadProgress, ...rest } = options;

        if(!onUploadProgress) return rest;

        rest.xhr = () => {
            const xhr = new window.XMLHttpRequest();

            if(onUploadProgress) {
                xhr.upload.addEventListener('progress', onUploadProgress, false);
            }

            return xhr;
        };

        return rest;
    }
}

export default jqueryDriver;
