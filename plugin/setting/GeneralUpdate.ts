import Toast from 'react-native-root-toast';
import { Delegate, PageKeys, Typings } from '../../standard';

export async function onAddMembers(props: Typings.Action.Setting.Params,
                                   memberUserIds: string[]): Promise<void> {
    const { imId, chatType, onDataChange, navigation } = props;
    const isGroup = chatType === Typings.Conversation.ChatType.Group;
    if (isGroup) {
        try {
            await Delegate.model.Group.addMembers(imId, memberUserIds);
            onDataChange();
        } catch (err) {
            Toast.show('群主已禁止添加成员');
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
            Toast.show('创建群聊失败');
        }
    }
    return Delegate.model.Group.getMembers(imId);
}

export async function onRemoveMembers(props: Typings.Action.Setting.Params,
                                      memberUserIds: string[]): Promise<void> {
    const { imId, onDataChange } = props;
    try {
        await Delegate.model.Group.removeMembers(imId, memberUserIds);
        onDataChange();
    } catch (err) {
        Toast.show('删除群成员失败');
    }
    return Delegate.model.Group.getMembers(imId);
}
