import React from 'react';
import Toast from 'react-native-root-toast';
import { Typings, Delegate } from '../../standard';

export const name = 'IMSettingTop';

export function getUi(props: Typings.Action.Setting.Params): Typings.Action.Setting.Result {
    const {key, imId, chatType} = props;
    return (
        <TopCell
            key={key}
            imId={imId}
            chatType={chatType}
        />
    );
}

export interface Props {
    imId: string;
    chatType: Typings.Conversation.ChatType;
}

export interface State {
    top: boolean;
}

export class TopCell extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = this._state();
    }

    render() {
        return (
            <Delegate.component.SettingItem
                type={Typings.Component.SettingItemType.Switch}
                title={'置顶聊天'}
                data={this.state.top}
                onPressSwitch={this._clickConfig.bind(this)}
            />
        );
    }

    protected _state() {
        const {imId} = this.props;
        const {top} = Delegate.model.Conversation.getConfig(imId);
        return {top};
    }

    protected _clickConfig(top: boolean) {
        const {imId, chatType} = this.props;
        this.setState({top});
        Delegate.model.Conversation.updateConfig(imId, chatType, {top})
            .catch(() => {
                Toast.show('更新设置失败');
            })
            .finally(() => {
                this.setState(this._state());
            });
    }
}