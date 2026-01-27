import Decimal from 'decimal.js';

export const floorTo = (num: number, place: number) => {
    return +`${Math.floor(parseFloat(`${num.toString()}e+${place}`))}e-${place}`;
};

export const calc = (num: number) => {
    return new Decimal(num);
};
