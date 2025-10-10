import { StackActions } from '@react-navigation/native';
import Toast from 'react-native-root-toast';
import { Typings, Delegate } from '../../standard';
import getGeneralButton from './GeneralButton';
import { Alert } from 'react-native';

export const name = 'IMSettingLeaveGroup';

export function getUi(props: Typings.Action.Setting.Params): Typings.Action.Setting.Result {
    const {key, imId, chatType} = props;
    const isGroup = chatType === Typings.Conversation.ChatType.Group;
    if (!isGroup) {
        return null;
    }
    const groupOwner = Delegate.model.Group.getOwner(imId);
    const isOwner = groupOwner === Delegate.user.getMine().userId;
    const text = isOwner ? '解散群聊' : '退出群聊';
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
            Alert.alert('提示','是否解散群聊?', [
                {
                    text: '取消',
                    onPress: () => {},
                },
                {
                    text: '确定',
                    onPress: () => {
                        leaveDidTrue(props,text,isOwner);
                    },
                },
            ]);
        } else {
            Alert.alert('提示','删除并退出后，将不再接收此群聊信息！', [
                {
                    text: '取消',
                    onPress: () => {},
                },
                {
                    text: '确定',
                    onPress: () => {
                        leaveDidTrue(props,text,isOwner);
                    },
                },
            ]);
        }
    } catch (err) {
        Toast.show(text + '失败');
    }
}

async function leaveDidTrue(
    props: Typings.Action.Setting.Params,
    text: string,
    isOwner: boolean) {

    const {imId, navigation} = props;

    const action = StackActions.pop(2);
    navigation.dispatch(action);
    await new Promise<void>((resolve) => {
        setTimeout(() => {
        resolve()
         }, 50);
       });
    if (isOwner) {
        await Delegate.model.Group.destroyOne(imId);
    } else {
        await Delegate.model.Group.quitOne(imId);
     }
    Toast.show(text + '成功');
}