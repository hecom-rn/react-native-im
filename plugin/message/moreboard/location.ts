import { t } from '@hecom/basecore/util/i18n';
import { Typings, Delegate } from '../../../standard';

export type Result = Typings.Action.MoreBoard.GeneralResult<Typings.Message.LocationBody>;

export type Params = Typings.Action.MoreBoard.PressParams<Typings.Message.LocationBody>;

const obj: Result = {
    get text() {
        return t('i18n_im_1fb4d574da92f1c1');
    },
    icon: require('./image/more_location.png'),
    onPress: (params: Params) => {
        Delegate.func.pushToLocationChoosePage({
            onChange: params.onDataChange,
        });
    },
};

export default obj;
