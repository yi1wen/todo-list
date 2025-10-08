
import styles from './TodoList.module.css';
import TodoItem, { TodoItemType } from './TodoItem';
import TodoInput from './TodoInput';
import { Button } from '@arco-design/web-react';
import { useEffect, useState } from 'react';
import { IconPlusCircle } from '@arco-design/web-react/icon';
import TodoData from '../api/data-layer/index';
import { OperationType, STORAGE_KEYS } from '../api/data-layer/types';
import { useRef } from 'react';
const deleteSound = require('../assets/deleteVoice.mp3') as string;
import useSound from 'use-sound';
import toast, { Toaster } from 'react-hot-toast';

const { getTodos, addTodo, editTodoContent, deleteTodo, toggleTodoStatus, listenStorage } = TodoData;

function TodoList() {
    const [addTodoInputVisible, setAddTodoInputVisible] = useState(false);
    const isFirstRenderRef = useRef(false);
    const [play] = useSound(deleteSound, { volume: 0.1, playbackRate: 1.5, interrupt: true });


    useEffect(() => {
        if (!isFirstRenderRef.current) {
            isFirstRenderRef.current = true;
            return;
        }
        const todos = getTodos();
        setTodos(todos);

        const handleLocalStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEYS.TODOS && e.newValue) {
                setTodos(JSON.parse(e.newValue));
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
            // console.log('Storage event detected:', e);
            if (e[STORAGE_KEYS.TODOS]) {
                setTodos(JSON.parse(e[STORAGE_KEYS.TODOS]));
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

    const [todos, setTodos] = useState<TodoItemType[]>([]);

    const onDeleteTodo = (id: string) => {
        setTodos(todos.filter((todo) => todo.id !== id));
        deleteTodo(id);
        play();
    }
    const onEditTodo = (todo: TodoItemType) => {
        setTodos(todos.map((t) => t.id === todo.id ? todo : t));
        editTodoContent(todo.id, todo.content);
    }
    const onAddTodo = (todo: TodoItemType) => {

        addTodo({
            action: OperationType.ADD,
            timestamp: Date.now(),
            data: todo,
        });
        toast.success('添加成功!')
        setAddTodoInputVisible(false);
    }
    const onToggleTodo = (id: string) => {
        const newIsDone = !todos.find((todo) => todo.id === id)?.isDone;
        setTodos(todos.map((todo) => todo.id === id ? {...todo, isDone: newIsDone} : todo));
        toggleTodoStatus(id, newIsDone ? TodoData.TodoStatus.COMPLETED : TodoData.TodoStatus.PENDING);
    }

    return (
        <div className={styles.todoList}>
            {
                todos.map((todo, index) => (
                    <TodoItem key={todo.id} todo={todo} onDelete={onDeleteTodo} onEdit={onEditTodo} onToggle={onToggleTodo}/>
                ))
            }
            {!addTodoInputVisible && <Button type='primary' status='danger' shape='round' icon={<IconPlusCircle />} onClick={() => {
                setAddTodoInputVisible(true);
            }}>
                添加任务
            </Button>}
            {addTodoInputVisible && <TodoInput todo={{id: String(Math.random()), content: '', isDone: false}} cancelInput={() => {
                setAddTodoInputVisible(false);
            }} saveTodo={onAddTodo}/>}
            <Toaster />

        </div>
    );
}

export default TodoList;