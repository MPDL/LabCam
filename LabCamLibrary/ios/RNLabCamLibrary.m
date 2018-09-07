
#import "RNLabCamLibrary.h"
#import <React/RCTLog.h>
#import <React/RCTAsyncLocalStorage.h>

@interface RNLabCamLibrary()
@end

@implementation RNLabCamLibrary

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE()
RCT_EXPORT_METHOD(addEvent)
{
}

@end
  
