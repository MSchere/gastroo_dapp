package com.migueloxx.tiendanft;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import android.content.DialogInterface;
import android.net.http.SslError;
import android.os.Bundle;
import android.util.Log;
import android.webkit.SslErrorHandler;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends AppCompatActivity {


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        WebView myWebView = (WebView) findViewById(R.id.webview);
        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        myWebView.loadUrl("http://192.168.10.34:3000");
        //myWebView.loadUrl("https://metamask.app.link/dapp/192.168.10.34:3001");

        getSupportActionBar().hide();

        myWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedSslError(WebView myWebView, SslErrorHandler handler, SslError error) {
                handler.proceed(); // Ignore SSL certificate errors
            }


            /*
 @Override
 public void onReceivedSslError(WebView view, final SslErrorHandler handler, SslError error) {
     String message = "SSL Certificate error.";
     switch (error.getPrimaryError()) {
         case SslError.SSL_UNTRUSTED:
             message = "The certificate authority is not trusted.";
             break;
         case SslError.SSL_EXPIRED:
             message = "The certificate has expired.";
             break;
         case SslError.SSL_IDMISMATCH:
             message = "The certificate Hostname mismatch.";
             break;
         case SslError.SSL_NOTYETVALID:
             message = "The certificate is not yet valid.";
             break;
     }
     message += "\"SSL Certificate Error\" Do you want to continue anyway?.. YES";

     handler.proceed();

     //Log.e(TAG, onReceivedSslError: " + message);
 }
 */
        });

    }

}