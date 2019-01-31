//
//  BBSAudioManager.h
//  cabinet
//
//  Created by Javier Quevedo on 16/09/15.
//  Copyright (c) 2015 BBStudio. All rights reserved.
//


/**
 *  Singleton Audio Manager class that can be use to dispense Audio Players
 */

#import <Foundation/Foundation.h>
#import "BBSAudioPlayer.h"

#define kAudioManagerStopNotification @"AudioManagerStop"
#define kAudioManagerPlayNotification @"AudioManagerPlay"
#define kAudioManagerUpdateNotification @"AudioManagerUpdate"

@interface BBSAudioManager : NSObject <AVAudioPlayerDelegate>

/**
 *  Disables the conventional init method
 */
- (instancetype)init NS_UNAVAILABLE;

/**
 *  Returns the shared instance
 *
 *  @return BBSAudioManager - Shared instance
 */
+ (BBSAudioManager *)sharedInstance;


/**
 *  Creates an Audio Player with a given Audio File.
 *
 *  @param url        The URL where the audio is located
 *  @param identifier The Identifier of the Player
 *
 *  @return BBSAudioPlayer - The audio player, nil if the file did not exist
 */
-(BBSAudioPlayer *) loadAudioWithURL:(NSURL *)url forPlayerIdentifier:(NSString *)identifier;


/**
 *  Dispenses an Audio Player given an identifier. An Audio Player may only be
 *  retrieved if it has been previosly loaded
 *
 *  @param identifier The identifier of the Audio Player
 *
 *  @return BBSAudioPlayer - The Audio Player
 */
-(BBSAudioPlayer *) audioPlayerWithIdentifier:(NSString *) identifier;

/**
 *  Stops and removes all audio players
 */
-(void) clear;


/**
 *  Destroys an audio player given its identifier
 *
 *  @param identifier The Audio Player Identifier
 */
-(void) destroyPlayerWithIdentifier:(NSString *)identifier;

/**
 *  Triggers an audio player to play, given its identifier
 *
 *  @param identifier The players identifier
 */
-(void) playWithPlayerIdentifier:(NSString *)identifier;


/**
 *  Pauses an Audio Player given its identifier
 *
 *  @param identifier The Audio Player Identifier
 */
-(void) pausePlayerWithIdentifier:(NSString *)identifier;

/**
 *  Triggers an audio player to stop, given its identifier
 *
 *  @param identifier The players identifier
 */
-(void) stopWithPlayerIdentifier:(NSString *)identifier;

/**
 *  Triggers the fadeout of an audio player given its identifier
 *
 *  @param identifier The players identifier
 */
-(void) fadeOutWithPlayerIdentifier:(NSString *)identifier withDuration:(float)duration;

@end
