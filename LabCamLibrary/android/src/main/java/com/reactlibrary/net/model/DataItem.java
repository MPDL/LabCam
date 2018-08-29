package com.reactlibrary.net.model;

/**
 * author : yingli
 * time   : 8/10/18
 * desc   :
 */
public class DataItem {

    String fileName;
    String contentUri;

    public DataItem(String fileName, String contentUri) {
        this.fileName = fileName;
        this.contentUri = contentUri;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getContentUri() {
        return contentUri;
    }

    public void setContentUri(String contentUri) {
        this.contentUri = contentUri;
    }
}
