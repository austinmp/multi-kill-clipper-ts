import { Typography } from '@mui/material';
import styles from './multi-kill-clipper.module.css';
import Summoner from '../main/app/models/summoner';

type SummonerStatusProps = {
  loggedInSummoner: Summoner | null;
  isLoggedInSummonerLoading: boolean;
};
/*
  Component acting as a status indicator for whether the Multi Kill Clipper app is able to
  connect to the League Client. If we are connected, the current Summoner will be displayed.
*/
export default function SummonerStatus({
  loggedInSummoner,
  isLoggedInSummonerLoading,
}: SummonerStatusProps) {
  return (
    <div className={styles['logged-in-summoner-ctn']}>
      <div className={styles['logged-in-summoner']}>
        {loggedInSummoner && !isLoggedInSummonerLoading && (
          <>
            <div className={styles['summoner-name']}>
              {`⚔️ ${loggedInSummoner.summonerName}`}
            </div>
            <div>{`🟢 Connected - #${loggedInSummoner.tagline}`}</div>
          </>
        )}
        {!loggedInSummoner && !isLoggedInSummonerLoading && (
          <div>🔴 Not Connected</div>
        )}
        {isLoggedInSummonerLoading && <div>🟡 Connecting...</div>}
      </div>
    </div>
  );
}
