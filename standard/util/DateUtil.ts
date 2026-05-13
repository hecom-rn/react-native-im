import { TimeUtils } from '@hecom/aDate';
import { General } from "standard/typings/Message";

export function showDateTime(
    timestamp: number,
    showTime: boolean
) {
    if (isNaN(timestamp)) {
        return '';
    }
    const date = TimeUtils.create(timestamp);
    return showTime ? date.format('YYYY-MM-DD HH:mm') : date.format('YYYY-MM-DD');
}

export function needShowTime(forward: General, current: General) {
    return !(forward &&
        current.timestamp - forward.timestamp < 3 * 60 * 1000 &&
        Math.floor(TimeUtils.create(forward.timestamp).getMinute() / 3) === Math.floor(TimeUtils.create(current.timestamp).getMinute() / 3))
}
