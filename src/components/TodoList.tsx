
import styles from './TodoList.module.css';
import TodoItem, { TodoItemType } from './TodoItem';
import TodoInput from './TodoInput';
import { Button } from '@arco-design/web-react';
import { useEffect, useState } from 'react';
import { IconPlusCircle } from '@arco-design/web-react/icon';
import TodoData from '../api/data-layer/index';
import { OperationType, STORAGE_KEYS } from '../api/data-layer/types';
import { useRef } from 'react';
const { getTodos,addTodo,editTodoContent } = TodoData;

function TodoList() {
    const [addTodoInputVisible, setAddTodoInputVisible] = useState(false);
    const isFirstRenderRef = useRef(false);

    useEffect(() => {
        if (!isFirstRenderRef.current) {
            isFirstRenderRef.current = true;
            return;
        }
        addTodo({
            action: OperationType.ADD,
            timestamp: Date.now(),
            data: {
                id: String(Math.random()),
                content: Math.random().toString(),
            }
        });
        const todos = getTodos();
        console.log('todos', todos);
        setTodos(todos);


        const handleStorageChange = (e: any) => {
            console.log('Storage event detected:', e);
            if (e[STORAGE_KEYS.TODOS]) {
                setTodos(JSON.parse(e[STORAGE_KEYS.TODOS]));
            }
        };

        window.addEventListener('setItemEvent' as any, handleStorageChange);
  
        return () => {
            window.removeEventListener('setItemEvent' as any, handleStorageChange);
        };
    }, []);

    const [todos, setTodos] = useState<TodoItemType[]>([]);

    const deleteTodo = (id: string) => {
        setTodos(todos.filter((todo) => todo.id !== id));
        deleteTodo(id);
    }
    const editTodo = (todo: TodoItemType) => {
        setTodos(todos.map((t) => t.id === todo.id ? todo : t));
        editTodoContent(todo.id, todo.content);
    }
    const onToggle = (id: string) => {
        setTodos(todos.map((todo) => todo.id === id ? {...todo, isDone: !todo.isDone} : todo));
        TodoData.toggleTodoStatus(id, todos.find((todo) => todo.id === id)?.isDone ? TodoData.TodoStatus.PENDING : TodoData.TodoStatus.COMPLETED);
    }

    return (
        <div className={styles.todoList}>
            {
                todos.map((todo, index) => (
                    <TodoItem key={todo.id} todo={todo} onDelete={deleteTodo} onEdit={editTodo} onToggle={onToggle}/>
                ))
            }
            {!addTodoInputVisible && <Button type='primary' status='danger' shape='round' icon={<IconPlusCircle />} onClick={() => {
                setAddTodoInputVisible(true);
            }}>
                添加任务
            </Button>}
            {addTodoInputVisible && <TodoInput todo={{id: String(Math.random()), content: '', isDone: false}} cancelInput={() => {
                setAddTodoInputVisible(false);
            }} saveTodo={(todo: TodoItemType) => {
                setTodos([...todos, todo])
                setAddTodoInputVisible(false);
            }}/>}
        </div>
    );
}

export default TodoList;