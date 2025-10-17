import { t } from '@hecom/basecore/util/i18n';
import { Message } from 'react-native-im/standard/typings';
import delegate from '../../standard/delegate';
import Navigation from '@hecom/navigation';
import { Delegate } from '../../standard';
import { showPhotoBrowserPage } from 'react-native-photo-browse';
import Model from '../../../../core/model';
import Constant from '../../../../core/constant';
import { FilePreviewPageKey } from '../../../../standard/accessory/page/FilePreviewPage';
import { VideoPlayPageKey } from '../../../../standard/accessory/page/VideoPlayPage';

const MessageType = {
    text: 1, // 文本消息
    image: 2, // 图片消息
    video: 3, // 视频消息
    location: 4, // 位置消息
    voice: 5, // 语音消息
    file: 6, // 文件消息
    cmd: 7, // CMD控制消息
    material: 8, //资料(对象)
};

export const msgDescResolver = new Map([
    [MessageType.text, _textMsgDescHandle],
    [MessageType.image, _imgMsgDescHandle],
    [MessageType.video, _videoMsgDescHandle],
    [MessageType.location, _locationMsgDescHandle],
    [MessageType.file, _fileMsgDescHandle],
    [MessageType.material, _materialMsgDescHandle],
]);

export const msgClickHandleResolver = new Map([
    [MessageType.text, _textMsgClickHandle],
    [MessageType.image, _imgMsgClickHandle],
    [MessageType.video, _videoMsgClickHandle],
    [MessageType.location, _locationClickHandle],
    [MessageType.file, _fileMsgClickHandle],
    [MessageType.material, _materialMsgClickHandle],
]);

function _textMsgDescHandle(msg: Message.General): string {
    return (
        delegate.user.getUser((msg as Message.General).from).name +
        ':' +
        (msg as Message.General).data.text
    );
}
function _imgMsgDescHandle(msg: Message.General): string {
    return (
        delegate.user.getUser((msg as Message.General).from).name + t('i18n_im_b9c65332a57fb427')
    );
}
function _videoMsgDescHandle(msg: Message.General): string {
    return (
        delegate.user.getUser((msg as Message.General).from).name + t('i18n_im_77430a0d2bed04f2')
    );
}
function _locationMsgDescHandle(msg: Message.General): string {
    return (
        delegate.user.getUser((msg as Message.General).from).name + t('i18n_im_2d6fd2ad327211a5')
    );
}
function _fileMsgDescHandle(msg: Message.General): string {
    return (
        delegate.user.getUser((msg as Message.General).from).name + t('i18n_im_f00e44feec93335e')
    );
}
function _materialMsgDescHandle(msg: Message.General): string {
    return (
        delegate.user.getUser((msg as Message.General).from).name + t('i18n_im_c5f393e5f1ebdae8')
    );
}

function _textMsgClickHandle(msg: Message.General) {}
function _imgMsgClickHandle(msg: Message.General) {
    let img = (msg as Message.Image).data;
    showPhotoBrowserPage({
        currentIndex: 0,
        images: [img.localPath ? img.localPath : img.remotePath],
        canSave: true,
        renderIndicator: () => null,
    });
}
function _videoMsgClickHandle(msg: Message.General) {
    let video = (msg as Message.Video).data;
    Navigation.push(VideoPlayPageKey, {
        uri: video.remotePath ? video.remotePath : video.localPath,
    });
}
function _locationClickHandle(msg: Message.General) {
    let loc = (msg as Message.Location).data;
    Delegate.func.pushToLocationViewPage(loc);
}
function _fileMsgClickHandle(msg: Message.General) {
    let file = (msg as Message.File).data;
    Navigation.push(FilePreviewPageKey, {
        url: file.remotePath,
        name: file.name,
        size: file.size,
        inComponent: false,
    });
}
function _materialMsgClickHandle(msg: Message.General) {
    let obj = msg.data.object;
    Model.event.trigger(Constant.event.JumpToDetail, {
        metaid: obj.metaName,
        itemData: obj,
    });
}
