
import objectToFormData from 'js-helpers/dist/request/objectToFormData';

class HttpUtil {
    static isFormData(data) {
        return (typeof FormData !== 'undefined') && (data instanceof FormData);
    }

    static hasFiles(data) {
        return Object.keys(data)
            .some(property => data[property] instanceof File || data[property] instanceof FileList);
    }

    static prepareMethodType(options) { /* eslint-disable no-param-reassign */
        const methodType = options.method ? options.method.toLowerCase() : options.method;

        if(methodType !== 'PUT' && methodType !== 'PATCH') return options;

        if(HttpUtil.isFormData(options.data)) {
            options.data.append('_method', methodType);
        } else{
            options.data._method = methodType;
        }

        options.method = 'POST';

        return options;
    }

    static objectToFormData(data) {
        return objectToFormData(data);
    }
}


export default HttpUtil;