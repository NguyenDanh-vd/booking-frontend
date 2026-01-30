export function getErrorMessage(error: unknown): string | string[] {
    if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object' &&
        (error as { response?: unknown }).response !== null
    ) {
        const response = (error as { response?: unknown }).response as { data?: unknown } | undefined;
        if (
            response &&
            'data' in response &&
            typeof response.data === 'object' &&
            response.data !== null
        ) {
            const data = response.data as { message?: unknown };
            if ('message' in data) {
                const msg = data.message;
                if (typeof msg === 'string' || Array.isArray(msg)) {
                    return msg;
                }
            }
        }
    }
    return 'Thanh toán thất bại';
}