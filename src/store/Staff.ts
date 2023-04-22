import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { StaffApi } from "@/api";
import { httpBatch } from "@/utill/http";
import { ElMessage } from 'element-plus'
export default defineStore(
    'Staff',
    () => {
        let result = ([])
        let Identify = ref<Vm.Identify[]>([])
        const List = reactive<HttpPayload.Staff>({
            stf_category: 0,
            stf_name: '',
            begin: 1,
            pageSize: 6
        })
        const Tabel = reactive<{ list: Vm.StaffTable[], total: number }>({
            list: [],
            total: 0
        });
        const getList = async (List: HttpPayload.Staff) => {
            [result, Identify.value] = await httpBatch([() => StaffApi.getList(List), () => StaffApi.dictionary()]);
            Tabel.list = result.list;
            console.log(Tabel.list)
            Tabel.total = result.total;
            Identify.value = Identify.value.filter(item => item.dic_group_name === '职务类别')
        }
        // 新增
        const Add = async (ruleForm: Vm.ruleForm) => {
            try {
                await StaffApi.add(ruleForm)
            } catch (e) { }
        }
        // 修改
        const update = async (ruleForm: Vm.ruleForm) => {
            try {
                await StaffApi.update(ruleForm)
            } catch (e) { }
        }
        //入职
        const entry=async (val: number)=>{
            await StaffApi.reinstate(val)
            const i = Tabel.list.findIndex(item => item.stf_id === val)
            Tabel.list[i].stf_invalid = 1

        }
        //离职
        const quit=async (val: number)=>{
            await StaffApi.dimission(val)
            const i = Tabel.list.findIndex(item => item.stf_id === val)
            Tabel.list[i].stf_invalid = 0
        }
        
        
        return {
            Tabel, List, getList, Identify, Add, update, entry, quit
        }



    },
    { persist: { enabled: true } }
)