package com.wonderalp.fr;

import android.app.ActionBar;
import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.util.ArrayMap;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import com.bbstudio.xapk.Expansion;

import org.xwalk.core.XWalkPreferences;
import org.xwalk.core.XWalkView;

import java.io.IOException;
import java.io.InputStream;

import fi.iki.elonen.NanoHTTPD;
import fi.iki.elonen.NanoHTTPD.Response.IStatus;


public class MainActivity extends Activity {
    public static final String LOG_TAG = "MainActivity";

    private CabinetServer httpd;
    private XWalkView xWalkWebView;

    class CabinetServer extends NanoHTTPD {
        public CabinetServer() {
            super(8080);
        }

        @Override
        public Response serve(IHTTPSession session) {
            String      path     = session.getUri();
            IStatus     status   = Response.Status.OK;
            String      mimeType = "text/plain";
            ArrayMap<String, String> headers = new ArrayMap<>();
            InputStream stream;
            int         length;

            // Get file
            try {
                stream = Expansion.getInputStream(MainActivity.this, path);
                length = stream.available();
            } catch(IOException ioe) {
                Log.e(LOG_TAG, "Fail to getInputStream for "+path);
                return newFixedLengthResponse(Response.Status.NOT_FOUND, NanoHTTPD.MIME_PLAINTEXT, "Not Found");
            }

            // Mime types
            if (path.endsWith("html") || path.endsWith("htm")) {
                mimeType = "text/html";
            } else if (path.endsWith("css")) {
                mimeType = "text/css";
            } else if (path.endsWith("js")) {
                mimeType = "text/javascript";
            } else if (path.endsWith("png") || path.endsWith("jpg") || path.endsWith("gif")) {
                mimeType = "image/*";
            } else if (path.endsWith("mp3") || path.endsWith("ogg")) {
                mimeType = path.endsWith("mp3") ? "audio/mpeg" : "audio/ogg";
                status = Response.Status.PARTIAL_CONTENT;
                headers.put("Accept-Ranges", "bytes");
                headers.put("Content-Range", "bytes 0-1/" + length);
            }

            // Build response
            //Log.d(LOG_TAG, "Uri: " + path + ", available: " + length);
            Response res = newFixedLengthResponse(status, mimeType, stream, length);
            for (String key : headers.keySet()) {
                res.addHeader(key, headers.get(key));
            }

            return res;
        }
    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Hide the status bar <= 4.0
        if (Build.VERSION.SDK_INT < 16) {
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                    WindowManager.LayoutParams.FLAG_FULLSCREEN);
        }
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        // Hide the status bar >= 4.1
        int uiOptions = View.SYSTEM_UI_FLAG_FULLSCREEN;
        getWindow().getDecorView().setSystemUiVisibility(uiOptions);

        // Remember that you should never show the action bar if the
        // status bar is hidden, so hide that too if necessary.
        ActionBar actionBar = getActionBar();
        if (null != actionBar) actionBar.hide();

        // Start server
        httpd = new CabinetServer();
        try {
            httpd.start();
        } catch(IOException ioe) {
            Log.e(LOG_TAG, "Failed to start server: " + ioe.getMessage());
        }
        Log.i(LOG_TAG, "Server started");

        // Content View
        setContentView(R.layout.activity_main);

        // WebView, Turn on remote debugging
        XWalkPreferences.setValue(XWalkPreferences.REMOTE_DEBUGGING, false);

        // WebView
        xWalkWebView=(XWalkView)findViewById(R.id.xwalkWebView);
        xWalkWebView.load("http://127.0.0.1:8080/index.html", null);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (xWalkWebView != null) {
            xWalkWebView.pauseTimers();
            xWalkWebView.onHide();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (xWalkWebView != null) {
            xWalkWebView.resumeTimers();
            xWalkWebView.onShow();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (xWalkWebView != null) {
            xWalkWebView.onDestroy();
        }
    }
}
