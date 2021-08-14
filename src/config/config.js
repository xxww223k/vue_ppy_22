// 自定义配置，参考 ./default/setting.config.js，需要自定义的属性在这里配置即可
const TITLE_NAME = process.env.VUE_APP_NAME

module.exports = {
    theme: {
        color: '#1890ff',
        mode: 'light',
        success: '#52c41a',
        warning: '#faad14',
        error: '#f5222f'
    },
    // multiPage: true,
    pageWidth: 'fluid',
    asyncRoutes: true,
    animate: {
        disabled: true,
        name: 'lightSpeed',
        direction: 'left'
    },
    footerLinks: [                        //页面底部链接，{link: '链接地址', name: '名称/显示文字', icon: '图标，支持 ant design vue 图标库'}
        // {link: 'https://pro.ant.design', name: 'Pro首页'},
        // {link: 'https://github.com/iczer/vue-antd-admin', icon: 'github'},
        // {link: 'https://ant.design', name: 'Ant Design'}
    ],
    systemName: TITLE_NAME,         //系统名称
    copyright: '蚂蚁嫖呗工作室出品',     //copyright
}