package com.reactlibrary.net;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reactlibrary.net.model.DataItem;

import java.util.List;


public class JacksonUtil {

    public static String dataItemsToJson(List<DataItem> list){
        ObjectMapper mapper = new ObjectMapper();
        try {
            String jsonStr = mapper.writeValueAsString(list);                   // write to string
            return jsonStr;
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return "";
    }
}
