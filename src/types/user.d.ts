declare namespace HttpPayload {
    // 发ajax需要的数据类型
    type userSearch = {
        role_id: number, user_name: string, begin: number, pageSize: number
    }
    type configRole={
        user_name:string,
        role_id:number
    }
    type changePwd={
        oldPwd:string,
        newPwd:string
    }
}
declare namespace Vm {
    // 需要展示的数据
    type userRole = {
        role_id: number | null, user_name: string, user_pwd:string
       
    }

}