package com.reactlibrary;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.job.JobParameters;
import android.app.job.JobService;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.net.Uri;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import com.facebook.react.modules.storage.ReactDatabaseSupplier;
import com.reactlibrary.net.MultipartUtil;
import com.reactlibrary.net.injection.component.DaggerUploadComponent;
import com.reactlibrary.net.injection.module.UploadModule;
import com.reactlibrary.net.model.DataItem;
import com.reactlibrary.net.repository.UploadRepository;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import static com.facebook.react.common.ReactConstants.TAG;
import static com.reactlibrary.net.JacksonUtil.dataItemsToJson;

/**
 * author : yingli
 * time   : 7/25/18
 * desc   :
 */
public class NetService extends JobService {

    @Inject
    UploadRepository uploadRepository;

    String credential;
    String repo;
    String parentDir;
    String uploadLink;
    String netOption;
    List<DataItem> photos;
    List<DataItem> textFiles;

    public static final String NOTIFICATION_CHANNEL_ID = "10001";
    private NotificationCompat.Builder mBuilder;

    public NetService() {
        super();
        DaggerUploadComponent.builder()
                .uploadModule(new UploadModule())
                .build()
                .inject(this);
    }

    @Override
    public boolean onStartJob(JobParameters jobParameters) {
        Log.e("NetService", "NetService onStartJob");

        String uploadError = getUploadError();
        if (uploadError == null || uploadError.equalsIgnoreCase("")){

            if (Connectivity.isConnectedMobile(this)) {
                netOption = getNetOption();
                if (netOption.equalsIgnoreCase("Cellular")) {
                    preProcess();
                    getUploadLink();
                }
            } else if (Connectivity.isConnectedWifi(this)) {
                preProcess();
                getUploadLink();
            }
        }
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

    private void preProcess() {
        credential = getCredential();
        repo = getRepo();
        parentDir = getParentDir();
    }

    private void uploadPhotos() {
        photos = retrieveItems("photos");

        if (photos!=null && photos.size()>0) {
            uploadNextItem(photos.get(0));
        } else {
            uploadTextFiles();
        }
    }

    private void uploadTextFiles() {
        textFiles = retrieveItems("md");

        if (textFiles!=null && textFiles.size()>0) {
            uploadNextItem(textFiles.get(0));
        }
    }

    public void uploadNextItem(DataItem dataItem) {
        String getContentUri = dataItem.getContentUri();
        if (getContentUri.startsWith("content:") || getContentUri.startsWith("file:")) {
            getContentUri = MultipartUtil.getImageRealPath(this.getContentResolver(), Uri.parse(getContentUri), null);
        }

        Call<ResponseBody> call = uploadRepository.uploadItem(credential, MultipartUtil.prepareFilePart("file", dataItem.getFileName(), getContentUri),
                MultipartUtil.addTextPart( "parent_dir", parentDir), uploadLink);
        call.enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {

                    if (dataItem.getFileName().endsWith(".md")){
                        textFiles.remove(dataItem);
                        write("md", dataItemsToJson(textFiles));
                        textFiles = retrieveItems("md");
                        if (textFiles !=null && textFiles.size()>0) {
                            uploadNextItem(textFiles.get(0));
                        }
                    } else {
                        photos.remove(dataItem);
                        write("photos", dataItemsToJson(photos));
                        photos = retrieveItems("photos");
                        if (photos != null && photos.size() > 0) {
                            uploadNextItem(photos.get(0));
                        } else {
                            uploadTextFiles();
                        }
                    }
                    showNotification("File Uploaded");
                } else {
                    int statusCode = response.code();
                    Log.e("dataItem", statusCode+ " - failed");
                    Log.e("dataItem", response.message());
                    String errStr = "";
                    try {
                        errStr = (response.errorBody()).string();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    if (errStr.contains("Parent dir doesn't exist")) {
                        showNotification("Selected folder " + parentDir + " not exist");
                        write("uploadError", "not exist");
                        Log.e("read", query("uploadError"));
                    }
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {

            }
        });
    }

    public String query(String key) {
        SQLiteDatabase readableDatabase = null;
        readableDatabase = ReactDatabaseSupplier.getInstance(this).getReadableDatabase();
        if (readableDatabase != null) {

            Cursor catalystLocalStorage = null;
            try {
                readableDatabase = ReactDatabaseSupplier.getInstance(this).getReadableDatabase();
                String result =  AsyncLocalStorageUtil.getItemImpl(readableDatabase, key);
                return result;

            } finally {
                if (catalystLocalStorage != null) {
                    catalystLocalStorage.close();
                }

                if (readableDatabase != null) {
                    readableDatabase.close();
                }
            }
        }
        return "";
    }

    public void write(String key, String updateValue) {
        SQLiteDatabase readableDatabase = null;
        readableDatabase = ReactDatabaseSupplier.getInstance(this).getReadableDatabase();
        if (readableDatabase != null) {

            Cursor catalystLocalStorage = null;
            try {
                readableDatabase = ReactDatabaseSupplier.getInstance(this).getReadableDatabase();
                AsyncLocalStorageUtil.setItemImpl(readableDatabase, key, updateValue);

            } finally {
                if (catalystLocalStorage != null) {
                    catalystLocalStorage.close();
                }

                if (readableDatabase != null) {
                    readableDatabase.close();
                }
            }
        }
    }

    public String getNetOption() {
        String uploadStr = query("reduxPersist:upload");
        try {
            JSONObject obj = new JSONObject(uploadStr);
            String netOption = obj.getString("netOption");
            return netOption;
        } catch (Throwable t) {
            Log.e("uploadStr", "Could not parse malformed JSON: \"" + uploadStr + "\"");
        }
        return "";
    }

    public String getCredential() {
        String accountsStr = query("reduxPersist:accounts");
        try {
            JSONObject obj = new JSONObject(accountsStr);
            String credential = obj.getString("authenticateResult");
            return credential;
        } catch (Throwable t) {
            Log.e("getCredential", "Could not parse malformed JSON: \"" + accountsStr + "\"");
        }
        return "";
    }

    public String getParentDir() {
        String libraryStr = query("reduxPersist:library");
        try {
            JSONObject obj = new JSONObject(libraryStr);
            String parentDir = obj.getString("parentDir");
            Log.e("parentDir", parentDir);
            return parentDir;
        } catch (Throwable t) {
            Log.e("getParentDir", "Could not parse malformed JSON: \"" + libraryStr + "\"");
        }
        return "";
    }

    public String getRepo() {
        String libraryStr = query("reduxPersist:library");
        try {
            JSONObject obj = new JSONObject(libraryStr);
            String destinationLibraryStr = obj.getString("destinationLibrary");
            JSONObject libObj = new JSONObject(destinationLibraryStr);
            String repo = libObj.getString("id");
            return repo;
        } catch (Throwable t) {
            Log.e("getRepo", "Could not parse malformed JSON: \"" + libraryStr + "\"");
        }
        return "";
    }

    public String getUploadError() {
        String uploadStr = "";
        uploadStr = query("uploadError");
        return uploadStr;
    }

    public List<DataItem> retrieveItems(String key) {
        String itemsStr = query(key);
        try {
            JSONArray uploadItemsArr = new JSONArray(itemsStr);
            List<DataItem> itemsList = new ArrayList<>();
            for (int i = 0; i < uploadItemsArr.length(); i++) {
                JSONObject jsonobject = uploadItemsArr.getJSONObject(i);
                String fileName = jsonobject.getString("fileName");
                String contentUri = jsonobject.getString("contentUri");
                itemsList.add(new DataItem(fileName, contentUri));
            }
            return itemsList;
        } catch (Throwable t) {
            Log.e("retrieveItems", "Could not parse malformed JSON: \"" + itemsStr + "\"");
        }
        return null;
    }

    private void getUploadLink() {
        Call<ResponseBody> call = uploadRepository.getUploadLink(credential, repo);
        call.enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    try {
                        String link = response.body().string();
                        link = link.substring(link.lastIndexOf("/")+1, link.length()-1);
                        Log.e(TAG, link);
                        uploadLink = link;
                        uploadPhotos();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                } else {
                    int statusCode = response.code();
                    Log.e("getUploadLink", statusCode+ " - failed");
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                Log.e(TAG, t.getMessage());
            }
        });
    }

    public void showNotification(String message) {
        mBuilder = new NotificationCompat.Builder(this);
        mBuilder.setSmallIcon(R.drawable.app_images_icon_app);
        mBuilder.setContentTitle("LabCam")
                .setContentText(message)
                .setAutoCancel(false);

        NotificationManager mNotificationManager = (NotificationManager) this.getSystemService(Context.NOTIFICATION_SERVICE);

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O)
        {
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel notificationChannel = new NotificationChannel(NOTIFICATION_CHANNEL_ID, "NOTIFICATION_CHANNEL_NAME", importance);
            notificationChannel.enableLights(false);
            notificationChannel.setVibrationPattern(new long[]{ 0 });
            notificationChannel.enableVibration(true);
            assert mNotificationManager != null;
            mBuilder.setChannelId(NOTIFICATION_CHANNEL_ID);
            mNotificationManager.createNotificationChannel(notificationChannel);
        }
        assert mNotificationManager != null;
        mNotificationManager.notify(0 /* Request Code */, mBuilder.build());
    }
}
