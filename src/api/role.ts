import { http} from "@/utill/http";

export default {
    getAll: () => http<null, Vm.role[]>({ url: '/role/all' }),
    getRoleFuncs:(role_id: number) =>http<null,Vm.Func[]>({url:'/role_function/list/'+role_id}),
    saveRoleFunc: (data: HttpPayload.roleFunc) => http<HttpPayload.roleFunc, null>({ url:'/role_function/config',method:'post',data}),
    add: (data: HttpPayload.role) => http<HttpPayload.role,null>({url:'/role/add',method:'post',data}),
    update: (data: HttpPayload.role) => http<HttpPayload.role, null>({ url: '/role/update', method: 'post', data }),
    remove: (id: number) => http<number,null>({ url: '/role/remove/' + id,method:'post' }),

}