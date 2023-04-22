import {http} from '@/utill/http'

export default{
    saveAvatar: (data: HttpPayload.Avatar) => http<HttpPayload.Avatar, string>({ url:'/student/avatarupdate',method:'post',data}),
    //用于查询
    search: (data: HttpPayload.Search) => http<HttpPayload.Search,any>({url:'/student/list',method:'post',data}),
    // 验证手机号
    validPhone: (data: any) => http<any,any>({ url:'/student/valid_phone',method:'post',data}),
    add: (data: HttpPayload.studentList) => http<HttpPayload.studentList,null>({url:'/student/add',method:'post',data}),
    update: (data: HttpPayload.studentList) => http<HttpPayload.studentList, null>({ url: '/student/update', method: 'post', data }),
    //分班（单个或批量）
    assignClass:(data:HttpPayload.assignClass)=>http<HttpPayload.assignClass,null>({url:'/student/assignclass',method:'post',data})
}