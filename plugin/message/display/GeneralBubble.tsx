import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Typings } from '../../../standard';

export type Props = Typings.Action.Display.Params;

export default class extends React.PureComponent<Props> {
    componentDidMount() {
        this.props.enableBubble(true);
    }
    
    render() {
        return (
            <View style={styles.view}>
                <Text style={styles.text}>
                    {'当前版本暂不支持该消息'}
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    view: {
        backgroundColor: 'transparent',
        paddingHorizontal: 10,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        backgroundColor: 'transparent',
    },
});