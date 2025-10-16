import { t } from '@hecom/basecore/util/i18';
import React from 'react';
import { Keyboard, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import PropTypes from 'prop-types';
import NaviBar, { getSafeAreaInset } from '@hecom/react-native-pure-navigation-bar';
import { Delegate } from 'react-native-im/standard/index';
import Toast from 'react-native-root-toast';
import Navigation from '@hecom/navigation/src/index';
import { Message } from 'react-native-im/standard/typings/index';
import delegate from 'react-native-im/standard/delegate';

export default class extends React.PureComponent {
    private keyboardDidShowListener: any;
    private keyboardDidHideListener: any;
    private isDisable = true;

    static propTypes = {
        groupId: PropTypes.string.isRequired,
        groupAnnouncement: PropTypes.string.isRequired,
        canEdit: PropTypes.bool,
        onDataChange: PropTypes.func.isRequired,
    };

    state = {
        keyBoardHeight: 0,
    };

    componentWillMount() {
        if (Platform.OS === 'ios') {
            this.keyboardDidShowListener = Keyboard.addListener(
                'keyboardDidShow',
                this._keyboardDidShow.bind(this)
            );
            this.keyboardDidHideListener = Keyboard.addListener(
                'keyboardDidHide',
                this._keyboardDidHide.bind(this)
            );
        }
    }
    componentWillUnmount() {
        if (Platform.OS === 'ios') {
            this.keyboardDidShowListener.remove();
            this.keyboardDidHideListener.remove();
        }
    }
    protected _keyboardDidShow(e) {
        if (Platform.OS === 'ios') {
            this.setState({
                keyBoardHeight: e.endCoordinates.height,
            });
        }
    }
    protected _keyboardDidHide() {
        if (Platform.OS === 'ios') {
            this.setState({
                keyBoardHeight: 0,
            });
        }
    }

    render() {
        const { canEdit, groupAnnouncement } = this.props;
        const rights = {};
        if (canEdit) {
            rights.rightElement = t('i18n_im_a3030bf8f16dc63c');
            if (this.isDisable) {
                rights.rightElementDisable = true;
            } else {
                rights.onRight = this._onRight;
            }
        }
        const safeArea = getSafeAreaInset();
        const marginStyle = {
            marginBottom: Math.max(this.state.keyBoardHeight, 10) + safeArea.bottom,
        };
        return (
            <View style={styles.container}>
                <NaviBar
                    title={t('i18n_im_99728d0e0224c355')}
                    {...rights}
                    autoCloseKeyboard={true}
                />
                {canEdit ? (
                    <TextInput
                        style={[styles.input, marginStyle]}
                        defaultValue={groupAnnouncement}
                        maxLength={2000}
                        multiline={true}
                        placeholder={t('i18n_im_0a59be271a44ca8b')}
                        onChangeText={(text) => {
                            this.isDisable = false;
                            this.setState({ text });
                        }}
                        autoFocus={canEdit}
                    />
                ) : (
                    <ScrollView
                        style={[styles.content, { marginBottom: safeArea.bottom }]}
                        showsVerticalScrollIndicator={true}
                    >
                        <Text style={[styles.contentText]}>{groupAnnouncement}</Text>
                    </ScrollView>
                )}
            </View>
        );
    }

    protected _onRight = () => {
        const { groupId, onDataChange } = this.props;
        let announcement = this.state.text;
        if (!announcement) {
            announcement = '';
        }
        this.props.apiRefresh(true);
        Delegate.model.Group.changeAnnouncement(groupId, announcement)
            .then(() => {
                this._onSendMessageText();
                this.props.apiRefresh(false);
                onDataChange();
                Toast.show(t('i18n_im_e05ddf992cc50896'));
                Navigation.pop();
            })
            .catch(() => {
                this.props.apiRefresh(false);
                Toast.show(t('i18n_im_6309a3bb5ba4c714'));
            });
    };

    protected _onSendMessageText() {
        let msg = this.state.text;
        if (msg.length > 0) {
            msg = t('i18n_im_b6c9b231fbf6a5e4') + '\n' + msg;
            const message = {
                type: delegate.config.messageType.text,
                body: {
                    text: msg,
                    atMemberList: Message.AtAll,
                },
            };
            this.props.onSendMessage(message);
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    input: {
        flex: 1,
        fontSize: 14,
        marginTop: 10,
        marginHorizontal: 12,
        ...Platform.select({
            android: { textAlignVertical: 'top' },
        }),
    },
    content: {
        flex: 1,
    },
    contentText: {
        fontSize: 14,
        color: '#333333',
        marginHorizontal: 12,
        marginTop: 10,
    },
});
