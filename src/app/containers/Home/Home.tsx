import styles from './Home.module.scss';
import image from './image.jpg';

export const Home = () => {
    console.log(styles, image);

    return (
        <div>
            <p className={styles.black}>Hello World</p>
        </div>
    );
};
