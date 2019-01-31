//
//  BBSWebViewActionManager.m
//  cabinet
//
//  Created by Javier Quevedo on 17/09/15.
//  Copyright (c) 2015 BBStudio. All rights reserved.
//

#import "BBSWebViewActionManager.h"
#import "BBSAudioManager.h"

#define kPlayAction  @"play"
#define kLoadAction @"load"
#define kDestroyAction @"destroy"
#define kLoadAndPlayAction @"loadAndPlay"
#define kPauseAction @"pause"
#define kFadeOutAction @"fadeOut"
#define kWebLocalFolder @"www"

@implementation BBSWebViewActionManager

-(id) initWithWebView:(UIWebView *)webView{
    if (self = [super init]){
        [webView setDelegate:self];
        _webView = webView;
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(audioManagerDidStopPlayingAudio:) name:kAudioManagerStopNotification object:[BBSAudioManager sharedInstance]];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(audioManagerDidUpdateAudio:) name:kAudioManagerUpdateNotification object:[BBSAudioManager sharedInstance]];
    }
    return self;
}
-(void) dealloc{
    
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

#pragma mark - Notifications
-(void) audioManagerDidStopPlayingAudio:(NSNotification *)notification{
    NSString *identifier =  [notification userInfo][@"identifier"];
    [self sendCommandToWebView:[NSString stringWithFormat:@"window.triggerAudioEvent(%@, 'status', false);", identifier]];
}

-(void) audioManagerDidUpdateAudio:(NSNotification *)notification{
    NSDictionary *userInfo = [notification userInfo];
    NSNumber *duration = userInfo[@"duration"];
    NSNumber *currentTime = userInfo[@"currentTime"];
    NSNumber *identifier = userInfo[@"identifier"];
   // NSLog(@"identifier %@ currentTime %@ duration %@", identifier, currentTime, duration);
   [self sendCommandToWebView:[NSString stringWithFormat:@"window.triggerAudioEvent(%@, 'progress', %@, %@);", identifier, currentTime, duration]];
}

#pragma mark - Delegate Methods

-(BOOL) webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType{
    if ([[[request URL] scheme] isEqualToString:@"action"]) {
        [self triggerAction:request.URL];
        return NO;
    }
    return YES;
}

-(void) triggerAction:(NSURL *)action{
     //NSLog(@"%@ %@ %@", [action host], [action port], [action path]);
    
    if ([action.host isEqual:kPlayAction]){
        [self playAudio:[[action port] stringValue]];
        return;
    }
    
    if ([action.host isEqual:kLoadAction]){
        [self loadAudio:[action path] forPlayerIdentifier:[[action port] stringValue]];
        return;
    }
    
    if ([action.host isEqual:kLoadAndPlayAction]){
        [self loadAudio:[action path] forPlayerIdentifier:[[action port] stringValue]];
        [self playAudio:[[action port] stringValue]];
        return;
    }
    
    if ([[action host] isEqual:kFadeOutAction]){
        NSString *durationString = [[action path] stringByReplacingOccurrencesOfString:@"/" withString:@""];
        [self fadeOutAudio:[[action port] stringValue] withDuration:[durationString floatValue]];
        return;
    }
    
    if ([[action host] isEqual:kDestroyAction]){
        [self destroyAudioPlayerWithIdentifier:[[action port] stringValue]];
    }
    
    if ([[action host] isEqual:kPauseAction]){
        [self pauseAudio:[[action port] stringValue]];
    }
    
}

#pragma mark - Internal Methods

-(void) loadAudio:(NSString *)path forPlayerIdentifier:(NSString *)identifier{
    NSString *bundlePath = [[NSBundle mainBundle] bundlePath];
    NSString *audioPath = [bundlePath stringByAppendingPathComponent:kWebLocalFolder];
    audioPath = [audioPath stringByAppendingPathComponent:path];
    NSURL *audioURL = [[NSURL alloc] initFileURLWithPath:audioPath];
    [[BBSAudioManager sharedInstance] loadAudioWithURL:audioURL forPlayerIdentifier:identifier];
}

-(void) pauseAudio:(NSString *)identifier{
    [[BBSAudioManager sharedInstance] pausePlayerWithIdentifier:identifier];
    [self sendCommandToWebView:[NSString stringWithFormat:@"window.triggerAudioEvent(%@, 'status', false);", identifier]];

}

-(void) playAudio:(NSString *)identifier{
    [[BBSAudioManager sharedInstance] playWithPlayerIdentifier:identifier];
    [self sendCommandToWebView:[NSString stringWithFormat:@"window.triggerAudioEvent(%@, 'status', true);", identifier]];
}

-(void) fadeOutAudio:(NSString *)identifier withDuration:(float)duration{
    [[BBSAudioManager sharedInstance] fadeOutWithPlayerIdentifier:identifier withDuration:duration];

}
         
-(void) destroyAudioPlayerWithIdentifier:(NSString *)identifier{
    [[BBSAudioManager sharedInstance] destroyPlayerWithIdentifier:identifier];
}

-(void) sendCommandToWebView:(NSString *)command{
   // NSLog(@"Command %@", command);
    [self.webView stringByEvaluatingJavaScriptFromString:command];
}

@end
