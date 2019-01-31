//
//  UIView+ContraintBuilder.h
//
//  Created by Sam on 23/03/15.
//  Copyright (c) 2015 BBStudio. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface UIView (ContraintBuilder)
- (void)constraint:(NSLayoutAttribute)myAttr equals:(NSLayoutAttribute)prtAttr;
- (void)constraint:(NSLayoutAttribute)myAttr equals:(NSLayoutAttribute)prtAttr times:(CGFloat)multiplier;
- (void)constraint:(NSLayoutAttribute)myAttr equals:(NSLayoutAttribute)prtAttr plus:(CGFloat)offset;
- (void)constraint:(NSLayoutAttribute)myAttr equals:(NSLayoutAttribute)prtAttr times:(CGFloat)multiplier plus:(CGFloat)offset;
- (void)constraintHeight:(CGFloat)height;
- (void)constraintWidth:(CGFloat)width;
- (void)fillParent;
- (void)fillParentPaddingTop:(CGFloat)top right:(CGFloat)right left:(CGFloat)left bottom:(CGFloat)bottom;
- (void)fillWidth;
- (void)fillHeight;
@end
