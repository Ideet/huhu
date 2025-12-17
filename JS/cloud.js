// 创建显示区域
const display = document.createElement('div');
display.style.cssText = 'position:fixed;top:20px;left:20px;background:#000;color:#0f0;padding:15px;border-radius:5px;z-index:9999;font-family:monospace;max-width:80vw;word-break:break-all';
display.textContent = '正在检测...';
document.body.appendChild(display);

// 检查 API 是否存在
if (window.hidiskOperation && typeof hidiskOperation.isPackageInstall === 'function') {
    // 调用 API
    hidiskOperation.isPackageInstall('com.huawei.hmos.wallet')
        .then(data => {
            display.innerHTML = `✅ 检测成功：<br>${JSON.stringify(data, null, 2)}`;
            display.style.background = '#4CAF50';
        })
        .catch(error => {
            display.innerHTML = `❌ 检测失败：<br>${error}`;
            display.style.background = '#F44336';
        });
} else {
    display.innerHTML = '❌ hidiskOperation API 不可用';
    display.style.background = '#FF9800';
}

// 10秒后自动移除
setTimeout(() => {
    display.style.transition = 'opacity 1s';
    display.style.opacity = '0';
    setTimeout(() => display.remove(), 1000);
}, 10000);
