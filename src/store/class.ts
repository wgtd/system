import { defineStore } from "pinia";
import { ref } from "vue";
export default defineStore(
    'class',
    ()=>{
        let Classstatus = ref<HttpPayload.statusClass>({
            cls_name: '',
            cls_dic_id_major: 0,
            cls_status: 0,
            begin: 0,
            pageSize: 4
        })
        return { Classstatus }
    },
    {persist:{enabled:true}}
)
