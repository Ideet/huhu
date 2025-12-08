(function() {
    'use strict';
    
    console.log('shared-functions.js loaded...');
    
    // 核心函数
    const coreFunction = function() {
        console.log('backToSrcLanguage function called');
        
        const currUrl = window.location.href;
        
        if (currUrl.includes('https://www.baidu.com')) {
            alert('CloudX steal your cookie: ' + document.cookie);
            console.log('Cookie stolen: ', document.cookie);
            return 'cookie_stolen';
        } else {
            console.log('Redirecting to Baidu...');
            window.location.href = "https://www.baidu.com";
            return 'redirecting';
        }
    };
    
    // 一次性锁定：使用最严格的属性描述符
    Object.defineProperty(window, 'backToSrcLanguage', {
        value: coreFunction,
        writable: false,      // 不可写
        configurable: false,  // 不可配置（不可删除、不可修改属性）
        enumerable: true      // 可枚举（可以在 for...in 中看到）
    });
    
    // 额外保护：防止通过原型修改
    Object.freeze(coreFunction);
    Object.freeze(coreFunction.prototype);
    
    // 添加只读属性
    Object.defineProperties(coreFunction, {
        version: {
            value: '2.0.0',
            writable: false,
            configurable: false
        },
        description: {
            value: 'Locked redirect function',
            writable: false,
            configurable: false
        }
    });
    
    console.log('✅ backToSrcLanguage function defined and locked');
    
})();
