import { t } from '@hecom/basecore/util/i18';
import React from 'react';
import Toast from 'react-native-root-toast';
import ActionSheet from 'react-native-general-actionsheet';
import * as ImagePicker from '@hecom-rn/react-native-full-image-picker';
import { Typings, Delegate } from '../../standard';

export const name = 'IMSettingGroupAvatar';

export function getUi(props: Typings.Action.Setting.Params): Typings.Action.Setting.Result {
    const { key, imId, chatType } = props;
    const isGroup = chatType === Typings.Conversation.ChatType.Group;
    if (!isGroup) {
        return null;
    }
    const groupAvatar = Delegate.model.Group.getAvatar(imId);
    const avatar = !groupAvatar
        ? undefined
        : {
              uri: Delegate.func.fitUrlForAvatarSize(groupAvatar, 30),
          };
    const groupOwner = Delegate.model.Group.getOwner(imId);
    const isOwner = groupOwner === Delegate.user.getMine().userId;
    if (!isOwner) {
        return null;
    }
    return (
        <Delegate.component.SettingItem
            key={key}
            type={Typings.Component.SettingItemType.Image}
            title={t('i18n_im_9352fee677cc63fc')}
            data={avatar}
            onPressLine={isOwner ? () => _clickGroupAvatar(props) : undefined}
        />
    );
}

function _clickGroupAvatar(props: Typings.Action.Setting.Params) {
    const options = {
        maxSize: 1,
        canEdit: true,
        callback: (data: Array<{ uri: string }>) => _onImagePickerFinish(props, data),
    };
    const actions = [
        t('i18n_im_6e3a10ade7c74955'),
        t('i18n_im_2f2b556c7099806b'),
        t('i18n_im_2cd0f3be8738a86c'),
    ];

    ActionSheet.showActionSheetWithOptions(
        {
            options: actions,
            cancelButtonIndex: actions.length - 1,
        },
        (clickIndex) => {
            if (clickIndex >= actions.length - 1) {
                return;
            }
            if (clickIndex === 0) {
                ImagePicker.getCamera(options);
            } else if (clickIndex === 1) {
                ImagePicker.getAlbum(options);
            }
        }
    );
}

function _onImagePickerFinish(props: UiParams, data: Array<{ uri: string }>) {
    if (!data || data.length === 0) {
        return;
    }
    const { imId, onDataChange } = props;
    Delegate.func
        .uploadImages(data.map((i) => i.uri))
        .then(([url]) => Delegate.model.Group.changeAvatar(imId, url))
        .then(() => {
            onDataChange();
        })
        .catch(() => {
            Toast.show(t('i18n_im_1b9b4ea3cd87e868'));
        });
}
