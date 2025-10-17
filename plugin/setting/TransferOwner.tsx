import { t } from '@hecom/basecore/util/i18n';
import { Alert } from 'react-native';
import Toast from 'react-native-root-toast';
import { Typings, Delegate, PageKeys } from '../../standard';
import getGeneralButton from './GeneralButton';

export const name = 'IMSettingTransferOwner';

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
    return getGeneralButton(key, t('i18n_im_01ba77ab84b2adbb'), () => _clickTransferOwner(props));
}

function _clickTransferOwner(props: Typings.Action.Setting.Params) {
    const { imId, navigation } = props;
    const groupMembers = Delegate.model.Group.getMembers(imId);
    const myUserId = Delegate.user.getMine().userId;
    const dataSource = groupMembers
        .filter((userId) => userId !== myUserId)
        .map((userId) => Delegate.user.getUser(userId));
    navigation.navigate(PageKeys.ChooseUser, {
        title: t('i18n_im_9e910da621148e4c'),
        multiple: false,
        dataSource: dataSource,
        onSelectData: (data: string[]) => _onTransferOwnerAlert(props, data),
        selectedIds: [],
    });
}

function _onTransferOwnerAlert(props: Typings.Action.Setting.Params, data: string[]) {
    const newOwner = Delegate.user.getUser(data[0]);
    Alert.alert(
        t('i18n_im_881bc916a59ad75f'),
        newOwner.name,
        [
            { text: t('i18n_im_2cd0f3be8738a86c') },
            {
                text: t('i18n_im_fac2a67ad87807c4'),
                onPress: () => _onTransferOwner(props, newOwner),
            },
        ],
        { cancelable: true }
    );
}

async function _onTransferOwner(
    props: Typings.Action.Setting.Params,
    newOwner: Typings.Contact.User
): Promise<void> {
    const { imId, onDataChange } = props;
    try {
        await Delegate.model.Group.changeOwner(imId, newOwner.userId);
        Toast.show(t('i18n_im_5e6d872cabdc583f'));
        onDataChange();
    } catch (err) {
        Toast.show(t('i18n_im_c5324c9ffe6b54b6'));
    }
}
