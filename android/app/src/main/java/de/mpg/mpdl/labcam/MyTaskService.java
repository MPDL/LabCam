package de.mpg.mpdl.labcam;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.support.v4.app.NotificationCompat;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

public class MyTaskService extends HeadlessJsTaskService {

  @Override
  protected @Nullable
  HeadlessJsTaskConfig getTaskConfig(Intent intent) {
    Bundle extras = intent.getExtras();
    if (extras != null) {
      return new HeadlessJsTaskConfig(
          "UploadTask",
          Arguments.fromBundle(extras),
          5000, // timeout for the task
          true // optional: defines whether or not  the task is allowed in foreground. Default is false
        );
    }
    return null;
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    Log.e("MyTaskService", "onDestroy");

  }

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {


//    NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this)
//            .setSmallIcon(R.drawable.app_images_icon_app)
//            .setContentTitle("Service")
//            .setContentText("Service running")
//            .setPriority(NotificationCompat.PRIORITY_DEFAULT);
//
//    NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
//    notificationManager.notify(1, mBuilder.build());

    SharedPreferences prefs = this.getSharedPreferences(
            "time", Context.MODE_PRIVATE);

    String dateTimeKey = "datetime";
    Long time = prefs.getLong(dateTimeKey, 0l);

    Long currentTime = System.currentTimeMillis();
    Log.e("MyTaskService", String.valueOf(currentTime-time));
    if (currentTime-time > 2000) {
      prefs.edit().putLong(dateTimeKey, currentTime).apply();
      Log.e("MyTaskService", "onStartCommand");
      return super.onStartCommand(intent, flags, startId);
    }else {
      return START_STICKY;
    }
  }

}