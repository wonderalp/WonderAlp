//
//  BBSAudioManager.m
//  cabinet
//
//  Created by Javier Quevedo on 16/09/15.
//  Copyright (c) 2015 BBStudio. All rights reserved.
//

#import "BBSAudioManager.h"
#define kAudioManagerStatusPollingInterval 100

@interface BBSAudioManager(){
    
}
@property (nonatomic, strong) NSMutableDictionary *players;
@property (nonatomic, strong) NSMutableArray *playingPlayers; // Used to keep track of what players should be polled for the status
@end


@implementation BBSAudioManager


-(id) initInternal{
    if (self = [super init]){
        _players = @{}.mutableCopy;
        _playingPlayers = @[].mutableCopy;
    }
    return self;
}

+ (BBSAudioManager *)sharedInstance
{
    static BBSAudioManager *sharedInstance = nil;
    static dispatch_once_t onceToken = 0;

    dispatch_once(&onceToken, ^{
        sharedInstance = [[BBSAudioManager alloc] initInternal];
    });
    return sharedInstance;
}

-(BBSAudioPlayer *) loadAudioWithURL:(NSURL *)url forPlayerIdentifier:(NSString *)identifier{
    @synchronized(self){
        BBSAudioPlayer *aPlayer = self.players[identifier];
        if (aPlayer){
            [aPlayer stop];
            [self.players removeObjectForKey:identifier];
            [self.playingPlayers removeObject:aPlayer];
        }
        
        NSError *error = NULL;
        aPlayer = [[BBSAudioPlayer alloc] initWithContentsOfURL:url error:&error];
        [aPlayer setDelegate:self];
        if (error){
            NSLog(@"[BBSAudioManager] Error creating audio player: %@", error.localizedDescription);
            return nil;
        }
        self.players[identifier] = aPlayer;
        return aPlayer;        
    }
}

-(BBSAudioPlayer *) audioPlayerWithIdentifier:(NSString *) identifier{
    @synchronized(self){
        return self.players[identifier];
    }
}

/**
 *  Stops all players and removes the references so that they are released
 */
-(void) clear{
    @synchronized(self){
        for (NSString *identifier in self.players.allKeys){
            BBSAudioPlayer *aPlayer = self.players[identifier];
            [aPlayer stop];
        }
        self.players = @{}.mutableCopy;
    }
}

-(void) destroyPlayerWithIdentifier:(NSString *)identifier{
    BBSAudioPlayer *aPlayer = self.players[identifier];
    if (!aPlayer)
        return;
    [aPlayer stop];
    [self.playingPlayers removeObject:aPlayer];
    [self.players removeObjectForKey:identifier];
}


-(void) playWithPlayerIdentifier:(NSString *)identifier{
    @synchronized(self){
        BBSAudioPlayer *aPlayer = self.players[identifier];
        if (!aPlayer)
            return;
        [aPlayer play];
        [self.playingPlayers addObject:aPlayer];
        [self pollPlayersStatus];
        
    }
}

-(void) pausePlayerWithIdentifier:(NSString *)identifier{
    @synchronized(self){
        BBSAudioPlayer *aPlayer = self.players[identifier];
        if (!aPlayer)
            return;
        [aPlayer pause];
        [self.playingPlayers removeObject:aPlayer];
    }
}

-(void) stopWithPlayerIdentifier:(NSString *)identifier{
    @synchronized(self){
        BBSAudioPlayer *aPlayer = self.players[identifier];
        if (!aPlayer)
            return;
        [aPlayer stop];
        [self audioPlayerDidFinishPlaying:aPlayer successfully:YES];
    }
}

-(void) fadeOutWithPlayerIdentifier:(NSString *)identifier withDuration:(float)duration{
    @synchronized(self) {
        BBSAudioPlayer *aPlayer = self.players[identifier];
        if (!aPlayer)
            return;
        [aPlayer fadeoutWithDuration:duration completion:^{
            [self audioPlayerDidFinishPlaying:aPlayer successfully:YES];
        }];
    }
}


/**
 *  Polls the players for the status. For each of the playing players a status update notification is sent
 *  If there are not players playing, the status polling is stopped until a new player starts playing
 */
-(void) pollPlayersStatus{
    @synchronized(self){
        if (self.playingPlayers.count > 0){
            for (BBSAudioPlayer *player in self.playingPlayers){
                if (player.playing){
                    NSString  *identifier = [self.players allKeysForObject:player][0];
                    [[NSNotificationCenter defaultCenter] postNotificationName:kAudioManagerUpdateNotification object:self userInfo:
                     @{@"identifier": identifier, @"currentTime": @(player.currentTime), @"duration" : @(player.duration)}];
                }
            }
            dispatch_time_t time = dispatch_time(DISPATCH_TIME_NOW, kAudioManagerStatusPollingInterval * NSEC_PER_MSEC);
            dispatch_after(time, dispatch_get_main_queue(), ^{
                [self pollPlayersStatus];
            });
        }
    }
}

-(void) audioPlayerDidFinishPlaying:(AVAudioPlayer *)player successfully:(BOOL)flag{
    NSString  *identifier = [self.players allKeysForObject:player][0];
    [[NSNotificationCenter defaultCenter] postNotificationName:kAudioManagerStopNotification object:self userInfo:@{@"identifier": identifier}];
    [self.playingPlayers removeObject:player];
}

@end
