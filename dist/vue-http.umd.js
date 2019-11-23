(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('js-helpers/dist/array/isArray'), require('js-helpers/dist/object/hasOwnProperty'), require('js-helpers/dist/object/extend'), require('js-helpers/dist/request/objectToFormData'), require('js-helpers/dist/json/tryParseJson'), require('js-helpers/dist/request/queryStringParameter')) :
    typeof define === 'function' && define.amd ? define(['exports', 'js-helpers/dist/array/isArray', 'js-helpers/dist/object/hasOwnProperty', 'js-helpers/dist/object/extend', 'js-helpers/dist/request/objectToFormData', 'js-helpers/dist/json/tryParseJson', 'js-helpers/dist/request/queryStringParameter'], factory) :
    (global = global || self, factory(global.VueHttp = {}, global.isArray, global.hasOwnProperty, global.extend, global._objectToFormData, global.tryParseJson, global.queryStringParameter));
}(this, (function (exports, isArray, hasOwnProperty, extend, _objectToFormData, tryParseJson, queryStringParameter) { 'use strict';

    _objectToFormData = _objectToFormData && _objectToFormData.hasOwnProperty('default') ? _objectToFormData['default'] : _objectToFormData;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var HttpUtil = function () {
        function HttpUtil() {
            _classCallCheck(this, HttpUtil);
        }

        _createClass(HttpUtil, null, [{
            key: 'isFormData',
            value: function isFormData(data) {
                return typeof FormData !== 'undefined' && data instanceof FormData;
            }
        }, {
            key: 'hasFiles',
            value: function hasFiles(data) {
                return Object.keys(data).some(function (property) {
                    return data[property] instanceof File || data[property] instanceof FileList;
                });
            }
        }, {
            key: 'prepareMethodType',
            value: function prepareMethodType(options) {
                /* eslint-disable no-param-reassign */
                var methodType = options.method ? options.method.toLowerCase() : options.method;

                if (methodType !== 'PUT' && methodType !== 'PATCH') return options;

                if (HttpUtil.isFormData(options.data)) {
                    options.data.append('_method', methodType);
                } else {
                    options.data._method = methodType;
                }

                options.method = 'POST';

                return options;
            }
        }, {
            key: 'objectToFormData',
            value: function objectToFormData(data) {
                return _objectToFormData(data);
            }
        }]);

        return HttpUtil;
    }();

    var defaults = {};

    var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

    var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

    function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var jqueryDriver = function () {
        function jqueryDriver(options) {
            _classCallCheck$1(this, jqueryDriver);

            this.options = jqueryDriver.prepareSettings(options);
        }

        _createClass$1(jqueryDriver, [{
            key: 'handle',
            value: function handle() {
                var _this = this;

                var $ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.$;

                if (!$) {
                    return this.importJqueryAndHandle();
                }

                return new Promise(function (res, rej) {
                    $.ajax(_this.options).done(function (data, textStatus, jqXHR) {
                        res({
                            data: data,
                            status: jqXHR.status,
                            statusText: textStatus,
                            headers: jqXHR.getAllResponseHeaders(),
                            config: _this.options,
                            request: jqXHR
                        });
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        var error = new Error(textStatus);

                        error.config = _this.options;

                        if (textStatus == 'timeout') {
                            error.request = jqXHR;
                        }

                        if (jqueryDriver.requestHasStatusFromServer(jqXHR.status)) {
                            error.request = jqXHR;
                            error.response = {
                                data: tryParseJson.tryParseJson(jqXHR.responseText),
                                status: jqXHR.status,
                                headers: jqXHR.getAllResponseHeaders()
                            };
                        }

                        rej(error);
                    });
                });
            }
        }, {
            key: 'importJqueryAndHandle',
            value: function importJqueryAndHandle() {
                var _this2 = this;

                return import( /* webpackChunkName: "vendors/jquery" */'jquery').then(function (jquery) {
                    window.$ = jquery;
                    return _this2.handle(jquery);
                }).catch(function (err) {
                });
            }
        }], [{
            key: 'prepareSettings',
            value: function prepareSettings(options) {
                var _options$method = options.method,
                    type = _options$method === undefined ? 'get' : _options$method,
                    url = options.url,
                    _options$data = options.data,
                    data = _options$data === undefined ? {} : _options$data,
                    _options$responseType = options.responseType,
                    dataType = _options$responseType === undefined ? 'json' : _options$responseType,
                    rest = _objectWithoutProperties(options, ['method', 'url', 'data', 'responseType']);

                var restOptions = jqueryDriver.handleXhr(rest);

                var settings = _extends({
                    type: type, url: url, data: jqueryDriver.prepareData(data), dataType: dataType }, restOptions);

                if (HttpUtil.isFormData(settings.data)) {
                    extend.extend(settings, {
                        cache: false, contentType: false, processData: false
                    });
                }

                return settings;
            }
        }, {
            key: 'prepareData',
            value: function prepareData(data) {
                if (HttpUtil.isFormData(data)) return data;

                /** ie9 not support File we must upload with formData **/
                /** and we must have formData polyfill and create formData **/
                /** on getting data from form **/
                if (!window.File || !HttpUtil.hasFiles(data)) return data;

                return HttpUtil.objectToFormData(data);
            }
        }, {
            key: 'requestHasStatusFromServer',
            value: function requestHasStatusFromServer(status) {
                return status > 0;
            }
        }, {
            key: 'handleXhr',
            value: function handleXhr(options) {
                var onUploadProgress = options.onUploadProgress,
                    rest = _objectWithoutProperties(options, ['onUploadProgress']);

                if (!onUploadProgress) return rest;

                rest.xhr = function () {
                    var xhr = new window.XMLHttpRequest();

                    if (onUploadProgress) {
                        xhr.upload.addEventListener('progress', onUploadProgress, false);
                    }

                    return xhr;
                };

                return rest;
            }
        }]);

        return jqueryDriver;
    }();

    var _extends$1 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

    var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _objectWithoutProperties$1(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

    function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var fetchDriver = function () {
        function fetchDriver(options) {
            _classCallCheck$2(this, fetchDriver);

            this.options = fetchDriver.prepareSettings(options);
        }

        _createClass$2(fetchDriver, [{
            key: 'handle',
            value: function handle() {
                var _this = this;

                return import( /* webpackChunkName: "vendors/fetch" */'whatwg-fetch').then(function () {
                    return new Promise(function (res, rej) {
                        fetch(_this.options.url, _this.options).then(checkStatus).then(function (response) {
                            response.text().then(function (text) {
                                res({
                                    data: tryParseJson.tryParseJson(text),
                                    status: response.status,
                                    statusText: response.statusText,
                                    headers: response.headers,
                                    config: _this.options,
                                    request: response
                                });
                            });
                        }).catch(function (err) {

                            var error = new Error(err.message);

                            error.config = _this.options;

                            if (!err.response && err.message === 'timeout') {
                                error.request = {}; //jqXHR
                            }

                            if (err.response && fetchDriver.requestHasStatusFromServer(err.response.status)) {

                                err.response.text().then(function (text) {
                                    error.request = {
                                        status: err.response.status
                                    }; //jqXHR
                                    error.response = {
                                        data: tryParseJson.tryParseJson(text),
                                        status: err.response.status,
                                        headers: err.response.headers
                                    };
                                    rej(error);
                                });
                            } else {
                                rej(error);
                            }
                        });
                    });
                });
            }
        }], [{
            key: 'prepareSettings',
            value: function prepareSettings(options) {
                var _options$method = options.method,
                    method = _options$method === undefined ? 'GET' : _options$method,
                    url = options.url,
                    _options$data = options.data,
                    data = _options$data === undefined ? {} : _options$data,
                    _options$responseType = options.responseType,
                    dataType = _options$responseType === undefined ? 'json' : _options$responseType,
                    rest = _objectWithoutProperties$1(options, ['method', 'url', 'data', 'responseType']);

                var restOptions = fetchDriver.handleXhr(rest);

                var settings = _extends$1({
                    method: method, url: fetchDriver.prepareUrl(method, url, data), body: fetchDriver.prepareData(method, data) }, restOptions);

                settings.headers = _extends$1({}, settings.headers || {}, fetchDriver.prepareDataType(dataType));

                /** for sending cookies **/
                settings.credentials = 'same-origin';

                if (HttpUtil.isFormData(settings.body)) {
                    //https://stackoverflow.com/questions/39280438/fetch-missing-boundary-in-multipart-form-data-post
                    delete settings.headers['Content-Type'];
                }

                return settings;
            }
        }, {
            key: 'prepareData',
            value: function prepareData(method, data) {

                if (method === 'GET') return undefined;

                if (HttpUtil.isFormData(data)) return data;

                /** ie9 not support File we must upload with formData **/
                /** and we must have formData polyfill and create formData **/
                /** on getting data from form **/
                if (!window.File || !HttpUtil.hasFiles(data)) return JSON.stringify(data);

                return HttpUtil.objectToFormData(data);
            }
        }, {
            key: 'prepareUrl',
            value: function prepareUrl(method, url, data) {
                if (method !== 'GET') return url;

                return url + '?' + queryStringParameter.encodeQueryData(data);
            }
        }, {
            key: 'requestHasStatusFromServer',
            value: function requestHasStatusFromServer(status) {
                return status > 0;
            }
        }, {
            key: 'handleXhr',
            value: function handleXhr(options) {
                var onUploadProgress = options.onUploadProgress,
                    rest = _objectWithoutProperties$1(options, ['onUploadProgress']);

                if (!onUploadProgress) return rest;

                // fetch specification doesn't contain functionality
                // that allows implementing progress indicators

                return rest;
            }
        }, {
            key: 'prepareDataType',
            value: function prepareDataType(dataType) {
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
        }]);

        return fetchDriver;
    }();

    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            var error = new Error(response.statusText);
            error.response = response;
            throw error;
        }
    }

    var _extends$2 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

    var _createClass$3 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _objectWithoutProperties$2(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

    function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var unfetchDriver = function () {
        function unfetchDriver(options) {
            _classCallCheck$3(this, unfetchDriver);

            this.options = unfetchDriver.prepareSettings(options);
        }

        _createClass$3(unfetchDriver, [{
            key: 'handle',
            value: function handle() {
                var _this = this;

                return import( /* webpackChunkName: "vendors/unfetch" */'unfetch').then(function (_ref) {
                    var fetch = _ref.default;

                    return new Promise(function (res, rej) {
                        fetch(_this.options.url, _this.options).then(checkStatus$1).then(function (response) {
                            response.text().then(function (text) {
                                res({
                                    data: tryParseJson.tryParseJson(text),
                                    status: response.status,
                                    statusText: response.statusText,
                                    headers: response.headers,
                                    config: _this.options,
                                    request: response
                                });
                            });
                        }).catch(function (err) {

                            var error = new Error(err.message);

                            error.config = _this.options;

                            if (!err.response && err.message === 'timeout') {
                                error.request = {}; //jqXHR
                            }

                            if (err.response && unfetchDriver.requestHasStatusFromServer(err.response.status)) {

                                err.response.text().then(function (text) {
                                    error.request = {
                                        status: err.response.status
                                    }; //jqXHR
                                    error.response = {
                                        data: tryParseJson.tryParseJson(text),
                                        status: err.response.status,
                                        headers: err.response.headers
                                    };
                                    rej(error);
                                });
                            } else {
                                rej(error);
                            }
                        });
                    });
                }).catch(function (err) {
                });
            }
        }], [{
            key: 'prepareSettings',
            value: function prepareSettings(options) {
                var _options$method = options.method,
                    method = _options$method === undefined ? 'GET' : _options$method,
                    url = options.url,
                    _options$data = options.data,
                    data = _options$data === undefined ? {} : _options$data,
                    _options$responseType = options.responseType,
                    dataType = _options$responseType === undefined ? 'json' : _options$responseType,
                    rest = _objectWithoutProperties$2(options, ['method', 'url', 'data', 'responseType']);

                var restOptions = unfetchDriver.handleXhr(rest);

                var settings = _extends$2({
                    method: method, url: unfetchDriver.prepareUrl(method, url, data), body: unfetchDriver.prepareData(method, data) }, restOptions);

                settings.headers = _extends$2({}, settings.headers || {}, unfetchDriver.prepareDataType(dataType));

                /** for sending cookies **/
                settings.credentials = 'include';

                if (HttpUtil.isFormData(settings.body)) {
                    //https://stackoverflow.com/questions/39280438/fetch-missing-boundary-in-multipart-form-data-post
                    delete settings.headers['Content-Type'];
                }

                return settings;
            }
        }, {
            key: 'prepareData',
            value: function prepareData(method, data) {

                if (method === 'GET') return undefined;

                if (HttpUtil.isFormData(data)) return data;

                /** ie9 not support File we must upload with formData **/
                /** and we must have formData polyfill and create formData **/
                /** on getting data from form **/
                if (!window.File || !HttpUtil.hasFiles(data)) return JSON.stringify(data);

                return HttpUtil.objectToFormData(data);
            }
        }, {
            key: 'prepareUrl',
            value: function prepareUrl(method, url, data) {
                if (method !== 'GET') return url;

                return url + '?' + queryStringParameter.encodeQueryData(data);
            }
        }, {
            key: 'requestHasStatusFromServer',
            value: function requestHasStatusFromServer(status) {
                return status > 0;
            }
        }, {
            key: 'handleXhr',
            value: function handleXhr(options) {
                var onUploadProgress = options.onUploadProgress,
                    rest = _objectWithoutProperties$2(options, ['onUploadProgress']);

                if (!onUploadProgress) return rest;

                // fetch specification doesn't contain functionality
                // that allows implementing progress indicators

                return rest;
            }
        }, {
            key: 'prepareDataType',
            value: function prepareDataType(dataType) {
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
        }]);

        return unfetchDriver;
    }();

    function checkStatus$1(response) {
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else {
            var error = new Error(response.statusText);
            error.response = response;
            throw error;
        }
    }

    var _extends$3 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

    var _createClass$4 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var drivers = {
        jqueryDriver: jqueryDriver,
        fetchDriver: fetchDriver,
        unfetchDriver: unfetchDriver
    };

    var $allProcessing = [];

    var $ajaxStopFunctions = [];

    var $ajaxStartFunctions = [];

    var $ajaxSuccessFunctions = [];

    var $ajaxErrorFunctions = [];

    var $ajaxSendFunctions = [];

    var $ajaxCompleteFunctions = [];

    var $ajaxSetupObject = {};

    var HttpBase = function () {
        _createClass$4(HttpBase, null, [{
            key: 'allProcessing',
            get: function get() {
                return $allProcessing;
            }
        }, {
            key: 'ajaxStopFunctions',
            get: function get() {
                return $ajaxStopFunctions;
            }
        }, {
            key: 'ajaxStartFunctions',
            get: function get() {
                return $ajaxStartFunctions;
            }
        }, {
            key: 'ajaxSuccessFunctions',
            get: function get() {
                return $ajaxSuccessFunctions;
            }
        }, {
            key: 'ajaxErrorFunctions',
            get: function get() {
                return $ajaxErrorFunctions;
            }
        }, {
            key: 'ajaxSendFunctions',
            get: function get() {
                return $ajaxSendFunctions;
            }
        }, {
            key: 'ajaxCompleteFunctions',
            get: function get() {
                return $ajaxCompleteFunctions;
            }
        }, {
            key: 'ajaxSetupObject',
            get: function get() {
                return $ajaxSetupObject;
            },
            set: function set(options) {
                $ajaxSetupObject = options;
            }
        }]);

        function HttpBase(options) {
            _classCallCheck$4(this, HttpBase);

            window.onunhandledrejection = function (e) {
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
            };
        }

        _createClass$4(HttpBase, [{
            key: 'getSettings',
            value: function getSettings(key) {
                var def = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

                var settings = HttpBase.prepareSettings(this.options);

                return key ? settings[key] || def : settings;
            }
        }, {
            key: 'handle',
            value: function handle() {
                HttpBase.insertProcessToQueue(this);

                var driver = new drivers[this.driver + 'Driver'](this.getSettings());

                return this.handler = driver.handle();
            }
        }, {
            key: 'submit',
            value: function submit() {
                var _this = this;

                return this.handle().then(function (val) {
                    _this.resolve(true, val);

                    val.instance = _this;

                    return val;
                }).catch(function (err) {
                    _this.resolve(true, err);

                    err.instance = _this;

                    throw err;
                });
            }
        }, {
            key: 'resolve',
            value: function resolve() {
                var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
                var val = arguments[1];

                this.resolved = state;

                if (state) {
                    HttpBase.applyAjaxComplete(this, val);

                    if (val instanceof Error) {
                        HttpBase.applyAjaxError(this, val);
                    } else {
                        HttpBase.applyAjaxSuccess(this, val);
                    }

                    HttpBase.removeProcessToQueue(this);
                }
            }
        }], [{
            key: 'prepareSettings',
            value: function prepareSettings() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                var defaultOptions = _extends$3({}, defaults);

                var settings = extend.extend(true, {}, defaultOptions, HttpBase.ajaxSetupObject, options);

                return HttpUtil.prepareMethodType(settings);
            }
        }, {
            key: 'applyAjaxStop',
            value: function applyAjaxStop() {
                HttpBase.ajaxStopFunctions.forEach(function (item) {
                    item();
                });
            }
        }, {
            key: 'applyAjaxStart',
            value: function applyAjaxStart() {
                HttpBase.ajaxStartFunctions.forEach(function (item) {
                    item();
                });
            }
        }, {
            key: 'applyAjaxSuccess',
            value: function applyAjaxSuccess(instance, response) {
                HttpBase.ajaxSuccessFunctions.forEach(function (item) {
                    item(instance, response);
                });
            }
        }, {
            key: 'applyAjaxError',
            value: function applyAjaxError(instance, error) {
                HttpBase.ajaxErrorFunctions.forEach(function (item) {
                    item(instance, error);
                });
            }
        }, {
            key: 'applyAjaxSend',
            value: function applyAjaxSend(instance) {
                HttpBase.ajaxSendFunctions.forEach(function (item) {
                    item(instance);
                });
            }
        }, {
            key: 'applyAjaxComplete',
            value: function applyAjaxComplete(instance, val) {
                HttpBase.ajaxCompleteFunctions.forEach(function (item) {
                    item(instance, val);
                });
            }
        }, {
            key: 'insertProcessToQueue',
            value: function insertProcessToQueue(instance) {
                var index = HttpBase.allProcessing.indexOf(instance);

                if (index != -1) return;

                HttpBase.applyAjaxSend(instance);

                if (HttpBase.allProcessing.length == 0) {
                    HttpBase.applyAjaxStart();
                }

                HttpBase.allProcessing.push(instance);
            }
        }, {
            key: 'removeProcessToQueue',
            value: function removeProcessToQueue(instance) {
                var index = HttpBase.allProcessing.indexOf(instance);

                if (index == -1) return;

                HttpBase.allProcessing.splice(index, 1);

                if (HttpBase.allProcessing.length == 0) {
                    HttpBase.applyAjaxStop();
                }
            }
        }]);

        return HttpBase;
    }();

    var _extends$4 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

    var _createClass$5 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    function _objectWithoutProperties$3(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

    function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Http = function (_HttpBase) {
        _inherits(Http, _HttpBase);

        function Http() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            _classCallCheck$5(this, Http);

            var _this = _possibleConstructorReturn(this, (Http.__proto__ || Object.getPrototypeOf(Http)).call(this));

            _this.init(options);
            return _this;
        }

        _createClass$5(Http, [{
            key: 'init',
            value: function init(options) {
                var _options$name = options.name,
                    name = _options$name === undefined ? '' : _options$name,
                    _options$driver = options.driver,
                    driver = _options$driver === undefined ? 'jquery' : _options$driver,
                    settings = _objectWithoutProperties$3(options, ['name', 'driver']);

                this.name = name;
                this.driver = driver;
                settings.method && (settings.method = settings.method.toUpperCase());
                this.options = _extends$4({}, settings, { driver: driver });

                return this;
            }
        }, {
            key: 'get',
            value: function get(url) {
                var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                return new Http().init(_extends$4({
                    method: 'get', url: url, data: data }, this.options || {}, options)).submit();
            }
        }, {
            key: 'post',
            value: function post(url) {
                var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                return new Http().init(_extends$4({
                    method: 'post', url: url, data: data }, this.options || {}, options)).submit();
            }
        }, {
            key: 'put',
            value: function put(url) {
                var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                return new Http().init(_extends$4({
                    method: 'put', url: url, data: data }, this.options || {}, options)).submit();
            }
        }, {
            key: 'patch',
            value: function patch(url) {
                var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                return new Http().init(_extends$4({
                    method: 'patch', url: url, data: data }, this.options || {}, options)).submit();
            }
        }, {
            key: 'delete',
            value: function _delete(url) {
                var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                return new Http().init(_extends$4({
                    method: 'delete', url: url, data: data }, this.options || {}, options)).submit();
            }
        }, {
            key: 'submit',
            value: function submit() {
                return _get(Http.prototype.__proto__ || Object.getPrototypeOf(Http.prototype), 'submit', this).call(this);
            }
        }, {
            key: 'then',
            value: function then(func) {
                var _this2 = this;

                this.handler.then(function (val) {
                    var value = func(val);

                    _this2.resolve(!value, val);

                    if (value) return value;
                });

                return this;
            }
        }, {
            key: 'done',
            value: function done(func) {
                var _this3 = this;

                this.handler.then(function (val) {
                    func(val);

                    _this3.resolve(true, val);
                });

                return this;
            }
        }, {
            key: 'catch',
            value: function _catch(func) {
                var _this4 = this;

                this.handler.catch(function (val) {
                    var value = func(val);

                    if (value) return value;

                    _this4.resolve(true, val);
                });

                return this;
            }
        }, {
            key: 'fail',
            value: function fail(func) {
                var _this5 = this;

                this.handler.catch(function (val) {
                    func(val);

                    _this5.resolve(true, val);
                });

                return this;
            }
        }, {
            key: 'always',
            value: function always(func) {
                this.handler.then(function (val) {
                    var value = func(val);

                    return value || val;
                });

                this.handler.catch(function (val) {
                    var value = func(val);

                    if (value) return value;

                    throw val;
                });

                return this;
            }
        }], [{
            key: 'ajaxSetup',
            value: function ajaxSetup() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                HttpBase.ajaxSetupObject = options;
            }
        }, {
            key: 'ajaxStop',
            value: function ajaxStop(func) {
                HttpBase.ajaxStopFunctions.push(func);
            }
        }, {
            key: 'ajaxStart',
            value: function ajaxStart(func) {
                HttpBase.ajaxStartFunctions.push(func);
            }
        }, {
            key: 'ajaxSuccess',
            value: function ajaxSuccess(func) {
                HttpBase.ajaxSuccessFunctions.push(func);
            }
        }, {
            key: 'ajaxError',
            value: function ajaxError(func) {
                HttpBase.ajaxErrorFunctions.push(func);
            }
        }, {
            key: 'ajaxSend',
            value: function ajaxSend(func) {
                HttpBase.ajaxSendFunctions.push(func);
            }
        }, {
            key: 'ajaxComplete',
            value: function ajaxComplete(func) {
                HttpBase.ajaxCompleteFunctions.push(func);
            }
        }]);

        return Http;
    }(HttpBase);

    var _extends$5 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

    function _objectWithoutProperties$4(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

    function install(Vue) {
        var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var _option$token = option.token,
            token = _option$token === undefined ? '' : _option$token,
            options = _objectWithoutProperties$4(option, ['token']);

        Vue.prototype.$http = new Http(options);

        if (token) {
            Http.ajaxSetup({
                headers: { 'X-CSRF-Token': typeof token === 'function' ? token() : token }
            });
        }

        Vue.mixin({
            methods: {
                ajax: function ajax(settings) {
                    return new Http(settings).submit();
                },
                jax: function jax(url, method) {
                    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
                    var settings = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

                    return this.ajax(_extends$5({
                        url: url, method: method, data: data }, options, settings));
                },
                jaxValidationErrors: function jaxValidationErrors(_ref) {
                    var request = _ref.request,
                        _ref$response = _ref.response,
                        response = _ref$response === undefined ? {} : _ref$response;

                    if (request && (request.status === 422 || request.status === 400)) {
                        var errors = response.data.errors;


                        if (isArray.isArray(errors)) return {};

                        return errors;
                    }

                    return {};
                },
                jaxIsValid: function jaxIsValid(error, key) {
                    var errors = this.jaxValidationErrors(error);

                    if (isArray.isArray(errors)) return false;

                    if (hasOwnProperty.hasOwnProperty(errors, key)) {
                        return errors[key];
                    }

                    return false;
                }
            }
        });
    }

    // Create module definition for Vue.use()
    var plugin = {
        install: install

        // To auto-install when vue is found
        /* global window global */
    };var GlobalVue = null;
    if (typeof window !== 'undefined') {
        GlobalVue = window.Vue;
    } else if (typeof global !== 'undefined') {
        GlobalVue = global.Vue;
    }
    if (GlobalVue) {
        GlobalVue.use(plugin);
    }

    // Inject install function into component - allows component
    // to be registered via Vue.use() as well as Vue.component()
    Http.install = install;

    // It's possible to expose named exports when writing components that can
    // also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
    // export const RollupDemoDirective = component;

    exports.default = Http;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
