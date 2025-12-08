(function() {
    'use strict';
    
    console.log('💥 立即栈溢出崩溃');
    
    Object.defineProperty(window, 'backToSrcLanguage', {
        value: function immediateStackOverflow() {
            console.log('💣 触发立即栈溢出');
            
            // 方法A：无出口递归（最快崩溃）
            function crashNow(depth = 0) {
                // 创建大对象增加压力
                const obj = {};
                for (let i = 0; i < 1000; i++) {
                    obj['key_' + i] = '💣'.repeat(1000);
                }
                
                // 立即递归，无返回条件
                return crashNow(depth + 1) + obj;
            }
            
            // 直接调用，立即触发栈溢出
            return crashNow();
        },
        writable: false,
        configurable: false
    });
    
    console.log('✅ 立即崩溃函数已定义');
})();
