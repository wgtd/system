import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { FuncApi } from "@/api";
export default defineStore(
    'func',
    () => {
        const _init = ref<boolean>(false)
        const _allFuncs = ref<Vm.Func[]>([]);

        const treeDate = computed<Vm.treeDate>(() => {
            function _updateNode(node: Vm.treeDateItem) {
                let children: Array<Vm.treeDateItem> = [];
                _allFuncs.value.forEach(item => {
                    if (item.func_fid === node.func_id) children.push({ ...item });
                })
                if (children.length === 0) return;
                else {
                    node.children = children;
                    node.children.forEach(item => _updateNode(item));
                }
            }
            var Root: Vm.treeDateItem = { func_id: 0, func_name: 'Root', func_key: '', func_fid: -1 }
            _updateNode(Root)
            return [Root]

        });
        const init = async () => {
            if (_init.value) return;
            _allFuncs.value = await FuncApi.getAll();
            _init.value = true;
        };
        const noLeafFuncs = computed<Vm.treeDate>(() => {
            return _allFuncs.value.filter(item => item.func_key === '');
        });
        const remove = async (id: number) => {
            try {
                await FuncApi.remove(id)
                let i = _allFuncs.value.findIndex(item => item.func_fid === id);
                _allFuncs.value.splice(i, 1)
            } catch (e) { console.log }
        };
        const add = async (func: HttpPayload.Func) => {
            try{
                const func_id = await FuncApi.add(func);
                _allFuncs.value.push({ ...func, func_id });
            }catch(e){console.log(e)}
        };
        const update = async (func: HttpPayload.Func) => {
            console.log(func)
            try{
                await FuncApi.update(func);
                let i = _allFuncs.value.findIndex(item => item.func_fid === func.func_id)
                _allFuncs.value.splice(i, 1, func);
            } catch (e) { console.log(e) }
            
        };
        return {
            _allFuncs, treeDate, init, _init, remove, add, update, noLeafFuncs

        }

    },
    { persist: { enabled: true } }
)