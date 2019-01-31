//
//  BBSAudioPlayer.m
//  cabinet
//
//  Created by Javier Quevedo on 16/09/15.
//  Copyright (c) 2015 BBStudio. All rights reserved.
//

#import "BBSAudioPlayer.h"

//typedef void (^void)(void);
#define kFadeInterval 50.0

@interface BBSAudioPlayer(){
    float _fadeDuration;
}

@property(copy) void (^fadeCompletion)(void);
@end

@implementation BBSAudioPlayer


-(void) fadeoutWithDuration:(float) duration completion:(void(^)(void))completion{
    self.fadeCompletion = completion;
    _fadeDuration = duration == -1.0 ? kDefaultFadeDuration : duration;
    [self fadeOutInternal];
}

-(void) fadeOutInternal{
    if (self.volume > kFadeInterval / _fadeDuration){
        self.volume -= kFadeInterval/_fadeDuration;
        dispatch_time_t time = dispatch_time(DISPATCH_TIME_NOW, kFadeInterval * NSEC_PER_MSEC);
        dispatch_after(time, dispatch_get_main_queue(), ^{
            [self fadeOutInternal];
        });
    }else{
        [self stop];
        self.volume = 1.0;
        if (self.fadeCompletion){
            self.fadeCompletion();
        }
    }
}

@end
