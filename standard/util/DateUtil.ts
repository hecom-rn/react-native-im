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
    const now = new Date();
    const that = new Date(timestamp);
    const isSameDay = sameDay(now, that);
    const isSameWeek = sameWeek(now, that);
    const year = that.getFullYear();
    const month = String(that.getMonth() + 1); // 月份从0开始，需要加1
    const day = String(that.getDate());
    const hours = String(that.getHours()).padStart(2, '0');
    const minutes = String(that.getMinutes()).padStart(2, '0');
    const dayOfWeek = getDayOfWeek(that);
    const timeStr = (isSameDay || showTime) ? `${hours}:${minutes}` : '';
    const dayStr = isSameDay ? '' : isSameWeek ? dayOfWeek : `${year}-${month}-${day}`;
    return [dayStr, timeStr].filter(i => i.length > 0).join(' ');
}

function sameWeek(now: Date, that: Date) {
    return isInNDay(now, that, 7);
}

function sameDay(now: Date, that: Date) {
    return now.getYear() === that.getYear() && now.getMonth() === that.getMonth() && now.getDate() === that.getDate();
}

function isInNDay(now: Date, that: Date, number: number) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const before = new Date(today - 24 * 3600 * 1000 * number).getTime();
    return that.getTime() < today && before <= that.getTime();
}

export function needShowTime(forward: General, current: General) {
    return !(forward &&
        current.timestamp - forward.timestamp < 3 * 60 * 1000 &&
        Math.floor(new Date(forward.timestamp).getMinutes() / 3) === Math.floor(new Date(current.timestamp).getMinutes() / 3))
}
