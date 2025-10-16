import { t } from '@hecom/basecore/util/i18';
import React from 'react';
import Toast from 'react-native-root-toast';
import { Typings, Delegate } from '../../standard';

export const name = 'IMSettingAllowInvite';

export function getUi(props: Typings.Action.Setting.Params): Typings.Action.Setting.Result {
    const { key, imId, chatType } = props;
    const isGroup = chatType === Typings.Conversation.ChatType.Group;
    if (!isGroup) {
        return null;
    }
    const groupOwner = Delegate.model.Group.getOwner(imId);
    const isOwner = groupOwner === Delegate.user.getMine().userId;
    if (!isOwner) {
        return null;
    }
    return <AllowInviteCell key={key} imId={imId} />;
}

export interface Props {
    imId: string;
}

export interface State {
    allowInvites: boolean;
}

export class AllowInviteCell extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = this._state();
    }

    render() {
        return (
            <Delegate.component.SettingItem
                type={Typings.Component.SettingItemType.Switch}
                title={t('i18n_im_9d2bfa502dca48bd')}
                data={this.state.allowInvites}
                onPressSwitch={this._clickConfig.bind(this)}
            />
        );
    }

    protected _state() {
        const { imId } = this.props;
        const allowInvites = Delegate.model.Group.getAllowInvites(imId);
        return { allowInvites };
    }

    protected _clickConfig(allowInvites: boolean) {
        const { imId } = this.props;
        this.setState({ allowInvites });
        Delegate.model.Group.changeAllowInvites(imId, allowInvites)
            .catch(() => {
                Toast.show(t('i18n_im_7cfdd71e7e3c1cf7'));
            })
            .finally(() => {
                this.setState(this._state());
            });
    }
}
