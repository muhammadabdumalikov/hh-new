import knex, { Knex } from "knex";

export class KnexService {
  instance: Knex;

  constructor() {
    this.instance = knex({
      client: 'postgresql',
      connection: {
        host: 'localhost',
        database: 'hh',
        password: '4324',
        user: 'postgres',
      },
      pool: {
        min: 2,
        max: 20,
      },
    })
  }
}

// import knex, { Knex } from "knex";

// export class KnexService {
//   instance: Knex;

//   constructor() {
//     this.instance = knex({
//       client: 'postgresql',
//       connection: {
//         host: 'localhost',
//         database: 'hh',
//         password: 'a1Gd6UnQdz6W',
//         user: 'postgres',
//       },
//       pool: {
//         min: 2,
//         max: 75,
//       },
//     })
//   }
// }