import { CharacterProfile } from '../types';

export type MythicBestDungeonRun = {
    mythicLevel: number;
    numKeystoneUpgrades: number,
    completedAt: string;
}

export type DungeonDetails = {
    backgroundImageUrl: string;
    shortName: string;
    iconUrl: string;
}

export type DungeonsDetailsRecord = {
    [dungeon: string]: DungeonDetails
};

export type MythicBestDungeonRuns = {
    [character: string]: {
        [dungeon: string]: MythicBestDungeonRun;
    }
};

export type BestRunsAndDungeonData = {
    bestRunsPerDungeon: {
        [dungeon: string]: MythicBestDungeonRun;
    };

    dungeons: DungeonsDetailsRecord;
}

export function processRunsForCharacter(result: CharacterProfile): BestRunsAndDungeonData {
    const bestRuns = result.mythic_plus_best_runs;

    const bestRunsPerDungeon: BestRunsAndDungeonData['bestRunsPerDungeon'] = {};
    const dungeons: BestRunsAndDungeonData['dungeons'] = {};

    const data = {
        bestRunsPerDungeon,
        dungeons
    }

    if (bestRuns == null) {
        return data;
    }

    return bestRuns.reduce((acc, run): BestRunsAndDungeonData => {
        const {
            dungeon,
            mythic_level: mythicLevel,
            num_keystone_upgrades: numKeystoneUpgrades,
            completed_at,
            icon_url: iconUrl,
            short_name: shortName,
            background_image_url: backgroundImageUrl
        } = run;

        const completedAt = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'long' }).format(new Date(completed_at));

        acc.bestRunsPerDungeon[dungeon] = {
            mythicLevel,
            numKeystoneUpgrades,
            completedAt
        };

        acc.dungeons[dungeon] = {
            iconUrl,
            shortName,
            backgroundImageUrl
        };

        return acc;
    }, data as BestRunsAndDungeonData);
}
