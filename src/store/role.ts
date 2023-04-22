import { defineStore } from "pinia";
import { RoleApi } from "@/api";
import {reactive, ref} from 'vue'

export default defineStore(
    'role',
    ()=>{
        // const _isInit=ref<boolean>(false)
        const roleList=ref<Vm.role[]>([])
        const dialogVisible=ref<boolean>(false)
        let val = reactive<Vm.role>({
            role_name:'',
            role_id:0
        })
        const init= async ()=>{
            // if(_isInit.value) return
            roleList.value=await RoleApi.getAll();
            // _isInit.value=true
        }
        const add = async (val: Vm.role)=>{
            await RoleApi.add(val)
        }
        const update = async (val: Vm.role)=>{
            await RoleApi.update(val)
        }
        const remove=async (id:number)=>{
            await RoleApi.remove(id)
        }

        return { roleList, init, dialogVisible, add, val, update, remove }
    },
    {persist:{enabled:true}}
)