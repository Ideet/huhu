// 立即执行函数，确保脚本插入后立即执行
~function() {
    "use strict";
    
    // ========== 添加 showResult 函数 ==========
    function showResult(text, isError) {
        const div = document.getElementById('result');
        if (div) {
            div.innerHTML += `<div style="color:${isError ? '#f00' : '#0f0'};margin:10px 0;font-size:16px;line-height:1.5;">${text}</div>`;
            // 自动滚动到底部
            div.scrollTop = div.scrollHeight;
        } else {
            // 如果没有result div，创建一个
            const newDiv = document.createElement('div');
            newDiv.id = 'result';
            newDiv.innerHTML = `<div style="color:${isError ? '#f00' : '#0f0'};margin:10px 0;font-size:16px;line-height:1.5;">${text}</div>`;
            newDiv.style.cssText = 'position:fixed;top:20px;left:20px;background:#000;color:#0f0;padding:20px;z-index:99999;border:2px solid #0f0;font-size:16px;line-height:1.5;font-family:monospace;max-width:80%;max-height:80%;overflow:auto;';
            document.body.appendChild(newDiv);
        }
    }
    
    // 显示初始状态
    showResult('🚀 开始加载 jsb3.js 桥接模块...');

    // ========================= 基础工具方法（模块导出/属性检测） =========================
    const moduleUtils = {
        defineProperty: (target, definition) => {
            for (const key in definition) {
                if (moduleUtils.hasOwnProp(definition, key) && !moduleUtils.hasOwnProp(target, key)) {
                    Object.defineProperty(target, key, {
                        enumerable: true,
                        get: definition[key]
                    });
                }
            }
        },

        hasOwnProp: (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop),

        markAsModule: (moduleObj) => {
            if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
                Object.defineProperty(moduleObj, Symbol.toStringTag, { value: "Module" });
            }
            Object.defineProperty(moduleObj, "__esModule", { value: true });
        }
    };

    // 模块导出对象
    const bridgeModule = {};
    moduleUtils.markAsModule(bridgeModule);

    // ========================= 事件订阅/发布器 =========================
    class EventEmitter {
        constructor(type, once) {
            this.type = type;
            this.handlers = {};
            this.numHandlers = 0;
            this.state = once ? 1 : 0;
            this.fireArgs = null;
            this.nextGuid = 1;
        }

        subscribe(handler) {
            if (this.state === 2) {
                handler.apply(this, this.fireArgs);
                return;
            }

            let guid = handler.observer_guid;
            if (!guid) {
                guid = String(this.nextGuid++);
                handler.observer_guid = guid;
            }

            if (!this.handlers[guid]) {
                this.handlers[guid] = handler;
                this.numHandlers++;
            }
        }

        unsubscribe(handler) {
            const guid = handler.observer_guid;
            if (this.handlers[guid]) {
                delete this.handlers[guid];
                this.numHandlers--;
            }
        }

        fire(arg1, arg2) {
            const args = arg2 ? [arg1, arg2] : [arg1];

            if (this.state === 1) {
                this.state = 2;
                this.fireArgs = args;
            }

            if (this.numHandlers <= 0) return [];

            const validHandlers = [];
            for (const guid in this.handlers) {
                if (moduleUtils.hasOwnProp(this.handlers, guid)) {
                    validHandlers.push(this.handlers[guid]);
                }
            }

            const results = validHandlers.map(handler => handler.apply(this, args));

            if (this.state === 2 && this.numHandlers > 0) {
                this.handlers = {};
                this.numHandlers = 0;
            }

            return results;
        }
    }

    const globalEmitters = {};

    function emitEvent(eventType, args) {
        const emitter = globalEmitters[eventType];
        if (!emitter) return undefined;
        return emitter.fire(args);
    }

    function subscribeEvent(eventType, handler) {
        if (!globalEmitters[eventType]) {
            globalEmitters[eventType] = new EventEmitter(eventType, false);
        }
        globalEmitters[eventType].subscribe(handler);
    }

    function unsubscribeEvent(eventType, handler) {
        const emitter = globalEmitters[eventType];
        if (emitter) {
            emitter.unsubscribe(handler);
        }
    }

    // ========================= Native桥接基础配置 =========================
    const defaultNativeBridge = {
        invoke: (service, action, callbackId, args, timeout) => {
            const errorMsg = `no native object ${service}:${action}`;
            console.warn(errorMsg);
            const result = `F08 ${callbackId} s${errorMsg}`;
            return result.length + " " + result;
        },

        invokeSync: (service, action, args) => {
            return `no native object ${service}:${action}`;
        }
    };

    function getNativeBridge(bridgeName) {
        return window[bridgeName] ? window[bridgeName] : defaultNativeBridge;
    }

    // ========================= 回调管理与消息处理 =========================
    const STATUS_SUCCESS = 1;
    const STATUS_UNKNOWN = 8;
    const STATUS_CANCEL = 9;

    const messageQueue = [];
    let callbackIdSeed = Math.floor(2e9 * Math.random());
    const callbackCache = {};

    const microTask = typeof Promise !== "undefined"
        ? (callback) => Promise.resolve().then(callback)
        : (callback) => setTimeout(callback);

    function generateCallbackId() {
        return callbackIdSeed++;
    }

    function parseNativeMessage(message) {
        if (message === "*") return "*";

        const lengthSeparator = message.indexOf(" ");
        const contentLength = Number(message.slice(0, lengthSeparator));
        const content = message.substring(lengthSeparator + 1, lengthSeparator + 1 + contentLength);
        const remaining = message.slice(lengthSeparator + contentLength + 1);

        if (remaining) {
            messageQueue.unshift(remaining);
        }

        return content;
    }

    function parseMessageContent(content) {
        const type = content.charAt(0);
        if (type !== "S" && type !== "F") {
            console.error(`processMessage failed: invalid message: ${JSON.stringify(content)}`);
            return null;
        }

        const keepCallback = content.charAt(1) === "1";
        const statusSeparator = content.indexOf(" ", 2);
        const statusCode = Number(content.slice(2, statusSeparator));
        const callbackIdSeparator = content.indexOf(" ", statusSeparator + 1);
        const callbackId = content.slice(statusSeparator + 1, callbackIdSeparator);
        const argsContent = content.slice(callbackIdSeparator + 1);
        const args = [];
        parseNativeArgs(args, argsContent);
        const parsedArgs = args.length === 1 ? args[0] : args;

        return {
            callbackId,
            success: type === "S",
            status: statusCode,
            args: parsedArgs,
            keepCallback
        };
    }

    function parseNativeArgs(result, content) {
        const type = content.charAt(0);
        switch (type) {
            case "s":
                result.push(content.slice(1));
                break;
            case "t":
                result.push(true);
                break;
            case "f":
                result.push(false);
                break;
            case "N":
                result.push(null);
                break;
            case "n":
                result.push(Number(content.slice(1)));
                break;
            case "A":
                result.push(atob(content.slice(1)));
                break;
            case "S":
                result.push(atob(content.slice(1)));
                break;
            case "M":
                let remaining = content.slice(1);
                while (remaining !== "") {
                    const lenSeparator = remaining.indexOf(" ");
                    const itemLen = Number(remaining.slice(0, lenSeparator));
                    const itemContent = remaining.substring(lenSeparator + 1, lenSeparator + 1 + itemLen);
                    remaining = remaining.slice(lenSeparator + itemLen + 1);
                    parseNativeArgs(result, itemContent);
                }
                break;
            default:
                result.push(JSON.parse(content));
                break;
        }
    }

    function callbackFromNative(callbackId, isSuccess, status, args, keepCallback) {
        try {
            const callback = callbackCache[callbackId];
            if (!callback) return;

            console.info(`callbackFromNative callbackId: ${callbackId}, isSuccess: ${isSuccess}, status: ${status}, args: ${JSON.stringify(args)}`);

            if (isSuccess && status === STATUS_SUCCESS) {
                callback.success && callback.success.call(null, args);
            } else if (!isSuccess) {
                callback.fail && callback.fail.call(null, args, status);
            }

            if (!keepCallback) {
                delete callbackCache[callbackId];
            }
        } catch (error) {
            const errorMsg = `Error in ${isSuccess ? "Success" : "Error"} callbackId: ${callbackId} : ${error}`;
            console.error(errorMsg);
        }
    }

    function processMessageQueue() {
        if (messageQueue.length === 0) return;

        try {
            const rawMessage = parseNativeMessage(messageQueue.shift());
            if (rawMessage === "*") return;

            const message = parseMessageContent(rawMessage);
            if (!message) return;

            callbackFromNative(
                message.callbackId,
                message.success,
                message.status,
                message.args,
                message.keepCallback
            );
        } finally {
            if (messageQueue.length > 0) {
                microTask(processMessageQueue);
            }
        }
    }

    function callNativeMethod(bridgeName, success, fail, service, action, args) {
        args = args || [];

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (Object.prototype.toString.call(arg).slice(8, -1) === "ArrayBuffer") {
                args[i] = btoa(arg);
            }
        }

        const callbackId = service + generateCallbackId();
        const argsStr = JSON.stringify(args);

        if (success || fail) {
            callbackCache[callbackId] = { success, fail };
        }

        const nativeBridge = getNativeBridge(bridgeName);
        const result = nativeBridge.invoke(service, action, callbackId, argsStr, -1);

        console.debug(`exec ${service}.${action} with args: ${JSON.stringify(args)}, result: ${JSON.stringify(result)}`);

        if (result) {
            messageQueue.push(result);
        }
        microTask(processMessageQueue);
    }

    // ========================= 对外暴露的核心API =========================
    function invoke(bridgeName, service, action, args, success, fail, cancel, complete) {
        const hasCallback = success || fail || cancel || complete;

        const wrappedSuccess = hasCallback ? (res) => {
            success && success(res);
            complete && complete(res);
        } : null;

        const wrappedFail = hasCallback ? (res, status) => {
            if (status === STATUS_CANCEL && cancel) {
                cancel(res);
            } else {
                fail && fail(res, status);
            }
            complete && complete(res, status);
        } : null;

        callNativeMethod(bridgeName, wrappedSuccess, wrappedFail, service, action, args);
    }

    function invokePromise(bridgeName, service, action, args) {
        return new Promise((resolve, reject) => {
            callNativeMethod(
                bridgeName,
                (res) => resolve(res),
                (err) => reject(err),
                service,
                action,
                args
            );
        });
    }

    function invokeSync(bridgeName, service, action, args) {
        const nativeBridge = getNativeBridge(bridgeName);
        const result = nativeBridge.invokeSync(service, action, args);

        let parsedResult;
        try {
            parsedResult = result ? JSON.parse(result) : null;
        } catch (error) {
            parsedResult = null;
        }

        return parsedResult
            ? { status: parsedResult.status ?? STATUS_UNKNOWN, result: parsedResult.result }
            : { status: STATUS_UNKNOWN };
    }

    function on(event, listener, options, isValueCallback) {
        subscribeEvent(event, listener);
    }

    function off(event, listener, options, isValueCallback) {
        unsubscribeEvent(event, listener);
    }

    function onNativeValueCallback(type, args, isValueCallback) {
        console.info(`call onNativeValueCallback type: ${JSON.stringify(type)}, args: ${JSON.stringify(args)}, isValueCallback: ${JSON.stringify(isValueCallback)}`);
        return emitEvent(type, args);
    }

    function init(apiName) {
        if (window[apiName]) {
            window[apiName].onNativeValueCallback = onNativeValueCallback;
            window[apiName].callbackFromNative = callbackFromNative;
        } else {
            window[apiName] = {
                onNativeValueCallback,
                callbackFromNative
            };
        }
    }

    // ========================= 模块导出配置 =========================
    moduleUtils.defineProperty(bridgeModule, {
        callbackFromNative: () => callbackFromNative,
        init: () => init,
        invoke: () => invoke,
        invokePromise: () => invokePromise,
        invokeSync: () => invokeSync,
        off: () => off,
        on: () => on,
        onNativeValueCallback: () => onNativeValueCallback
    });

    if (typeof module !== "undefined" && module.exports) {
        module.exports = bridgeModule;
    }

    if (typeof window !== "undefined") {
        window.nativeBridge = {
            init,
            invoke,
            invokePromise,
            invokeSync,
            on,
            off,
            onNativeValueCallback,
            callbackFromNative
        };
    }

    // ========================= 业务层API注册与页面初始化 =========================
    showResult('🔧 正在初始化 wiseopercampaign 桥接...');
    init("wiseopercampaign");

    function invokeNativeBridge(moduleName, methodName, params, success, fail) {
        window.nativeBridge.invoke(
            "wiseopercampaignbridge",
            moduleName,
            methodName,
            params || [],
            success,
            fail
        );
    }

    function invokeSyncNativeBridge(moduleName, methodName, params, success, fail) {
        window.nativeBridge.invokeSync(
            "wiseopercampaignbridge",
            moduleName,
            methodName,
            params || [],
            success,
            fail
        );
    }

    const apiConfig = {
        app: [
            "getDeviceSessionId",
            "getDeviceToken",
            "createCalendarEvent",
            "queryCalendarEvent",
            "deleteCalendarEvent"
        ],
        account: [
            "getUserId",
            "getUserInfo",
            "getUserToken"
        ]
    };

    const apiConfigSync = {
        app: [
            "getParams",
            "showToast"
        ]
    };

    window.wiseopercampaign = window.wiseopercampaign || {};
    Object.entries(apiConfig).forEach(([moduleName, methods]) => {
        window.wiseopercampaign[moduleName] = window.wiseopercampaign[moduleName] || {};

        methods.forEach(methodName => {
            window.wiseopercampaign[moduleName][methodName] = (params, success, fail) => {
                invokeNativeBridge(moduleName, methodName, params, success, fail);
            };
        });
    });

    // ========================= 页面初始化（确保在 innerHTML 插入后立即执行） =========================
    (function initPage() {
        // 创建结果展示容器（如果不存在）
        let resultContainer = document.getElementById('userIdResult');
        if (!resultContainer) {
            resultContainer = document.createElement('div');
            resultContainer.id = 'userIdResult';
            resultContainer.style.cssText = 'position:fixed;top:20px;left:20px;background:#000;color:#0f0;padding:20px;z-index:99999;border:2px solid #0f0;font-size:16px;line-height:1.5;font-family:monospace;max-width:80%;max-height:80%;overflow:auto;';
            document.body.appendChild(resultContainer);
        }
        
        showResult('✅ 桥接初始化完成，开始调用API...');
        
        // 延迟调用API
        setTimeout(() => {
            const apiCalls = [
                {
                    api: 'app.getDeviceSessionId',
                    params: [false],
                    label: 'app getDeviceSessionId'
                },
                {
                    api: 'app.getDeviceToken',
                    params: [{
                        scene: 'query',
                        forceRefresh: false,
                        queryExpireSeconds: 1000,
                        invokeExpireSeconds: 1000
                    }],
                    label: 'app getDeviceToken'
                },
                {
                    api: 'app.queryCalendarEvent',
                    params: [{
                        id: 0,
                        title: 'cc',
                        timeRange: [[new Date().getTime(), new Date().getTime() + 100000]]
                    }],
                    label: 'app queryCalendarEvent'
                },               
                {
                    api: 'account.getUserId',
                    params: [],
                    label: 'account getUserId'
                },
                {
                    api: 'account.getUserInfo',
                    params: [],
                    label: 'account getUserInfo'
                },
                {
                    api: 'account.getUserToken',
                    params: [],
                    label: 'account getUserToken'
                }
            ];

            apiCalls.forEach(({ api, params, label }) => {
                const [module, method] = api.split('.');
                showResult(`📡 正在调用: ${label}...`);
                wiseopercampaign[module][method](
                    params,
                    (data) => {
                        showResult(`✅ ${label} 成功: ${JSON.stringify(data)}`);
                    },
                    (err) => {
                        showResult(`❌ ${label} 失败: ${JSON.stringify(err)}`, true);
                    }
                );
            });
            
            // 显示同步API调用
            setTimeout(() => {
                const apiSyncCalls = [
                    {
                        api: 'app.showToast',
                        params: ['jsb3.js 加载成功', 3000],
                        label: 'app showToast'
                    },
                    {
                        api: 'app.getParams',
                        params: [],
                        label: 'app getParams'
                    }
                ];

                apiSyncCalls.forEach(({ api, params, label }) => {
                    const [module, method] = api.split('.');
                    showResult(`📱 正在同步调用: ${label}...`);
                    if(window.wiseopercampaignbridge){
                        const result = window.wiseopercampaignbridge.invokeSync(module, method, params);
                        showResult(`📱 ${label} 结果: ${JSON.stringify(result)}`);
                    } else {
                        showResult(`❌ wiseopercampaignbridge 不可用`, true);
                    }
                });
                
                showResult('🎉 所有API调用完成！');
            }, 100);
        }, 100);
    })();

}();
