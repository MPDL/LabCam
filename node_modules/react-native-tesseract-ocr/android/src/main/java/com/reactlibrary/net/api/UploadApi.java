package com.reactlibrary.net.api;

import okhttp3.MultipartBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Path;

/**
 * author : yingli
 * time   : 8/9/18
 * desc   :
 */
public interface UploadApi {
    @Multipart
    @POST("seafhttp/upload-api/{link}")
    Call<ResponseBody> uploadItem(
            @Header("Authorization") String token,
            @Part MultipartBody.Part file,
            @Part MultipartBody.Part parentDir,
            @Path("link") String link
    );

    @GET("api2/repos/{repo}/upload-link/")
    Call<ResponseBody> getUploadLink(
            @Header("Authorization") String token,
            @Path("repo") String repo
    );


    @GET("api2/repos/{library}/dir/?t=f&recursive=0&p={path}")
    Call<ResponseBody> getDirectories(
            @Header("Authorization") String token,
            @Path("library") String library,
            @Path("path") String path
    );
}
