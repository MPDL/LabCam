package com.reactlibrary.net.injection.module;

import com.reactlibrary.net.repository.UploadRepository;
import com.reactlibrary.net.repository.UploadRepositoryImpl;

import dagger.Module;
import dagger.Provides;


@Module
public class UploadModule {

    @Provides
    UploadRepository provideUploadRepository(UploadRepositoryImpl repository){
        return repository;
    }

}
