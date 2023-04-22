import { createPinia } from "pinia";
//这里不是总仓库，只是想把pinia全局性的代码收拢在这里而已
import useAuthStore from './auth';
import piniaPersist from 'pinia-plugin-persist';
import useDashboardStore from './dashboard';
import useClassroomStore from './classroom';
import useFuncStore from './func';
import useStaffStore from './Staff';
import useRoleStore from './role';
import useStudentStore from './student';
import useClassStore from './class';
const pinia=createPinia();
pinia.use(piniaPersist);
export default pinia
export{
    useAuthStore,
    useDashboardStore,
    useClassroomStore,
    useFuncStore,
    useStaffStore,
    useRoleStore,
    useStudentStore,
    useClassStore
}
