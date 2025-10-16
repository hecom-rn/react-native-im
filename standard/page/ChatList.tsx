import { t } from '@hecom/basecore/util/i18';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import Toast from 'react-native-root-toast';
import Listener from '@hecom/listener';
import * as PageKeys from '../pagekey';
import { Event } from '../typings';
import delegate from '../delegate';

export default class extends React.PureComponent {
    static navigationOptions = function () {
        return {
            title: t('i18n_im_9bdc537b54b560c9'),
        };
    };

    static propTypes = {};

    static defaultProps = {};

    constructor(props) {
        super(props);
        this.state = {
            dataSource: null,
        };
    }

    componentDidMount() {
        this._refresh();
        this.listenListUpdate = Listener.registerWithSubEvent(
            [Event.Base, Event.Conversation],
            this._refresh.bind(this)
        );
        this.listenUserLeave = Listener.registerWithSubEvent(
            [Event.Base, Event.GroupLeave],
            this._userLeave.bind(this)
        );
    }

    componentWillUnmount() {
        Listener.unregister([Event.Base, Event.Conversation], this.listenListUpdate);
        Listener.unregister([Event.Base, Event.GroupLeave], this.listenUserLeave);
    }

    render() {
        return (
            this.state.dataSource !== null && (
                <SwipeListView
                    useFlatList={true}
                    disableRightSwipe={true}
                    closeOnRowBeginSwipe={true}
                    style={styles.view}
                    data={this.state.dataSource}
                    renderItem={this._renderRow.bind(this)}
                    renderHiddenItem={this._renderHiddenItem.bind(this)}
                    ListHeaderComponent={this._renderFakeSearchBar()}
                    rightOpenValue={-281}
                    keyExtractor={(item) => item.imId}
                />
            )
        );
    }

    _renderRow({ item, index }) {
        const isBottom = index === this.state.dataSource.length - 1;
        const separatorLeft = !isBottom ? 75 : -1;
        return (
            <delegate.component.ConversationCell
                imId={item.imId}
                chatType={item.chatType}
                separatorLeft={separatorLeft}
                navigation={this.props.navigation}
            />
        );
    }

    _renderHiddenItem({ item }, rowMap) {
        const config = delegate.model.Conversation.getConfig(item.imId);
        const isRead = !(item.unreadMessagesCount > 0);
        const markTitle = isRead ? t('i18n_im_597f0b54d9ed28be') : t('i18n_im_71ef3f727b039321');
        return (
            <View style={styles.hidden}>
                {this._renderButton(
                    rowMap,
                    item,
                    config.top ? t('i18n_im_c92179b74af61689') : t('i18n_im_173f88d28ebfb1e6'),
                    {
                        backgroundColor: '#d9d8de',
                        width: 69,
                    },
                    this._clickTop.bind(this, item, config)
                )}
                {this._renderButton(
                    rowMap,
                    item,
                    markTitle,
                    {
                        backgroundColor: '#c7cccc',
                        width: 106,
                    },
                    this._clickMarkReadStatus.bind(this, item, !isRead)
                )}
                {this._renderButton(
                    rowMap,
                    item,
                    t('i18n_im_2f9daa828907b93f'),
                    {
                        backgroundColor: '#fc3b39',
                        width: 106,
                    },
                    this._clickDelete.bind(this, item)
                )}
            </View>
        );
    }

    _renderButton(rowMap, item, text, style, onPress) {
        return (
            <TouchableOpacity
                onPress={function () {
                    rowMap[item.imId].closeRow();
                    onPress && onPress();
                }}
                style={[styles.btn, style]}
            >
                <Text style={styles.btnText}>{text}</Text>
            </TouchableOpacity>
        );
    }

    _renderFakeSearchBar() {
        return (
            <delegate.component.FakeSearchBar
                onFocus={this._clickSearch.bind(this)}
                placeholder={t('i18n_im_44ce7ae909bbb28b')}
            />
        );
    }

    _refresh() {
        const dataSource = delegate.model.Conversation.get();
        this.setState({ dataSource });
    }

    _userLeave(data) {
        const { reason } = data;
        if (reason == 0) {
            this._refresh.bind(this);
        }
    }

    _clickTop(item, config) {
        const top = !config.top;
        delegate.model.Conversation.updateConfig(item.imId, item.chatType, { top }).catch(
            function () {
                Toast.show(t('i18n_im_7110e44959a56e66'));
            }
        );
    }

    _clickMarkReadStatus(item, status) {
        delegate.model.Conversation.markReadStatus(item.imId, item.chatType, status);
    }

    _clickDelete(item) {
        delegate.model.Conversation.deleteOne(item.imId);
    }

    _clickSearch() {
        this.props.navigation.navigate(PageKeys.Search, {});
    }
}

const styles = StyleSheet.create({
    view: {
        flex: 1,
    },
    hidden: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    btn: {
        justifyContent: 'center',
        alignSelf: 'stretch',
        alignItems: 'center',
        height: 64,
    },
    btnText: {
        color: 'white',
        fontSize: 17,
    },
});
