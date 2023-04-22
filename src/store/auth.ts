import { defineStore } from "pinia";
import { ref } from 'vue';

export default defineStore(
    'auth',
    () => {
    const token = ref<string>('')
    const userName = ref<string>('')
    const login = (u: string, t: string) => {
        userName.value = u,
            token.value = t
    }
    const logout = () => {
        userName.value = 'u',
            token.value = 't'
    }
    return { token, userName, login, logout }
}, {persist: {enabled: true}})