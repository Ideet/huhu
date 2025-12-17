// cloud.js - 完整版本
(() => {
    'use strict';
    
    // 获取显示容器
    const resultElement = document.getElementById('xss-result');
    if (!resultElement) {
        console.error('未找到显示容器 #xss-result');
        return;
    }
    
    // 更新状态
    const updateStatus = (message, type = 'info') => {
        const colors = {
            info: { bg: '#1a365d', border: '#4299e1' },
            success: { bg: '#22543d', border: '#48bb78' },
            error: { bg: '#742a2a', border: '#f56565' },
            warning: { bg: '#744210', border: '#ed8936' }
        };
        
        resultElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px">
                <span style="font-size: 20px">
                    ${type === 'success' ? '✅' : 
                      type === 'error' ? '❌' : 
                      type === 'warning' ? '⚠️' : '⏳'}
                </span>
                <strong style="font-size: 16px">
                    ${type === 'success' ? '检测成功' : 
                      type === 'error' ? '检测失败' : 
                      type === 'warning' ? '警告' : '检测中...'}
                </strong>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 6px; font-size: 14px">
                ${message}
            </div>
            <div style="margin-top: 10px; font-size: 12px; opacity: 0.7; text-align: right">
                ${new Date().toLocaleTimeString()}
            </div>
        `;
        
        resultElement.style.background = colors[type].bg;
        resultElement.style.borderColor = colors[type].border;
    };
    
    // 主检测函数
    const detectWallet = async () => {
        try {
            // 1. 检查 API 是否存在
            if (typeof hidiskOperation === 'undefined') {
                updateStatus('hidiskOperation API 不可用', 'error');
                return;
            }
            
            if (typeof hidiskOperation.isPackageInstall !== 'function') {
                updateStatus('isPackageInstall 方法不存在', 'error');
                return;
            }
            
            // 2. 更新状态
            updateStatus('正在检测华为钱包安装状态...', 'info');
            
            // 3. 调用异步 API
            const result = await hidiskOperation.isPackageInstall('com.huawei.hmos.wallet');
            
            // 4. 显示结果
            const formattedResult = `
                包名: <code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px">com.huawei.hmos.wallet</code><br><br>
                安装状态: <strong style="color: ${result ? '#48bb78' : '#f56565'}">
                    ${result ? '✅ 已安装' : '❌ 未安装'}
                </strong><br><br>
                原始数据: <code style="font-size: 12px">${JSON.stringify(result, null, 2)}</code>
            `;
            
            updateStatus(formattedResult, 'success');
            
            // 5. 可选：自动关闭
            setTimeout(() => {
                resultElement.style.opacity = '0.5';
                setTimeout(() => {
                    resultElement.style.transition = 'opacity 0.5s';
                    resultElement.style.opacity = '0';
                    setTimeout(() => resultElement.remove(), 500);
                }, 3000);
            }, 8000);
            
        } catch (error) {
            // 错误处理
            const errorMessage = error?.message || error || '未知错误';
            updateStatus(`
                错误类型: ${error?.name || 'UnknownError'}<br><br>
                错误信息: <code style="color: #feb2b2">${errorMessage}</code><br><br>
                请检查:<br>
                1. hidiskOperation API 是否可用<br>
                2. 当前环境是否支持该 API<br>
                3. 华为钱包是否正确安装
            `, 'error');
            
            // 错误时不自动关闭
            resultElement.style.cursor = 'pointer';
            resultElement.onclick = () => resultElement.remove();
        }
    };
    
    // 立即执行
    detectWallet();
    
    // 全局暴露结果（可选）
    window.cloudDetectionResult = {
        element: resultElement,
        updateStatus: updateStatus,
        detectWallet: detectWallet
    };
    
    console.log('cloud.js 加载完成，开始检测');
})();
