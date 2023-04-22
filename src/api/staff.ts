import {http} from "@/utill/http";

export default {
    
    getList: (data: HttpPayload.Staff) => http<HttpPayload.Staff, Vm.StaffTable>({url:'/staff/list',method:'post',data}),
    //按照员工类别获取角色
    getIdentify: (category: number) => http<null, Vm.Staff[]>({ url: "/staff/listbycategory/" + category }),
    //增加
    add: (data: Vm.ruleForm) => http<Vm.ruleForm, null>({ url: "/staff/add", method: "post", data }),
    //编辑
    update: (data: Vm.ruleForm) => http<Vm.ruleForm, null>({ url: "/staff/update", method: "post", data }),
    //
    dimission: (stf_id: number) => http<number, null>({ url: "/staff/dimission/" + stf_id }),
    reinstate: (stf_id: number) => http<number, null>({ url: "/staff/reinstate/" + stf_id, }),
    dictionary: () => http<null, Vm.dictionary[]>({ url: "/dictionary/all"})
}