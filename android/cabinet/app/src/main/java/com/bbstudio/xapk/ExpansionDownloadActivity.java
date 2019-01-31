package com.bbstudio.xapk;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Messenger;
import android.provider.Settings;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.google.android.vending.expansion.downloader.DownloadProgressInfo;
import com.google.android.vending.expansion.downloader.DownloaderClientMarshaller;
import com.google.android.vending.expansion.downloader.DownloaderServiceMarshaller;
import com.google.android.vending.expansion.downloader.Helpers;
import com.google.android.vending.expansion.downloader.IDownloaderClient;
import com.google.android.vending.expansion.downloader.IDownloaderService;
import com.google.android.vending.expansion.downloader.IStub;

import java.io.File;
import java.io.IOException;

/**
 * Created by sam on 15/06/15.
 */
public class ExpansionDownloadActivity extends Activity implements IDownloaderClient {
    private static final String LOG_TAG = "ExpansionDownload";

    private ProgressBar mPB;

    private TextView mStatusText;
    private TextView mProgressFraction;
    private TextView mProgressPercent;
    private TextView mAverageSpeed;
    private TextView mTimeRemaining;

    private View mDashboard;
    private View mCellMessage;

    private Button mPauseButton;
    private Button mWiFiSettingsButton;

    private boolean mStatePaused;
    private int mState;

    private IDownloaderService mRemoteService;
    private IStub mDownloaderClientStub;

    boolean expansionFilesDelivered() {
        // Main expansion file
        String fileName = Helpers.getExpansionAPKFileName(this, true, Expansion.getMainVersion());
        Log.i(LOG_TAG, "expansionFilesDelivered: " + fileName);
        if (!Helpers.doesFileExist(this, fileName)) {
            return false;
        }

        // Patch file
        if (Expansion.getPatchVersion() > 0) {
            fileName = Helpers.getExpansionAPKFileName(this, false, Expansion.getPatchVersion());
            Log.i(LOG_TAG, "expansionFilesDelivered: " + fileName);
            if (!Helpers.doesFileExist(this, fileName)) {
                return false;
            }
        }

        return checkExpansionFiles();
    }

    boolean checkExpansionFiles() {
        String filename = Expansion.getMainFileCheck();
        Log.i(LOG_TAG, "checkExpansionFiles: " + filename);

        try {
            if (!filename.equals("")){
                Expansion.getInputStream(this, filename);
            }
        } catch(IOException e) {
            Log.i(LOG_TAG, "checkExpansionFiles: " + e.getMessage());
            File file = new File(Helpers.getExpansionAPKFileName(this, true, Expansion.getMainVersion()));
            file.delete();
            return false;
        }
        return true;
    }

    private void setState(int newState) {
        if (mState != newState) {
            mState = newState;
            mStatusText.setText(-1 == mState
                    ? Expansion.getStringId("state_corrupted")
                    : Helpers.getDownloaderStringResourceIDFromState(this, newState));
        }
    }

    private void setButtonPausedState(boolean paused) {
        mStatePaused = paused;
        mPauseButton.setText(paused
                ? Expansion.getStringId("text_button_resume")
                : Expansion.getStringId("text_button_pause"));
    }

    void initializeDownload() {
        Log.i(LOG_TAG, "initializeDownload");
        mDownloaderClientStub = DownloaderClientMarshaller.CreateStub(
                this, ExpansionDownloaderService.class);

        setContentView(Expansion.getLayoutId("activity_expansion_download"));

        mPB = (ProgressBar) findViewById(Expansion.getResId("progressBar"));
        mStatusText = (TextView) findViewById(Expansion.getResId("statusText"));
        mProgressFraction = (TextView) findViewById(Expansion.getResId("progressAsFraction"));
        mProgressPercent = (TextView) findViewById(Expansion.getResId("progressAsPercentage"));
        mAverageSpeed = (TextView) findViewById(Expansion.getResId("progressAverageSpeed"));
        mTimeRemaining = (TextView) findViewById(Expansion.getResId("progressTimeRemaining"));
        mDashboard = findViewById(Expansion.getResId("downloaderDashboard"));
        mCellMessage = findViewById(Expansion.getResId("approveCellular"));
        mPauseButton = (Button) findViewById(Expansion.getResId("pauseButton"));
        mWiFiSettingsButton = (Button) findViewById(Expansion.getResId("wifiSettingsButton"));

        mPauseButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (mStatePaused) {
                    mRemoteService.requestContinueDownload();
                } else {
                    mRemoteService.requestPauseDownload();
                }
                setButtonPausedState(!mStatePaused);
            }
        });

        mWiFiSettingsButton.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View v) {
                startActivity(new Intent(Settings.ACTION_WIFI_SETTINGS));
            }
        });

        Button resumeOnCell = (Button) findViewById(Expansion.getResId("resumeOverCellular"));
        resumeOnCell.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                mRemoteService.setDownloadFlags(IDownloaderService.FLAGS_DOWNLOAD_OVER_CELLULAR);
                mRemoteService.requestContinueDownload();
                mCellMessage.setVisibility(View.GONE);
            }
        });
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Expansion.init(getBaseContext());

        if (!expansionFilesDelivered()) {
            try {
                Intent launchIntent = ExpansionDownloadActivity.this.getIntent();
                Intent notifierIntent = new Intent(this, ExpansionDownloadActivity.class);
                notifierIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                notifierIntent.setAction(launchIntent.getAction());

                if (launchIntent.getCategories() != null) {
                    for (String category : launchIntent.getCategories()) {
                        notifierIntent.addCategory(category);
                    }
                }

                PendingIntent pendingIntent = PendingIntent.getActivity(
                        ExpansionDownloadActivity.this,
                        0,  notifierIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT);

                int startResult = DownloaderClientMarshaller.startDownloadServiceIfRequired(
                        this, pendingIntent,
                        ExpansionDownloaderService.class);
                if (startResult != DownloaderClientMarshaller.NO_DOWNLOAD_REQUIRED) {
                    initializeDownload();
                    return;
                }

            } catch (PackageManager.NameNotFoundException e) {
                Log.e(LOG_TAG, "Cannot find own package! MAYDAY!");
                e.printStackTrace();
            }
        } else {
            // Start main activity
            String name = Expansion.getMainActivityClassName();
            try {
                Intent intent = new Intent(ExpansionDownloadActivity.this, Class.forName(name));
                intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(intent);
                finish();
            } catch (ClassNotFoundException e) {
                Log.e(LOG_TAG, "Main class not found ("+name+")!");
            }
        }
    }

    void onDownloadComplete() {
        Log.i(LOG_TAG, "Download complete");
        if (!checkExpansionFiles()) {
            setState(-1);
            return;
        }
        finish();
    }

    @Override
    public void onStart() {
        super.onStart();
        if (null != mDownloaderClientStub) {
            mDownloaderClientStub.connect(this);
        }
    }

    @Override
    public void onStop() {
        if (null != mDownloaderClientStub) {
            mDownloaderClientStub.disconnect(this);
        }
        super.onStop();
    }


    @Override
    public void onServiceConnected(Messenger m) {
        Log.i(LOG_TAG, "onServiceConnected");
        mRemoteService = DownloaderServiceMarshaller.CreateProxy(m);
        mRemoteService.onClientUpdated(mDownloaderClientStub.getMessenger());
    }

    @Override
    public void onDownloadStateChanged(int newState) {
        Log.i(LOG_TAG, "onDownloadStateChanged: " + newState);
        setState(newState);
        boolean showDashboard = true;
        boolean showCellMessage = false;
        boolean paused;
        boolean indeterminate;
        switch (newState) {
            case IDownloaderClient.STATE_IDLE:
                // STATE_IDLE means the service is listening, so it's
                // safe to start making calls via mRemoteService.
                paused = false;
                indeterminate = true;
                break;
            case IDownloaderClient.STATE_CONNECTING:
            case IDownloaderClient.STATE_FETCHING_URL:
                showDashboard = true;
                paused = false;
                indeterminate = true;
                break;
            case IDownloaderClient.STATE_DOWNLOADING:
                paused = false;
                showDashboard = true;
                indeterminate = false;
                break;

            case IDownloaderClient.STATE_FAILED_CANCELED:
            case IDownloaderClient.STATE_FAILED:
            case IDownloaderClient.STATE_FAILED_FETCHING_URL:
            case IDownloaderClient.STATE_FAILED_UNLICENSED:
                paused = true;
                showDashboard = false;
                indeterminate = false;
                break;
            case IDownloaderClient.STATE_PAUSED_NEED_CELLULAR_PERMISSION:
            case IDownloaderClient.STATE_PAUSED_WIFI_DISABLED_NEED_CELLULAR_PERMISSION:
                showDashboard = false;
                paused = true;
                indeterminate = false;
                showCellMessage = true;
                break;

            case IDownloaderClient.STATE_PAUSED_BY_REQUEST:
                paused = true;
                indeterminate = false;
                break;
            case IDownloaderClient.STATE_PAUSED_ROAMING:
            case IDownloaderClient.STATE_PAUSED_SDCARD_UNAVAILABLE:
                paused = true;
                indeterminate = false;
                break;
            case IDownloaderClient.STATE_COMPLETED:
                showDashboard = false;
                paused = false;
                indeterminate = false;
                onDownloadComplete();
                return;
            default:
                paused = true;
                indeterminate = true;
                showDashboard = true;
        }
        int newDashboardVisibility = showDashboard ? View.VISIBLE : View.GONE;
        if (mDashboard.getVisibility() != newDashboardVisibility) {
            mDashboard.setVisibility(newDashboardVisibility);
        }
        int cellMessageVisibility = showCellMessage ? View.VISIBLE : View.GONE;
        if (mCellMessage.getVisibility() != cellMessageVisibility) {
            mCellMessage.setVisibility(cellMessageVisibility);
        }

        mPB.setIndeterminate(indeterminate);
        setButtonPausedState(paused);
    }

    @Override
    public void onDownloadProgress(DownloadProgressInfo progress) {
        int kilobytes_per_second = Expansion.getStringId("kilobytes_per_second");
        int time_remaining       = Expansion.getStringId("time_remaining");

        mAverageSpeed.setText(getString(kilobytes_per_second,
                Helpers.getSpeedString(progress.mCurrentSpeed)));
        mTimeRemaining.setText(getString(time_remaining,
                Helpers.getTimeRemaining(progress.mTimeRemaining)));

        progress.mOverallTotal = progress.mOverallTotal;
        mPB.setMax((int) (progress.mOverallTotal >> 8));
        mPB.setProgress((int) (progress.mOverallProgress >> 8));
        mProgressPercent.setText(Long.toString(progress.mOverallProgress
                * 100 /
                progress.mOverallTotal) + "%");
        mProgressFraction.setText(Helpers.getDownloadProgressString
                (progress.mOverallProgress,
                        progress.mOverallTotal));
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }
}
