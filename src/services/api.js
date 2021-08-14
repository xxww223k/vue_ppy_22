//跨域代理前缀
const API_PROXY_PREFIX = '/api'
// const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_API_BASE_URL : API_PROXY_PREFIX
const BASE_URL = process.env.VUE_APP_API_BASE_URL
module.exports = {
    LOGIN: `${BASE_URL}${API_PROXY_PREFIX}/login`,
    ROUTES: `${BASE_URL}${API_PROXY_PREFIX}/routes`,
    USER: `${BASE_URL}${API_PROXY_PREFIX}/user`,
    ROLE: `${BASE_URL}${API_PROXY_PREFIX}/role`,
    PERMISSION: `${BASE_URL}${API_PROXY_PREFIX}/permission`,
    BANK: `${BASE_URL}${API_PROXY_PREFIX}/bank`,
    WATCH: `${BASE_URL}${API_PROXY_PREFIX}/watch`,
    BANK_ACCOUNT: `${BASE_URL}${API_PROXY_PREFIX}/bank_account`,
    SMS: `${BASE_URL}${API_PROXY_PREFIX}/sms`,
    ORDER: `${BASE_URL}${API_PROXY_PREFIX}/order`,
    ACCOUNT_DETAIL: `${BASE_URL}${API_PROXY_PREFIX}/account_detail`,
    PLATFORM_ACCOUNT_DETAIL: `${BASE_URL}${API_PROXY_PREFIX}/platform_account_detail`,
    COLLECT_REPORT: `${BASE_URL}${API_PROXY_PREFIX}/collect_report`,
    TRANSACTION: `${BASE_URL}${API_PROXY_PREFIX}/transaction`,
    PAY_TYPE: `${BASE_URL}${API_PROXY_PREFIX}/pay_type`,
    TURNOVER: `${BASE_URL}${API_PROXY_PREFIX}/turnover`,
    DASHBOARD: `${BASE_URL}${API_PROXY_PREFIX}/dashboard`,
    CREDIT: `${BASE_URL}${API_PROXY_PREFIX}/credit`,
    ASSIGN: `${BASE_URL}${API_PROXY_PREFIX}/assign`,
    MENU: `${BASE_URL}${API_PROXY_PREFIX}/menu`,
}
