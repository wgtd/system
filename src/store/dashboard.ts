import { defineStore } from "pinia";
import { UserApi } from "@/api";
import { ref, markRaw, computed, reactive } from 'vue';
import { TabPanelName } from "element-plus";
export default defineStore(
    'dashiboard',
    () => {
        const collapse = ref<boolean>(false);//标识菜单是否是收缩的状态
        const collapseToggle = () => collapse.value = !collapse.value;
        const userMenu = ref<Array<Vm.Func>>(([]));
        type MenuTreeItem = Vm.Func & { children?: MenuTreeItem[] };
        const MenuTree = computed<Array<MenuTreeItem>>(() => {
            function _updateNode(node: MenuTreeItem) {
                let children: Array<MenuTreeItem> = [];
                userMenu.value.forEach(item => {
                    if (item.func_fid === node.func_id) children.push({ ...item });
                })
                if (children.length === 0) return;
                else {
                    node.children = children;
                    node.children.forEach(item => _updateNode(item));
                }
            }
            var result: Array<MenuTreeItem> = [];
            userMenu.value.forEach(item => {
                if (item.func_fid === 0) result.push({ ...item });
            });
            result.forEach(item => _updateNode(item));
            return result

        });
        const getMenu = async () => {
            const list = await UserApi.getMenu()
            userMenu.value = list
        }
        //左右关联
        const openFuncs = reactive<Vm.Func[]>([])
        const activeFuncKey = ref<string>('')//表示当前激活的func_key
        const openFunc = (func_key: string) => {
            if (openFuncs.findIndex(item => item.func_key === func_key) === -1) {
                let target = userMenu.value.find(item => item.func_key === func_key) as Vm.Func;
                openFuncs.push({ ...target })
            }
            activeFuncKey.value = func_key
        };
        const closeFunc = (func_key: TabPanelName) => {
            let i = openFuncs.findIndex(item => item.func_key === func_key);
            if (func_key !== activeFuncKey.value) { }//删除的是一个不激活的tab
            else if (openFuncs.length === 1) {//删除的是一个
                activeFuncKey.value = '';
            }
            else if (i === openFuncs.length - 1) {
                activeFuncKey.value = openFuncs[i - 1].func_key
            }
            else {
                activeFuncKey.value = openFuncs[i + 1].func_key
            }
            openFuncs.splice(i, 1)
        }
        return {
            collapse, collapseToggle, userMenu,
            openFuncs, MenuTree, getMenu, activeFuncKey, openFunc,
            closeFunc
        }
    }
    ,
    { persist: { enabled: true } })