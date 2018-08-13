package com.reactlibrary.net.injection.component;

import com.reactlibrary.NetService;
import com.reactlibrary.net.injection.PerActivity;
import com.reactlibrary.net.injection.module.UploadModule;

import dagger.Component;

@PerActivity
@Component(modules = {UploadModule.class})
public interface UploadComponent {
    void inject(NetService service);
}
