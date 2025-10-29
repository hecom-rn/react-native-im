import { t } from '@hecom/basecore/util/i18n';
import { Typings, Delegate } from '../../../standard';

export type Params = Typings.Action.Abstract.Params<Typings.Message.LocationBody>;

export type Result = Typings.Action.Abstract.Result;

export default function (params: Params): Result {
    const myUserId = Delegate.user.getMine().userId;
    const { message } = params;
    const isSend = message.from === myUserId;
    if (isSend) {
        return t('i18n_im_19f3c787e8e28c53');
    } else {
        const user = Delegate.user.getUser(message.from);
        return '[' + t('i18n_im_8ae8823ca6d19596', { MemberExpression1: user.name }) + ']';
    }
}
