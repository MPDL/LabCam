package com.reactlibrary.net.repository;

import okhttp3.MultipartBody;
import okhttp3.ResponseBody;
import retrofit2.Call;

/**
 * author : yingli
 * time   : 8/9/18
 * desc   :
 */
public interface UploadRepository {
    Call<ResponseBody> uploadItem(
            String token,
            MultipartBody.Part file,
            MultipartBody.Part parentDir,
            MultipartBody.Part replace,
            String link
    );

    Call<ResponseBody> getUploadLink(
            String token,
            String repo
    );


    Call<ResponseBody> getDirectories(
            String token,
            String library,
            String path
    );

}
