#!/bin/bash
set -e

echo "=== 1. Setting up directories ==="
ANDROID_BUILD_DIR="/tmp/android-build"
rm -rf "$ANDROID_BUILD_DIR"
mkdir -p "$ANDROID_BUILD_DIR"/{gen,bin,res,src/com/hsc2027/aiexamlab,assets}

# Copy Vite web dist assets into Android assets
echo "=== 2. Copying web build assets ==="
mkdir -p "$ANDROID_BUILD_DIR/assets/www"
cp -r /app/applet/dist/* "$ANDROID_BUILD_DIR/assets/www/"
cp -r /app/applet/src/assets "$ANDROID_BUILD_DIR/assets/"

echo "=== 3. Creating Android Resources & Manifest ==="
mkdir -p "$ANDROID_BUILD_DIR/res/values"
mkdir -p "$ANDROID_BUILD_DIR/res/layout"
mkdir -p "$ANDROID_BUILD_DIR/res/mipmap-hdpi"
mkdir -p "$ANDROID_BUILD_DIR/res/mipmap-mdpi"
mkdir -p "$ANDROID_BUILD_DIR/res/mipmap-xhdpi"
mkdir -p "$ANDROID_BUILD_DIR/res/mipmap-xxhdpi"
mkdir -p "$ANDROID_BUILD_DIR/res/mipmap-xxxhdpi"

cat << 'EOF' > "$ANDROID_BUILD_DIR/res/values/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">HSC 2027 AI Exam Lab</string>
</resources>
EOF

cat << 'EOF' > "$ANDROID_BUILD_DIR/res/values/styles.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="@android:style/Theme.DeviceDefault.Light.NoActionBar">
        <item name="android:windowBackground">@android:color/white</item>
    </style>
</resources>
EOF

cat << 'EOF' > "$ANDROID_BUILD_DIR/res/layout/activity_main.xml"
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
</FrameLayout>
EOF

# Generate launcher icons from logo
LOGO_IMG="/app/applet/logo-favicon.png"
if [ ! -f "$LOGO_IMG" ]; then
    LOGO_IMG="/app/applet/src/assets/images/hsc_lab_hero_banner_1793111324035.jpg"
fi
if [ -f "$LOGO_IMG" ]; then
    convert "$LOGO_IMG" -resize 48x48 "$ANDROID_BUILD_DIR/res/mipmap-mdpi/ic_launcher.png"
    convert "$LOGO_IMG" -resize 72x72 "$ANDROID_BUILD_DIR/res/mipmap-hdpi/ic_launcher.png"
    convert "$LOGO_IMG" -resize 96x96 "$ANDROID_BUILD_DIR/res/mipmap-xhdpi/ic_launcher.png"
    convert "$LOGO_IMG" -resize 144x144 "$ANDROID_BUILD_DIR/res/mipmap-xxhdpi/ic_launcher.png"
    convert "$LOGO_IMG" -resize 192x192 "$ANDROID_BUILD_DIR/res/mipmap-xxxhdpi/ic_launcher.png"
fi

cat << 'EOF' > "$ANDROID_BUILD_DIR/AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.hsc2027.aiexamlab"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk
        android:minSdkVersion="21"
        android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:exported="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

cat << 'EOF' > "$ANDROID_BUILD_DIR/src/com/hsc2027/aiexamlab/MainActivity.java"
package com.hsc2027.aiexamlab;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.ValueCallback;
import android.webkit.DownloadListener;
import android.net.Uri;
import android.content.Intent;
import android.view.KeyEvent;
import android.view.Window;
import android.graphics.Bitmap;

public class MainActivity extends Activity {
    private WebView mWebView;
    private ValueCallback<Uri[]> mUploadMessage;
    private final static int FILECHOOSER_RESULTCODE = 1001;
    private static final String APP_URL = "https://ais-dev-2bebxbxajcsq7zx3ph5ed5-179765966097.asia-east1.run.app";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.activity_main);

        mWebView = (WebView) findViewById(R.id.webview);
        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);

        mWebView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimetype, long contentLength) {
                try {
                    Intent i = new Intent(Intent.ACTION_VIEW);
                    i.setDataAndType(Uri.parse(url), mimetype != null && mimetype.length() > 0 ? mimetype : "application/pdf");
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(i);
                } catch (Exception e) {
                    try {
                        Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(browserIntent);
                    } catch (Exception ignored) {}
                }
            }
        });

        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("blob:") || url.startsWith("data:")) {
                    return false;
                }
                if (url.endsWith(".apk") || url.endsWith(".pdf")) {
                    try {
                        Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(i);
                        return true;
                    } catch (Exception ignored) {}
                }
                view.loadUrl(url);
                return true;
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                // Fallback to bundled offline version if offline
                view.loadUrl("file:///android_asset/www/index.html");
            }
        });

        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (mUploadMessage != null) {
                    mUploadMessage.onReceiveValue(null);
                }
                mUploadMessage = filePathCallback;
                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILECHOOSER_RESULTCODE);
                } catch (Exception e) {
                    mUploadMessage = null;
                    return false;
                }
                return true;
            }
        });

        mWebView.loadUrl(APP_URL);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        if (requestCode == FILECHOOSER_RESULTCODE) {
            if (mUploadMessage == null) return;
            Uri[] results = null;
            if (resultCode == Activity.RESULT_OK && intent != null) {
                String dataString = intent.getDataString();
                if (dataString != null) {
                    results = new Uri[]{Uri.parse(dataString)};
                }
            }
            mUploadMessage.onReceiveValue(results);
            mUploadMessage = null;
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_BACK) && mWebView.canGoBack()) {
            mWebView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
EOF

BUILD_TOOLS="/opt/android-sdk/build-tools/34.0.0"
PLATFORM="/opt/android-sdk/platforms/android-34/android.jar"

echo "=== 4. Compiling resources with aapt2 ==="
cd "$ANDROID_BUILD_DIR"
"$BUILD_TOOLS/aapt2" compile --dir res -o compiled_res.zip

echo "=== 5. Linking resources with aapt2 ==="
"$BUILD_TOOLS/aapt2" link \
    -I "$PLATFORM" \
    --manifest AndroidManifest.xml \
    -o unaligned.apk \
    --java gen \
    -A assets \
    compiled_res.zip

echo "=== 6. Compiling Java sources ==="
javac -encoding UTF-8 -d bin -cp "$PLATFORM" gen/com/hsc2027/aiexamlab/*.java src/com/hsc2027/aiexamlab/*.java

echo "=== 7. Compiling bytecode to DEX with d8 ==="
"$BUILD_TOOLS/d8" bin/com/hsc2027/aiexamlab/*.class --lib "$PLATFORM" --output "$ANDROID_BUILD_DIR"

echo "=== 8. Packaging classes.dex into APK ==="
zip -uj unaligned.apk classes.dex

echo "=== 9. Aligning APK with zipalign ==="
"$BUILD_TOOLS/zipalign" -v -p 4 unaligned.apk aligned.apk

echo "=== 10. Generating debug keystore & signing APK ==="
if [ ! -f "$ANDROID_BUILD_DIR/debug.keystore" ]; then
    keytool -genkeypair -v \
        -keystore "$ANDROID_BUILD_DIR/debug.keystore" \
        -alias androiddebugkey \
        -keypass android \
        -storepass android \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -dname "CN=Android Debug,O=Android,C=US"
fi

"$BUILD_TOOLS/apksigner" sign \
    --ks "$ANDROID_BUILD_DIR/debug.keystore" \
    --ks-pass pass:android \
    --key-pass pass:android \
    --out "$ANDROID_BUILD_DIR/app-debug.apk" \
    aligned.apk

echo "=== 11. Verifying signed APK ==="
"$BUILD_TOOLS/apksigner" verify --verbose "$ANDROID_BUILD_DIR/app-debug.apk"

APK_SIZE=$(stat -c%s "$ANDROID_BUILD_DIR/app-debug.apk")
echo "Generated APK size: $APK_SIZE bytes"

echo "=== 12. Copying to requested destinations ==="
mkdir -p /app/applet/.build-outputs
mkdir -p /app/applet/APK_DOWNLOAD

cp "$ANDROID_BUILD_DIR/app-debug.apk" /app/applet/.build-outputs/app-debug.apk
cp "$ANDROID_BUILD_DIR/app-debug.apk" /app/applet/APK_DOWNLOAD/app-debug.apk

echo "=== BUILD COMPLETE ==="
ls -lh /app/applet/.build-outputs/app-debug.apk
ls -lh /app/applet/APK_DOWNLOAD/app-debug.apk
