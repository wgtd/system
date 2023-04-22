declare namespace HttpPayload {
    type Avatar = {
        stu_id: number,
        stu_avatar_old: string | null,
        stu_avatar_new: string
    }
    type Search = {
        stu_name: string,
        stu_cls_id: number|null,
        stu_qualification: number,
        begin: number,
        pageSize: number
    }
    type studentList = {
        stu_name: string,
        stu_avatar: string | null,
        stu_cls_id: number|null ,
        stu_sex: 0 | 1,
        stu_phone: string,
        stu_phone2: string,
        stu_born: string,
        stu_qualification: number,
        stu_school: string | null,
        stu_major: string | null,
        stu_address: string,
        stu_remark: string | null,
        stu_id: number
    }
    type assignClass = {
        stu_id:number|null,
        stu_ids:number[],
        stu_cls_id:number|null
    }
}
declare namespace Vm {
    type studentList = {
        stu_name: string,
        stu_avatar: string | null,
        stu_cls_id: number | null,
        stu_sex: 0 | 1,
        stu_phone: string,
        stu_phone2: string,
        stu_born: string,
        stu_qualification: number,
        stu_school: string | null,
        stu_major: string | null,
        stu_address: string,
        stu_remark: string | null,
        stu_id: number
    }
}