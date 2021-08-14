// 视图组件
const view = {
    tabs: () => import('@/layouts/tabs'),
    blank: () => import('@/layouts/BlankView'),
    page: () => import('@/layouts/PageView')
}

// 路由组件注册
// const routerMap = {
//   login: {
//     authority: '*',
//     path: '/login',
//     component: () => import('@/pages/login')
//   },
//   demo: {
//     name: '演示页',
//     renderMenu: false,
//     component: () => import('@/pages/demo')
//   },
//   exp403: {
//     authority: '*',
//     name: 'exp403',
//     path: '403',
//     component: () => import('@/pages/exception/403')
//   },
//   exp404: {
//     name: 'exp404',
//     path: '404',
//     component: () => import('@/pages/exception/404')
//   },
//   exp500: {
//     name: 'exp500',
//     path: '500',
//     component: () => import('@/pages/exception/500')
//   },
//   root: {
//     path: '/',
//     name: '首页',
//     redirect: '/login',
//     component: view.tabs
//   },
//   parent1: {
//     name: '父级路由1',
//     icon: 'dashboard',
//     component: view.blank
//   },
//   parent2: {
//     name: '父级路由2',
//     icon: 'form',
//     component: view.page
//   },
//   exception: {
//     name: '异常页',
//     icon: 'warning',
//     component: view.blank
//   }
// }

const routerMap = {
    exp403: {
        authority: '*',
        name: 'exp403',
        path: '403',
        component: () => import('@/pages/exception/403')
    },
    exp404: {
        name: 'exp404',
        path: '404',
        component: () => import('@/pages/exception/404')
    },
    exp500: {
        name: 'exp500',
        path: '500',
        component: () => import('@/pages/exception/500')
    },
    login: {
        authority: '*',
        path: '/login',
        component: () => import('@/pages/login')
    },
    root: {
        path: '/',
        name: '首页',
        redirect: '/login',
        component: view.tabs
    },
    dashboard: {
        path: 'dashboard',
        name: '仪表盘',
        icon: 'dashboard',
        component: () => import('@/pages/dashboard')
    },
    tools: {
        path: 'tools',
        name: '工具',
        icon: 'tool',
        component: view.blank,
    },
    builder: {
        path: 'builder',
        name: '代码生成器',
        component: () => import('@/pages/builder'),
    },
    user: {
        path: 'user',
        name: '用户',
        icon: 'user',
        component: () => import('@/pages/user')
    },
    form_user: {
        path: 'form/user/:id?',
        name: '用户',
        invisible: true,
        component: () => import('@/pages/user/Form')
    },
    system: {
        path: 'system',
        name: '系统',
        icon: 'setting',
        component: view.blank,
    },
    // 角色
    role: {
        path: 'role',
        name: '角色',
        component: () => import('@/pages/role')
    },
    form_role: {
        path: 'form/system/role/:id?',
        name: '角色',
        invisible: true,
        component: () => import('@/pages/role/Form')
    },
    // 银行
    bank: {
        path: 'bank',
        icon: 'bank',
        name: '银行',
        component: () => import('@/pages/bank')
    },
    form_bank: {
        path: 'form/bank/:id?',
        name: '银行',
        invisible: true,
        component: () => import('@/pages/bank/Form')
    },
    // 监控
    watch: {
        path: 'watch',
        icon: 'android',
        name: '监控',
        component: () => import('@/pages/watch')
    },
    form_watch: {
        path: 'form/watch/:id?',
        name: '监控',
        invisible: true,
        component: () => import('@/pages/watch/Form')
    },
    // 银行卡
    bank_account: {
        path: 'bank_account',
        icon: 'credit-card',
        component: () => import('@/pages/bank_account')
    },
    // 银行卡表单
    form_bank_account: {
        path: 'form/bank_account/:id?',
        icon: 'credit-card',
        invisible: true,
        component: () => import('@/pages/bank_account/Form')
    },
    // 短信
    sms: {
        path: 'sms',
        icon: 'message',
        component: () => import('@/pages/sms')
    },
    // 订单
    order: {
        path: 'order',
        icon: 'shopping',
        component: () => import('@/pages/order')
    },
    // 补单
    form_order: {
        path: 'form/order',
        icon: 'shopping',
        component: () => import('@/pages/order/Form')
    },
    // 账目
    account_detail: {
        path: 'account_detail',
        icon: 'account-book',
        component: () => import('@/pages/account_detail')
    },
    // 交易
    transaction: {
        path: 'transaction',
        icon: 'star',
        component: () => import('@/pages/transaction')
    },
    pay_type: {
        path: 'pay_type',
        icon: 'cloud',
        component: () => import('@/pages/pay_type')
    },
    form_pay_type: {
        path: 'form/pay_type/:id?',
        invisible: true,
        component: () => import('@/pages/pay_type/Form')
    }
}

export default routerMap
