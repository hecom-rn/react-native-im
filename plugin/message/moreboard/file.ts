import { t } from '@hecom/basecore/util/i18';
import { Typings } from '../../../standard';

export type Result = Typings.Action.MoreBoard.GeneralResult<Typings.Message.FileBody>;

export type Params = Typings.Action.MoreBoard.PressParams<Typings.Message.FileBody>;

const obj: Result = {
    get text() {
        return t('i18n_im_39932f24fe11a6ba');
    },
    icon: require('./image/more_file.png'),
    onPress: (_: Params) => {
        // TODO 更多面板文件点击事件
    },
};

export default obj;
