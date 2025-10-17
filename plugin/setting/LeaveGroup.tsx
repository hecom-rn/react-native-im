import { t } from '@hecom/basecore/util/i18n';
import { StackActions } from '@react-navigation/native';
import Toast from 'react-native-root-toast';
import { Typings, Delegate } from '../../standard';
import getGeneralButton from './GeneralButton';
import { Alert } from 'react-native';

export const name = 'IMSettingLeaveGroup';

export function getUi(props: Typings.Action.Setting.Params): Typings.Action.Setting.Result {
    const { key, imId, chatType } = props;
    const isGroup = chatType === Typings.Conversation.ChatType.Group;
    if (!isGroup) {
        return null;
    }
    const groupOwner = Delegate.model.Group.getOwner(imId);
    const isOwner = groupOwner === Delegate.user.getMine().userId;
    const text = isOwner ? t('i18n_im_cb2756b09c5ab768') : t('i18n_im_6742dce649e2faff');
    return getGeneralButton(key, text, () => _clickLeave(props, text, isOwner));
}

async function _clickLeave(
    props: Typings.Action.Setting.Params,
    text: string,
    isOwner: boolean
): Promise<void> {
    try {
        // dismissGroup, need confirm again
        if (isOwner) {
            Alert.alert(t('i18n_im_f56c6c82203b33f6'), t('i18n_im_70638242f4a126e1'), [
                {
                    text: t('i18n_im_2cd0f3be8738a86c'),
                    onPress: () => {},
                },
                {
                    text: t('i18n_im_fac2a67ad87807c4'),
                    onPress: () => {
                        leaveDidTrue(props, text, isOwner);
                    },
                },
            ]);
        } else {
            Alert.alert(t('i18n_im_f56c6c82203b33f6'), t('i18n_im_f5b195490e60ac89'), [
                {
                    text: t('i18n_im_2cd0f3be8738a86c'),
                    onPress: () => {},
                },
                {
                    text: t('i18n_im_fac2a67ad87807c4'),
                    onPress: () => {
                        leaveDidTrue(props, text, isOwner);
                    },
                },
            ]);
        }
    } catch (err) {
        Toast.show(text + t('i18n_im_28384d7afd2e4fa6'));
    }
}

async function leaveDidTrue(props: Typings.Action.Setting.Params, text: string, isOwner: boolean) {
    const { imId, navigation } = props;

    const action = StackActions.pop(2);
    navigation.dispatch(action);
    await new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 50);
    });
    if (isOwner) {
        await Delegate.model.Group.destroyOne(imId);
    } else {
        await Delegate.model.Group.quitOne(imId);
    }
    Toast.show(text + t('i18n_im_053461ce86d26572'));
}
