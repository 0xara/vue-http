
import { isArray } from 'js-helpers/dist/array/isArray';
import { hasOwnProperty } from 'js-helpers/dist/object/hasOwnProperty';
import Http from './Http/Http';

function install(Vue, globalOptions = {}, setup = {}) {

    const { baseUrl = '', ...options } = globalOptions;

    Vue.prototype.$http = new Http(options);

    Http.ajaxSetup(typeof setup === 'function' ? setup() : setup);

    Vue.mixin({
        methods: {
            ajax(settings) {
                return new Http(settings).submit();
            },

            jax(url, method, data = {}, settings = {}) {
                url = this.jaxUrlGenerator(url);
                return this.ajax({
                    url, method, data, ...options, ...settings
                });
            },

            jaxValidationErrors({ request, response = {} }) {
                if(request && (request.status === 422 || request.status === 400)) {
                    const { errors } = response.data;

                    if(isArray(errors)) return {};

                    return errors;
                }

                return {};
            },

            jaxIsValid(error, key) {
                const errors = this.jaxValidationErrors(error);

                if(isArray(errors)) return false;

                if(hasOwnProperty(errors, key)) {
                    return errors[key];
                }

                return false;
            },

            jaxUrlGenerator(url) {
                const base = baseUrl.replace(/\/$/, '');
                url = url.replace(/^\//, '');
                return `${base}/${url}`
            }
        }
    });
}

// Create module definition for Vue.use()
const plugin = {
    install
}

// To auto-install when vue is found
/* global window global */
let GlobalVue = null
if (typeof window !== 'undefined') {
    GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue
}
if (GlobalVue) {
    GlobalVue.use(plugin)
}

// Inject install function into component - allows component
// to be registered via Vue.use() as well as Vue.component()
Http.install = install

// Export component by default
export default Http

// It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;
