# GenerateRuntypes

GenerateRuntypes is a codegen library for generating run-time validation schemas in typescript for the [runtypes](https://github.com/pelotom/runtypes) library.

It is capable of generating validation schemas from JSON or code (typescript or javascript). The input must be parse-able, otherwise the generator will choke or will probably produce incomplete schemas.

The output tries to be intuitive, but likely needs some massaging.

### try it out

``` 
curl -s https://pokeapi.co/api/v2/pokemon/bulbasaur | npx generate-runtypes | less
``` 

<details>
  <summary>Outputs something like this</summary>
  ```typescript
   import * as RT from "runtypes";
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
  export const GameIndices = RT.Record({
    game_index: RT.Number,
    version: Ability,
  });
  export type GameIndices = RT.Static<typeof GameIndices>;
  export const VersionGroupDetails = RT.Record({
    level_learned_at: RT.Number,
    move_learn_method: Ability,
    version_group: Ability,
  });
  export type VersionGroupDetails = RT.Static<typeof VersionGroupDetails>;
  export const Moves = RT.Record({
    move: Ability,
    version_group_details: RT.Array(VersionGroupDetails),
  });
  export type Moves = RT.Static<typeof Moves>;
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
  export const Stats = RT.Record({
    base_stat: RT.Number,
    effort: RT.Number,
    stat: Ability,
  });
  export type Stats = RT.Static<typeof Stats>;
  export const Types = RT.Record({
    slot: RT.Number,
    type: Ability,
  });
  export type Types = RT.Static<typeof Types>;
  export const Pokeman = RT.Record({
    abilities: RT.Array(Abilities),
    base_experience: RT.Number,
    forms: RT.Array(Ability),
    game_indices: RT.Array(GameIndices),
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
  export type Pokeman = RT.Static<typeof Pokeman>;
  
  ```
</details>
