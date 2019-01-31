package com.bbstudio.xapk;

import com.google.android.vending.expansion.downloader.impl.DownloaderService;

/**
 * Created by sam on 15/06/15.
 */
public class ExpansionDownloaderService extends DownloaderService {
    public static final String BASE64_PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkRwucrbnjoH8StkYcGFlXgrGY/Ix2WVnmxdIvD7DtRA+Q2RcpoQ8DMUZtzuhHCjcjwh0G2pn7ZMcclKuVTYfG1zgAwqEvUJVeSA5qrYKZj2tdP6Xoi91FhGhx8jCGP+7VFol09dmcChkOCDJ45dH8uT8pXtHyKBOMmun4Sc0DRemaRiaZ/5EUHe1U2yGNgd2EiukKtXO/7GHvBIqEN52r7sWDwMIuJZoJDpJ45AwxXxdOynIX7KMYLNFDvOfgbPpmLxTqgW8sEg3+L/e8+A5FYhDhoBfZ/ykeuzusEK8dMJdbwWnkXzY+SckGopBufa7YzVgelGfpZB7lT38svUgKQIDAQAB";
    public static final byte[] SALT = new byte[] {
            1, 125, -12, -1, 44, 98, -120, -12, 43, 2, -8, -4, 9, 5, -106, -107, -33, 45, -1, 84,
            32, 18, 93, 51, -62
    };

    @Override
    public String getPublicKey() {
        return BASE64_PUBLIC_KEY;
    }

    @Override
    public byte[] getSALT() {
        return SALT;
    }

    @Override
    public String getAlarmReceiverClassName() {
        return ExpansionBroadcastReceiver.class.getName();
    }
}
