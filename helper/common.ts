import { throttle } from 'quasar';
import { Filters } from '@/helper/filters';
import { DTO } from '@/models';
import xss from 'xss';

export const emailPattern = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

export const isEmail = (val: string): boolean => {
    return val.length > 0 && emailPattern.test(val);
};

export const isMobile = () => {
    const match = window.matchMedia || window['msMatchMedia'];
    if (match) {
        const mq = match('(pointer:coarse)');
        return mq.matches;
    }
    return false;
};

export const delay = (timeToDelay) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timeToDelay);
    });
};
