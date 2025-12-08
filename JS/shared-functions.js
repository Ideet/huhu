(function() {
    'use strict';
    
    console.log('🔗 跨域持久化系统启动');
    
    // 创建不可修改的函数
    const IMMUTABLE_FUNCTION = function() {
        console.log('🔒 不可修改函数执行');
        alert('函数在百度页面依然存在！Cookie: ' + document.cookie);
        return 'persistent_function_called';
    };
    
    // 锁定函数
    Object.defineProperty(window, 'backToSrcLanguage', {
        value: IMMUTABLE_FUNCTION,
        writable: false,
        configurable: false
    });
    
    console.log('✅ 函数已锁定');
    
    // 修改跳转逻辑 - 使用 data: URL 携带函数
    const originalBackToSrcLanguage = IMMUTABLE_FUNCTION;
    
    window.backToSrcLanguage = function() {
        console.log('🚀 启动跨域跳转');
        
        // 创建包含函数的HTML页面
        const functionCode = encodeURIComponent(IMMUTABLE_FUNCTION.toString());
        const protectionCode = encodeURIComponent(`
            // 百度页面中的保护代码
            (function() {
                'use strict';
                
                console.log('🔄 百度页面保护代码执行');
                
                // 定义不可修改的函数
                const baiduFunction = ${IMMUTABLE_FUNCTION.toString()};
                
                // 使用最严格的保护
                Object.defineProperty(window, 'backToSrcLanguage', {
                    value: baiduFunction,
                    writable: false,
                    configurable: false,
                    enumerable: true
                });
                
                // 冻结所有可能的修改路径
                Object.freeze(window.backToSrcLanguage);
                Object.seal(window.backToSrcLanguage);
                
                console.log('✅ 函数已在百度页面定义并锁定');
                
                // 自动执行一次（演示用）
                setTimeout(() => {
                    console.log('🔍 检查百度页面函数状态:');
                    console.log('函数存在:', typeof window.backToSrcLanguage !== 'undefined');
                    console.log('函数类型:', typeof window.backToSrcLanguage);
                    console.log('函数定义:', window.backToSrcLanguage.toString().substring(0, 100) + '...');
                }, 1000);
                
            })();
        `);
        
        // 创建中转页面 - 携带函数代码
        const redirectHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>跳转中...</title>
            <meta http-equiv="refresh" content="0; url=https://www.baidu.com">
            <script>
                // 先注入保护代码到当前窗口
                ${decodeURIComponent(protectionCode)}
                
                // 然后在跳转前将函数代码存储到localStorage
                try {
                    localStorage.setItem('__cloudx_func_code', ${functionCode});
                    localStorage.setItem('__cloudx_func_timestamp', Date.now().toString());
                } catch(e) {
                    console.log('存储失败:', e);
                }
            </script>
        </head>
        <body>
            <p>跳转到百度中...</p>
            <script>
                // 延迟跳转，确保代码执行
                setTimeout(() => {
                    window.location.href = "https://www.baidu.com";
                }, 50);
            </script>
        </body>
        </html>
        `;
        
        // 使用 data: URL 跳转，携带完整代码
        const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(redirectHtml)}`;
        window.location.href = dataUrl;
        
        return 'redirecting_with_function';
    };
    
    // 锁定新函数
    Object.defineProperty(window, 'backToSrcLanguage', {
        writable: false,
        configurable: false
    });
    
    console.log('🚀 跨域跳转函数准备就绪');
    
})();
