import { defineStore } from "pinia";
import { ref, reactive } from 'vue';
import { ClassroomApi } from "@/api";




export default defineStore(
    'classroom',
    () => {
        const list: any = ref<Vm.Classroom[]>([]);
        let addlist = reactive({
            clsr_id: 0,
            clsr_name: '',
            clsr_occupy: 0
        })
        const classname = ref('');
        const dialogVisible = ref<boolean>(false);
        let editList = reactive<HttpPayload.Edit>({
            clsr_id: 0,
            clsr_name: '',
            clsr_occupy: 0
        })
        const getClassroom = async () => {
            try {
                const ClassroomList = await ClassroomApi.get();
                list.value = ClassroomList;
            } catch (e) {}
        }
        const remove=async (id: number)=>{
            try{
                await ClassroomApi.remove(id)
            }catch(e){}
            
        }
        
        return { getClassroom, list, dialogVisible, classname, editList, addlist, remove }
    }, {
    persist: { enabled: true }//使仓库持久化
}
)