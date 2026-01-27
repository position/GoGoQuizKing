import dayjs from 'dayjs';
import { useSeriesStore } from '@/store/series.store';

export const getUtcDateTimeReverse = (d: any) => {
    return new Date(
        dayjs
            .utc(d)
            .add(dayjs().utcOffset() * -1, 'minutes')
            .format(),
    );
};

// summerTime 도 계산 getDisplayTime('2023-03-12T10:00:00', 'America/Toronto')
// timezone없으면 utc0으로 리턴
export const getDisplayTime = (date: string, timezone: string = null, format = 'YYYY-MM-DD HH:mm:ss') => {
    return timezone ? dayjs.utc(date).tz(timezone).format(format) : dayjs.utc(date).format(format);
};

export const getUtcOffset = (date: string, timezone: string) => {
    const offset = timezone ? dayjs.utc(date).tz(timezone).utcOffset() / 60 : 0;
    return offset >= 0 ? `+${offset}` : `${offset}`;
};

export const getSeriesTimezoneString = () => {
    const seriesStore = useSeriesStore();
    const seriesTimezone = seriesStore.getCurrentSeriesInfo?.timeZone;
    return seriesTimezone ? `${seriesTimezone} (UTC${getUtcOffset(dayjs().format('YYYY-MM-DD HH:mm:ss'), seriesTimezone)})` : 'UTC+0';
};
