
import styles from './TodoItem.module.css';
import { Divider, Button } from '@arco-design/web-react';
import { useState } from 'react';
import TodoInput from './TodoInput';
import 'animate.css';
import { IconEdit, IconDelete, IconCheck } from '@arco-design/web-react/icon';

export interface TodoItemType {
  id: string;
  content: string;
  isDone: boolean;
}
function TodoItem({ todo, onDelete, onEdit, onToggle }: { todo: TodoItemType; onDelete: (id: string) => void; onEdit: (todo: TodoItemType) => void; onToggle: (id: string) => void }) {
    const { id, content, isDone } = todo;
    const [isEditing, setIsEditing] = useState(false);
    return (
        <div>
            <div className='animate__animated animate__slideInLeft'>
                {!isEditing && <div className={styles.todoItem}>
                    <div className={styles.todoItemContent + ' ' + (isDone ? styles.todoItemContentDone : '')}>
                        <div className={styles.todoItemRadio + ' ' + (isDone ? styles.todoItemRadioDone : '')} onClick={() => {
                            onToggle(id);
                        }}>
                            {isDone ? <IconCheck /> : ''}
                        </div>
                        <div className={isDone ? styles.todoItemContentTextDone : styles.todoItemContentText}>{content}</div>
                    </div>
                
                    <div className={styles.listItemActions}>
                        <Button type='secondary' shape='circle' icon={<IconEdit />} onClick={() => {
                            setIsEditing(true);
                        }} />
                        <Button type='secondary' shape='circle' icon={<IconDelete />} onClick={() => {
                            onDelete(id);
                        }} />
                    </div>
                </div>}
                {isEditing && <TodoInput todo={todo} isEditing={true} cancelInput={() => {
                    setIsEditing(false);
                }} saveTodo={(todo: TodoItemType) => {
                    onEdit(todo);
                    setIsEditing(false);
                }} />}
            </div>
            
            <Divider />
        </div>
    );
}

export default TodoItem;