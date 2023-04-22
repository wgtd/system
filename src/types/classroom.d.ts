declare namespace HttpPayload {
    // 发ajax需要的数据类型
    type Classroom={
        clsr_id: number,
        clsr_name: string,
        clsr_occupy: number
    }
    type Edit = {
        clsr_id: number,
        clsr_name: string,
        clsr_occupy: number
    }
}
declare namespace Vm {
    // 需要展示的数据
    type Classroom={
        clsr_id: number,
        clsr_name: string,
        clsr_occupy: number
    }

}