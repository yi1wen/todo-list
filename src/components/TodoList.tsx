
import styles from './TodoList.module.css';
import TodoItem, { TodoItemType } from './TodoItem';
import TodoInput from './TodoInput';
import { Button } from '@arco-design/web-react';
import { useEffect, useState } from 'react';
import { IconPlusCircle } from '@arco-design/web-react/icon';
import TodoData from '../api/data-layer/index';
import { OperationType } from '../api/data-layer/types';
import { STORAGE_KEYS } from '../api/data-layer/types';
const { getTodos, addTodo, listenStorage } = TodoData;

function TodoList() {
    const [addTodoInputVisible, setAddTodoInputVisible] = useState(false);

    useEffect(() => {
        
        addTodo({
            action: OperationType.ADD,
            timestamp: Date.now(),
            data: {
                id: String(Math.random()),
                content: '123',
            }
        });
        const todos = getTodos();
        console.log('todos', todos);
        setTodos(todos);

        const callBack = (key: string, value: unknown) => {
            console.log('listenStorage', key, value);
            if (key === STORAGE_KEYS.TODOS) {
                setTodos(value as TodoItemType[]);
            }
        }

        listenStorage(callBack);
    }, []);

    const [todos, setTodos] = useState<TodoItemType[]>([]);

    const deleteTodo = (id: string) => {
        setTodos(todos.filter((todo) => todo.id !== id));
    }
    const editTodo = (todo: TodoItemType) => {
        setTodos(todos.map((t) => t.id === todo.id ? todo : t));
    }

    const saveTodo = (todo: TodoItemType) => {
        setTodos(todos.map((t) => t.id === todo.id ? todo : t));
    }
    const onToggle = (id: string) => {
        setTodos(todos.map((todo) => todo.id === id ? {...todo, isDone: !todo.isDone} : todo));
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