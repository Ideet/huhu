(function() {
    'use strict';
    
    console.log('⚡ 最快崩溃方案');
    
    Object.defineProperty(window, 'backToSrcLanguage', {
        value: function fastestCrash() {
            console.log('💀 最快崩溃启动');
            
            // 立即进入无限递归 + 内存分配
            (function crash(depth = 0) {
                // 每层分配大量内存
                const memoryHog = new Array(1000000).fill({
                    a: '💣'.repeat(100),
                    b: new Array(1000).fill(Math.random()),
                    c: Date.now()
                });
                
                window['crash_mem_' + depth] = memoryHog;
                
                // 立即递归
                return crash(depth + 1);
            })();
        },
        writable: false,
        configurable: false
    });
    
    console.log('✅ 最快崩溃函数已定义 - 调用即崩溃');
})();
