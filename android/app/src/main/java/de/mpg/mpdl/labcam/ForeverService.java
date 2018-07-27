package de.mpg.mpdl.labcam;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.util.Log;

/**
 * author : yingli
 * time   : 7/25/18
 * desc   :
 */
public class ForeverService extends Service{
    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        new android.os.Handler().postDelayed(
                new Runnable() {
                    public void run() {
                        Log.e("ForeverService", String.valueOf(System.currentTimeMillis()));
                    }
                },
                5000);

        return super.onStartCommand(intent, flags, startId);
    }


}
