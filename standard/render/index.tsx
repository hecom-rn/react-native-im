import React from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import Badge from '@hecom/badge';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

function renderBadge(avoid: boolean, count: number) {
    const {width} = Dimensions.get('window');
    return (
        <SafeAreaInsetsContext.Consumer>
            {(insets) => {
                const inset = insets || { left: 0, right: 0, top: 0, bottom: 0 };
                const style = avoid ? {
                    top: 5,
                    right: width - 70 - inset.left + 5,
                } : {
                    top: 0,
                    right: width - 70 - inset.left,
                };
                return (
                    <Badge
                        count={avoid ? null : count}
                        maxCount={99}
                        radius={avoid ? 3 : 8}
                        outSpace={2}
                        style={[styles.badge, style]}
                    />
                );
            }}
        </SafeAreaInsetsContext.Consumer>
    );
}

const styles = StyleSheet.create({
    badge: {position: 'absolute', zIndex: 1}
});

export {
    renderBadge
}
