import {General} from "standard/typings/Message";
import { TimeUtils } from '@hecom/aDate';

export function showDateTime(
    timestamp: number,
    showTime: boolean
) {
    if (isNaN(timestamp)) {
        return '';
    }
    const date = TimeUtils.create(timestamp);

    // 获取各个时间部分
    const year = date.getYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是0-11
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHour()).padStart(2, '0');
    const minutes = String(date.getMinute()).padStart(2, '0');

    return showTime ? `${year}-${month}-${day} ${hours}:${minutes}` : `${year}-${month}-${day}`;
}

export function needShowTime(forward: General, current: General) {
    return !(forward &&
        current.timestamp - forward.timestamp < 3 * 60 * 1000 &&
        Math.floor(TimeUtils.create(forward.timestamp).getMinute() / 3) === Math.floor(TimeUtils.create(current.timestamp).getMinute() / 3))
}
