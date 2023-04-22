import {http} from '@/utill/http';

export default{
    getAll:()=>http({url:'/class/all'}),
    add:(data: HttpPayload.Class)=>http<HttpPayload.Class,Vm.Class[]>({url:'/class/add',method:'post',data}),
    update: (data: HttpPayload.Class) => http<HttpPayload.Class, Vm.Class[]>({ url: '/class/update', method: 'post', data }),
    validform: (data:any)=>http({url:'/class/valid_name',method:'post',data}),
    begin:(data:HttpPayload.begin)=>http<HttpPayload.begin,any>({url:'/class/begin',method:'post',data}),
    end: (data:any) => http<any, any>({ url: '/class/end', method: 'post', data}),
    getClassList:(data: HttpPayload.statusClass)=>http<HttpPayload.statusClass,{total:number,list:[]}>({url:'/class/list',method:'post',data})
}