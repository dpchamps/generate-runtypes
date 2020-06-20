import * as RT from 'runtypes' 
export const Types = RT.Record({
  slot: RT.Number,
  type: Ability,
});
export type Types = RT.Static<typeof Types>;
export const Stats = RT.Record({
  base_stat: RT.Number,
  effort: RT.Number,
  stat: Ability,
});
export type Stats = RT.Static<typeof Stats>;
export const Sprites = RT.Record({
  back_default: RT.String,
  back_female: RT.Null,
  back_shiny: RT.String,
  back_shiny_female: RT.Null,
  front_default: RT.String,
  front_female: RT.Null,
  front_shiny: RT.String,
  front_shiny_female: RT.Null,
});
export type Sprites = RT.Static<typeof Sprites>;
export const Version_group_details = RT.Record({
  level_learned_at: RT.Number,
  move_learn_method: Ability,
  version_group: Ability,
});
export type Version_group_details = RT.Static<typeof Version_group_details>;
export const Moves = RT.Record({
  move: Ability,
  version_group_details: RT.Array(Version_group_details),
});
export type Moves = RT.Static<typeof Moves>;
export const Game_indices = RT.Record({
  game_index: RT.Number,
  version: Ability,
});
export type Game_indices = RT.Static<typeof Game_indices>;
export const Ability = RT.Record({
  name: RT.String,
  url: RT.String,
});
export type Ability = RT.Static<typeof Ability>;
export const Abilities = RT.Record({
  ability: Ability,
  is_hidden: RT.Boolean,
  slot: RT.Number,
});
export type Abilities = RT.Static<typeof Abilities>;
export const JSONSchema = RT.Record({
  abilities: RT.Array(Abilities),
  base_experience: RT.Number,
  forms: RT.Array(Ability),
  game_indices: RT.Array(Game_indices),
  height: RT.Number,
  id: RT.Number,
  is_default: RT.Boolean,
  location_area_encounters: RT.String,
  moves: RT.Array(Moves),
  name: RT.String,
  order: RT.Number,
  species: Ability,
  sprites: Sprites,
  stats: RT.Array(Stats),
  types: RT.Array(Types),
  weight: RT.Number,
});
export type JSONSchema = RT.Static<typeof JSONSchema>;
