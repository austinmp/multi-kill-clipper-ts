/* eslint-disable no-await-in-loop */
import CustomError from '../models/custom-error';
import LeagueClient from '../apis/league-client';
import { MultiKillClip } from '../models/multi-kill-clip';
import EventService from '../models/event-service';
import MultiKillMatch from '../models/multi-kill-match';
import MultiKill from '../models/multi-kill';
import Summoner from '../models/summoner';
import { getRiotId, truncatePatchVersion } from '../utils/utils';
import {
  MAX_MATCHES_PER_REQUEST,
  RANKED_FLEX_QUEUE_ID,
  RANKED_SOLO_QUEUE_ID,
} from '../constants';
import Replay from '../apis/replay';

class MultiKillClipperMain {
  multiKillMatches: MultiKillMatch[];

  multiKillTypes: number[];

  summoner: Summoner;

  loggedInSummoner: Summoner;

  replay: any;

  patch: string;

  constructor(
    summonerName: string,
    multiKillTypes: number[],
    loggedInSummoner: Summoner,
    tagline: any = '#NA1',
  ) {
    this.summoner = new Summoner(summonerName, tagline);
    this.multiKillTypes = multiKillTypes;
    this.multiKillMatches = [];
    this.subscribeToFrontEndEvents();
    this.patch = '';
    this.loggedInSummoner = loggedInSummoner;
  }

  async getMultiKills(): Promise<MultiKillMatch[]> {
    if (!(await this.summoner.isFound())) {
      throw new CustomError(
        `${this.summoner.riotId} was not found; verify the name and try again.`,
      );
    }

    const multiKillMatches = await this.getAllMultiKillMatchesOnCurrentPatch();
    if (!multiKillMatches.length) {
      throw new CustomError(
        `No multi-kill matches of the selected type were found on the current patch (${this.patch}).`,
      );
    }

    return multiKillMatches;
  }

  async getAllMultiKillMatchesOnCurrentPatch(): Promise<MultiKillMatch[]> {
    const rawPatch = await LeagueClient.getPatchVersion();
    const currentPatch = truncatePatchVersion(rawPatch);
    this.patch = currentPatch;
    const matchesOnCurrentPatch = [];
    const isSearchingSelf =
      getRiotId(
        this.loggedInSummoner.summonerName,
        this.loggedInSummoner.tagline,
      ) === this.summoner.riotId;

    let start = 0;
    let end = MAX_MATCHES_PER_REQUEST;
    let matchBatch = await LeagueClient.getMatchHistoryByPuuid(
      this.summoner.puuid,
      start,
      end,
    );
    let i = 0;
    let match = matchBatch[i];
    while (match) {
      const matchPatch = truncatePatchVersion(match.gameVersion);
      if (matchPatch !== currentPatch) {
        break;
      }

      /*
        You can only download other players RANKED GAME mode replays from the client.
        However, you can download your own replays from any game mode.
      */
      const isRankedGame =
        match.queueId === RANKED_SOLO_QUEUE_ID ||
        match.queueId === RANKED_FLEX_QUEUE_ID;
      if (
        MultiKillMatch.isMultiKillMatch(match, this.multiKillTypes) &&
        (isSearchingSelf || isRankedGame)
      ) {
        const multiKillMatch = new MultiKillMatch(match, this.multiKillTypes);
        matchesOnCurrentPatch.push(multiKillMatch);
      }

      i += 1;
      if (i >= MAX_MATCHES_PER_REQUEST) {
        start = end;
        end += MAX_MATCHES_PER_REQUEST;
        i = 0;
        matchBatch = await LeagueClient.getMatchHistoryByPuuid(
          this.summoner.puuid,
          start,
          end,
        );
      }
      match = matchBatch[i];
    }

    await Promise.all(
      matchesOnCurrentPatch.map((m: MultiKillMatch) => m.init()),
    );

    return matchesOnCurrentPatch;
  }

  async parseMatchDataForMatchesWithMultiKills(
    matchData: any,
    multiKillTypes: any,
  ) {
    const multiKillMatches = MultiKillMatch.filterMatchesByMultiKills(
      matchData.matchHistory,
      multiKillTypes,
    );
    if (multiKillMatches.length === 0) {
      throw new CustomError(
        `No multi-kill matches of the selected type were found on the current patch (${this.patch}).`,
      );
    }
    return multiKillMatches;
  }


  static async createMultiKillClip(
    multiKillMatch: MultiKillMatch,
    multiKill: MultiKill,
  ) {
    EventService.publish('clipProgress', 'Initializing replay download...');
    const highlightsFolderPath = await LeagueClient.getHighlightsFolderPath();
    const replay = new Replay();
    await LeagueClient.launchReplay(multiKillMatch.matchId);
    await replay.load(10, 10); // Add global vars
    await replay.init();
    const clip = new MultiKillClip(
      replay,
      multiKillMatch,
      multiKill,
      highlightsFolderPath,
    );
    await clip.createClip();
    await replay.exit();
  }

  setMultiKillMatches(multiKillTypes: any, matchList: any) {
    this.multiKillMatches = matchList;
    this.multiKillTypes = multiKillTypes;
  }

  subscribeToFrontEndEvents() {
    EventService.subscribe('cancelRequest', this.cancelRequestCallback);
  }

  async cancelRequestCallback() {
    await this.replay.exit();
  }

  sendProgressToFrontEnd(message: any) {
    EventService.publish('clipProgress', message);
  }
}

export default MultiKillClipperMain;
