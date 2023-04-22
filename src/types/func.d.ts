declare namespace HttpPayload {
    // 发ajax需要的数据类型
    type Func = {
        func_id: number,
        func_name: string,
        func_key: string,
        func_fid: number,
    };
}
declare namespace Vm {
    // 需要展示的数据
    type Func = {
        func_id: number,
        func_name: string,
        func_key: string,
        func_fid: number,
    };
    type treeDateItem = Func & { children?: treeDateItem []};
    type treeDate=treeDateItem[];
}