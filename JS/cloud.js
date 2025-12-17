// 立即执行的异步函数
(async function() {
    try {
        // 创建显示容器
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #000;
            color: #0f0;
            padding: 15px;
            border-radius: 8px;
            z-index: 999999;
            max-width: 500px;
            font-family: monospace;
            border: 2px solid #0f0;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
        `;
        container.textContent = '正在检测华为钱包安装状态...';
        document.body.appendChild(container);
        
        // 等待异步结果
        const result = await hidiskOperation.isPackageInstall('com.huawei.hmos.wallet');
        
        // 显示结果
        container.innerHTML = `
            <strong>✅ 华为钱包检测结果</strong><br>
            <hr style="margin:8px 0;border-color:#333">
            包名: com.huawei.hmos.wallet<br>
            状态: ${result ? '已安装' : '未安装'}<br>
            原始数据: ${JSON.stringify(result)}
        `;
        container.style.background = '#1a472a';
        
        // 5秒后自动移除
        setTimeout(() => {
            container.style.transition = 'opacity 1s';
            container.style.opacity = '0';
            setTimeout(() => container.remove(), 1000);
        }, 5000);
        
    } catch (error) {
        // 错误处理
        document.body.innerHTML += `
            <div style="
                position:fixed;
                top:50%;
                left:50%;
                transform:translate(-50%,-50%);
                background:#8B0000;
                color:white;
                padding:20px;
                border-radius:10px;
                z-index:999999;
                font-family:Arial;
                text-align:center;
                box-shadow:0 0 30px rgba(255,0,0,0.5);
            ">
                <strong>❌ 检测失败</strong><br><br>
                错误信息: ${error}<br><br>
                <small>5秒后自动关闭</small>
            </div>
        `;
        
        setTimeout(() => {
            const errorDiv = document.querySelector('div[style*="background:#8B0000"]');
            if (errorDiv) errorDiv.remove();
        }, 5000);
    }
})();
