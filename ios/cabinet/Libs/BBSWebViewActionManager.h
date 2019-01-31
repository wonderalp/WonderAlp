//
//  BBSWebViewActionManager.h
//  cabinet
//
//  Created by Javier Quevedo on 17/09/15.
//  Copyright (c) 2015 BBStudio. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface BBSWebViewActionManager : NSObject <UIWebViewDelegate>
@property (nonatomic, strong) UIWebView *webView;

/**
 *  Constructor.
 *  Initializes the WebView action manager with a given webview
 *
 *  @param webView The UIWebView
 *
 *  @return The BBSWebViewActionManager
 */
-(id) initWithWebView:(UIWebView *)webView;

@end
