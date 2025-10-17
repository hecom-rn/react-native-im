import { t } from '@hecom/basecore/util/i18n';
import Toast from 'react-native-root-toast';
import { Delegate, PageKeys, Typings } from '../../standard';

export async function onAddMembers(
    props: Typings.Action.Setting.Params,
    memberUserIds: string[]
): Promise<void> {
    const { imId, chatType, onDataChange, navigation } = props;
    const isGroup = chatType === Typings.Conversation.ChatType.Group;
    if (isGroup) {
        try {
            await Delegate.model.Group.addMembers(imId, memberUserIds);
            onDataChange();
        } catch (err) {
            Toast.show(t('i18n_im_a1143a6d33b79d62'));
        }
    } else {
        const newMembers = [imId, ...memberUserIds];
        try {
            const result = await Delegate.model.Conversation.createOne(newMembers);
            navigation.navigate(PageKeys.ChatDetail, {
                imId: result.imId,
                chatType: result.chatType,
            });
        } catch (err) {
            Toast.show(t('i18n_im_e76fafa24e583a23'));
        }
    }
    return Delegate.model.Group.getMembers(imId);
}

export async function onRemoveMembers(
    props: Typings.Action.Setting.Params,
    memberUserIds: string[]
): Promise<void> {
    const { imId, onDataChange } = props;
    try {
        await Delegate.model.Group.removeMembers(imId, memberUserIds);
        onDataChange();
    } catch (err) {
        Toast.show(t('i18n_im_662871c77511fdf0'));
    }
    return Delegate.model.Group.getMembers(imId);
}
