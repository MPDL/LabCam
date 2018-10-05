/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTAsyncLocalStorage.h>

#import <Photos/Photos.h>
#import "AFNetworking.h"
#import <UserNotifications/UserNotifications.h>
#import <CoreTelephony/CTTelephonyNetworkInfo.h>
#import "Reachability.h"

@interface AppDelegate()
@property (strong, atomic) NSMutableString *credential;
@property (strong, atomic) NSMutableString *repo;
@property (strong, atomic) NSMutableString *parentDir;
@property (strong, atomic) NSMutableString *uploadLink;
@property (strong, atomic) NSMutableString *netOption;
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;

//  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"LabCam"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:111.0f green:123.0f blue:1.0f alpha:1];
  
  [application setMinimumBackgroundFetchInterval:UIApplicationBackgroundFetchIntervalMinimum];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (void)applicationDidEnterBackground:(UIApplication *)application
{
  NSLog(@"%@", @"applicationDidEnterBackground");
  __block UIBackgroundTaskIdentifier bgTask = 0;
  UIApplication  *app = [UIApplication sharedApplication];
  bgTask = [app beginBackgroundTaskWithName:@"MyTask" expirationHandler:^{
    [app endBackgroundTask:bgTask];
    bgTask = UIBackgroundTaskInvalid;
  }];
  
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    RCTAsyncLocalStorage *storage = [[RCTAsyncLocalStorage alloc] init];
    [self getNetOpt:storage];
  });
}

-(void)application:(UIApplication *)application performFetchWithCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
   NSLog(@"performFetchWithCompletionHandler");

  RCTAsyncLocalStorage *storage = [[RCTAsyncLocalStorage alloc] init];
  [self getNetOpt:storage];

  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 25 * NSEC_PER_SEC),
                 dispatch_get_main_queue(), ^{
                   // Check result of your operation and call completion block with the result
                   NSLog(@"performFetchWithCompletionHandler completionHandler");
                   completionHandler(UIBackgroundFetchResultNewData);
    });
}

#pragma --------------------------------------------------------------------------------------------
#pragma mark ===== Network =====
#pragma --------------------------------------------------------------------------------------------

- (void)getNetOpt: (RCTAsyncLocalStorage *)storage
{
  NSLog(@"getNetOpt");
  [self jsonFromLocalRNStrogeForKey: @"reduxPersist:upload" completion:^(NSDictionary* data,NSError* error){
    if(data){
      NSMutableString * netOption = [data valueForKeyPath: @"netOption"];
      NSLog(@"netOption : %@", netOption);
      _netOption = netOption;
      NSString *networkType = [self getNetworkType];
      if ([networkType isEqualToString:@"Wifi"]) {
        [self getAccounts:storage];
      } else if([networkType isEqualToString:@"cellular"]) {
        if ([netOption isEqualToString:@"cellular"]) {
          [self getAccounts:storage];
        }
      }
    }else{
      //handle error
      NSLog(@"JSON Parsing Error: %@",error.localizedDescription);
    }
  }];
}

- (NSString *)getNetworkType
{
  Reachability *reachability = [Reachability reachabilityForInternetConnection];
  [reachability startNotifier];
  
  NetworkStatus status = [reachability currentReachabilityStatus];
  
  if(status == NotReachable)
  {
    //No internet
    NSLog(@"bla No internet");
    return @"No internet";
  }
  else if (status == ReachableViaWiFi)
  {
    //WiFi
    NSLog(@"bla Wifi");
    return @"Wifi";
  }
  else if (status == ReachableViaWWAN)
  {
    //3G
    NSLog(@"bla 3G");
    return @"cellular";
  }
  return @"No internet";
}

- (void)getUploadLink :(UIBackgroundTaskIdentifier) bgTask
{
  AFHTTPSessionManager *manager = [[AFHTTPSessionManager alloc]initWithSessionConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
  manager.requestSerializer = [AFJSONRequestSerializer serializer];
  manager.responseSerializer = [AFJSONResponseSerializer serializerWithReadingOptions:NSJSONReadingAllowFragments];
  [manager.requestSerializer setValue:_credential forHTTPHeaderField:@"Authorization"];
  
  [manager GET:[NSString stringWithFormat:@"%@/%@/%@", @"https://keeper.mpdl.mpg.de/api2/repos", _repo, @"upload-link/"]
    parameters:nil progress:nil success:^(NSURLSessionTask *task, id responseObject) {
    NSLog(@"JSON: %@", responseObject);
    _uploadLink = responseObject;
    RCTAsyncLocalStorage *storage = [[RCTAsyncLocalStorage alloc] init];
    [self getPhotos: storage :^(NSDictionary* data,NSError* error){
      if(data){
        for (id item in data) {
          NSString * fileName = [item valueForKeyPath: @"fileName"];
          NSString * contentUri = [item valueForKeyPath: @"contentUri"];
          NSString * text = [item valueForKeyPath:@"text"];
          NSLog(@"fileName : %@", fileName);
          NSLog(@"text : %@", text);
          [self uploadPhoto:fileName :contentUri :bgTask];
          break;
        }
      }else{
        //handle error
        NSLog(@"JSON Parsing Error: %@",error.localizedDescription);
      }
    }
     ];
  } failure:^(NSURLSessionTask *operation, NSError *error) {
    NSLog(@"Error: %@", error);
  }];
}

#pragma --------------------------------------------------------------------------------------------
#pragma mark ===== Photo =====
#pragma --------------------------------------------------------------------------------------------

-(void)getPhotos: (RCTAsyncLocalStorage *)storage : (void(^)(NSDictionary *data, NSError *error)) completion
{
  NSLog(@"getPhotos");
  [self jsonFromLocalRNStrogeForKey: @"photos" completion:completion];
}

-(void) setPhotos: (RCTAsyncLocalStorage *)storage :(NSString *) photosStr :(RCTResponseSenderBlock) rnCompletion
{
  dispatch_async(storage.methodQueue, ^{
    @try {
      NSMutableArray<NSMutableArray<NSMutableArray *> *> * kvPairs = [[NSMutableArray alloc] init];
      NSMutableArray * innerArr = [[NSMutableArray alloc] init];
      [innerArr addObject:@"photos"];
      [innerArr addObject: photosStr];
      [kvPairs addObject:innerArr];
      [storage performSelector:@selector(multiSet:callback:) withObject:kvPairs withObject: rnCompletion];
    }
    @catch (NSException *exception) {
      NSLog(@"Caught an exception");
    }
  });
}

- (void)uploadPhoto :(NSString *)fileName : (NSString *)contentUri :(UIBackgroundTaskIdentifier) bgTask
{
  NSURL* imageUri = [NSURL URLWithString:contentUri];
  PHFetchResult *results = [PHAsset fetchAssetsWithALAssetURLs:@[imageUri] options:nil];
  
  if (results.count == 0) {
    NSString *errorText = [NSString stringWithFormat:@"Failed to fetch PHAsset with local identifier %@ with no error message.", contentUri];
    NSMutableDictionary* details = [NSMutableDictionary dictionary];
    [details setValue:errorText forKey:NSLocalizedDescriptionKey];
    return;
  }
  
  __block NSData *data;
  PHAsset *asset = [results firstObject];
  PHImageManager *imageManager = [PHImageManager defaultManager];
  PHImageRequestOptions *options = [[PHImageRequestOptions alloc]init];
  options.networkAccessAllowed = YES;
  
  @autoreleasepool {
    [imageManager requestImageDataForAsset:asset options:options resultHandler:^(NSData *imageData, NSString *dataUTI, UIImageOrientation orientation, NSDictionary *info) {
      NSLog(@"requestImageDataForAsset returned info(%@)", info);
      data = [NSData dataWithData:imageData];
      NSString *string = [NSByteCountFormatter stringFromByteCount:data.length countStyle:NSByteCountFormatterCountStyleBinary];
      NSLog(@" size: %@", string);
      
      NSMutableURLRequest *request = [[AFHTTPRequestSerializer serializer] multipartFormRequestWithMethod:@"POST" URLString:_uploadLink parameters:nil constructingBodyWithBlock:^(id<AFMultipartFormData> formData) {
        [formData appendPartWithFormData:[_parentDir dataUsingEncoding:NSUTF8StringEncoding] name:@"parent_dir"];
//        [formData appendPartWithFormData:[@"1" dataUsingEncoding:NSUTF8StringEncoding] name:@"replace"];
        [formData appendPartWithFileData:imageData name:@"file" fileName:fileName mimeType:@"image/jpeg"];
        
      } error:nil];
      [request setAllowsCellularAccess:NO];
      [request setValue:_credential forHTTPHeaderField:@"Authorization"];
      
      AFURLSessionManager *manager = [[AFURLSessionManager alloc] initWithSessionConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
      manager.responseSerializer = [AFJSONResponseSerializer serializerWithReadingOptions:NSJSONReadingAllowFragments];
      
      NSURLSessionUploadTask *uploadTask;
      uploadTask = [manager
                    uploadTaskWithStreamedRequest:request
                    progress: nil
                    completionHandler:^(NSURLResponse * _Nonnull response, id  _Nullable responseObject, NSError * _Nullable error) {
                      NSLog(@"response: %@", response);
                      NSLog(@"error: %@", error);
                      NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *) response;
                      NSLog(@"response status code: %ld", (long)[httpResponse statusCode]);
                      if ((long)[httpResponse statusCode] == 200) {
                        [self showNotifcation];
                        NSLog(@"photo uploaded");
                        
                        RCTAsyncLocalStorage *storage = [[RCTAsyncLocalStorage alloc] init];
                        [self getPhotos: storage :^(NSDictionary* data,NSError* error){
                          if(data){
                            NSMutableArray *newArr = [[NSMutableArray alloc] init];
                            for (id item in data) {
                              NSString * name = [item valueForKeyPath: @"fileName"];
                              if (![name isEqualToString:fileName]) {
                                [newArr addObject:item];
                              }
                            }
                            
                            NSError *error;
                            NSData *jsonData = [NSJSONSerialization dataWithJSONObject:newArr
                                                                               options:0 // Pass 0 if you don't care about the readability of the generated string
                                                                                 error:&error];
                            
                            if (! jsonData) {
                              NSLog(@"Got an error: %@", error);
                            } else {
                              NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
                              NSLog(@"%@", jsonString);
                              
                              RCTResponseSenderBlock rnCompletion = ^(NSArray *response) {
                                if ([newArr count] == 0) {
                                  [self getMdFiles: storage :^(NSDictionary* data,NSError* error){
                                    if(data && [data count]>0){
                                      for (id item in data) {
                                        NSString * fileName = [item valueForKeyPath: @"fileName"];
                                        NSString * text = [item valueForKeyPath: @"text"];
                                        NSLog(@"fileName : %@", fileName);
                                        NSLog(@"text : %@", text);
                                        [self uploadMdFile :fileName :text :0];
                                        break;
                                      }
                                    }else{
                                      //handle error
                                      UIApplication  *app = [UIApplication sharedApplication];
                                      [app endBackgroundTask: bgTask];
                                      NSLog(@"endBackgroundTask");
                                      NSLog(@"JSON Parsing Error: %@",error.localizedDescription);
                                    }
                                  }];
                                } else {
                                  [self uploadPhoto:[[newArr objectAtIndex:0] valueForKeyPath: @"fileName"] :[[newArr objectAtIndex:0] valueForKeyPath: @"contentUri"] :bgTask];
                                }
                              };
                              [self setPhotos:storage :jsonString :rnCompletion];
                            }
                          }else{
                            //handle error
                            NSLog(@"JSON Parsing Error: %@",error.localizedDescription);
                          }
                        }];
                      }
                    }];
      
      [uploadTask resume];
    }];
  }
}

#pragma --------------------------------------------------------------------------------------------
#pragma mark ===== Mdfiles =====
#pragma --------------------------------------------------------------------------------------------

-(void)getMdFiles: (RCTAsyncLocalStorage *)storage : (void(^)(NSDictionary *data, NSError *error)) completion
{
  NSLog(@"getMdFiles");
  [self jsonFromLocalRNStrogeForKey: @"md" completion:completion];
}

-(void) setMds: (RCTAsyncLocalStorage *)storage :(NSString *) mdsStr :(RCTResponseSenderBlock) setMdscompletion
{
  dispatch_async(storage.methodQueue, ^{
    @try {
      NSMutableArray<NSMutableArray<NSMutableArray *> *> * kvPairs = [[NSMutableArray alloc] init];
      NSMutableArray * innerArr = [[NSMutableArray alloc] init];
      [innerArr addObject:@"md"];
      [innerArr addObject: mdsStr];
      [kvPairs addObject:innerArr];
      [storage performSelector:@selector(multiSet:callback:) withObject:kvPairs withObject: setMdscompletion];
    }
    @catch (NSException *exception) {
      NSLog(@"Caught an exception");
    }
    
  });
}

- (void)uploadMdFile :(NSString *)fileName : (NSString *)text :(UIBackgroundTaskIdentifier) bgTask
{
  NSData* data = [text dataUsingEncoding:NSUTF8StringEncoding];
  NSString *string = [NSByteCountFormatter stringFromByteCount:data.length countStyle:NSByteCountFormatterCountStyleBinary];
  NSLog(@" size: %@", string);
  
  NSMutableURLRequest *request = [[AFHTTPRequestSerializer serializer] multipartFormRequestWithMethod:@"POST" URLString:_uploadLink parameters:nil constructingBodyWithBlock:^(id<AFMultipartFormData> formData) {
    [formData appendPartWithFormData:[_parentDir dataUsingEncoding:NSUTF8StringEncoding] name:@"parent_dir"];
//    [formData appendPartWithFormData:[@"1" dataUsingEncoding:NSUTF8StringEncoding] name:@"replace"];
    [formData appendPartWithFileData: data name:@"file" fileName:fileName mimeType:@"text/markdown"];
    
  } error:nil];
  [request setAllowsCellularAccess:NO];
  [request setValue:_credential forHTTPHeaderField:@"Authorization"];
  
  AFURLSessionManager *manager = [[AFURLSessionManager alloc] initWithSessionConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
  manager.responseSerializer = [AFJSONResponseSerializer serializerWithReadingOptions:NSJSONReadingAllowFragments];
  
  NSURLSessionUploadTask *uploadTask;
  uploadTask = [manager
                uploadTaskWithStreamedRequest:request
                progress: nil
                completionHandler:^(NSURLResponse * _Nonnull response, id  _Nullable responseObject, NSError * _Nullable error) {
                  NSLog(@"response: %@", response);
                  NSLog(@"error: %@", error);
                  NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *) response;
                  NSLog(@"response status code: %ld", (long)[httpResponse statusCode]);
                  if ((long)[httpResponse statusCode] == 200) {
                    [self showNotifcation];
                    
                    RCTAsyncLocalStorage *storage = [[RCTAsyncLocalStorage alloc] init];
                    [self getMdFiles: storage :^(NSDictionary* data,NSError* error){
                      if(data){
                        NSMutableArray *newArr = [[NSMutableArray alloc] init];
                        for (id item in data) {
                          NSString * name = [item valueForKeyPath: @"fileName"];
                          if (![name isEqualToString:fileName]) {
                            [newArr addObject:item];
                          }
                        }
                        
                        NSError *error;
                        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:newArr
                                                                           options:0 // Pass 0 if you don't care about the readability of the generated string
                                                                             error:&error];
                        
                        if (!jsonData) {
                          NSLog(@"Got an error: %@", error);
                        } else {
                          NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
                          NSLog(@"%@", jsonString);
                          
                          RCTResponseSenderBlock setMdcompletion = ^(NSArray *response) {
                            if ([newArr count] == 0) {
                              
                            } else {
                              [self uploadMdFile:[[newArr objectAtIndex:0] valueForKeyPath: @"fileName"] :[[newArr objectAtIndex:0] valueForKeyPath: @"text"] :bgTask];
                            }
                          };
                          
                          [self setMds:storage :jsonString :setMdcompletion];
                        }
                      }else{
                        //handle error
                        NSLog(@"JSON Parsing Error: %@",error.localizedDescription);
                      }
                    }];
                  }
                }];
  [uploadTask resume];
}

#pragma --------------------------------------------------------------------------------------------
#pragma mark ===== Storage =====
#pragma --------------------------------------------------------------------------------------------

- (void)getAccounts: (RCTAsyncLocalStorage *)storage
{
  NSLog(@"getAccounts");
  [self jsonFromLocalRNStrogeForKey: @"reduxPersist:accounts" completion:^(NSDictionary* data,NSError* error){
    if(data){
      _credential = [data valueForKeyPath: @"authenticateResult"];
      NSLog(@"authenticateResult : %@", _credential);
      [self getLibrary:storage];
    }else{
      //handle error
      NSLog(@"JSON Parsing Error: %@",error.localizedDescription);
    }
  }];
}

- (void)getLibrary: (RCTAsyncLocalStorage *)storage
{
  NSLog(@"getLibrary");
  [self jsonFromLocalRNStrogeForKey: @"reduxPersist:library" completion:^(NSDictionary* data,NSError* error){
    if(data){
      _repo = [data valueForKeyPath: @"destinationLibrary.id"];
      _parentDir = [data valueForKeyPath: @"parentDir"];
      NSLog(@"repo : %@", _repo);
      NSLog(@"parentDir : %@", _parentDir);
      [self getUploadLink: 0];
    }else{
      //handle error
      NSLog(@"JSON Parsing Error: %@",error.localizedDescription);
    }
  }];
}

- (void)jsonFromLocalRNStrogeForKey:(NSString *)key completion:(void (^)(NSDictionary * _Nullable, NSError * _Nullable))completion
{
  RCTResponseSenderBlock rnCompletion = ^(NSArray *response) {
    
    NSString *jsonAsString;
    
    if (response.count > 1) {
      NSArray *response1 = response[1];
      if (response1.count > 0) {
        NSArray *response2 = response1[0];
        if (response2.count > 1) {
          jsonAsString = response2[1];
        }
      }
    }
    
    NSData *jsonAsData = [jsonAsString dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error;
    NSDictionary *json = [NSJSONSerialization
                          JSONObjectWithData:jsonAsData options:NSJSONReadingMutableContainers error:&error];
    completion(json, error);
  };
  
  RCTAsyncLocalStorage *storage = [RCTAsyncLocalStorage new];
  
  dispatch_async(storage.methodQueue, ^{
    @try {
      [storage performSelector:@selector(multiGet:callback:) withObject:@[key] withObject:rnCompletion];
    }
    @catch (NSException *exception) {
      NSLog(@"Caught an exception %@", key);
    }
  });
}

- (void) showNotifcation
{
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  UNAuthorizationOptions options = UNAuthorizationOptionAlert + UNAuthorizationOptionSound;
  
  [center requestAuthorizationWithOptions:options
                        completionHandler:^(BOOL granted, NSError * _Nullable error) {
                          if (!granted) {
                            NSLog(@"Something went wrong");
                          }
                        }];

  [center getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings * _Nonnull settings) {
    if (settings.authorizationStatus != UNAuthorizationStatusAuthorized) {
      // Notifications not allowed
    }
  }];
  
  UNMutableNotificationContent *content = [UNMutableNotificationContent new];
  content.title = @"LabCam";
  content.body = @"File Uploaded";
  content.sound = [UNNotificationSound defaultSound];
  
  UNTimeIntervalNotificationTrigger *trigger = [UNTimeIntervalNotificationTrigger triggerWithTimeInterval:1
                                                                                                  repeats:NO];
  
  NSString *identifier = @"UYLLocalNotification";
  UNNotificationRequest *request = [UNNotificationRequest requestWithIdentifier:identifier
                                                                      content:content trigger:trigger];
  
  [center addNotificationRequest:request withCompletionHandler:^(NSError * _Nullable error) {
    if (error != nil) {
      NSLog(@"Something went wrong: %@",error);
    }
  }];
}
@end
