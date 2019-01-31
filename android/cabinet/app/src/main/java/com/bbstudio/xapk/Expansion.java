package com.bbstudio.xapk;

import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.content.res.Resources;
import android.support.annotation.NonNull;
import android.util.ArrayMap;
import android.util.Log;
import android.webkit.WebResourceResponse;

import com.android.vending.expansion.zipfile.APKExpansionSupport;
import com.android.vending.expansion.zipfile.ZipResourceFile;

import java.io.IOException;
import java.io.InputStream;

/**
 * Helpers and configuration for app expansion file
 *
 * Created by sam on 15/06/15.
 */
public class Expansion {
    static private ZipResourceFile zipFile = null;

    static private String packageName;
    static private Resources res;

    static public void init(Context context) {
        packageName = context.getPackageName();
        res = context.getResources();
    }

    //
    // Configuration
    //

    static public int getIntegerId(String key) {
        return res.getIdentifier(key, "integer", packageName);
    }

    static public int getStringId(String key) {
        return res.getIdentifier(key, "string", packageName);
    }

    static public int getLayoutId(String key) {
        return res.getIdentifier(key, "layout", packageName);
    }

    static public int getResId(String key) {
        return res.getIdentifier(key, "id", packageName);
    }

    static public int getInteger(String key) {
        return res.getInteger(getIntegerId(key));
    }

    static public String getString(String key) {
        return res.getString(getStringId(key));
    }

    static public int getMainVersion() {
        return getInteger("obb_main_version");
    }

    static public int getPatchVersion() {
        return getInteger("obb_patch_version");
    }

    static public String getMainFileCheck() {
        return getString("obb_main_filecheck");
    }

    static public String getBaseDir() {
        return getString("obb_basedir");
    }

    static public String getProviderAuthority() {
        return getString("obb_provider_auth");
    }

    static public String getMainActivityClassName() {
        return getString("obb_main_activity");
    }

    //
    // Helpers
    //

    static public ZipResourceFile getExpansionFile(Context ctx) throws IOException {
        if (null == zipFile) {
            zipFile = APKExpansionSupport.getAPKExpansionZipFile(
                    ctx,
                    getMainVersion(),
                    getPatchVersion());
        }
        return zipFile;
    }

    static public String getAssetName(String fileName) {
        if (!fileName.startsWith("/")) {
            fileName = "/" + fileName;
        }
        return getBaseDir() + fileName;
    }

    static public String getAssetUrl(String fileName) {
        if (!fileName.startsWith("/")) {
            fileName = "/" + fileName;
        }

        return "content://" + getProviderAuthority() + "/" + getBaseDir() + fileName;
    }

    static public InputStream getInputStream(Context ctx, String fileName) throws IOException {
        InputStream stream = getExpansionFile(ctx).getInputStream(getAssetName(fileName));
        if (null == stream) throw new IOException("File not found: " + fileName);
        return stream;
    }

    static public AssetFileDescriptor getAssetFileDescriptor(Context ctx, String fileName) throws IOException {
        AssetFileDescriptor fd = getExpansionFile(ctx).getAssetFileDescriptor(getAssetName(fileName));
        if (null == fd) throw new IOException("File not found: " + fileName);
        return fd;
    }

    static public WebResourceResponse getWebResourceResponse(Context ctx, String fileName) throws IOException {
        InputStream stream = getInputStream(ctx, fileName);
        int statusCode = 200;
        String reasonPhrase = "OK";
        String encoding = "UTF-8";
        String mimeType = "text/plain";

        ArrayMap<String, String> responseHeaders = new ArrayMap<>();

        if (fileName.endsWith("html") || fileName.endsWith("htm")) {
            mimeType = "text/html";
        } else if (fileName.endsWith("css")) {
            mimeType = "text/css";
        } else if (fileName.endsWith("js")) {
            mimeType = "text/javascript";
        } else if (fileName.endsWith("png") || fileName.endsWith("jpg") || fileName.endsWith("gif")) {
            mimeType = "image/*";
            encoding = "base64";
        } else if (fileName.endsWith("mp3")) {
            statusCode = 206;
            reasonPhrase = "Partial Content";
            responseHeaders.put("X-Toto", "Fun");
            mimeType = "audio/mpeg";
            encoding = null;
        } else if (fileName.endsWith("ogg")) {
            statusCode = 206;
            reasonPhrase = "Partial Content";
            mimeType = "audio/ogg";
            encoding = null;
        }

        Log.i("Expansion", "WebResponse for: " + fileName + ", mimeType: " + mimeType + ", encoding: " + encoding +
            ", statusCode: " + statusCode + " " + reasonPhrase);

        //return new WebResourceResponse(mimeType, encoding, stream);
        return new WebResourceResponse(mimeType, encoding, statusCode, reasonPhrase, responseHeaders, stream);
    }

}
