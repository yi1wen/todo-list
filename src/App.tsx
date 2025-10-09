
import { Layout } from '@arco-design/web-react';
import "@arco-design/web-react/dist/css/arco.css";
import styles from './App.module.css';
import TodoList from './components/TodoList';
import "animate.css";
const Sider = Layout.Sider;
const Header = Layout.Header;
const Content = Layout.Content;

function App() {
    return (
        <div className={styles.App}>
            <Layout className={styles.layout}>
                <Header className={styles.header}>
                    <div>实时协作待办事项列表</div>
                </Header>
                <Layout>
                    {/* <Sider className={styles.sider}>Sider</Sider> */}
                    <Content>
                        <div className={styles.content}>
                            <TodoList />
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </div>
    );
}

export default App;
