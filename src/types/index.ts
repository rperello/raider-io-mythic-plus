export type ClassType =
  | 'Priest'
  | 'Warrior'
  | 'Mage'
  | 'Rogue'
  | 'Hunter'
  | 'Warlock'
  | 'Shaman'
  | 'Druid'
  | 'Paladin'
  | 'Demon Hunter'
  | 'Death Knight'
  | 'Monk'
  | 'Evoker';

export type PriestClassSpec = 'Holy' | 'Discipline' | 'Shadow';
export type WarriorClassSpec = 'Arms' | 'Fury' | 'Protection';
export type MageClassSpec = 'Fire' | 'Frost' | 'Arcane';
export type RogueClassSpec = 'Subtlety' | 'Outlaw' | 'Assassination';
export type HunterClassSpec = 'Beast Mastery' | 'Marksmanship' | 'Survival';
export type WarlockClassSpec = 'Affliction' | 'Demonology' | 'Destruction';
export type ShamanClassSpec = 'Elemental' | 'Enhancement' | 'Restoration';
export type DruidClassSpec = 'Restoration' | 'Balance' | 'Feral' | 'Guardian';
export type PaladinClassSpec = 'Protection' | 'Retribution' | 'Holy';
export type DemonHunterClassSpec = 'Vengeance' | 'Havoc';
export type DeathKnightClassSpec = 'Blood' | 'Unholy' | 'Frost';
export type MonkClassSpec = 'Windwalker' | 'Brewmaster' | 'Mistweaver';
export type EvokerClassSpec = 'Devastation' | 'Preservation' | 'Augmentation';

export type ClassSpec =
  | PriestClassSpec
  | WarriorClassSpec
  | MageClassSpec
  | RogueClassSpec
  | HunterClassSpec
  | WarlockClassSpec
  | ShamanClassSpec
  | DruidClassSpec
  | PaladinClassSpec
  | DemonHunterClassSpec
  | DeathKnightClassSpec
  | MonkClassSpec
  | EvokerClassSpec;

export type ClassRole = 'DPS' | 'TANK' | 'HEALING';
export type ClassFilter = ClassRole | 'ALL';

export type ScoreKey = 'all' | Lowercase<ClassRole> | 'spec_0' | 'spec_1' | 'spec_2' | 'spec_3';

export interface MythicPlusScoreInSeason {
    season: string;
    scores: Record<ScoreKey, number>;
    segments: Record<ScoreKey, { score: number; color: string }>;
}

export type MythicBestRun = {
  /**
   * @description Friendly name of Dungeon
   * @example Mists of Tirna Scithe
   */
  dungeon: string;
  /**
   * @description Shortened or abbreviated name of Dungeon
   * @example MISTS
   */
  short_name: string;
  /**
   * @description Mythic+ Level of the run
   * @example 10
   */
  mythic_level: number;
  /**
   * Format: date-time
   * @description When this run was completed
   * @example 2024-09-22T03:02:51.000Z
   */
  completed_at: string;
  /**
   * @description How long it took to complete the dungeon, in milliseconds
   * @example 1636548
   */
  clear_time_ms: number;
  /**
   * @description The par time for the dungeon, in milliseconds
   * @example 1800999
   */
  par_time_ms: number;
  /**
   * @description How many times the keystone used for this dungeon would have been upgraded after completion
   * @example 2
   */
  num_keystone_upgrades: number;
  /**
   * @description The map challenge mode ID for the dungeon
   * @example 375
   */
  map_challenge_mode_id: number;
  /**
   * @description The zone ID for the dungeon
   * @example 13334
   */
  zone_id: number;
  /**
   * @description The static expansion id for this particular dungeon.
   * @example 8
   */
  zone_expansion_id: number;
  /**
   * @description URL to the wow icon for this dungeon
   * @example https://cdn.raiderio.net/images/wow/icons/large/achievement_dungeon_mistsoftirnascithe.jpg
   */
  icon_url: string;
  /**
   * @description URL to the background image for this dungeon
   * @example https://cdn.raiderio.net/images/dungeons/expansion8/base/mists-of-tirna-scithe.jpg
   */
  background_image_url: string;
  /**
   * @description How many points this run was worth
   * @example 326.6
   */
  score: number;
  /**
   * @description URL to this specific run to view roster details
   * @example https://raider.io/mythic-plus-runs/season-tww-1/5376417-10-mists-of-tirna-scithe
   */
  url: string;
  affixes: Array<any>;
};

export interface CharacterProfile {
  name: string;
  race: string;
  class: ClassType;
  active_spec_name: ClassSpec;
  active_spec_role: ClassRole;
  gender: string;
  faction: 'horde' | 'alliance';
  achievement_points: number;
  thumbnail_url: string;
  region: Lowercase<Region>;
  realm: string;
  last_crawled_at: string;
  profile_url: string;
  profile_banner: string;
  mythic_plus_scores_by_season?: MythicPlusScoreInSeason[];
  mythic_plus_best_runs?: MythicBestRun[];
}

export type BasicCharacterProfile = Pick<CharacterProfile, 'name'> & Partial<Pick<CharacterProfile, 'realm'>> & { region?: string }; 

export type Region = 'CN' | 'EU' | 'KR' | 'TW' | 'US';
