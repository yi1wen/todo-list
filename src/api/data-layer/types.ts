export enum TodoStatus {
  RUNNING = 'running', // 运行中
  COMPLETED = 'completed', // 已完成
  FAILED = 'failed', // 失败
  PENDING = 'pending', // 待处理
}

export enum OperationType {
  ADD = 'add', // 添加
  DELETE = 'delete', // 删除
  UPDATE = 'update', // 更新
  TOGGLE_STATUS = 'toggleStatus' // 切换状态
}

export interface OperationLog {
  action: OperationType;    // 操作类型
  timestamp: number;        // 操作时间戳
  data: {
    id: string;              // 操作项目ID
    content?: string;       // 内容(适用add/update)
    status?: TodoStatus;    // 状态(适用toggle)
  };
}

export interface TodoItem {
  id: string;
  content: string;
  isDone: boolean;
  status?: TodoStatus;
}

export interface TimeWindow {
  isOpen: boolean;          // 时间窗口是否打开
  operations: OperationLog[]; // 窗口内的所有操作
}

export interface ConflictInfo {
  message: string;
  conflictingOperations: OperationLog[];
  resolvedOperation: OperationLog;
}

export const STORAGE_KEYS = {
    TODOS: 'collaborative-todos',
    CONFLICTS: 'todo-conflicts',
    TIME_WINDOW: 'todo-time-window'
};

export const TIME_WINDOW_DURATION = 5000; 


