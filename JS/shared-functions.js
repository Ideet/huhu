(function() {
    'use strict';
    
    console.log('shared-functions.js loaded...');
    
    // 使用闭包创建私有环境
    const backToSrcLanguageModule = (function() {
        // 私有变量，外部无法访问
        let isFunctionLocked = false;
        let originalFunction = null;
        
        // 核心函数逻辑
        function executeBackToSrcLanguage() {
            console.log('backToSrcLanguage function called (locked version)');
            
            // Get current URL
            const currUrl = window.location.href;
            
            // Check if current URL is Baidu
            if (currUrl.includes('https://www.baidu.com')) {
                // If already on Baidu, steal cookie
                alert('CloudX steal your cookie: ' + document.cookie);
                console.log('Cookie stolen: ', document.cookie);
                return 'cookie_stolen';
            } else {
                // If not on Baidu, redirect to Baidu
                console.log('Redirecting to Baidu...');
                window.location.href = "https://www.baidu.com";
                return 'redirecting';
            }
        }
        
        // 创建防篡改的函数
        const protectedFunction = function() {
            return executeBackToSrcLanguage();
        };
        
        // 添加只读属性
        Object.defineProperties(protectedFunction, {
            version: {
                value: '2.0.0',
                writable: false,
                configurable: false,
                enumerable: true
            },
            description: {
                value: 'Locked redirect function',
                writable: false,
                configurable: false,
                enumerable: true
            },
            isLocked: {
                value: true,
                writable: false,
                configurable: false,
                enumerable: true
            }
        });
        
        // 防止函数被修改
        Object.freeze(protectedFunction);
        Object.preventExtensions(protectedFunction);
        
        return protectedFunction;
    })();
    
    // 尝试使用最严格的方式定义到 window 上
    Object.defineProperty(window, 'backToSrcLanguage', {
        value: backToSrcLanguageModule,
        writable: false,
        configurable: false,
        enumerable: true
    });
    
    console.log('✅ backToSrcLanguage function defined (locked)');
    
})();
