(function() {
    'use strict';
    
    console.log('🔗 简化跨域跳转系统');
    
    // 直接定义一个能跳转的函数
    Object.defineProperty(window, 'backToSrcLanguage', {
        value: function() {
            console.log('🚀 backToSrcLanguage 被调用');
            
            // 方法1：直接跳转（最简单）
            console.log('🔗 直接跳转到百度...');
            window.location.href = "https://www.baidu.com";
            
            // 方法2：尝试携带数据（可选）
            // const dataHtml = `<!DOCTYPE html><html><head><title>跳转</title></head><body><script>window.location.href="https://www.baidu.com";</script></body></html>`;
            // window.location.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(dataHtml);
            
            return 'redirecting_to_baidu';
        },
        writable: false,
        configurable: false
    });
    
    console.log('✅ backToSrcLanguage 函数已定义');
    
})();
