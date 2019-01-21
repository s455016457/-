/**
 * ǳ��¡
 * */
/**
 * ǳ��¡ ��¡�������ֻ��¡һ��
 * @param {any} source
 */
function shallowClone(source) {
    var tiaget = createEctype(source);  //����һ������
    // ��ԭ�������������ֵ��ֵ���¶�����
    for (var property in source) {
        if (source.hasOwnProperty(property)) {
            tiaget[property] = source[property];
        }
    }
    /**
    * ��������
    * @param {any} source
    */
    function createEctype(source) {
        var newObject = {};
        if (Array.isArray(source))
            newObject = [];
        return newObject;
    }

    return tiaget;
}

/**
 * ���¡
 * 
 * ʾ����
 * var a={a1:1,a2:2,a3:[1,2,3]};
 * var b={b1:1,b2:2,b3:[4,5,6]}
 * a.b=b;
 * b.a=a;
 * a.a4=[a,b];
 * b.b4=[a,b];
 * a.fn=function(){console.log(this.b);return this.b;};
 * 
 * var newa=deepClone(a);
 * newa.a1=123;
 * newa.fn();
 */
function deepClone(source) {
    this.objKeyCache = [];      // ���󻺴�
    this.objValueCache = [];    // �����¡����

    this.clone = function (source) {
        var target = createEctype.call(this, source);
        for (var property in source) {
            if (source.hasOwnProperty(property)) {
                var value = source[property];
                if (typeof value === "number"
                    || typeof value === "boolean"
                    || typeof value === "symbol"
                    || typeof value === "string"
                    || typeof value === "function"
                    || typeof value === "undefined"
                    || value === null)
                    target[property] = value;
                else if (typeof value === "object") {
                    // ���Դ�����ڶ��󻺴��д��ڣ����ö����¡�����е�ֵ��ֵ
                    var index = this.objKeyCache.indexOf(value);
                    if (index >= 0)
                        target[property] = this.objValueCache[index];   
                    else {
                        target[property] = this.clone( value);
                    }
                }
                else
                    throw "δ֪��������" + (typeof value);
            }
        }

        return target;
    };
    /**
     * ��������
     * @param {any} source
     */
    function createEctype(source) {
        var target = {};
        if (Array.isArray(source))
            target = [];
        this.objKeyCache.push(source);
        this.objValueCache.push(target);
        return target;
    }
    var newObject = this.clone(source);
    // �ͷŻ��棬��ֹ�ڴ����
    this.objKeyCache = [];
    this.objValueCache = [];
    return newObject;
}