declare namespace Vm{
    type Class={
        cls_id: number,
        cls_name: string,
        cls_dic_id_major: number,
        cls_clsr_id: number,
        cls_stf_id_teacher: number,
        cls_stf_id_admin: number,
        cls_stf_id_job: number,
        cls_begin: null | string,
        cls_end: null | string,
        cls_remark: string | null
    }
    type statusClass = {
        list:[],
        total:number
    }

    
}
declare namespace HttpPayload {
    type Class = {
        cls_id: number,
        cls_name: string,
        cls_dic_id_major: number,
        cls_clsr_id: number | null,
        cls_stf_id_teacher: number,
        cls_stf_id_admin: number,
        cls_stf_id_job: number,
        cls_begin: null|string,
        cls_end: null|string,
        cls_remark: string|null
    }
    type statusClass={
        cls_name:string,
        cls_dic_id_major:number,
        cls_status:0|1|2|3,
        begin:number,
        pageSize:number
    }
    type begin={
        cls_id:number, 
        cls_clsr_id:number|null
    }
}