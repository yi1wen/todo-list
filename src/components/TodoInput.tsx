import { Input, Card, Divider, Button } from '@arco-design/web-react';
import styles from './TodoInput.module.css';
import { useState } from 'react';
import { TodoItemType } from './TodoItem';
const TextArea = Input.TextArea;

function TodoInput({ todo, cancelInput, isEditing = false, saveTodo }: { todo?: TodoItemType; cancelInput: () => void; isEditing?: boolean; saveTodo: (todos: any) => void }) {
    const [inputContent, setInputContent] = useState(todo?.content || '');
    return (
    <Card className={styles.todoInput}>
        <div>
            <TextArea className={styles.textarea} placeholder="请输入待办事项" value={inputContent} onChange={setInputContent} />
            <Divider className={styles.divider} />
            <Button type='secondary' shape="round" onClick={cancelInput}>取消</Button>
            <Button status="danger" shape="round" onClick={() => {
                if(!isEditing && !inputContent.trim()) return;
                saveTodo({...todo, content: inputContent});
            }}>{isEditing ? '保存' : '添加'}</Button>
        </div>
    </Card>
    );
}

export default TodoInput;