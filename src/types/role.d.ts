declare namespace HttpPayload {
    // 发ajax需要的数据类型
    type roleFunc = {
        role_id: number,
        role_func_ids: string
    }
    type role = {
        role_id: number,
        role_name: string
    }
    
}
declare namespace Vm {
    // 需要展示的数据
    type role = {
        role_id: number,
        role_name: string
    }
}