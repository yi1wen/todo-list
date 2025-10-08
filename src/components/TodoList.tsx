
import styles from './TodoList.module.css';
import TodoItem, { TodoItemType } from './TodoItem';
import TodoInput from './TodoInput';
import { Button, Message } from '@arco-design/web-react';
import { useState } from 'react';
import { IconPlusCircle } from '@arco-design/web-react/icon';
import { mock } from '../mock';

function TodoList() {
    const [addTodoInputVisible, setAddTodoInputVisible] = useState(false);

    const [todos, setTodos] = useState<TodoItemType[]>(mock);
    const deleteTodo = (id: number) => {
        setTodos(todos.filter((todo) => todo.id !== id));
    }
    const editTodo = (todo: TodoItemType) => {
        setTodos(todos.map((t) => t.id === todo.id ? todo : t));
    }
    const onToggle = (id: number) => {
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
            {addTodoInputVisible && <TodoInput todo={{id: Math.random(), content: '', isDone: false}} cancelInput={() => {
                setAddTodoInputVisible(false);
            }} saveTodo={(todo: TodoItemType) => {
                setTodos([...todos, todo])
                setAddTodoInputVisible(false);
            }}/>}
        </div>
    );
}

export default TodoList;