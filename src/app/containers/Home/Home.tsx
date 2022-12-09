import styles from './Home.module.scss';

export const Home = () => {
    console.log(styles);

    return (
        <div>
            <p className={styles.black}>Hello World</p>
        </div>
    );
};
