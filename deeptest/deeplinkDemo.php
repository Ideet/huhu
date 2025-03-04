<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <button id="clickOpen">点击我打开网页</button><br>
    <button id="clickStop">点击我被阻止</button><br>
	<button id="openEmail">拉起邮件</button><br>
	<button id="openTel">拉起电话</button><br>
	<button id="openAGCMB">拉起应用市场下载招商银行</button><br>
	<button id="openAGEnterprise">拉起应用市场企业应用下载</button><br>
	<a href = "imeituan://www.meituan.com/">超链接打开网页</a><br>
	
	<button id="openWelink">拉起Welink会议</button><br>
	<button id="openAnJuKe">拉起安居客</button><br>
	<button id="openOneTravel">拉起OneTravel</button><br>
	<button id="openbyhref">href拉起</button><br>
	
</body>
<script>

	window.onload = function() {
		setTimeout(()=> {
			var button = document.getElementById("clickOpen");
			button.click();
			console.log('模拟拉起点击事件');
		}, 3000)
	  
	};

    document.getElementById('clickOpen').addEventListener('click', function() {
        window.open('imeituan://www.meituan.com/')
    })
    document.getElementById('clickStop').addEventListener('click', function(e) {
        e.preventDefault()
        return false
        window.open('imeituan://www.meituan.com/')
    })
	
	document.getElementById('openEmail').addEventListener('click', function() {
        window.open('mailto:gaodali0622@163.com')
    })
	document.getElementById('openTel').addEventListener('click', function() {
        window.open('tel:18136467136')
    })
	document.getElementById('openAGCMB').addEventListener('click', function() {
        window.open('store://appgallery.huawei.com/app/detail?id=com.cmbchina.harmony')
    })
	document.getElementById('openWelink').addEventListener('click', function() {
        window.open('welinkmtg://welink.huawei.com/join?action=join&confno=96636375&pwd=&token=96636375&w3Token=&servertime=1711791386820&randomno=66948')
    })
	document.getElementById('openAGEnterprise').addEventListener('click', function() {
        window.open('store://enterprise/manifest?url=https://agc-storage-drcn.platform.dbankcloud.cn/v0/default-bucket-cc78d/enterprise/demo2/test-manifest.json5?token=d104847f-e16d-4442-b283-496c6f0319bf')
    })
	document.getElementById('openAnJuKe').addEventListener('click', function() {
        window.open('anjuke://www.anjuke.com')
    })
	document.getElementById('openOneTravel').addEventListener('click', function() {
        window.open('OneTravel://router/page/web?xxxx')
    })
    
	document.getElementById('openbyhref').addEventListener('click', function() {
	   console.log('openbyhref')
       window.location.href = "imeituan://www.meituan.com/"
    })
		
</script>
</html>