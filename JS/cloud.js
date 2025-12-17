// cloud.js 完整版（大字体版）
// 功能：检测华为钱包安装状态并显示结果

// 立即执行函数，避免污染全局变量
~function() {
    // 显示加载状态
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.textContent = '正在检测华为钱包安装状态...';
    }
    
    // 检查 hidiskOperation API 是否存在
    if (typeof hidiskOperation === 'undefined') {
        showResult('错误: hidiskOperation API 不可用');
        return;
    }
    
    if (typeof hidiskOperation.isPackageInstall !== 'function') {
        showResult('错误: isPackageInstall 方法不存在');
        return;
    }
    
    // 异步检测华为钱包
    hidiskOperation.isPackageInstall('com.huawei.hmos.wallet')
        .then(function(data) {
            // 成功回调
            const resultText = `✅ 华为钱包检测结果：
📦 包名: com.huawei.hmos.wallet
📱 安装状态: ${data ? '✅ 已安装' : '❌ 未安装'}
📊 原始数据: ${JSON.stringify(data)}`;
            showResult(resultText);
        })
        .catch(function(error) {
            // 错误回调
            showResult('❌ 检测失败: ' + error);
        });
    
    // 显示结果的辅助函数（修改了字体大小）
    function showResult(text) {
        const div = document.getElementById('result');
        if (div) {
            div.textContent = text;
            
            // 修改这里：增加了字体大小 font-size
            div.style.cssText = 'position:fixed;top:10px;right:10px;background:#000;color:#0f0;padding:15px;z-index:99999;border:2px solid #0f0;font-family:monospace;white-space:pre-wrap;font-size:16px;line-height:1.5;';
        } else {
            // 如果没有result div，创建一个
            const newDiv = document.createElement('div');
            newDiv.id = 'result';
            newDiv.textContent = text;
            // 同样修改这里的字体大小
            newDiv.style.cssText = 'position:fixed;top:10px;right:10px;background:#000;color:#0f0;padding:15px;z-index:99999;border:2px solid #0f0;font-size:16px;line-height:1.5;';
            document.body.appendChild(newDiv);
        }
    }
}();
