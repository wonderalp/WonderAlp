//
//  UIView+ContraintBuilder.m
//
//  Created by Sam on 23/03/15.
//  Copyright (c) 2015 BBStudio. All rights reserved.
//

#import "UIView+ConstraintBuilder.h"

@implementation UIView (ContraintBuilder)

// Equals constraints

- (void)constraint:(NSLayoutAttribute)myAttr equals:(NSLayoutAttribute)prtAttr {
    [self constraint:myAttr equals:prtAttr times:1.0 plus:0];
}

- (void)constraint:(NSLayoutAttribute)myAttr equals:(NSLayoutAttribute)prtAttr times:(CGFloat)multiplier  {
    [self constraint:myAttr equals:prtAttr times:multiplier plus:0];
}

- (void)constraint:(NSLayoutAttribute)myAttr equals:(NSLayoutAttribute)prtAttr plus:(CGFloat)offset {
    [self constraint:myAttr equals:prtAttr times:1.0 plus:offset];
}

- (void)constraint:(NSLayoutAttribute)myAttr equals:(NSLayoutAttribute)prtAttr times:(CGFloat)multiplier plus:(CGFloat)offset {
    self.translatesAutoresizingMaskIntoConstraints = NO;
    [self.superview addConstraint:
     [NSLayoutConstraint constraintWithItem:self
                                  attribute:myAttr
                                  relatedBy:NSLayoutRelationEqual
                                     toItem:self.superview
                                  attribute:prtAttr
                                 multiplier:multiplier
                                   constant:offset]];
}

// Dimension shortcuts

- (void)constraintHeight:(CGFloat)height {
    [self constraint:NSLayoutAttributeHeight equals:NSLayoutAttributeHeight times:0.0 plus:height];
}

- (void)constraintWidth:(CGFloat)width {
    [self constraint:NSLayoutAttributeWidth equals:NSLayoutAttributeWidth times:0.0 plus:width];
}

// Filling

- (void)fillWidth {
    [self constraint:NSLayoutAttributeLeft equals:NSLayoutAttributeLeft];
    [self constraint:NSLayoutAttributeWidth equals:NSLayoutAttributeWidth];
}

- (void)fillHeight {
    [self constraint:NSLayoutAttributeTop equals:NSLayoutAttributeTop];
    [self constraint:NSLayoutAttributeBottom equals:NSLayoutAttributeBottom];
}

- (void)fillParent {
    [self constraint:NSLayoutAttributeTop equals:NSLayoutAttributeTop];
    [self constraint:NSLayoutAttributeLeft equals:NSLayoutAttributeLeft];
    [self constraint:NSLayoutAttributeWidth equals:NSLayoutAttributeWidth];
    [self constraint:NSLayoutAttributeHeight equals:NSLayoutAttributeHeight];
}

- (void)fillParentPaddingTop:(CGFloat)top right:(CGFloat)right left:(CGFloat)left bottom:(CGFloat)bottom {
    [self constraint:NSLayoutAttributeTop equals:NSLayoutAttributeTop plus:top];
    [self constraint:NSLayoutAttributeLeft equals:NSLayoutAttributeLeft plus:left];
    [self constraint:NSLayoutAttributeWidth equals:NSLayoutAttributeWidth plus:-left-right];
    [self constraint:NSLayoutAttributeHeight equals:NSLayoutAttributeHeight plus:-top-bottom];
}

@end
