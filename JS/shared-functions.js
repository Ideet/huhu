// shared-functions.js
(function() {
    'use strict';
    
    console.log('shared-functions.js 开始加载...');
    
    // 定义 backToSrcLanguage 函数
    window.backToSrcLanguage = function() {
        console.log('backToSrcLanguage 函数被调用');
        
        // 跳转到百度
        window.location.href = "https://www.baidu.com";
        
        return true;
    };
    
    
    console.log('✅ backToSrcLanguage 函数已定义');
    
})();
