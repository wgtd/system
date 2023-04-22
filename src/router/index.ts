
import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "@/store";
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: () => import('../views/EduLogin.vue') },
        {
            path: '/home',
            component: () => import('../views/EduHome.vue'),
            children: [
                { path: 'class', components: { class: () => import('../views/EduClass.vue') } },
                { path: 'classroom', components: { classroom: () => import('../views/EduClassroom.vue') } },
                { path: 'func', components: { func: () => import('../views/EduFunc.vue') } },
                { path: 'rolefunc', components: { rolefunc: () => import('../views/EduRoleFunc.vue') } },
                { path: 'staff', components: { staff: () => import('../views/EduStaff.vue') } },
                { path: 'student', components: { student: () => import('../views/EduStudent.vue') } },
                { path: 'userrole', components: { userrole: () => import('../views/EduUserRole.vue') } },
                { path: 'password', components: { password: () => import('../views/passwordEdit.vue') } },
            ]
        },
    ],
})
router.beforeEach((to, from, next) => {
    const useAuth = useAuthStore()
    let token=useAuth.token
    if (token) {
        next();
    } else {
        if (to.path === "/login") {
            next();
        } else {
            next({ path: "/login" }); 
        }
    }
});
export default router