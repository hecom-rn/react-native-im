import { t } from '@hecom/basecore/util/i18n';
import { Typings } from '../../../standard';

export type Params = Typings.Action.Abstract.Params<Typings.Message.VideoBody>;

export type Result = Typings.Action.Abstract.Result;

export default function (_: Params): Result {
    return t('i18n_im_da5d0399eba80b23');
}
