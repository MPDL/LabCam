package de.mpg.mpdl.labcam;

import android.app.ActivityManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.util.Log;

import com.facebook.react.HeadlessJsTaskService;

import java.util.List;

public class NetworkChangeReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(final Context context, final Intent intent) {

        /**
         This part will be called everytime network connection is changed
         e.g. Connected -> Not Connected
         **/
        if (!isAppOnForeground((context))) {
            /**
             We will start our service and send extra info about
             network connections
             **/

            if (intent.getAction().equals(ConnectivityManager.CONNECTIVITY_ACTION)) {

                ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
                NetworkInfo networkInfo = cm.getActiveNetworkInfo();

                if (networkInfo != null && networkInfo.getType() == ConnectivityManager.TYPE_MOBILE &&
                    networkInfo.isConnected()) {
                    // cellular is connected
                    Log.e("NetworkChangeReceiver", " -- Cellular connected --- " );
                    startService(context, "cellular");
                }
            }
            else if (intent.getAction().equalsIgnoreCase(WifiManager.WIFI_STATE_CHANGED_ACTION))
            {
                int wifiState = intent.getIntExtra(WifiManager.EXTRA_WIFI_STATE, WifiManager.WIFI_STATE_UNKNOWN);
                if (wifiState == WifiManager.WIFI_STATE_DISABLED) {
                    Log.e("NetworkChangeReceiver", " ----- Wifi  Disconnected ----- ");
                    ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
                    NetworkInfo networkInfo = cm.getActiveNetworkInfo();
                    if (networkInfo != null && networkInfo.getType() == ConnectivityManager.TYPE_MOBILE &&
                            networkInfo.isConnected()) {
                        // cellular is connected
                        Log.e("NetworkChangeReceiver", " -- Cellular connected --- " );
                        startService(context, "cellular");

                    }
                } else if (wifiState == WifiManager.WIFI_STATE_ENABLED) {
                    // Wifi is connected
                    Log.e("NetworkChangeReceiver", " -- Wifi connected --- ");
                    startService(context, "wifi");
                }
            }
        }
    }

    private boolean isAppOnForeground(Context context) {
        /**
          We need to check if app is in foreground otherwise the app will crash.
         http://stackoverflow.com/questions/8489993/check-android-application-is-in-foreground-or-not
        **/
        ActivityManager activityManager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningAppProcessInfo> appProcesses =
        activityManager.getRunningAppProcesses();
        if (appProcesses == null) {
            return false;
        }
        final String packageName = context.getPackageName();
        for (ActivityManager.RunningAppProcessInfo appProcess : appProcesses) {
            if (appProcess.importance ==
            ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND &&
             appProcess.processName.equals(packageName)) {
                return true;
            }
        }
        return false;
    }

    public static void startService(final Context context, final String internetType) {

        new android.os.Handler().postDelayed(
                new Runnable() {
                    public void run() {
                        Intent serviceIntent = new Intent(context, MyTaskService.class);
                        serviceIntent.putExtra("internetType", internetType);
                        context.startService(serviceIntent);
                        HeadlessJsTaskService.acquireWakeLockNow(context);
                    }
                }, 2000);
    }
}