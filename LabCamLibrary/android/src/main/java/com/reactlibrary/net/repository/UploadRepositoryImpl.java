package com.reactlibrary.net.repository;

import com.reactlibrary.net.RetrofitFactory;
import com.reactlibrary.net.api.UploadApi;

import javax.inject.Inject;

import okhttp3.MultipartBody;
import okhttp3.ResponseBody;
import retrofit2.Call;

/**
 * author : yingli
 * time   : 8/9/18
 * desc   :
 */
public class UploadRepositoryImpl implements UploadRepository{

    @Inject
    public UploadRepositoryImpl() {
    }

    @Override
    public Call<ResponseBody> uploadItem(String token, MultipartBody.Part file, MultipartBody.Part parentDir, String link) {
        return RetrofitFactory.getInstance().create(UploadApi.class).uploadItem(token, file, parentDir, link);
    }

    @Override
    public Call<ResponseBody> getUploadLink(String token, String repo) {
        return RetrofitFactory.getInstance().create(UploadApi.class).getUploadLink(token, repo);
    }

    @Override
    public Call<ResponseBody> getDirectories(String token, String library, String path) {
        return RetrofitFactory.getInstance().create(UploadApi.class).getDirectories(token, library, path);
    }
}
