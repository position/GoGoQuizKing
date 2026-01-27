import { DTO } from '@/models';
import dayjs from 'dayjs';
import { format } from 'quasar';
import { floorTo, calc } from '@/helper/float';

const { pad } = format;

export const Filters = {
    // currency 표기. 소수점자리수에서 반올림
    currency(value: number, currency: DTO.Enums.SeriesCurrency = DTO.Enums.SeriesCurrency.USD, decimals = 2, deleteTwoZero = false, signSpace = false) {
        const digitsRE = /(\d{3})(?=\d)/g;

        if (!isFinite(value) || (!value && value !== 0)) {
            return '';
        }

        const stringified = Math.abs(value).toFixed(decimals);
        const _int = decimals ? stringified.slice(0, -1 - decimals) : stringified;
        const i = _int.length % 3;
        const head = i > 0 ? _int.slice(0, i) + (_int.length > 3 ? ',' : '') : '';
        let _float = decimals ? stringified.slice(-1 - decimals) : '';
        const sign = value < 0 ? `-${signSpace ? ' ' : ''}` : '';

        if (deleteTwoZero) {
            _float = _float === '.00' ? '' : _float;
        }
        return `${sign + DTO.Enums.CurrencySymbol[DTO.Enums.SeriesCurrency[currency]]} ${head + _int.slice(i).replace(digitsRE, '$1,') + _float}`;
    },
    currencySymbol(currency: DTO.Enums.SeriesCurrency = DTO.Enums.SeriesCurrency.USD): string {
        return String(DTO.Enums.CurrencySymbol[DTO.Enums.SeriesCurrency[currency]]) || String(DTO.Enums.CurrencySymbol.USD);
    },
    numberFormat(value: number, decimals = 0, deleteTwoZero = false) {
        if (isNaN(value)) {
            return 0;
        }

        const formattedValue = new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
        if (deleteTwoZero && Number.isInteger(value)) {
            return formattedValue.replace(/\.00$/, ''); // `.00` 제거
        }

        return formattedValue;
    },

    ldt(value: any, format = 'YYYY-MM-DD') {
        return dayjs.utc(value).local().format(format);
    },
    dt(value: any, format = 'YYYY-MM-DD') {
        return dayjs.utc(value).format(format);
    },
    sdt(date: string, format = 'YYYY-MM-DD HH:mm:ss', timezone: string = null) {
        if (date) {
            if (date.replace(/[^0-9]/gi, '') === '') return date;
            return timezone ? dayjs.utc(date).tz(timezone).format(format) : dayjs.utc(date).format(format);
        }
        return '';
    },
    // 소수점 첫째자리까지 표기 (버림처리)
    bb(chipCount: number, bigBlind: number, decimal = 1) {
        if (chipCount === null || !bigBlind) {
            return '0.0 BB';
        }

        // store에서 bb를 가져다가 바로 쓸 수 있으나 이거 호출할때마다 useStore를 호출해야함.
        const bbValue = floorTo(calc(chipCount).div(bigBlind).toNumber(), decimal);

        return `${Filters.numberFormat(bbValue, decimal)} BB`;
    },
    wsopIdFormat: (wsopId) => {
        if (!wsopId) {
            return;
        }
        const wsopIdArr = wsopId.split('');
        wsopIdArr.splice(3, 0, ' ');

        return wsopIdArr.join('').toUpperCase();
    },
    tableNoFormat: (tableNo: number) => {
        return tableNo ? pad(`${tableNo}`, 3) : '';
    },
    dailyAndEventGridFormat: (data: any[]) => {
        const returnGridData = [];
        data.forEach((items) => {
            const gridRowObject = {};
            const firstStringToUpperCase = (str) => {
                const firstChar = str.charAt(0);
                const others = str.slice(1);
                return firstChar.toUpperCase() + others;
            };

            const getSpreadObjectRecursion = (gridItem, originKey = '', depth = 0) => {
                Object.keys(gridItem).forEach((key) => {
                    const keyName = `${originKey}${depth === 0 ? key : firstStringToUpperCase(key)}`;
                    if (typeof gridItem[key] !== 'object') {
                        gridRowObject[keyName] = gridItem[key];
                    } else {
                        const nextDepth = depth + 1;
                        getSpreadObjectRecursion(gridItem[key], keyName, nextDepth);
                    }
                });
            };

            getSpreadObjectRecursion(items);
            returnGridData.push(gridRowObject);
        });
        return returnGridData;
    },
    addSpaceBeforeCapitalLetters: (str) => {
        if (str) {
            return str.replace(/([A-Z])/g, ' $1').trim();
        }
        return '';
    },

    ordinalSuffixOf: (i: number) => {
        const j = i % 10;
        const k = i % 100;
        if (j === 1 && k !== 11) {
            return i + 'st';
        }
        if (j === 2 && k !== 12) {
            return i + 'nd';
        }
        if (j === 3 && k !== 13) {
            return i + 'rd';
        }
        return i + 'th';
    }
};
