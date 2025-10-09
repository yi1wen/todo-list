
import styles from './TodoList.module.css';
import TodoItem, { TodoItemType } from './TodoItem';
import TodoInput from './TodoInput';
import { Button, Divider } from '@arco-design/web-react';
import { useEffect, useState, useRef } from 'react';
import { IconPlusCircle, IconLoading } from '@arco-design/web-react/icon';
import TodoData from '../api/data-layer/index';
import { OperationType, STORAGE_KEYS } from '../api/data-layer/types';
const deleteSound = require('../assets/deleteVoice.mp3') as string;
import useSound from 'use-sound';
import toast, { Toaster } from 'react-hot-toast';

const { getTodos, addTodo, editTodoContent, deleteTodo, toggleTodoStatus, listenStorage } = TodoData;
enum INIT_STATE {
    LOADING = 'loading',
    HAS_MORE = 'hasMore',
    NO_HAS_MORE = 'noMore',
    FAILED = 'failed',
}
function TodoList() {
    const [addTodoInputVisible, setAddTodoInputVisible] = useState(false);
    const isFirstRenderRef = useRef(false);
    const [play] = useSound(deleteSound, { volume: 0.1, playbackRate: 1.5, interrupt: true });
    const loadingPromise = useRef<{ resolve: (msg: string) => void; reject: (msg: string) => void } | undefined>(undefined);
    const message = useRef<string>('');
    const [ initState, setInitState ] = useState<INIT_STATE>(INIT_STATE.LOADING);
    const [todos, setTodos] = useState<TodoItemType[]>([]);
    const handleSetTodos = (todos: TodoItemType[]) => {
        if (todos.length === 0) {
            setInitState(INIT_STATE.NO_HAS_MORE);
        } else {
            setInitState(INIT_STATE.HAS_MORE);
        }
        setTodos(todos);
    }

    useEffect(() => {
        
        if (!isFirstRenderRef.current) {
            isFirstRenderRef.current = true;
            return;
        }

        const todos = getTodos();
        setTimeout(() => {
            handleSetTodos(todos);
        }, 1000);

        const handleLocalStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEYS.TODOS && e.newValue) {
                loadingPromise.current?.resolve('保存成功');
                handleSetTodos(JSON.parse(e.newValue));

            }
            if (e.key === STORAGE_KEYS.CONFLICTS) {
                const conflicts = JSON.parse(e.newValue || '[]');
                const {resolvedOperation} = conflicts[conflicts.length - 1];
                toast('修改有冲突，已采用最新数据自动解决', {
                    icon: '⚠️',
                });
            }
        };

        const handleStorageChange = (e: any) => {
            if (e[STORAGE_KEYS.TODOS]) {
                loadingPromise.current?.resolve('保存成功');
                handleSetTodos(JSON.parse(e[STORAGE_KEYS.TODOS]));
            }

            if (e[STORAGE_KEYS.CONFLICTS]) {
                const conflicts = JSON.parse(e[STORAGE_KEYS.CONFLICTS]);
                const {resolvedOperation} = conflicts[conflicts.length - 1];
                toast('修改有冲突，已采用最新数据自动解决', {
                    icon: '⚠️',
                });
            }
        };

        window.addEventListener('setItemEvent' as any, handleStorageChange);
        window.addEventListener('storage', handleLocalStorageChange);

  
        return () => {
            window.removeEventListener('setItemEvent' as any, handleStorageChange);
            window.removeEventListener('storage' as any, handleStorageChange);
        };
    }, []);

   

    const loading = () => {
        if(loadingPromise.current) return;
        toast.promise(
            new Promise((resolve, reject) => {
                message.current = '';
                loadingPromise.current = {
                    resolve: (msg) => {
                        message.current = msg;
                        loadingPromise.current = undefined;
                        resolve(msg);
                    },
                    reject: (msg) => {
                        message.current = msg;
                        loadingPromise.current = undefined;
                        reject(msg);
                    },
                };
            }),
            {
                loading: '保存中...',
                success: <b>保存成功!</b>,
                error: <b>{message.current || '保存失败，请稍后重试'}</b>,
            },
        );
    }

    const onDeleteTodo = (id: string) => {
        loading();
        handleSetTodos(todos.filter((todo) => todo.id !== id));
        deleteTodo(id);
        play();
    }
    const onEditTodo = (todo: TodoItemType) => {
        loading();
        handleSetTodos(todos.map((t) => t.id === todo.id ? todo : t));
        editTodoContent(todo.id, todo.content);
    }
    const onAddTodo = (todo: TodoItemType) => {
        loading();
        addTodo({
            action: OperationType.ADD,
            timestamp: Date.now(),
            data: todo,
        });
        setAddTodoInputVisible(false);
    }
    const onToggleTodo = (id: string) => {
        loading();
        const newIsDone = !todos.find((todo) => todo.id === id)?.isDone;
        handleSetTodos(todos.map((todo) => todo.id === id ? {...todo, isDone: newIsDone} : todo));
        toggleTodoStatus(id, newIsDone ? TodoData.TodoStatus.COMPLETED : TodoData.TodoStatus.PENDING);
    }

    return (
        <div className={styles.todoList}>
            {
                todos.map((todo, index) => (
                    <TodoItem key={todo.id} todo={todo} onDelete={onDeleteTodo} onEdit={onEditTodo} onToggle={onToggleTodo}/>
                ))
            }
            {initState !== INIT_STATE.HAS_MORE && <div className={styles.footer}>
                {initState === INIT_STATE.LOADING && <div>
                    <div><IconLoading /> 加载中...</div>
                    <Divider />
                </div>}
                {initState === INIT_STATE.NO_HAS_MORE && todos.length === 0 && <div>
                    <div>快来添加todos吧～</div>
                    <Divider />
                </div>}
            </div>}
            
            {!addTodoInputVisible && <Button type='primary' status='danger' shape='round' icon={<IconPlusCircle />} onClick={() => {
                setAddTodoInputVisible(true);
            }}>
                添加任务
            </Button>}
            {addTodoInputVisible && <TodoInput todo={{id: String(Math.random()), content: '', isDone: false}} cancelInput={() => {
                setAddTodoInputVisible(false);
            }} saveTodo={onAddTodo}/>}
            <Toaster position="bottom-right" />

        </div>
    );
}

export default TodoList;