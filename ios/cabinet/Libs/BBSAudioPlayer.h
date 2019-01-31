//
//  BBSAudioPlayer.h
//  cabinet
//
//  Created by Javier Quevedo on 16/09/15.
//  Copyright (c) 2015 BBStudio. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>

@interface BBSAudioPlayer : AVAudioPlayer

#define kDefaultFadeDuration 500.0 //ms

/**
 *  Fades out given a duration, and invokes the block upon completion
 *
 *  @discussion If the duration is -1, the default duration is used
 *  @param duration   <#duration description#>
 *  @param completion <#completion description#>
 */
-(void) fadeoutWithDuration:(float) duration completion:(void(^)(void))completion;


@end
