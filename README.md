# GenerateRuntypes

GenerateRuntypes is a codegen library for generating run-time validation schemas in typescript for the [runtypes](https://github.com/pelotom/runtypes) library.

It is capable of generating validation schemas from JSON or code (typescript or javascript). The input must be parse-able, otherwise the generator will choke or will probably produce incomplete schemas.

The output tries to be intuitive, but likely needs some massaging.

### try it out

``` 
curl -s https://pokeapi.co/api/v2/pokemon/bulbasaur | npx generateRuntypes | less
``` 

Will output:
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



The CLI accepts two arguments:

| Command | Description                |
|---------|----------------------------|
| --in    | A file to process          |
| --name  | Top-Level Schema To Export |

Due to the type resolution-strategy, the supplied name _may_ be overwritten.

If no file `--in` file is supplied, the node process will open an stdin socket which allows you to pipe sources into it.

All results are piped to `stdout` allowing you to redirect the output to a file or another process.


### Type-Resolution

The generator maintains a registry of all records that have been generated. If similar-shaped records are found, they're merged where differing properties are union-ed.

For example, for the following top-level object 

```json
{
  "hero": {
    "stats": {
      "hp": 100,
      "strength": 50
    }
  },
  "villian":{
    "stats": {
      "hp": 10,
      "strength": "potato"
    }
  }
}
```

Would result in the following schemas:

```typescript
import * as RT from "runtypes";

export const Stats = RT.Record({
  hp: RT.Number,
  strength: RT.Union(RT.Number, RT.String),
});
export type Stats = RT.Static<typeof Stats>;

export const Hero = RT.Record({
  stats: Stats,
});
export type Hero = RT.Static<typeof Hero>;

export const Schema = RT.Record({
  hero: Hero,
  villian: Hero,
});
export type Schema = RT.Static<typeof Schema>;
```

Down the road, it should be possible to select different merge strategies, in order to -- for example -- favor discriminated unions when possible.

