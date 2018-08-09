package de.mpg.mpdl.labcam;

import android.app.job.JobParameters;
import android.app.job.JobService;
import android.util.Log;

/**
 * author : yingli
 * time   : 7/25/18
 * desc   :
 */
public class NetService extends JobService {
    @Override
    public boolean onStartJob(JobParameters jobParameters) {
        Log.e("NetService", "NetService onStartJob");
        return false;
    }

    @Override
    public boolean onStopJob(JobParameters jobParameters) {
        return false;
    }

    @Override
    public void onDestroy() {
        Log.e("NetService", "NetService onDestroy");
        super.onDestroy();
    }
}
