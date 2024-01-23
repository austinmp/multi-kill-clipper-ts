import Paper from '@mui/material/Paper';
import styles from './multi-kill-clipper.module.css';
import gwen from '../../assets/gwen.png';
import LoggedInSummoner from './SummonerStatus';
import Summoner from '../main/app/models/summoner';

type HeaderProps = {
  className?: string;
  loggedInSummoner: Summoner | null;
  isLoggedInSummonerLoading: boolean;
};

export default function Header({
  className,
  loggedInSummoner,
  isLoggedInSummonerLoading,
}: HeaderProps) {
  return (
    <Paper elevation={10} component="header" className={className} square>
      <div className={styles.headerInner}>
        <div className={styles['logo-ctn']}>
          <img className={styles['gwen-ctn']} src={gwen} alt="Gwen" />
          <div>Multi Kill Clipper</div>
        </div>
        <LoggedInSummoner
          loggedInSummoner={loggedInSummoner}
          isLoggedInSummonerLoading={isLoggedInSummonerLoading}
        />
      </div>
    </Paper>
  );
}
