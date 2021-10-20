import delegate from 'react-native-im/standard/delegate';
import { guid } from 'react-native-im/standard/util/index';
import { Message } from 'react-native-im/standard/typings/index';
import { IMConstant } from 'react-native-im-easemob';
export function  sendFileMessage(imId: any, chatType: any, body: { length, size, name, path }, sendCallBackFunc?: Function) {
    const message = _generateMessage(imId, IMConstant.MessageType.file, body);
    _sendMessage(imId, chatType, message, delegate.model.Message.sendMessage, sendCallBackFunc);
}

function _generateMessage(imId, type, body, others = {}) {
    if (type == IMConstant.MessageType.image && body && body.mineType && body.mineType.startsWith('video')) {
        type = IMConstant.MessageType.video;
    }
    return {
        conversationId: imId,
        messageId: undefined,
        innerId: guid(),
        status: Message.Status.Pending,
        type: type,
        from: delegate.user.getMine().userId,
        to: imId,
        localTime: new Date().getTime(),
        timestamp: new Date().getTime(),
        data: body,
        ...others
    };
}

function _sendMessage(imId, chatType, message, sendFunc, sendCallBackFunc?) {
    sendFunc(imId, chatType, message)
        .then(() => {
            sendCallBackFunc && sendCallBackFunc();
        })
        .catch(() => {
            sendCallBackFunc && sendCallBackFunc();
        });
}