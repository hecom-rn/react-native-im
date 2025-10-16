import { t } from '@hecom/basecore/util/i18';
import React from 'react';
import Toast from 'react-native-root-toast';
import { Typings, Delegate } from '../../standard';
import { APNs } from 'react-native-im-easemob';

export const name = 'IMSettingAvoid';

export function getUi(props: Typings.Action.Setting.Params): Typings.Action.Setting.Result {
    const { key, imId, chatType } = props;
    return <AvoidCell key={key} imId={imId} chatType={chatType} />;
}

export interface Props {
    imId: string;
    chatType: Typings.Conversation.ChatType;
}

export interface State {
    avoid: boolean;
}

export class AvoidCell extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = this._state();
    }

    render() {
        return (
            <Delegate.component.SettingItem
                type={Typings.Component.SettingItemType.Switch}
                title={t('i18n_im_5c3604c325ee4b6e')}
                data={this.state.avoid}
                onPressSwitch={this._clickConfig.bind(this)}
            />
        );
    }

    protected _state() {
        const { imId } = this.props;
        const { avoid } = Delegate.model.Conversation.getConfig(imId);
        return { avoid };
    }

    protected _clickConfig(avoid: boolean) {
        const { imId, chatType } = this.props;
        this.setState({ avoid });
        Delegate.model.Conversation.updateConfig(imId, chatType, { avoid })
            .then(() => {
                APNs.setIgnoreGroupPush(imId, chatType, avoid);
            })
            .catch(() => {
                Toast.show(t('i18n_im_7cfdd71e7e3c1cf7'));
            })
            .finally(() => {
                this.setState(this._state());
            });
    }
}
