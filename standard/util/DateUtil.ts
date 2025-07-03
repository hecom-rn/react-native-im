import {General} from "standard/typings/Message";

function getDayOfWeek(date) {
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return days[date.getDay()];
}

export function showDateTime(
    timestamp: number,
    showTime: boolean
) {
    if (isNaN(timestamp)) {
        return '';
    }
    const date = new Date(timestamp);

    // 获取各个时间部分
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是0-11
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return showTime ? `${year}-${month}-${day} ${hours}:${minutes}` : `${year}-${month}-${day}`;
}

export function needShowTime(forward: General, current: General) {
    return !(forward &&
        current.timestamp - forward.timestamp < 3 * 60 * 1000 &&
        Math.floor(new Date(forward.timestamp).getMinutes() / 3) === Math.floor(new Date(current.timestamp).getMinutes() / 3))
}
