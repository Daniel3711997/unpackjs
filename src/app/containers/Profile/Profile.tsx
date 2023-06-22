import { Photos } from 'app/components/Photos';
import { Todos } from 'app/components/Todos';

import styles from './StylesProfile.module.scss';

export const Profile = () => {
    return (
        <div>
            <p className={styles.black}>Hello World</p>

            <h2>Photos</h2>
            <Photos />

            <h2>Todos</h2>
            <Todos />
        </div>
    );
};
