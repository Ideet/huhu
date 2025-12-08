(function() {
    'use strict';
    
    console.log('🔗 简化跨域跳转系统');
    
    // 直接定义一个能跳转的函数
    Object.defineProperty(window, 'backToSrcLanguage', {
        value: function() {
            console.log('🚀 backToSrcLanguage 被调用');
            
            // 使用 window.open 打开 data: URL
            const dataHtml = `<!DOCTYPE html>
                <html>
                <head>
                    <title>跳转中</title>
                </head>
                <body>
                    <script>
                        console.log('中转页加载');
                        window.location.href = "https://www.baidu.com";
                    </script>
                </body>
                </html>`;
            
            const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(dataHtml);
            
            // 方法1: window.open (可能被阻止)
            const newWindow = window.open(dataUrl, '_blank');
            
            if (!newWindow || newWindow.closed) {
                console.warn('⚠️ 弹出窗口被阻止，使用备用方案');
                // 备用：直接跳转
                window.location.href = "https://www.baidu.com";
            }
            
            return 'redirecting_to_baidu';
        },
        writable: false,
        configurable: false
    });
    
    console.log('✅ backToSrcLanguage 函数已定义');
    
})();
