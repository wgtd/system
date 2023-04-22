import { http } from "@/utill/http";

export default {
    login: (data: HttpPayload.login) =>
        http<HttpPayload.login, string>({ url: '/user/login', method: 'post', data }),
    getMenu: () =>
        http<null, Array<Vm.Func>>({ url: '/user/getmenu', method: 'post' }),
    getUser: (data: HttpPayload.userSearch) =>
        http<HttpPayload.userSearch, { total: number, list: Vm.userRole[] }>({ url: '/user/list', method: 'post', data }),
    remove: (user_name: string) =>
        http<null, null>({ url: '/user/remove/' + user_name, method: 'post' }),
    resetpwd: (user_name: string) =>
        http<null, null>({ url: '/user/resetpwd/' + user_name, method: 'post' }),
    add: (user_name: string) =>
        http<null, null>({ url: '/user/add/' + user_name, method: 'post' }),
    configRole: (data: HttpPayload.configRole) =>
        http<HttpPayload.configRole, null>({ url: '/user/config_role', method: 'post', data }),
    validateName:(user_name:string)=>http<string,number>({ url:'/user/valid_name/'+user_name,method:'post'}),
    //用户自己修改密码
    changePwd:(data:HttpPayload.changePwd)=>http({url:'/user/pwdchange',method:'post',data})
}