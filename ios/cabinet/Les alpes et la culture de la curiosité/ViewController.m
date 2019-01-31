//
//  ViewController.m
//  Les alpes et la culture de la curiosité
//
//  Created by Sam on 07/04/15.
//  Copyright (c) 2015 BBStudio. All rights reserved.
//

#import "ViewController.h"
#import "UIView+ConstraintBuilder.h"
#import "BBSWebViewActionManager.h"

@interface ViewController ()
@property (nonatomic, strong) BBSWebViewActionManager *actionManager;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    [UIView setAnimationsEnabled:NO];
    
    UIWebView *webView = [[UIWebView alloc] initWithFrame:self.view.frame];
    [self.view addSubview:webView];
    [webView fillParent];
    webView.scrollView.bounces = NO;
    
    self.actionManager = [[BBSWebViewActionManager alloc] initWithWebView:webView];
    
    NSURL *url = [[NSBundle mainBundle] URLForResource:@"index" withExtension:@"html" subdirectory:@"www"];
    [webView loadRequest:[NSURLRequest requestWithURL:url]];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
}

- (BOOL)prefersStatusBarHidden {
    return YES;
}

- (NSUInteger)supportedInterfaceOrientations {
    return UIInterfaceOrientationMaskLandscape;
}
//
//- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
//    if ([[[request URL] scheme] isEqualToString:@"action"]) {
//        NSLog(@"%@ %@ %@", [[request URL] host], [[request URL] port], [[request URL] path]);
//        return NO;
//    }
//
//    return YES;
//}

@end    
