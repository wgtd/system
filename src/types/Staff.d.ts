declare namespace HttpPayload {
    // 发ajax需要的数据类型
    type Staff = {
        stf_category: number, stf_name: string, begin: number, pageSize: number
    }
}
declare namespace Vm {
    // 需要展示的数据
    type Staff = {
        stf_category: number,
        stf_name: string,
        begin: number,
        PageSize: number
    }
    type StaffTable={
        list:[] ,
        total:number,
        stf_id: number, //员工id
        stf_name: string,//员工姓名,
        stf_remark: string, //员工备注
        stf_category: number, //员工职位
        stf_invalid: number //是否离职
    }
    type dictionary = {
        dic_id: number,
        dic_name: string,
        dic_group_key: string,
        dic_group_name: string
    }
    type Identify={
        dic_id:number,
        dic_name:string,
        dic_group_key:string,
        dic_group_name:string
    }
    type ruleForm = {
        stf_id: number, //员工id
        stf_name: string,//员工姓名,
        stf_remark: string | null, //员工备注
        stf_category: number, //员工职位
        stf_invalid?: number //是否离职
    }

}