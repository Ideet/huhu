private startBrowser(uriString: string) {
    let want: Want = {
        action: "ohos.want.action.viewData",
        bundleName: "com.huawei.hmos.browser",
        abilityName: "MainAbility",
        uri: uriString
    };
    let context = getContext(this) as common.UIAbilityContext;
    context.startAbility(want).then(() => {
        // 拉起成功
    }).catch((err: BusinessError) => {
        // 处理错误
    });
}



import web_webview from '@ohos.web.webview';
import { common, Want } from '@kit.AbilityKit';

@Entry
@Component
struct WebPage {
    controller: web_webview.WebviewController = new web_webview.WebviewController();

    build() {
        Row() {
            Column() {
                Web({ src: $rawfile('local.html'), controller: this.controller })
                .onLoadIntercept((event) => {
                    if (event) {
                        let url: string = event.data.getRequestUrl();
                        console.log(url);
                        // 判断链接是否为拨号链接
                        if (url.indexOf('store://') === 0) {
                            // 跳转拨号界面
                            const want: Want = {
                                uri: 'store://appgallery.huawei.com/app/detail?id=C1229502635594278976'
                            };
                            const context = getContext(this) as common.UIAbilityContext;
                            context.startAbility(want).then(() => {
                                // 拉起成功
                            }).catch(() => {
                                // 处理错误
                            });
                            return true;
                        }
                    }
                    return false;
                })
                .domStorageAccess(true)
                .width('100%')
                .height('100%')
            }
        }
    }
}

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>测试页面</title>
    <script>
        function goToLink() {
            window.open('store://appgallery.huawei.com/app/detail?id=C1229502635594278976');
        }
    </script>
</head>
<body>
    <div align="center">
        <button type="button" id="btn_navi" onclick="goToLink()">跳转应用市场</button>
    </div>
</body>
</html>
