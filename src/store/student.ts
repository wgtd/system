import { defineStore } from "pinia";
import {reactive,ref } from 'vue'
import { StudentApi ,StaffApi,ClassApi} from '@/api'
import { httpBatch } from "@/utill/http";
export default defineStore(
    'student',
    ()=>{
        
        const total=ref(0)
        let ret=([])
        let classList=ref<Vm.Class[]>([])
        let qualificationList=ref<Vm.Identify[]>([])
        let list = ref<Vm.studentList[]>([])
        const getData = async (searchModel: HttpPayload.Search)=>{
            [ret, qualificationList.value, classList.value] = await httpBatch([() => StudentApi.search(searchModel), () => StaffApi.dictionary(), () => ClassApi.getAll()])
            total.value=ret.total
            list.value=ret.list
            qualificationList.value = qualificationList.value.filter(item => item.dic_group_name === '学历')   
        }
        const add=async (val:HttpPayload.studentList)=>{
            await StudentApi.add(val)
        }
        const edit = async (val: HttpPayload.studentList) => {
            await StudentApi.update(val)
        }



        return { list, getData, total, add, edit, qualificationList, classList }
    },
    {persist:{enabled:true}}

)

