import type { FetchOptions } from 'ofetch';
import type { TransactionHistoryList, TransactionHistoryPayload } from '~/model/payment';

interface GetTransactionHistoryRequest extends TransactionHistoryPayload {}
interface GetTransactionHistoryResponse extends TransactionHistoryList {}

export default async function getTransactionHistoryApi(
    data: GetTransactionHistoryRequest,
    options?: FetchOptions,
) {
    const $api = useNuxtApp().$api;

    return await $api<GetTransactionHistoryResponse>('/Balance/TransactionHistories', {
        ...options,
        method: 'GET',
        params: data,
    });
}
