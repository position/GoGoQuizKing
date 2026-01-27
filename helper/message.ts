import { Notify, Dialog } from 'quasar';
import dayjs from 'dayjs';

export const ToastMessage = {
    success(message: string, timeout = 3000) {
        Notify.create({
            message,
            html: true,
            type: 'positive',
            position: 'top',
            timeout,
            actions: [
                {
                    icon: 'close',
                    color: 'white',
                },
            ],
        });
    },
    error(message: string, timeout = 3000) {
        Notify.create({
            message,
            html: true,
            type: 'negative',
            position: 'top',
            timeout,
            color: 'notification-error',
            actions: [
                {
                    icon: 'close',
                    color: 'white',
                },
            ],
        });
    },
    warning(message: string, timeout = 3000) {
        Notify.create({
            message,
            html: true,
            type: 'negative',
            position: 'top',
            timeout,
            color: 'notification-warning',
            icon: 'report',
        });
    },
    custom(message: string, timeout = 0) {
        Notify.create({
            message,
            html: true,
            group: false,
            classes: 'custom-notify',
            position: 'bottom',
            timeout,
            color: 'blue-8',
            textColor: 'white',
            actions: [
                {
                    label: 'OK',
                    color: 'yellow',
                    handler: () => {
                        /* ... */
                    },
                },
            ],
        });
    },
};

export const ConfirmMessage = ({
    title = '한번 더 확인!',
    message = 'Are you sure?',
    ok = '넵!',
    cancel = '아니요!',
    isPersistent = true,
    html = true,
    color = 'negative',
    icon = null,
    prompt = null,
    focus = 'none',
}) => {
    return new Promise((resolve, reject) => {
        const options = {
            title,
            message,
            ok: { label: ok, color: 'primary', unelevated: true },
            cancel: { label: cancel, color: 'gray-4', unelevated: true },
            persistent: isPersistent,
            focus: focus as 'ok' | 'cancel' | 'none',
            html,
            color,
        };
        if (prompt) {
            options['prompt'] = { outlined: true, dense: true, ...prompt };
        }

        if (icon) {
            options.message = `<q-card-section class="row items-center no-wrap">
                <i class="q-icon text-primary material-icons" style="font-size: 20px">${icon}</i>
                <span class="q-ml-sm">${message}</span>
            </q-card-section>`;
        }

        Dialog.create(options).onOk(resolve).onCancel(reject);
    });
};

export const AlertMessage = ({
    title = 'Alert',
    message = '',
    html = true,
    ok = 'ok',
    titleIcon = null,
    buttonColor = 'primary',
}) => {
    return new Promise((resolve) => {
        const options = {
            title,
            message,
            html,
            persistent: true,
            ok: { label: ok, color: buttonColor, unelevated: true },
        };
        if (titleIcon) {
            options.title = `<i class='q-icon text-primary material-symbols-outlined' style='font-size: 21px;'>${titleIcon}</i>
                <span>${title}</span>`;
        }

        Dialog.create(options).onOk(resolve);
    });
};

export const SaveLog = ({ key = 'error', desc = '' }) => {
    const storageKey = localStorage.getItem(key);
    const tempLog = storageKey ? JSON.parse(storageKey) : [];
    tempLog.unshift(`${dayjs().format('YYYY-MM-DD HH:mm:ss')}, ${desc}`);

    localStorage.setItem(key, JSON.stringify(tempLog));
};
