import {http} from "@/utill/http";

export default {
   get:()=>http<Vm.Classroom[]>({url:'/classroom/all'}),
   add: (data : HttpPayload.Classroom)=>http<HttpPayload.Classroom,number>({url:'/classroom/add',method:'post',data}),
   update: (data: HttpPayload.Edit) => http<HttpPayload.Edit, null>({ url: '/classroom/update', method: 'post',data}),
   remove:(id: number)=>http<null,null>({url:'/classroom/remove/'+id})
}