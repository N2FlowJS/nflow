
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Flow
 * 
 */
export type Flow = $Result.DefaultSelection<Prisma.$FlowPayload>
/**
 * Model FlowExecution
 * 
 */
export type FlowExecution = $Result.DefaultSelection<Prisma.$FlowExecutionPayload>
/**
 * Model UserSecret
 * 
 */
export type UserSecret = $Result.DefaultSelection<Prisma.$UserSecretPayload>
/**
 * Model LLMProvider
 * 
 */
export type LLMProvider = $Result.DefaultSelection<Prisma.$LLMProviderPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.flow`: Exposes CRUD operations for the **Flow** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Flows
    * const flows = await prisma.flow.findMany()
    * ```
    */
  get flow(): Prisma.FlowDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.flowExecution`: Exposes CRUD operations for the **FlowExecution** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FlowExecutions
    * const flowExecutions = await prisma.flowExecution.findMany()
    * ```
    */
  get flowExecution(): Prisma.FlowExecutionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userSecret`: Exposes CRUD operations for the **UserSecret** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserSecrets
    * const userSecrets = await prisma.userSecret.findMany()
    * ```
    */
  get userSecret(): Prisma.UserSecretDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.lLMProvider`: Exposes CRUD operations for the **LLMProvider** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LLMProviders
    * const lLMProviders = await prisma.lLMProvider.findMany()
    * ```
    */
  get lLMProvider(): Prisma.LLMProviderDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.7.0
   * Query Engine version: 75cbdc1eb7150937890ad5465d861175c6624711
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Flow: 'Flow',
    FlowExecution: 'FlowExecution',
    UserSecret: 'UserSecret',
    LLMProvider: 'LLMProvider'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "flow" | "flowExecution" | "userSecret" | "lLMProvider"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Flow: {
        payload: Prisma.$FlowPayload<ExtArgs>
        fields: Prisma.FlowFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FlowFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FlowFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowPayload>
          }
          findFirst: {
            args: Prisma.FlowFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FlowFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowPayload>
          }
          findMany: {
            args: Prisma.FlowFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowPayload>[]
          }
          create: {
            args: Prisma.FlowCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowPayload>
          }
          createMany: {
            args: Prisma.FlowCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FlowCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowPayload>[]
          }
          delete: {
            args: Prisma.FlowDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowPayload>
          }
          update: {
            args: Prisma.FlowUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowPayload>
          }
          deleteMany: {
            args: Prisma.FlowDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FlowUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FlowUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowPayload>[]
          }
          upsert: {
            args: Prisma.FlowUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowPayload>
          }
          aggregate: {
            args: Prisma.FlowAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFlow>
          }
          groupBy: {
            args: Prisma.FlowGroupByArgs<ExtArgs>
            result: $Utils.Optional<FlowGroupByOutputType>[]
          }
          count: {
            args: Prisma.FlowCountArgs<ExtArgs>
            result: $Utils.Optional<FlowCountAggregateOutputType> | number
          }
        }
      }
      FlowExecution: {
        payload: Prisma.$FlowExecutionPayload<ExtArgs>
        fields: Prisma.FlowExecutionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FlowExecutionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowExecutionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FlowExecutionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowExecutionPayload>
          }
          findFirst: {
            args: Prisma.FlowExecutionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowExecutionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FlowExecutionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowExecutionPayload>
          }
          findMany: {
            args: Prisma.FlowExecutionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowExecutionPayload>[]
          }
          create: {
            args: Prisma.FlowExecutionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowExecutionPayload>
          }
          createMany: {
            args: Prisma.FlowExecutionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FlowExecutionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowExecutionPayload>[]
          }
          delete: {
            args: Prisma.FlowExecutionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowExecutionPayload>
          }
          update: {
            args: Prisma.FlowExecutionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowExecutionPayload>
          }
          deleteMany: {
            args: Prisma.FlowExecutionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FlowExecutionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FlowExecutionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowExecutionPayload>[]
          }
          upsert: {
            args: Prisma.FlowExecutionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FlowExecutionPayload>
          }
          aggregate: {
            args: Prisma.FlowExecutionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFlowExecution>
          }
          groupBy: {
            args: Prisma.FlowExecutionGroupByArgs<ExtArgs>
            result: $Utils.Optional<FlowExecutionGroupByOutputType>[]
          }
          count: {
            args: Prisma.FlowExecutionCountArgs<ExtArgs>
            result: $Utils.Optional<FlowExecutionCountAggregateOutputType> | number
          }
        }
      }
      UserSecret: {
        payload: Prisma.$UserSecretPayload<ExtArgs>
        fields: Prisma.UserSecretFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserSecretFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecretPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserSecretFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecretPayload>
          }
          findFirst: {
            args: Prisma.UserSecretFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecretPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserSecretFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecretPayload>
          }
          findMany: {
            args: Prisma.UserSecretFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecretPayload>[]
          }
          create: {
            args: Prisma.UserSecretCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecretPayload>
          }
          createMany: {
            args: Prisma.UserSecretCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserSecretCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecretPayload>[]
          }
          delete: {
            args: Prisma.UserSecretDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecretPayload>
          }
          update: {
            args: Prisma.UserSecretUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecretPayload>
          }
          deleteMany: {
            args: Prisma.UserSecretDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserSecretUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserSecretUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecretPayload>[]
          }
          upsert: {
            args: Prisma.UserSecretUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSecretPayload>
          }
          aggregate: {
            args: Prisma.UserSecretAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserSecret>
          }
          groupBy: {
            args: Prisma.UserSecretGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserSecretGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserSecretCountArgs<ExtArgs>
            result: $Utils.Optional<UserSecretCountAggregateOutputType> | number
          }
        }
      }
      LLMProvider: {
        payload: Prisma.$LLMProviderPayload<ExtArgs>
        fields: Prisma.LLMProviderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LLMProviderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LLMProviderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>
          }
          findFirst: {
            args: Prisma.LLMProviderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LLMProviderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>
          }
          findMany: {
            args: Prisma.LLMProviderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>[]
          }
          create: {
            args: Prisma.LLMProviderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>
          }
          createMany: {
            args: Prisma.LLMProviderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LLMProviderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>[]
          }
          delete: {
            args: Prisma.LLMProviderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>
          }
          update: {
            args: Prisma.LLMProviderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>
          }
          deleteMany: {
            args: Prisma.LLMProviderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LLMProviderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LLMProviderUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>[]
          }
          upsert: {
            args: Prisma.LLMProviderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMProviderPayload>
          }
          aggregate: {
            args: Prisma.LLMProviderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLLMProvider>
          }
          groupBy: {
            args: Prisma.LLMProviderGroupByArgs<ExtArgs>
            result: $Utils.Optional<LLMProviderGroupByOutputType>[]
          }
          count: {
            args: Prisma.LLMProviderCountArgs<ExtArgs>
            result: $Utils.Optional<LLMProviderCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    flow?: FlowOmit
    flowExecution?: FlowExecutionOmit
    userSecret?: UserSecretOmit
    lLMProvider?: LLMProviderOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    flows: number
    secrets: number
    providers: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    flows?: boolean | UserCountOutputTypeCountFlowsArgs
    secrets?: boolean | UserCountOutputTypeCountSecretsArgs
    providers?: boolean | UserCountOutputTypeCountProvidersArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountFlowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FlowWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSecretsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserSecretWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountProvidersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LLMProviderWhereInput
  }


  /**
   * Count Type FlowCountOutputType
   */

  export type FlowCountOutputType = {
    executions: number
  }

  export type FlowCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    executions?: boolean | FlowCountOutputTypeCountExecutionsArgs
  }

  // Custom InputTypes
  /**
   * FlowCountOutputType without action
   */
  export type FlowCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowCountOutputType
     */
    select?: FlowCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * FlowCountOutputType without action
   */
  export type FlowCountOutputTypeCountExecutionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FlowExecutionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    username: string | null
    password: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    username: string | null
    password: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    username: number
    password: number
    name: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    username?: true
    password?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    username?: true
    password?: true
    name?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    username?: true
    password?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    username: string
    password: string
    name: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    username?: boolean
    password?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    flows?: boolean | User$flowsArgs<ExtArgs>
    secrets?: boolean | User$secretsArgs<ExtArgs>
    providers?: boolean | User$providersArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    username?: boolean
    password?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    username?: boolean
    password?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    username?: boolean
    password?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "username" | "password" | "name" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    flows?: boolean | User$flowsArgs<ExtArgs>
    secrets?: boolean | User$secretsArgs<ExtArgs>
    providers?: boolean | User$providersArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      flows: Prisma.$FlowPayload<ExtArgs>[]
      secrets: Prisma.$UserSecretPayload<ExtArgs>[]
      providers: Prisma.$LLMProviderPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      username: string
      password: string
      name: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    flows<T extends User$flowsArgs<ExtArgs> = {}>(args?: Subset<T, User$flowsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FlowPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    secrets<T extends User$secretsArgs<ExtArgs> = {}>(args?: Subset<T, User$secretsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSecretPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    providers<T extends User$providersArgs<ExtArgs> = {}>(args?: Subset<T, User$providersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.flows
   */
  export type User$flowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Flow
     */
    select?: FlowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Flow
     */
    omit?: FlowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowInclude<ExtArgs> | null
    where?: FlowWhereInput
    orderBy?: FlowOrderByWithRelationInput | FlowOrderByWithRelationInput[]
    cursor?: FlowWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FlowScalarFieldEnum | FlowScalarFieldEnum[]
  }

  /**
   * User.secrets
   */
  export type User$secretsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecret
     */
    select?: UserSecretSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSecret
     */
    omit?: UserSecretOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecretInclude<ExtArgs> | null
    where?: UserSecretWhereInput
    orderBy?: UserSecretOrderByWithRelationInput | UserSecretOrderByWithRelationInput[]
    cursor?: UserSecretWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserSecretScalarFieldEnum | UserSecretScalarFieldEnum[]
  }

  /**
   * User.providers
   */
  export type User$providersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    where?: LLMProviderWhereInput
    orderBy?: LLMProviderOrderByWithRelationInput | LLMProviderOrderByWithRelationInput[]
    cursor?: LLMProviderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LLMProviderScalarFieldEnum | LLMProviderScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Flow
   */

  export type AggregateFlow = {
    _count: FlowCountAggregateOutputType | null
    _min: FlowMinAggregateOutputType | null
    _max: FlowMaxAggregateOutputType | null
  }

  export type FlowMinAggregateOutputType = {
    id: string | null
    name: string | null
    data: string | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FlowMaxAggregateOutputType = {
    id: string | null
    name: string | null
    data: string | null
    userId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FlowCountAggregateOutputType = {
    id: number
    name: number
    data: number
    userId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FlowMinAggregateInputType = {
    id?: true
    name?: true
    data?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FlowMaxAggregateInputType = {
    id?: true
    name?: true
    data?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FlowCountAggregateInputType = {
    id?: true
    name?: true
    data?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FlowAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Flow to aggregate.
     */
    where?: FlowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Flows to fetch.
     */
    orderBy?: FlowOrderByWithRelationInput | FlowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FlowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Flows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Flows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Flows
    **/
    _count?: true | FlowCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FlowMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FlowMaxAggregateInputType
  }

  export type GetFlowAggregateType<T extends FlowAggregateArgs> = {
        [P in keyof T & keyof AggregateFlow]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFlow[P]>
      : GetScalarType<T[P], AggregateFlow[P]>
  }




  export type FlowGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FlowWhereInput
    orderBy?: FlowOrderByWithAggregationInput | FlowOrderByWithAggregationInput[]
    by: FlowScalarFieldEnum[] | FlowScalarFieldEnum
    having?: FlowScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FlowCountAggregateInputType | true
    _min?: FlowMinAggregateInputType
    _max?: FlowMaxAggregateInputType
  }

  export type FlowGroupByOutputType = {
    id: string
    name: string
    data: string
    userId: string
    createdAt: Date
    updatedAt: Date
    _count: FlowCountAggregateOutputType | null
    _min: FlowMinAggregateOutputType | null
    _max: FlowMaxAggregateOutputType | null
  }

  type GetFlowGroupByPayload<T extends FlowGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FlowGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FlowGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FlowGroupByOutputType[P]>
            : GetScalarType<T[P], FlowGroupByOutputType[P]>
        }
      >
    >


  export type FlowSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    data?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    executions?: boolean | Flow$executionsArgs<ExtArgs>
    _count?: boolean | FlowCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["flow"]>

  export type FlowSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    data?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["flow"]>

  export type FlowSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    data?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["flow"]>

  export type FlowSelectScalar = {
    id?: boolean
    name?: boolean
    data?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FlowOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "data" | "userId" | "createdAt" | "updatedAt", ExtArgs["result"]["flow"]>
  export type FlowInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    executions?: boolean | Flow$executionsArgs<ExtArgs>
    _count?: boolean | FlowCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type FlowIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type FlowIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $FlowPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Flow"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      executions: Prisma.$FlowExecutionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      data: string
      userId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["flow"]>
    composites: {}
  }

  type FlowGetPayload<S extends boolean | null | undefined | FlowDefaultArgs> = $Result.GetResult<Prisma.$FlowPayload, S>

  type FlowCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FlowFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FlowCountAggregateInputType | true
    }

  export interface FlowDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Flow'], meta: { name: 'Flow' } }
    /**
     * Find zero or one Flow that matches the filter.
     * @param {FlowFindUniqueArgs} args - Arguments to find a Flow
     * @example
     * // Get one Flow
     * const flow = await prisma.flow.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FlowFindUniqueArgs>(args: SelectSubset<T, FlowFindUniqueArgs<ExtArgs>>): Prisma__FlowClient<$Result.GetResult<Prisma.$FlowPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Flow that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FlowFindUniqueOrThrowArgs} args - Arguments to find a Flow
     * @example
     * // Get one Flow
     * const flow = await prisma.flow.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FlowFindUniqueOrThrowArgs>(args: SelectSubset<T, FlowFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FlowClient<$Result.GetResult<Prisma.$FlowPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Flow that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowFindFirstArgs} args - Arguments to find a Flow
     * @example
     * // Get one Flow
     * const flow = await prisma.flow.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FlowFindFirstArgs>(args?: SelectSubset<T, FlowFindFirstArgs<ExtArgs>>): Prisma__FlowClient<$Result.GetResult<Prisma.$FlowPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Flow that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowFindFirstOrThrowArgs} args - Arguments to find a Flow
     * @example
     * // Get one Flow
     * const flow = await prisma.flow.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FlowFindFirstOrThrowArgs>(args?: SelectSubset<T, FlowFindFirstOrThrowArgs<ExtArgs>>): Prisma__FlowClient<$Result.GetResult<Prisma.$FlowPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Flows that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Flows
     * const flows = await prisma.flow.findMany()
     * 
     * // Get first 10 Flows
     * const flows = await prisma.flow.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const flowWithIdOnly = await prisma.flow.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FlowFindManyArgs>(args?: SelectSubset<T, FlowFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FlowPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Flow.
     * @param {FlowCreateArgs} args - Arguments to create a Flow.
     * @example
     * // Create one Flow
     * const Flow = await prisma.flow.create({
     *   data: {
     *     // ... data to create a Flow
     *   }
     * })
     * 
     */
    create<T extends FlowCreateArgs>(args: SelectSubset<T, FlowCreateArgs<ExtArgs>>): Prisma__FlowClient<$Result.GetResult<Prisma.$FlowPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Flows.
     * @param {FlowCreateManyArgs} args - Arguments to create many Flows.
     * @example
     * // Create many Flows
     * const flow = await prisma.flow.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FlowCreateManyArgs>(args?: SelectSubset<T, FlowCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Flows and returns the data saved in the database.
     * @param {FlowCreateManyAndReturnArgs} args - Arguments to create many Flows.
     * @example
     * // Create many Flows
     * const flow = await prisma.flow.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Flows and only return the `id`
     * const flowWithIdOnly = await prisma.flow.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FlowCreateManyAndReturnArgs>(args?: SelectSubset<T, FlowCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FlowPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Flow.
     * @param {FlowDeleteArgs} args - Arguments to delete one Flow.
     * @example
     * // Delete one Flow
     * const Flow = await prisma.flow.delete({
     *   where: {
     *     // ... filter to delete one Flow
     *   }
     * })
     * 
     */
    delete<T extends FlowDeleteArgs>(args: SelectSubset<T, FlowDeleteArgs<ExtArgs>>): Prisma__FlowClient<$Result.GetResult<Prisma.$FlowPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Flow.
     * @param {FlowUpdateArgs} args - Arguments to update one Flow.
     * @example
     * // Update one Flow
     * const flow = await prisma.flow.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FlowUpdateArgs>(args: SelectSubset<T, FlowUpdateArgs<ExtArgs>>): Prisma__FlowClient<$Result.GetResult<Prisma.$FlowPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Flows.
     * @param {FlowDeleteManyArgs} args - Arguments to filter Flows to delete.
     * @example
     * // Delete a few Flows
     * const { count } = await prisma.flow.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FlowDeleteManyArgs>(args?: SelectSubset<T, FlowDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Flows.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Flows
     * const flow = await prisma.flow.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FlowUpdateManyArgs>(args: SelectSubset<T, FlowUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Flows and returns the data updated in the database.
     * @param {FlowUpdateManyAndReturnArgs} args - Arguments to update many Flows.
     * @example
     * // Update many Flows
     * const flow = await prisma.flow.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Flows and only return the `id`
     * const flowWithIdOnly = await prisma.flow.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FlowUpdateManyAndReturnArgs>(args: SelectSubset<T, FlowUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FlowPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Flow.
     * @param {FlowUpsertArgs} args - Arguments to update or create a Flow.
     * @example
     * // Update or create a Flow
     * const flow = await prisma.flow.upsert({
     *   create: {
     *     // ... data to create a Flow
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Flow we want to update
     *   }
     * })
     */
    upsert<T extends FlowUpsertArgs>(args: SelectSubset<T, FlowUpsertArgs<ExtArgs>>): Prisma__FlowClient<$Result.GetResult<Prisma.$FlowPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Flows.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowCountArgs} args - Arguments to filter Flows to count.
     * @example
     * // Count the number of Flows
     * const count = await prisma.flow.count({
     *   where: {
     *     // ... the filter for the Flows we want to count
     *   }
     * })
    **/
    count<T extends FlowCountArgs>(
      args?: Subset<T, FlowCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FlowCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Flow.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FlowAggregateArgs>(args: Subset<T, FlowAggregateArgs>): Prisma.PrismaPromise<GetFlowAggregateType<T>>

    /**
     * Group by Flow.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FlowGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FlowGroupByArgs['orderBy'] }
        : { orderBy?: FlowGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FlowGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFlowGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Flow model
   */
  readonly fields: FlowFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Flow.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FlowClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    executions<T extends Flow$executionsArgs<ExtArgs> = {}>(args?: Subset<T, Flow$executionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FlowExecutionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Flow model
   */
  interface FlowFieldRefs {
    readonly id: FieldRef<"Flow", 'String'>
    readonly name: FieldRef<"Flow", 'String'>
    readonly data: FieldRef<"Flow", 'String'>
    readonly userId: FieldRef<"Flow", 'String'>
    readonly createdAt: FieldRef<"Flow", 'DateTime'>
    readonly updatedAt: FieldRef<"Flow", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Flow findUnique
   */
  export type FlowFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Flow
     */
    select?: FlowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Flow
     */
    omit?: FlowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowInclude<ExtArgs> | null
    /**
     * Filter, which Flow to fetch.
     */
    where: FlowWhereUniqueInput
  }

  /**
   * Flow findUniqueOrThrow
   */
  export type FlowFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Flow
     */
    select?: FlowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Flow
     */
    omit?: FlowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowInclude<ExtArgs> | null
    /**
     * Filter, which Flow to fetch.
     */
    where: FlowWhereUniqueInput
  }

  /**
   * Flow findFirst
   */
  export type FlowFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Flow
     */
    select?: FlowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Flow
     */
    omit?: FlowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowInclude<ExtArgs> | null
    /**
     * Filter, which Flow to fetch.
     */
    where?: FlowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Flows to fetch.
     */
    orderBy?: FlowOrderByWithRelationInput | FlowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Flows.
     */
    cursor?: FlowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Flows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Flows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Flows.
     */
    distinct?: FlowScalarFieldEnum | FlowScalarFieldEnum[]
  }

  /**
   * Flow findFirstOrThrow
   */
  export type FlowFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Flow
     */
    select?: FlowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Flow
     */
    omit?: FlowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowInclude<ExtArgs> | null
    /**
     * Filter, which Flow to fetch.
     */
    where?: FlowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Flows to fetch.
     */
    orderBy?: FlowOrderByWithRelationInput | FlowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Flows.
     */
    cursor?: FlowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Flows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Flows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Flows.
     */
    distinct?: FlowScalarFieldEnum | FlowScalarFieldEnum[]
  }

  /**
   * Flow findMany
   */
  export type FlowFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Flow
     */
    select?: FlowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Flow
     */
    omit?: FlowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowInclude<ExtArgs> | null
    /**
     * Filter, which Flows to fetch.
     */
    where?: FlowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Flows to fetch.
     */
    orderBy?: FlowOrderByWithRelationInput | FlowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Flows.
     */
    cursor?: FlowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Flows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Flows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Flows.
     */
    distinct?: FlowScalarFieldEnum | FlowScalarFieldEnum[]
  }

  /**
   * Flow create
   */
  export type FlowCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Flow
     */
    select?: FlowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Flow
     */
    omit?: FlowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowInclude<ExtArgs> | null
    /**
     * The data needed to create a Flow.
     */
    data: XOR<FlowCreateInput, FlowUncheckedCreateInput>
  }

  /**
   * Flow createMany
   */
  export type FlowCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Flows.
     */
    data: FlowCreateManyInput | FlowCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Flow createManyAndReturn
   */
  export type FlowCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Flow
     */
    select?: FlowSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Flow
     */
    omit?: FlowOmit<ExtArgs> | null
    /**
     * The data used to create many Flows.
     */
    data: FlowCreateManyInput | FlowCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Flow update
   */
  export type FlowUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Flow
     */
    select?: FlowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Flow
     */
    omit?: FlowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowInclude<ExtArgs> | null
    /**
     * The data needed to update a Flow.
     */
    data: XOR<FlowUpdateInput, FlowUncheckedUpdateInput>
    /**
     * Choose, which Flow to update.
     */
    where: FlowWhereUniqueInput
  }

  /**
   * Flow updateMany
   */
  export type FlowUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Flows.
     */
    data: XOR<FlowUpdateManyMutationInput, FlowUncheckedUpdateManyInput>
    /**
     * Filter which Flows to update
     */
    where?: FlowWhereInput
    /**
     * Limit how many Flows to update.
     */
    limit?: number
  }

  /**
   * Flow updateManyAndReturn
   */
  export type FlowUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Flow
     */
    select?: FlowSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Flow
     */
    omit?: FlowOmit<ExtArgs> | null
    /**
     * The data used to update Flows.
     */
    data: XOR<FlowUpdateManyMutationInput, FlowUncheckedUpdateManyInput>
    /**
     * Filter which Flows to update
     */
    where?: FlowWhereInput
    /**
     * Limit how many Flows to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Flow upsert
   */
  export type FlowUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Flow
     */
    select?: FlowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Flow
     */
    omit?: FlowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowInclude<ExtArgs> | null
    /**
     * The filter to search for the Flow to update in case it exists.
     */
    where: FlowWhereUniqueInput
    /**
     * In case the Flow found by the `where` argument doesn't exist, create a new Flow with this data.
     */
    create: XOR<FlowCreateInput, FlowUncheckedCreateInput>
    /**
     * In case the Flow was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FlowUpdateInput, FlowUncheckedUpdateInput>
  }

  /**
   * Flow delete
   */
  export type FlowDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Flow
     */
    select?: FlowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Flow
     */
    omit?: FlowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowInclude<ExtArgs> | null
    /**
     * Filter which Flow to delete.
     */
    where: FlowWhereUniqueInput
  }

  /**
   * Flow deleteMany
   */
  export type FlowDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Flows to delete
     */
    where?: FlowWhereInput
    /**
     * Limit how many Flows to delete.
     */
    limit?: number
  }

  /**
   * Flow.executions
   */
  export type Flow$executionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowExecution
     */
    select?: FlowExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FlowExecution
     */
    omit?: FlowExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowExecutionInclude<ExtArgs> | null
    where?: FlowExecutionWhereInput
    orderBy?: FlowExecutionOrderByWithRelationInput | FlowExecutionOrderByWithRelationInput[]
    cursor?: FlowExecutionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FlowExecutionScalarFieldEnum | FlowExecutionScalarFieldEnum[]
  }

  /**
   * Flow without action
   */
  export type FlowDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Flow
     */
    select?: FlowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Flow
     */
    omit?: FlowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowInclude<ExtArgs> | null
  }


  /**
   * Model FlowExecution
   */

  export type AggregateFlowExecution = {
    _count: FlowExecutionCountAggregateOutputType | null
    _min: FlowExecutionMinAggregateOutputType | null
    _max: FlowExecutionMaxAggregateOutputType | null
  }

  export type FlowExecutionMinAggregateOutputType = {
    id: string | null
    flowId: string | null
    status: string | null
    input: string | null
    output: string | null
    error: string | null
    startedAt: Date | null
    endedAt: Date | null
    createdAt: Date | null
  }

  export type FlowExecutionMaxAggregateOutputType = {
    id: string | null
    flowId: string | null
    status: string | null
    input: string | null
    output: string | null
    error: string | null
    startedAt: Date | null
    endedAt: Date | null
    createdAt: Date | null
  }

  export type FlowExecutionCountAggregateOutputType = {
    id: number
    flowId: number
    status: number
    input: number
    output: number
    error: number
    startedAt: number
    endedAt: number
    createdAt: number
    _all: number
  }


  export type FlowExecutionMinAggregateInputType = {
    id?: true
    flowId?: true
    status?: true
    input?: true
    output?: true
    error?: true
    startedAt?: true
    endedAt?: true
    createdAt?: true
  }

  export type FlowExecutionMaxAggregateInputType = {
    id?: true
    flowId?: true
    status?: true
    input?: true
    output?: true
    error?: true
    startedAt?: true
    endedAt?: true
    createdAt?: true
  }

  export type FlowExecutionCountAggregateInputType = {
    id?: true
    flowId?: true
    status?: true
    input?: true
    output?: true
    error?: true
    startedAt?: true
    endedAt?: true
    createdAt?: true
    _all?: true
  }

  export type FlowExecutionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FlowExecution to aggregate.
     */
    where?: FlowExecutionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FlowExecutions to fetch.
     */
    orderBy?: FlowExecutionOrderByWithRelationInput | FlowExecutionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FlowExecutionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FlowExecutions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FlowExecutions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FlowExecutions
    **/
    _count?: true | FlowExecutionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FlowExecutionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FlowExecutionMaxAggregateInputType
  }

  export type GetFlowExecutionAggregateType<T extends FlowExecutionAggregateArgs> = {
        [P in keyof T & keyof AggregateFlowExecution]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFlowExecution[P]>
      : GetScalarType<T[P], AggregateFlowExecution[P]>
  }




  export type FlowExecutionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FlowExecutionWhereInput
    orderBy?: FlowExecutionOrderByWithAggregationInput | FlowExecutionOrderByWithAggregationInput[]
    by: FlowExecutionScalarFieldEnum[] | FlowExecutionScalarFieldEnum
    having?: FlowExecutionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FlowExecutionCountAggregateInputType | true
    _min?: FlowExecutionMinAggregateInputType
    _max?: FlowExecutionMaxAggregateInputType
  }

  export type FlowExecutionGroupByOutputType = {
    id: string
    flowId: string
    status: string
    input: string | null
    output: string | null
    error: string | null
    startedAt: Date | null
    endedAt: Date | null
    createdAt: Date
    _count: FlowExecutionCountAggregateOutputType | null
    _min: FlowExecutionMinAggregateOutputType | null
    _max: FlowExecutionMaxAggregateOutputType | null
  }

  type GetFlowExecutionGroupByPayload<T extends FlowExecutionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FlowExecutionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FlowExecutionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FlowExecutionGroupByOutputType[P]>
            : GetScalarType<T[P], FlowExecutionGroupByOutputType[P]>
        }
      >
    >


  export type FlowExecutionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    flowId?: boolean
    status?: boolean
    input?: boolean
    output?: boolean
    error?: boolean
    startedAt?: boolean
    endedAt?: boolean
    createdAt?: boolean
    flow?: boolean | FlowDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["flowExecution"]>

  export type FlowExecutionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    flowId?: boolean
    status?: boolean
    input?: boolean
    output?: boolean
    error?: boolean
    startedAt?: boolean
    endedAt?: boolean
    createdAt?: boolean
    flow?: boolean | FlowDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["flowExecution"]>

  export type FlowExecutionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    flowId?: boolean
    status?: boolean
    input?: boolean
    output?: boolean
    error?: boolean
    startedAt?: boolean
    endedAt?: boolean
    createdAt?: boolean
    flow?: boolean | FlowDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["flowExecution"]>

  export type FlowExecutionSelectScalar = {
    id?: boolean
    flowId?: boolean
    status?: boolean
    input?: boolean
    output?: boolean
    error?: boolean
    startedAt?: boolean
    endedAt?: boolean
    createdAt?: boolean
  }

  export type FlowExecutionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "flowId" | "status" | "input" | "output" | "error" | "startedAt" | "endedAt" | "createdAt", ExtArgs["result"]["flowExecution"]>
  export type FlowExecutionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    flow?: boolean | FlowDefaultArgs<ExtArgs>
  }
  export type FlowExecutionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    flow?: boolean | FlowDefaultArgs<ExtArgs>
  }
  export type FlowExecutionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    flow?: boolean | FlowDefaultArgs<ExtArgs>
  }

  export type $FlowExecutionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FlowExecution"
    objects: {
      flow: Prisma.$FlowPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      flowId: string
      status: string
      input: string | null
      output: string | null
      error: string | null
      startedAt: Date | null
      endedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["flowExecution"]>
    composites: {}
  }

  type FlowExecutionGetPayload<S extends boolean | null | undefined | FlowExecutionDefaultArgs> = $Result.GetResult<Prisma.$FlowExecutionPayload, S>

  type FlowExecutionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FlowExecutionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FlowExecutionCountAggregateInputType | true
    }

  export interface FlowExecutionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FlowExecution'], meta: { name: 'FlowExecution' } }
    /**
     * Find zero or one FlowExecution that matches the filter.
     * @param {FlowExecutionFindUniqueArgs} args - Arguments to find a FlowExecution
     * @example
     * // Get one FlowExecution
     * const flowExecution = await prisma.flowExecution.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FlowExecutionFindUniqueArgs>(args: SelectSubset<T, FlowExecutionFindUniqueArgs<ExtArgs>>): Prisma__FlowExecutionClient<$Result.GetResult<Prisma.$FlowExecutionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one FlowExecution that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FlowExecutionFindUniqueOrThrowArgs} args - Arguments to find a FlowExecution
     * @example
     * // Get one FlowExecution
     * const flowExecution = await prisma.flowExecution.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FlowExecutionFindUniqueOrThrowArgs>(args: SelectSubset<T, FlowExecutionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FlowExecutionClient<$Result.GetResult<Prisma.$FlowExecutionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FlowExecution that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowExecutionFindFirstArgs} args - Arguments to find a FlowExecution
     * @example
     * // Get one FlowExecution
     * const flowExecution = await prisma.flowExecution.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FlowExecutionFindFirstArgs>(args?: SelectSubset<T, FlowExecutionFindFirstArgs<ExtArgs>>): Prisma__FlowExecutionClient<$Result.GetResult<Prisma.$FlowExecutionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FlowExecution that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowExecutionFindFirstOrThrowArgs} args - Arguments to find a FlowExecution
     * @example
     * // Get one FlowExecution
     * const flowExecution = await prisma.flowExecution.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FlowExecutionFindFirstOrThrowArgs>(args?: SelectSubset<T, FlowExecutionFindFirstOrThrowArgs<ExtArgs>>): Prisma__FlowExecutionClient<$Result.GetResult<Prisma.$FlowExecutionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more FlowExecutions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowExecutionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FlowExecutions
     * const flowExecutions = await prisma.flowExecution.findMany()
     * 
     * // Get first 10 FlowExecutions
     * const flowExecutions = await prisma.flowExecution.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const flowExecutionWithIdOnly = await prisma.flowExecution.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FlowExecutionFindManyArgs>(args?: SelectSubset<T, FlowExecutionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FlowExecutionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a FlowExecution.
     * @param {FlowExecutionCreateArgs} args - Arguments to create a FlowExecution.
     * @example
     * // Create one FlowExecution
     * const FlowExecution = await prisma.flowExecution.create({
     *   data: {
     *     // ... data to create a FlowExecution
     *   }
     * })
     * 
     */
    create<T extends FlowExecutionCreateArgs>(args: SelectSubset<T, FlowExecutionCreateArgs<ExtArgs>>): Prisma__FlowExecutionClient<$Result.GetResult<Prisma.$FlowExecutionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many FlowExecutions.
     * @param {FlowExecutionCreateManyArgs} args - Arguments to create many FlowExecutions.
     * @example
     * // Create many FlowExecutions
     * const flowExecution = await prisma.flowExecution.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FlowExecutionCreateManyArgs>(args?: SelectSubset<T, FlowExecutionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FlowExecutions and returns the data saved in the database.
     * @param {FlowExecutionCreateManyAndReturnArgs} args - Arguments to create many FlowExecutions.
     * @example
     * // Create many FlowExecutions
     * const flowExecution = await prisma.flowExecution.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FlowExecutions and only return the `id`
     * const flowExecutionWithIdOnly = await prisma.flowExecution.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FlowExecutionCreateManyAndReturnArgs>(args?: SelectSubset<T, FlowExecutionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FlowExecutionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a FlowExecution.
     * @param {FlowExecutionDeleteArgs} args - Arguments to delete one FlowExecution.
     * @example
     * // Delete one FlowExecution
     * const FlowExecution = await prisma.flowExecution.delete({
     *   where: {
     *     // ... filter to delete one FlowExecution
     *   }
     * })
     * 
     */
    delete<T extends FlowExecutionDeleteArgs>(args: SelectSubset<T, FlowExecutionDeleteArgs<ExtArgs>>): Prisma__FlowExecutionClient<$Result.GetResult<Prisma.$FlowExecutionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one FlowExecution.
     * @param {FlowExecutionUpdateArgs} args - Arguments to update one FlowExecution.
     * @example
     * // Update one FlowExecution
     * const flowExecution = await prisma.flowExecution.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FlowExecutionUpdateArgs>(args: SelectSubset<T, FlowExecutionUpdateArgs<ExtArgs>>): Prisma__FlowExecutionClient<$Result.GetResult<Prisma.$FlowExecutionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more FlowExecutions.
     * @param {FlowExecutionDeleteManyArgs} args - Arguments to filter FlowExecutions to delete.
     * @example
     * // Delete a few FlowExecutions
     * const { count } = await prisma.flowExecution.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FlowExecutionDeleteManyArgs>(args?: SelectSubset<T, FlowExecutionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FlowExecutions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowExecutionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FlowExecutions
     * const flowExecution = await prisma.flowExecution.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FlowExecutionUpdateManyArgs>(args: SelectSubset<T, FlowExecutionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FlowExecutions and returns the data updated in the database.
     * @param {FlowExecutionUpdateManyAndReturnArgs} args - Arguments to update many FlowExecutions.
     * @example
     * // Update many FlowExecutions
     * const flowExecution = await prisma.flowExecution.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more FlowExecutions and only return the `id`
     * const flowExecutionWithIdOnly = await prisma.flowExecution.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FlowExecutionUpdateManyAndReturnArgs>(args: SelectSubset<T, FlowExecutionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FlowExecutionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one FlowExecution.
     * @param {FlowExecutionUpsertArgs} args - Arguments to update or create a FlowExecution.
     * @example
     * // Update or create a FlowExecution
     * const flowExecution = await prisma.flowExecution.upsert({
     *   create: {
     *     // ... data to create a FlowExecution
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FlowExecution we want to update
     *   }
     * })
     */
    upsert<T extends FlowExecutionUpsertArgs>(args: SelectSubset<T, FlowExecutionUpsertArgs<ExtArgs>>): Prisma__FlowExecutionClient<$Result.GetResult<Prisma.$FlowExecutionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of FlowExecutions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowExecutionCountArgs} args - Arguments to filter FlowExecutions to count.
     * @example
     * // Count the number of FlowExecutions
     * const count = await prisma.flowExecution.count({
     *   where: {
     *     // ... the filter for the FlowExecutions we want to count
     *   }
     * })
    **/
    count<T extends FlowExecutionCountArgs>(
      args?: Subset<T, FlowExecutionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FlowExecutionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FlowExecution.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowExecutionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FlowExecutionAggregateArgs>(args: Subset<T, FlowExecutionAggregateArgs>): Prisma.PrismaPromise<GetFlowExecutionAggregateType<T>>

    /**
     * Group by FlowExecution.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FlowExecutionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FlowExecutionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FlowExecutionGroupByArgs['orderBy'] }
        : { orderBy?: FlowExecutionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FlowExecutionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFlowExecutionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FlowExecution model
   */
  readonly fields: FlowExecutionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FlowExecution.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FlowExecutionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    flow<T extends FlowDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FlowDefaultArgs<ExtArgs>>): Prisma__FlowClient<$Result.GetResult<Prisma.$FlowPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FlowExecution model
   */
  interface FlowExecutionFieldRefs {
    readonly id: FieldRef<"FlowExecution", 'String'>
    readonly flowId: FieldRef<"FlowExecution", 'String'>
    readonly status: FieldRef<"FlowExecution", 'String'>
    readonly input: FieldRef<"FlowExecution", 'String'>
    readonly output: FieldRef<"FlowExecution", 'String'>
    readonly error: FieldRef<"FlowExecution", 'String'>
    readonly startedAt: FieldRef<"FlowExecution", 'DateTime'>
    readonly endedAt: FieldRef<"FlowExecution", 'DateTime'>
    readonly createdAt: FieldRef<"FlowExecution", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FlowExecution findUnique
   */
  export type FlowExecutionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowExecution
     */
    select?: FlowExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FlowExecution
     */
    omit?: FlowExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowExecutionInclude<ExtArgs> | null
    /**
     * Filter, which FlowExecution to fetch.
     */
    where: FlowExecutionWhereUniqueInput
  }

  /**
   * FlowExecution findUniqueOrThrow
   */
  export type FlowExecutionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowExecution
     */
    select?: FlowExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FlowExecution
     */
    omit?: FlowExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowExecutionInclude<ExtArgs> | null
    /**
     * Filter, which FlowExecution to fetch.
     */
    where: FlowExecutionWhereUniqueInput
  }

  /**
   * FlowExecution findFirst
   */
  export type FlowExecutionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowExecution
     */
    select?: FlowExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FlowExecution
     */
    omit?: FlowExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowExecutionInclude<ExtArgs> | null
    /**
     * Filter, which FlowExecution to fetch.
     */
    where?: FlowExecutionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FlowExecutions to fetch.
     */
    orderBy?: FlowExecutionOrderByWithRelationInput | FlowExecutionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FlowExecutions.
     */
    cursor?: FlowExecutionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FlowExecutions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FlowExecutions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FlowExecutions.
     */
    distinct?: FlowExecutionScalarFieldEnum | FlowExecutionScalarFieldEnum[]
  }

  /**
   * FlowExecution findFirstOrThrow
   */
  export type FlowExecutionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowExecution
     */
    select?: FlowExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FlowExecution
     */
    omit?: FlowExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowExecutionInclude<ExtArgs> | null
    /**
     * Filter, which FlowExecution to fetch.
     */
    where?: FlowExecutionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FlowExecutions to fetch.
     */
    orderBy?: FlowExecutionOrderByWithRelationInput | FlowExecutionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FlowExecutions.
     */
    cursor?: FlowExecutionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FlowExecutions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FlowExecutions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FlowExecutions.
     */
    distinct?: FlowExecutionScalarFieldEnum | FlowExecutionScalarFieldEnum[]
  }

  /**
   * FlowExecution findMany
   */
  export type FlowExecutionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowExecution
     */
    select?: FlowExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FlowExecution
     */
    omit?: FlowExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowExecutionInclude<ExtArgs> | null
    /**
     * Filter, which FlowExecutions to fetch.
     */
    where?: FlowExecutionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FlowExecutions to fetch.
     */
    orderBy?: FlowExecutionOrderByWithRelationInput | FlowExecutionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FlowExecutions.
     */
    cursor?: FlowExecutionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FlowExecutions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FlowExecutions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FlowExecutions.
     */
    distinct?: FlowExecutionScalarFieldEnum | FlowExecutionScalarFieldEnum[]
  }

  /**
   * FlowExecution create
   */
  export type FlowExecutionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowExecution
     */
    select?: FlowExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FlowExecution
     */
    omit?: FlowExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowExecutionInclude<ExtArgs> | null
    /**
     * The data needed to create a FlowExecution.
     */
    data: XOR<FlowExecutionCreateInput, FlowExecutionUncheckedCreateInput>
  }

  /**
   * FlowExecution createMany
   */
  export type FlowExecutionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FlowExecutions.
     */
    data: FlowExecutionCreateManyInput | FlowExecutionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FlowExecution createManyAndReturn
   */
  export type FlowExecutionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowExecution
     */
    select?: FlowExecutionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FlowExecution
     */
    omit?: FlowExecutionOmit<ExtArgs> | null
    /**
     * The data used to create many FlowExecutions.
     */
    data: FlowExecutionCreateManyInput | FlowExecutionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowExecutionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FlowExecution update
   */
  export type FlowExecutionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowExecution
     */
    select?: FlowExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FlowExecution
     */
    omit?: FlowExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowExecutionInclude<ExtArgs> | null
    /**
     * The data needed to update a FlowExecution.
     */
    data: XOR<FlowExecutionUpdateInput, FlowExecutionUncheckedUpdateInput>
    /**
     * Choose, which FlowExecution to update.
     */
    where: FlowExecutionWhereUniqueInput
  }

  /**
   * FlowExecution updateMany
   */
  export type FlowExecutionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FlowExecutions.
     */
    data: XOR<FlowExecutionUpdateManyMutationInput, FlowExecutionUncheckedUpdateManyInput>
    /**
     * Filter which FlowExecutions to update
     */
    where?: FlowExecutionWhereInput
    /**
     * Limit how many FlowExecutions to update.
     */
    limit?: number
  }

  /**
   * FlowExecution updateManyAndReturn
   */
  export type FlowExecutionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowExecution
     */
    select?: FlowExecutionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FlowExecution
     */
    omit?: FlowExecutionOmit<ExtArgs> | null
    /**
     * The data used to update FlowExecutions.
     */
    data: XOR<FlowExecutionUpdateManyMutationInput, FlowExecutionUncheckedUpdateManyInput>
    /**
     * Filter which FlowExecutions to update
     */
    where?: FlowExecutionWhereInput
    /**
     * Limit how many FlowExecutions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowExecutionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * FlowExecution upsert
   */
  export type FlowExecutionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowExecution
     */
    select?: FlowExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FlowExecution
     */
    omit?: FlowExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowExecutionInclude<ExtArgs> | null
    /**
     * The filter to search for the FlowExecution to update in case it exists.
     */
    where: FlowExecutionWhereUniqueInput
    /**
     * In case the FlowExecution found by the `where` argument doesn't exist, create a new FlowExecution with this data.
     */
    create: XOR<FlowExecutionCreateInput, FlowExecutionUncheckedCreateInput>
    /**
     * In case the FlowExecution was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FlowExecutionUpdateInput, FlowExecutionUncheckedUpdateInput>
  }

  /**
   * FlowExecution delete
   */
  export type FlowExecutionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowExecution
     */
    select?: FlowExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FlowExecution
     */
    omit?: FlowExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowExecutionInclude<ExtArgs> | null
    /**
     * Filter which FlowExecution to delete.
     */
    where: FlowExecutionWhereUniqueInput
  }

  /**
   * FlowExecution deleteMany
   */
  export type FlowExecutionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FlowExecutions to delete
     */
    where?: FlowExecutionWhereInput
    /**
     * Limit how many FlowExecutions to delete.
     */
    limit?: number
  }

  /**
   * FlowExecution without action
   */
  export type FlowExecutionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FlowExecution
     */
    select?: FlowExecutionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FlowExecution
     */
    omit?: FlowExecutionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FlowExecutionInclude<ExtArgs> | null
  }


  /**
   * Model UserSecret
   */

  export type AggregateUserSecret = {
    _count: UserSecretCountAggregateOutputType | null
    _min: UserSecretMinAggregateOutputType | null
    _max: UserSecretMaxAggregateOutputType | null
  }

  export type UserSecretMinAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    key: string | null
    label: string | null
    lastUsedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserSecretMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    key: string | null
    label: string | null
    lastUsedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserSecretCountAggregateOutputType = {
    id: number
    userId: number
    name: number
    key: number
    label: number
    lastUsedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserSecretMinAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    key?: true
    label?: true
    lastUsedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserSecretMaxAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    key?: true
    label?: true
    lastUsedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserSecretCountAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    key?: true
    label?: true
    lastUsedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserSecretAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserSecret to aggregate.
     */
    where?: UserSecretWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSecrets to fetch.
     */
    orderBy?: UserSecretOrderByWithRelationInput | UserSecretOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserSecretWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSecrets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSecrets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserSecrets
    **/
    _count?: true | UserSecretCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserSecretMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserSecretMaxAggregateInputType
  }

  export type GetUserSecretAggregateType<T extends UserSecretAggregateArgs> = {
        [P in keyof T & keyof AggregateUserSecret]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserSecret[P]>
      : GetScalarType<T[P], AggregateUserSecret[P]>
  }




  export type UserSecretGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserSecretWhereInput
    orderBy?: UserSecretOrderByWithAggregationInput | UserSecretOrderByWithAggregationInput[]
    by: UserSecretScalarFieldEnum[] | UserSecretScalarFieldEnum
    having?: UserSecretScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserSecretCountAggregateInputType | true
    _min?: UserSecretMinAggregateInputType
    _max?: UserSecretMaxAggregateInputType
  }

  export type UserSecretGroupByOutputType = {
    id: string
    userId: string
    name: string
    key: string
    label: string | null
    lastUsedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: UserSecretCountAggregateOutputType | null
    _min: UserSecretMinAggregateOutputType | null
    _max: UserSecretMaxAggregateOutputType | null
  }

  type GetUserSecretGroupByPayload<T extends UserSecretGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserSecretGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserSecretGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserSecretGroupByOutputType[P]>
            : GetScalarType<T[P], UserSecretGroupByOutputType[P]>
        }
      >
    >


  export type UserSecretSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    key?: boolean
    label?: boolean
    lastUsedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userSecret"]>

  export type UserSecretSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    key?: boolean
    label?: boolean
    lastUsedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userSecret"]>

  export type UserSecretSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    key?: boolean
    label?: boolean
    lastUsedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userSecret"]>

  export type UserSecretSelectScalar = {
    id?: boolean
    userId?: boolean
    name?: boolean
    key?: boolean
    label?: boolean
    lastUsedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserSecretOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "name" | "key" | "label" | "lastUsedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["userSecret"]>
  export type UserSecretInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserSecretIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserSecretIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserSecretPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserSecret"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      name: string
      key: string
      label: string | null
      lastUsedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userSecret"]>
    composites: {}
  }

  type UserSecretGetPayload<S extends boolean | null | undefined | UserSecretDefaultArgs> = $Result.GetResult<Prisma.$UserSecretPayload, S>

  type UserSecretCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserSecretFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserSecretCountAggregateInputType | true
    }

  export interface UserSecretDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserSecret'], meta: { name: 'UserSecret' } }
    /**
     * Find zero or one UserSecret that matches the filter.
     * @param {UserSecretFindUniqueArgs} args - Arguments to find a UserSecret
     * @example
     * // Get one UserSecret
     * const userSecret = await prisma.userSecret.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserSecretFindUniqueArgs>(args: SelectSubset<T, UserSecretFindUniqueArgs<ExtArgs>>): Prisma__UserSecretClient<$Result.GetResult<Prisma.$UserSecretPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserSecret that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserSecretFindUniqueOrThrowArgs} args - Arguments to find a UserSecret
     * @example
     * // Get one UserSecret
     * const userSecret = await prisma.userSecret.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserSecretFindUniqueOrThrowArgs>(args: SelectSubset<T, UserSecretFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserSecretClient<$Result.GetResult<Prisma.$UserSecretPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserSecret that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSecretFindFirstArgs} args - Arguments to find a UserSecret
     * @example
     * // Get one UserSecret
     * const userSecret = await prisma.userSecret.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserSecretFindFirstArgs>(args?: SelectSubset<T, UserSecretFindFirstArgs<ExtArgs>>): Prisma__UserSecretClient<$Result.GetResult<Prisma.$UserSecretPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserSecret that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSecretFindFirstOrThrowArgs} args - Arguments to find a UserSecret
     * @example
     * // Get one UserSecret
     * const userSecret = await prisma.userSecret.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserSecretFindFirstOrThrowArgs>(args?: SelectSubset<T, UserSecretFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserSecretClient<$Result.GetResult<Prisma.$UserSecretPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserSecrets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSecretFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserSecrets
     * const userSecrets = await prisma.userSecret.findMany()
     * 
     * // Get first 10 UserSecrets
     * const userSecrets = await prisma.userSecret.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userSecretWithIdOnly = await prisma.userSecret.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserSecretFindManyArgs>(args?: SelectSubset<T, UserSecretFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSecretPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserSecret.
     * @param {UserSecretCreateArgs} args - Arguments to create a UserSecret.
     * @example
     * // Create one UserSecret
     * const UserSecret = await prisma.userSecret.create({
     *   data: {
     *     // ... data to create a UserSecret
     *   }
     * })
     * 
     */
    create<T extends UserSecretCreateArgs>(args: SelectSubset<T, UserSecretCreateArgs<ExtArgs>>): Prisma__UserSecretClient<$Result.GetResult<Prisma.$UserSecretPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserSecrets.
     * @param {UserSecretCreateManyArgs} args - Arguments to create many UserSecrets.
     * @example
     * // Create many UserSecrets
     * const userSecret = await prisma.userSecret.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserSecretCreateManyArgs>(args?: SelectSubset<T, UserSecretCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserSecrets and returns the data saved in the database.
     * @param {UserSecretCreateManyAndReturnArgs} args - Arguments to create many UserSecrets.
     * @example
     * // Create many UserSecrets
     * const userSecret = await prisma.userSecret.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserSecrets and only return the `id`
     * const userSecretWithIdOnly = await prisma.userSecret.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserSecretCreateManyAndReturnArgs>(args?: SelectSubset<T, UserSecretCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSecretPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserSecret.
     * @param {UserSecretDeleteArgs} args - Arguments to delete one UserSecret.
     * @example
     * // Delete one UserSecret
     * const UserSecret = await prisma.userSecret.delete({
     *   where: {
     *     // ... filter to delete one UserSecret
     *   }
     * })
     * 
     */
    delete<T extends UserSecretDeleteArgs>(args: SelectSubset<T, UserSecretDeleteArgs<ExtArgs>>): Prisma__UserSecretClient<$Result.GetResult<Prisma.$UserSecretPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserSecret.
     * @param {UserSecretUpdateArgs} args - Arguments to update one UserSecret.
     * @example
     * // Update one UserSecret
     * const userSecret = await prisma.userSecret.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserSecretUpdateArgs>(args: SelectSubset<T, UserSecretUpdateArgs<ExtArgs>>): Prisma__UserSecretClient<$Result.GetResult<Prisma.$UserSecretPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserSecrets.
     * @param {UserSecretDeleteManyArgs} args - Arguments to filter UserSecrets to delete.
     * @example
     * // Delete a few UserSecrets
     * const { count } = await prisma.userSecret.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserSecretDeleteManyArgs>(args?: SelectSubset<T, UserSecretDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserSecrets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSecretUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserSecrets
     * const userSecret = await prisma.userSecret.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserSecretUpdateManyArgs>(args: SelectSubset<T, UserSecretUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserSecrets and returns the data updated in the database.
     * @param {UserSecretUpdateManyAndReturnArgs} args - Arguments to update many UserSecrets.
     * @example
     * // Update many UserSecrets
     * const userSecret = await prisma.userSecret.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserSecrets and only return the `id`
     * const userSecretWithIdOnly = await prisma.userSecret.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserSecretUpdateManyAndReturnArgs>(args: SelectSubset<T, UserSecretUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSecretPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserSecret.
     * @param {UserSecretUpsertArgs} args - Arguments to update or create a UserSecret.
     * @example
     * // Update or create a UserSecret
     * const userSecret = await prisma.userSecret.upsert({
     *   create: {
     *     // ... data to create a UserSecret
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserSecret we want to update
     *   }
     * })
     */
    upsert<T extends UserSecretUpsertArgs>(args: SelectSubset<T, UserSecretUpsertArgs<ExtArgs>>): Prisma__UserSecretClient<$Result.GetResult<Prisma.$UserSecretPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserSecrets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSecretCountArgs} args - Arguments to filter UserSecrets to count.
     * @example
     * // Count the number of UserSecrets
     * const count = await prisma.userSecret.count({
     *   where: {
     *     // ... the filter for the UserSecrets we want to count
     *   }
     * })
    **/
    count<T extends UserSecretCountArgs>(
      args?: Subset<T, UserSecretCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserSecretCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserSecret.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSecretAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserSecretAggregateArgs>(args: Subset<T, UserSecretAggregateArgs>): Prisma.PrismaPromise<GetUserSecretAggregateType<T>>

    /**
     * Group by UserSecret.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSecretGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserSecretGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserSecretGroupByArgs['orderBy'] }
        : { orderBy?: UserSecretGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserSecretGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserSecretGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserSecret model
   */
  readonly fields: UserSecretFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserSecret.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserSecretClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserSecret model
   */
  interface UserSecretFieldRefs {
    readonly id: FieldRef<"UserSecret", 'String'>
    readonly userId: FieldRef<"UserSecret", 'String'>
    readonly name: FieldRef<"UserSecret", 'String'>
    readonly key: FieldRef<"UserSecret", 'String'>
    readonly label: FieldRef<"UserSecret", 'String'>
    readonly lastUsedAt: FieldRef<"UserSecret", 'DateTime'>
    readonly createdAt: FieldRef<"UserSecret", 'DateTime'>
    readonly updatedAt: FieldRef<"UserSecret", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserSecret findUnique
   */
  export type UserSecretFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecret
     */
    select?: UserSecretSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSecret
     */
    omit?: UserSecretOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecretInclude<ExtArgs> | null
    /**
     * Filter, which UserSecret to fetch.
     */
    where: UserSecretWhereUniqueInput
  }

  /**
   * UserSecret findUniqueOrThrow
   */
  export type UserSecretFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecret
     */
    select?: UserSecretSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSecret
     */
    omit?: UserSecretOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecretInclude<ExtArgs> | null
    /**
     * Filter, which UserSecret to fetch.
     */
    where: UserSecretWhereUniqueInput
  }

  /**
   * UserSecret findFirst
   */
  export type UserSecretFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecret
     */
    select?: UserSecretSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSecret
     */
    omit?: UserSecretOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecretInclude<ExtArgs> | null
    /**
     * Filter, which UserSecret to fetch.
     */
    where?: UserSecretWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSecrets to fetch.
     */
    orderBy?: UserSecretOrderByWithRelationInput | UserSecretOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserSecrets.
     */
    cursor?: UserSecretWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSecrets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSecrets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserSecrets.
     */
    distinct?: UserSecretScalarFieldEnum | UserSecretScalarFieldEnum[]
  }

  /**
   * UserSecret findFirstOrThrow
   */
  export type UserSecretFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecret
     */
    select?: UserSecretSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSecret
     */
    omit?: UserSecretOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecretInclude<ExtArgs> | null
    /**
     * Filter, which UserSecret to fetch.
     */
    where?: UserSecretWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSecrets to fetch.
     */
    orderBy?: UserSecretOrderByWithRelationInput | UserSecretOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserSecrets.
     */
    cursor?: UserSecretWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSecrets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSecrets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserSecrets.
     */
    distinct?: UserSecretScalarFieldEnum | UserSecretScalarFieldEnum[]
  }

  /**
   * UserSecret findMany
   */
  export type UserSecretFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecret
     */
    select?: UserSecretSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSecret
     */
    omit?: UserSecretOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecretInclude<ExtArgs> | null
    /**
     * Filter, which UserSecrets to fetch.
     */
    where?: UserSecretWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSecrets to fetch.
     */
    orderBy?: UserSecretOrderByWithRelationInput | UserSecretOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserSecrets.
     */
    cursor?: UserSecretWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSecrets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSecrets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserSecrets.
     */
    distinct?: UserSecretScalarFieldEnum | UserSecretScalarFieldEnum[]
  }

  /**
   * UserSecret create
   */
  export type UserSecretCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecret
     */
    select?: UserSecretSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSecret
     */
    omit?: UserSecretOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecretInclude<ExtArgs> | null
    /**
     * The data needed to create a UserSecret.
     */
    data: XOR<UserSecretCreateInput, UserSecretUncheckedCreateInput>
  }

  /**
   * UserSecret createMany
   */
  export type UserSecretCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserSecrets.
     */
    data: UserSecretCreateManyInput | UserSecretCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserSecret createManyAndReturn
   */
  export type UserSecretCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecret
     */
    select?: UserSecretSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserSecret
     */
    omit?: UserSecretOmit<ExtArgs> | null
    /**
     * The data used to create many UserSecrets.
     */
    data: UserSecretCreateManyInput | UserSecretCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecretIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserSecret update
   */
  export type UserSecretUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecret
     */
    select?: UserSecretSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSecret
     */
    omit?: UserSecretOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecretInclude<ExtArgs> | null
    /**
     * The data needed to update a UserSecret.
     */
    data: XOR<UserSecretUpdateInput, UserSecretUncheckedUpdateInput>
    /**
     * Choose, which UserSecret to update.
     */
    where: UserSecretWhereUniqueInput
  }

  /**
   * UserSecret updateMany
   */
  export type UserSecretUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserSecrets.
     */
    data: XOR<UserSecretUpdateManyMutationInput, UserSecretUncheckedUpdateManyInput>
    /**
     * Filter which UserSecrets to update
     */
    where?: UserSecretWhereInput
    /**
     * Limit how many UserSecrets to update.
     */
    limit?: number
  }

  /**
   * UserSecret updateManyAndReturn
   */
  export type UserSecretUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecret
     */
    select?: UserSecretSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserSecret
     */
    omit?: UserSecretOmit<ExtArgs> | null
    /**
     * The data used to update UserSecrets.
     */
    data: XOR<UserSecretUpdateManyMutationInput, UserSecretUncheckedUpdateManyInput>
    /**
     * Filter which UserSecrets to update
     */
    where?: UserSecretWhereInput
    /**
     * Limit how many UserSecrets to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecretIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserSecret upsert
   */
  export type UserSecretUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecret
     */
    select?: UserSecretSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSecret
     */
    omit?: UserSecretOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecretInclude<ExtArgs> | null
    /**
     * The filter to search for the UserSecret to update in case it exists.
     */
    where: UserSecretWhereUniqueInput
    /**
     * In case the UserSecret found by the `where` argument doesn't exist, create a new UserSecret with this data.
     */
    create: XOR<UserSecretCreateInput, UserSecretUncheckedCreateInput>
    /**
     * In case the UserSecret was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserSecretUpdateInput, UserSecretUncheckedUpdateInput>
  }

  /**
   * UserSecret delete
   */
  export type UserSecretDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecret
     */
    select?: UserSecretSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSecret
     */
    omit?: UserSecretOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecretInclude<ExtArgs> | null
    /**
     * Filter which UserSecret to delete.
     */
    where: UserSecretWhereUniqueInput
  }

  /**
   * UserSecret deleteMany
   */
  export type UserSecretDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserSecrets to delete
     */
    where?: UserSecretWhereInput
    /**
     * Limit how many UserSecrets to delete.
     */
    limit?: number
  }

  /**
   * UserSecret without action
   */
  export type UserSecretDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSecret
     */
    select?: UserSecretSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserSecret
     */
    omit?: UserSecretOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserSecretInclude<ExtArgs> | null
  }


  /**
   * Model LLMProvider
   */

  export type AggregateLLMProvider = {
    _count: LLMProviderCountAggregateOutputType | null
    _min: LLMProviderMinAggregateOutputType | null
    _max: LLMProviderMaxAggregateOutputType | null
  }

  export type LLMProviderMinAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    provider: string | null
    baseUrl: string | null
    apiKey: string | null
    config: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LLMProviderMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    provider: string | null
    baseUrl: string | null
    apiKey: string | null
    config: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LLMProviderCountAggregateOutputType = {
    id: number
    userId: number
    name: number
    provider: number
    baseUrl: number
    apiKey: number
    config: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type LLMProviderMinAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    provider?: true
    baseUrl?: true
    apiKey?: true
    config?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LLMProviderMaxAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    provider?: true
    baseUrl?: true
    apiKey?: true
    config?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LLMProviderCountAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    provider?: true
    baseUrl?: true
    apiKey?: true
    config?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type LLMProviderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LLMProvider to aggregate.
     */
    where?: LLMProviderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LLMProviders to fetch.
     */
    orderBy?: LLMProviderOrderByWithRelationInput | LLMProviderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LLMProviderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LLMProviders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LLMProviders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LLMProviders
    **/
    _count?: true | LLMProviderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LLMProviderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LLMProviderMaxAggregateInputType
  }

  export type GetLLMProviderAggregateType<T extends LLMProviderAggregateArgs> = {
        [P in keyof T & keyof AggregateLLMProvider]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLLMProvider[P]>
      : GetScalarType<T[P], AggregateLLMProvider[P]>
  }




  export type LLMProviderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LLMProviderWhereInput
    orderBy?: LLMProviderOrderByWithAggregationInput | LLMProviderOrderByWithAggregationInput[]
    by: LLMProviderScalarFieldEnum[] | LLMProviderScalarFieldEnum
    having?: LLMProviderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LLMProviderCountAggregateInputType | true
    _min?: LLMProviderMinAggregateInputType
    _max?: LLMProviderMaxAggregateInputType
  }

  export type LLMProviderGroupByOutputType = {
    id: string
    userId: string
    name: string
    provider: string
    baseUrl: string | null
    apiKey: string | null
    config: string | null
    createdAt: Date
    updatedAt: Date
    _count: LLMProviderCountAggregateOutputType | null
    _min: LLMProviderMinAggregateOutputType | null
    _max: LLMProviderMaxAggregateOutputType | null
  }

  type GetLLMProviderGroupByPayload<T extends LLMProviderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LLMProviderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LLMProviderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LLMProviderGroupByOutputType[P]>
            : GetScalarType<T[P], LLMProviderGroupByOutputType[P]>
        }
      >
    >


  export type LLMProviderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    provider?: boolean
    baseUrl?: boolean
    apiKey?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lLMProvider"]>

  export type LLMProviderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    provider?: boolean
    baseUrl?: boolean
    apiKey?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lLMProvider"]>

  export type LLMProviderSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    provider?: boolean
    baseUrl?: boolean
    apiKey?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lLMProvider"]>

  export type LLMProviderSelectScalar = {
    id?: boolean
    userId?: boolean
    name?: boolean
    provider?: boolean
    baseUrl?: boolean
    apiKey?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type LLMProviderOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "name" | "provider" | "baseUrl" | "apiKey" | "config" | "createdAt" | "updatedAt", ExtArgs["result"]["lLMProvider"]>
  export type LLMProviderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type LLMProviderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type LLMProviderIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $LLMProviderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LLMProvider"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      name: string
      provider: string
      baseUrl: string | null
      apiKey: string | null
      config: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["lLMProvider"]>
    composites: {}
  }

  type LLMProviderGetPayload<S extends boolean | null | undefined | LLMProviderDefaultArgs> = $Result.GetResult<Prisma.$LLMProviderPayload, S>

  type LLMProviderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LLMProviderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LLMProviderCountAggregateInputType | true
    }

  export interface LLMProviderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LLMProvider'], meta: { name: 'LLMProvider' } }
    /**
     * Find zero or one LLMProvider that matches the filter.
     * @param {LLMProviderFindUniqueArgs} args - Arguments to find a LLMProvider
     * @example
     * // Get one LLMProvider
     * const lLMProvider = await prisma.lLMProvider.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LLMProviderFindUniqueArgs>(args: SelectSubset<T, LLMProviderFindUniqueArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LLMProvider that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LLMProviderFindUniqueOrThrowArgs} args - Arguments to find a LLMProvider
     * @example
     * // Get one LLMProvider
     * const lLMProvider = await prisma.lLMProvider.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LLMProviderFindUniqueOrThrowArgs>(args: SelectSubset<T, LLMProviderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LLMProvider that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMProviderFindFirstArgs} args - Arguments to find a LLMProvider
     * @example
     * // Get one LLMProvider
     * const lLMProvider = await prisma.lLMProvider.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LLMProviderFindFirstArgs>(args?: SelectSubset<T, LLMProviderFindFirstArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LLMProvider that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMProviderFindFirstOrThrowArgs} args - Arguments to find a LLMProvider
     * @example
     * // Get one LLMProvider
     * const lLMProvider = await prisma.lLMProvider.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LLMProviderFindFirstOrThrowArgs>(args?: SelectSubset<T, LLMProviderFindFirstOrThrowArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LLMProviders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMProviderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LLMProviders
     * const lLMProviders = await prisma.lLMProvider.findMany()
     * 
     * // Get first 10 LLMProviders
     * const lLMProviders = await prisma.lLMProvider.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const lLMProviderWithIdOnly = await prisma.lLMProvider.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LLMProviderFindManyArgs>(args?: SelectSubset<T, LLMProviderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LLMProvider.
     * @param {LLMProviderCreateArgs} args - Arguments to create a LLMProvider.
     * @example
     * // Create one LLMProvider
     * const LLMProvider = await prisma.lLMProvider.create({
     *   data: {
     *     // ... data to create a LLMProvider
     *   }
     * })
     * 
     */
    create<T extends LLMProviderCreateArgs>(args: SelectSubset<T, LLMProviderCreateArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LLMProviders.
     * @param {LLMProviderCreateManyArgs} args - Arguments to create many LLMProviders.
     * @example
     * // Create many LLMProviders
     * const lLMProvider = await prisma.lLMProvider.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LLMProviderCreateManyArgs>(args?: SelectSubset<T, LLMProviderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LLMProviders and returns the data saved in the database.
     * @param {LLMProviderCreateManyAndReturnArgs} args - Arguments to create many LLMProviders.
     * @example
     * // Create many LLMProviders
     * const lLMProvider = await prisma.lLMProvider.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LLMProviders and only return the `id`
     * const lLMProviderWithIdOnly = await prisma.lLMProvider.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LLMProviderCreateManyAndReturnArgs>(args?: SelectSubset<T, LLMProviderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LLMProvider.
     * @param {LLMProviderDeleteArgs} args - Arguments to delete one LLMProvider.
     * @example
     * // Delete one LLMProvider
     * const LLMProvider = await prisma.lLMProvider.delete({
     *   where: {
     *     // ... filter to delete one LLMProvider
     *   }
     * })
     * 
     */
    delete<T extends LLMProviderDeleteArgs>(args: SelectSubset<T, LLMProviderDeleteArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LLMProvider.
     * @param {LLMProviderUpdateArgs} args - Arguments to update one LLMProvider.
     * @example
     * // Update one LLMProvider
     * const lLMProvider = await prisma.lLMProvider.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LLMProviderUpdateArgs>(args: SelectSubset<T, LLMProviderUpdateArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LLMProviders.
     * @param {LLMProviderDeleteManyArgs} args - Arguments to filter LLMProviders to delete.
     * @example
     * // Delete a few LLMProviders
     * const { count } = await prisma.lLMProvider.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LLMProviderDeleteManyArgs>(args?: SelectSubset<T, LLMProviderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LLMProviders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMProviderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LLMProviders
     * const lLMProvider = await prisma.lLMProvider.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LLMProviderUpdateManyArgs>(args: SelectSubset<T, LLMProviderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LLMProviders and returns the data updated in the database.
     * @param {LLMProviderUpdateManyAndReturnArgs} args - Arguments to update many LLMProviders.
     * @example
     * // Update many LLMProviders
     * const lLMProvider = await prisma.lLMProvider.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LLMProviders and only return the `id`
     * const lLMProviderWithIdOnly = await prisma.lLMProvider.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LLMProviderUpdateManyAndReturnArgs>(args: SelectSubset<T, LLMProviderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LLMProvider.
     * @param {LLMProviderUpsertArgs} args - Arguments to update or create a LLMProvider.
     * @example
     * // Update or create a LLMProvider
     * const lLMProvider = await prisma.lLMProvider.upsert({
     *   create: {
     *     // ... data to create a LLMProvider
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LLMProvider we want to update
     *   }
     * })
     */
    upsert<T extends LLMProviderUpsertArgs>(args: SelectSubset<T, LLMProviderUpsertArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LLMProviders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMProviderCountArgs} args - Arguments to filter LLMProviders to count.
     * @example
     * // Count the number of LLMProviders
     * const count = await prisma.lLMProvider.count({
     *   where: {
     *     // ... the filter for the LLMProviders we want to count
     *   }
     * })
    **/
    count<T extends LLMProviderCountArgs>(
      args?: Subset<T, LLMProviderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LLMProviderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LLMProvider.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMProviderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LLMProviderAggregateArgs>(args: Subset<T, LLMProviderAggregateArgs>): Prisma.PrismaPromise<GetLLMProviderAggregateType<T>>

    /**
     * Group by LLMProvider.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMProviderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LLMProviderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LLMProviderGroupByArgs['orderBy'] }
        : { orderBy?: LLMProviderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LLMProviderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLLMProviderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LLMProvider model
   */
  readonly fields: LLMProviderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LLMProvider.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LLMProviderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LLMProvider model
   */
  interface LLMProviderFieldRefs {
    readonly id: FieldRef<"LLMProvider", 'String'>
    readonly userId: FieldRef<"LLMProvider", 'String'>
    readonly name: FieldRef<"LLMProvider", 'String'>
    readonly provider: FieldRef<"LLMProvider", 'String'>
    readonly baseUrl: FieldRef<"LLMProvider", 'String'>
    readonly apiKey: FieldRef<"LLMProvider", 'String'>
    readonly config: FieldRef<"LLMProvider", 'String'>
    readonly createdAt: FieldRef<"LLMProvider", 'DateTime'>
    readonly updatedAt: FieldRef<"LLMProvider", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LLMProvider findUnique
   */
  export type LLMProviderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * Filter, which LLMProvider to fetch.
     */
    where: LLMProviderWhereUniqueInput
  }

  /**
   * LLMProvider findUniqueOrThrow
   */
  export type LLMProviderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * Filter, which LLMProvider to fetch.
     */
    where: LLMProviderWhereUniqueInput
  }

  /**
   * LLMProvider findFirst
   */
  export type LLMProviderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * Filter, which LLMProvider to fetch.
     */
    where?: LLMProviderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LLMProviders to fetch.
     */
    orderBy?: LLMProviderOrderByWithRelationInput | LLMProviderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LLMProviders.
     */
    cursor?: LLMProviderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LLMProviders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LLMProviders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LLMProviders.
     */
    distinct?: LLMProviderScalarFieldEnum | LLMProviderScalarFieldEnum[]
  }

  /**
   * LLMProvider findFirstOrThrow
   */
  export type LLMProviderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * Filter, which LLMProvider to fetch.
     */
    where?: LLMProviderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LLMProviders to fetch.
     */
    orderBy?: LLMProviderOrderByWithRelationInput | LLMProviderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LLMProviders.
     */
    cursor?: LLMProviderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LLMProviders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LLMProviders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LLMProviders.
     */
    distinct?: LLMProviderScalarFieldEnum | LLMProviderScalarFieldEnum[]
  }

  /**
   * LLMProvider findMany
   */
  export type LLMProviderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * Filter, which LLMProviders to fetch.
     */
    where?: LLMProviderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LLMProviders to fetch.
     */
    orderBy?: LLMProviderOrderByWithRelationInput | LLMProviderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LLMProviders.
     */
    cursor?: LLMProviderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LLMProviders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LLMProviders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LLMProviders.
     */
    distinct?: LLMProviderScalarFieldEnum | LLMProviderScalarFieldEnum[]
  }

  /**
   * LLMProvider create
   */
  export type LLMProviderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * The data needed to create a LLMProvider.
     */
    data: XOR<LLMProviderCreateInput, LLMProviderUncheckedCreateInput>
  }

  /**
   * LLMProvider createMany
   */
  export type LLMProviderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LLMProviders.
     */
    data: LLMProviderCreateManyInput | LLMProviderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LLMProvider createManyAndReturn
   */
  export type LLMProviderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * The data used to create many LLMProviders.
     */
    data: LLMProviderCreateManyInput | LLMProviderCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LLMProvider update
   */
  export type LLMProviderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * The data needed to update a LLMProvider.
     */
    data: XOR<LLMProviderUpdateInput, LLMProviderUncheckedUpdateInput>
    /**
     * Choose, which LLMProvider to update.
     */
    where: LLMProviderWhereUniqueInput
  }

  /**
   * LLMProvider updateMany
   */
  export type LLMProviderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LLMProviders.
     */
    data: XOR<LLMProviderUpdateManyMutationInput, LLMProviderUncheckedUpdateManyInput>
    /**
     * Filter which LLMProviders to update
     */
    where?: LLMProviderWhereInput
    /**
     * Limit how many LLMProviders to update.
     */
    limit?: number
  }

  /**
   * LLMProvider updateManyAndReturn
   */
  export type LLMProviderUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * The data used to update LLMProviders.
     */
    data: XOR<LLMProviderUpdateManyMutationInput, LLMProviderUncheckedUpdateManyInput>
    /**
     * Filter which LLMProviders to update
     */
    where?: LLMProviderWhereInput
    /**
     * Limit how many LLMProviders to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * LLMProvider upsert
   */
  export type LLMProviderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * The filter to search for the LLMProvider to update in case it exists.
     */
    where: LLMProviderWhereUniqueInput
    /**
     * In case the LLMProvider found by the `where` argument doesn't exist, create a new LLMProvider with this data.
     */
    create: XOR<LLMProviderCreateInput, LLMProviderUncheckedCreateInput>
    /**
     * In case the LLMProvider was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LLMProviderUpdateInput, LLMProviderUncheckedUpdateInput>
  }

  /**
   * LLMProvider delete
   */
  export type LLMProviderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
    /**
     * Filter which LLMProvider to delete.
     */
    where: LLMProviderWhereUniqueInput
  }

  /**
   * LLMProvider deleteMany
   */
  export type LLMProviderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LLMProviders to delete
     */
    where?: LLMProviderWhereInput
    /**
     * Limit how many LLMProviders to delete.
     */
    limit?: number
  }

  /**
   * LLMProvider without action
   */
  export type LLMProviderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProvider
     */
    select?: LLMProviderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMProvider
     */
    omit?: LLMProviderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMProviderInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    username: 'username',
    password: 'password',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const FlowScalarFieldEnum: {
    id: 'id',
    name: 'name',
    data: 'data',
    userId: 'userId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FlowScalarFieldEnum = (typeof FlowScalarFieldEnum)[keyof typeof FlowScalarFieldEnum]


  export const FlowExecutionScalarFieldEnum: {
    id: 'id',
    flowId: 'flowId',
    status: 'status',
    input: 'input',
    output: 'output',
    error: 'error',
    startedAt: 'startedAt',
    endedAt: 'endedAt',
    createdAt: 'createdAt'
  };

  export type FlowExecutionScalarFieldEnum = (typeof FlowExecutionScalarFieldEnum)[keyof typeof FlowExecutionScalarFieldEnum]


  export const UserSecretScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    key: 'key',
    label: 'label',
    lastUsedAt: 'lastUsedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserSecretScalarFieldEnum = (typeof UserSecretScalarFieldEnum)[keyof typeof UserSecretScalarFieldEnum]


  export const LLMProviderScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    provider: 'provider',
    baseUrl: 'baseUrl',
    apiKey: 'apiKey',
    config: 'config',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type LLMProviderScalarFieldEnum = (typeof LLMProviderScalarFieldEnum)[keyof typeof LLMProviderScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    username?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    flows?: FlowListRelationFilter
    secrets?: UserSecretListRelationFilter
    providers?: LLMProviderListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    flows?: FlowOrderByRelationAggregateInput
    secrets?: UserSecretOrderByRelationAggregateInput
    providers?: LLMProviderOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    username?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    flows?: FlowListRelationFilter
    secrets?: UserSecretListRelationFilter
    providers?: LLMProviderListRelationFilter
  }, "id" | "email" | "username">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    username?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type FlowWhereInput = {
    AND?: FlowWhereInput | FlowWhereInput[]
    OR?: FlowWhereInput[]
    NOT?: FlowWhereInput | FlowWhereInput[]
    id?: StringFilter<"Flow"> | string
    name?: StringFilter<"Flow"> | string
    data?: StringFilter<"Flow"> | string
    userId?: StringFilter<"Flow"> | string
    createdAt?: DateTimeFilter<"Flow"> | Date | string
    updatedAt?: DateTimeFilter<"Flow"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    executions?: FlowExecutionListRelationFilter
  }

  export type FlowOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    data?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    executions?: FlowExecutionOrderByRelationAggregateInput
  }

  export type FlowWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FlowWhereInput | FlowWhereInput[]
    OR?: FlowWhereInput[]
    NOT?: FlowWhereInput | FlowWhereInput[]
    name?: StringFilter<"Flow"> | string
    data?: StringFilter<"Flow"> | string
    userId?: StringFilter<"Flow"> | string
    createdAt?: DateTimeFilter<"Flow"> | Date | string
    updatedAt?: DateTimeFilter<"Flow"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    executions?: FlowExecutionListRelationFilter
  }, "id">

  export type FlowOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    data?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FlowCountOrderByAggregateInput
    _max?: FlowMaxOrderByAggregateInput
    _min?: FlowMinOrderByAggregateInput
  }

  export type FlowScalarWhereWithAggregatesInput = {
    AND?: FlowScalarWhereWithAggregatesInput | FlowScalarWhereWithAggregatesInput[]
    OR?: FlowScalarWhereWithAggregatesInput[]
    NOT?: FlowScalarWhereWithAggregatesInput | FlowScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Flow"> | string
    name?: StringWithAggregatesFilter<"Flow"> | string
    data?: StringWithAggregatesFilter<"Flow"> | string
    userId?: StringWithAggregatesFilter<"Flow"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Flow"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Flow"> | Date | string
  }

  export type FlowExecutionWhereInput = {
    AND?: FlowExecutionWhereInput | FlowExecutionWhereInput[]
    OR?: FlowExecutionWhereInput[]
    NOT?: FlowExecutionWhereInput | FlowExecutionWhereInput[]
    id?: StringFilter<"FlowExecution"> | string
    flowId?: StringFilter<"FlowExecution"> | string
    status?: StringFilter<"FlowExecution"> | string
    input?: StringNullableFilter<"FlowExecution"> | string | null
    output?: StringNullableFilter<"FlowExecution"> | string | null
    error?: StringNullableFilter<"FlowExecution"> | string | null
    startedAt?: DateTimeNullableFilter<"FlowExecution"> | Date | string | null
    endedAt?: DateTimeNullableFilter<"FlowExecution"> | Date | string | null
    createdAt?: DateTimeFilter<"FlowExecution"> | Date | string
    flow?: XOR<FlowScalarRelationFilter, FlowWhereInput>
  }

  export type FlowExecutionOrderByWithRelationInput = {
    id?: SortOrder
    flowId?: SortOrder
    status?: SortOrder
    input?: SortOrderInput | SortOrder
    output?: SortOrderInput | SortOrder
    error?: SortOrderInput | SortOrder
    startedAt?: SortOrderInput | SortOrder
    endedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    flow?: FlowOrderByWithRelationInput
  }

  export type FlowExecutionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FlowExecutionWhereInput | FlowExecutionWhereInput[]
    OR?: FlowExecutionWhereInput[]
    NOT?: FlowExecutionWhereInput | FlowExecutionWhereInput[]
    flowId?: StringFilter<"FlowExecution"> | string
    status?: StringFilter<"FlowExecution"> | string
    input?: StringNullableFilter<"FlowExecution"> | string | null
    output?: StringNullableFilter<"FlowExecution"> | string | null
    error?: StringNullableFilter<"FlowExecution"> | string | null
    startedAt?: DateTimeNullableFilter<"FlowExecution"> | Date | string | null
    endedAt?: DateTimeNullableFilter<"FlowExecution"> | Date | string | null
    createdAt?: DateTimeFilter<"FlowExecution"> | Date | string
    flow?: XOR<FlowScalarRelationFilter, FlowWhereInput>
  }, "id">

  export type FlowExecutionOrderByWithAggregationInput = {
    id?: SortOrder
    flowId?: SortOrder
    status?: SortOrder
    input?: SortOrderInput | SortOrder
    output?: SortOrderInput | SortOrder
    error?: SortOrderInput | SortOrder
    startedAt?: SortOrderInput | SortOrder
    endedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: FlowExecutionCountOrderByAggregateInput
    _max?: FlowExecutionMaxOrderByAggregateInput
    _min?: FlowExecutionMinOrderByAggregateInput
  }

  export type FlowExecutionScalarWhereWithAggregatesInput = {
    AND?: FlowExecutionScalarWhereWithAggregatesInput | FlowExecutionScalarWhereWithAggregatesInput[]
    OR?: FlowExecutionScalarWhereWithAggregatesInput[]
    NOT?: FlowExecutionScalarWhereWithAggregatesInput | FlowExecutionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FlowExecution"> | string
    flowId?: StringWithAggregatesFilter<"FlowExecution"> | string
    status?: StringWithAggregatesFilter<"FlowExecution"> | string
    input?: StringNullableWithAggregatesFilter<"FlowExecution"> | string | null
    output?: StringNullableWithAggregatesFilter<"FlowExecution"> | string | null
    error?: StringNullableWithAggregatesFilter<"FlowExecution"> | string | null
    startedAt?: DateTimeNullableWithAggregatesFilter<"FlowExecution"> | Date | string | null
    endedAt?: DateTimeNullableWithAggregatesFilter<"FlowExecution"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"FlowExecution"> | Date | string
  }

  export type UserSecretWhereInput = {
    AND?: UserSecretWhereInput | UserSecretWhereInput[]
    OR?: UserSecretWhereInput[]
    NOT?: UserSecretWhereInput | UserSecretWhereInput[]
    id?: StringFilter<"UserSecret"> | string
    userId?: StringFilter<"UserSecret"> | string
    name?: StringFilter<"UserSecret"> | string
    key?: StringFilter<"UserSecret"> | string
    label?: StringNullableFilter<"UserSecret"> | string | null
    lastUsedAt?: DateTimeNullableFilter<"UserSecret"> | Date | string | null
    createdAt?: DateTimeFilter<"UserSecret"> | Date | string
    updatedAt?: DateTimeFilter<"UserSecret"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserSecretOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    key?: SortOrder
    label?: SortOrderInput | SortOrder
    lastUsedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserSecretWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    key?: string
    userId_name?: UserSecretUserIdNameCompoundUniqueInput
    AND?: UserSecretWhereInput | UserSecretWhereInput[]
    OR?: UserSecretWhereInput[]
    NOT?: UserSecretWhereInput | UserSecretWhereInput[]
    userId?: StringFilter<"UserSecret"> | string
    name?: StringFilter<"UserSecret"> | string
    label?: StringNullableFilter<"UserSecret"> | string | null
    lastUsedAt?: DateTimeNullableFilter<"UserSecret"> | Date | string | null
    createdAt?: DateTimeFilter<"UserSecret"> | Date | string
    updatedAt?: DateTimeFilter<"UserSecret"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "key" | "userId_name">

  export type UserSecretOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    key?: SortOrder
    label?: SortOrderInput | SortOrder
    lastUsedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserSecretCountOrderByAggregateInput
    _max?: UserSecretMaxOrderByAggregateInput
    _min?: UserSecretMinOrderByAggregateInput
  }

  export type UserSecretScalarWhereWithAggregatesInput = {
    AND?: UserSecretScalarWhereWithAggregatesInput | UserSecretScalarWhereWithAggregatesInput[]
    OR?: UserSecretScalarWhereWithAggregatesInput[]
    NOT?: UserSecretScalarWhereWithAggregatesInput | UserSecretScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserSecret"> | string
    userId?: StringWithAggregatesFilter<"UserSecret"> | string
    name?: StringWithAggregatesFilter<"UserSecret"> | string
    key?: StringWithAggregatesFilter<"UserSecret"> | string
    label?: StringNullableWithAggregatesFilter<"UserSecret"> | string | null
    lastUsedAt?: DateTimeNullableWithAggregatesFilter<"UserSecret"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"UserSecret"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserSecret"> | Date | string
  }

  export type LLMProviderWhereInput = {
    AND?: LLMProviderWhereInput | LLMProviderWhereInput[]
    OR?: LLMProviderWhereInput[]
    NOT?: LLMProviderWhereInput | LLMProviderWhereInput[]
    id?: StringFilter<"LLMProvider"> | string
    userId?: StringFilter<"LLMProvider"> | string
    name?: StringFilter<"LLMProvider"> | string
    provider?: StringFilter<"LLMProvider"> | string
    baseUrl?: StringNullableFilter<"LLMProvider"> | string | null
    apiKey?: StringNullableFilter<"LLMProvider"> | string | null
    config?: StringNullableFilter<"LLMProvider"> | string | null
    createdAt?: DateTimeFilter<"LLMProvider"> | Date | string
    updatedAt?: DateTimeFilter<"LLMProvider"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type LLMProviderOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    provider?: SortOrder
    baseUrl?: SortOrderInput | SortOrder
    apiKey?: SortOrderInput | SortOrder
    config?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type LLMProviderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LLMProviderWhereInput | LLMProviderWhereInput[]
    OR?: LLMProviderWhereInput[]
    NOT?: LLMProviderWhereInput | LLMProviderWhereInput[]
    userId?: StringFilter<"LLMProvider"> | string
    name?: StringFilter<"LLMProvider"> | string
    provider?: StringFilter<"LLMProvider"> | string
    baseUrl?: StringNullableFilter<"LLMProvider"> | string | null
    apiKey?: StringNullableFilter<"LLMProvider"> | string | null
    config?: StringNullableFilter<"LLMProvider"> | string | null
    createdAt?: DateTimeFilter<"LLMProvider"> | Date | string
    updatedAt?: DateTimeFilter<"LLMProvider"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type LLMProviderOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    provider?: SortOrder
    baseUrl?: SortOrderInput | SortOrder
    apiKey?: SortOrderInput | SortOrder
    config?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: LLMProviderCountOrderByAggregateInput
    _max?: LLMProviderMaxOrderByAggregateInput
    _min?: LLMProviderMinOrderByAggregateInput
  }

  export type LLMProviderScalarWhereWithAggregatesInput = {
    AND?: LLMProviderScalarWhereWithAggregatesInput | LLMProviderScalarWhereWithAggregatesInput[]
    OR?: LLMProviderScalarWhereWithAggregatesInput[]
    NOT?: LLMProviderScalarWhereWithAggregatesInput | LLMProviderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LLMProvider"> | string
    userId?: StringWithAggregatesFilter<"LLMProvider"> | string
    name?: StringWithAggregatesFilter<"LLMProvider"> | string
    provider?: StringWithAggregatesFilter<"LLMProvider"> | string
    baseUrl?: StringNullableWithAggregatesFilter<"LLMProvider"> | string | null
    apiKey?: StringNullableWithAggregatesFilter<"LLMProvider"> | string | null
    config?: StringNullableWithAggregatesFilter<"LLMProvider"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"LLMProvider"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"LLMProvider"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    username: string
    password: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    flows?: FlowCreateNestedManyWithoutUserInput
    secrets?: UserSecretCreateNestedManyWithoutUserInput
    providers?: LLMProviderCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    username: string
    password: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    flows?: FlowUncheckedCreateNestedManyWithoutUserInput
    secrets?: UserSecretUncheckedCreateNestedManyWithoutUserInput
    providers?: LLMProviderUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    flows?: FlowUpdateManyWithoutUserNestedInput
    secrets?: UserSecretUpdateManyWithoutUserNestedInput
    providers?: LLMProviderUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    flows?: FlowUncheckedUpdateManyWithoutUserNestedInput
    secrets?: UserSecretUncheckedUpdateManyWithoutUserNestedInput
    providers?: LLMProviderUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    username: string
    password: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlowCreateInput = {
    id?: string
    name: string
    data: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutFlowsInput
    executions?: FlowExecutionCreateNestedManyWithoutFlowInput
  }

  export type FlowUncheckedCreateInput = {
    id?: string
    name: string
    data: string
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    executions?: FlowExecutionUncheckedCreateNestedManyWithoutFlowInput
  }

  export type FlowUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutFlowsNestedInput
    executions?: FlowExecutionUpdateManyWithoutFlowNestedInput
  }

  export type FlowUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    executions?: FlowExecutionUncheckedUpdateManyWithoutFlowNestedInput
  }

  export type FlowCreateManyInput = {
    id?: string
    name: string
    data: string
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FlowUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlowUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlowExecutionCreateInput = {
    id?: string
    status?: string
    input?: string | null
    output?: string | null
    error?: string | null
    startedAt?: Date | string | null
    endedAt?: Date | string | null
    createdAt?: Date | string
    flow: FlowCreateNestedOneWithoutExecutionsInput
  }

  export type FlowExecutionUncheckedCreateInput = {
    id?: string
    flowId: string
    status?: string
    input?: string | null
    output?: string | null
    error?: string | null
    startedAt?: Date | string | null
    endedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type FlowExecutionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    input?: NullableStringFieldUpdateOperationsInput | string | null
    output?: NullableStringFieldUpdateOperationsInput | string | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    flow?: FlowUpdateOneRequiredWithoutExecutionsNestedInput
  }

  export type FlowExecutionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    flowId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    input?: NullableStringFieldUpdateOperationsInput | string | null
    output?: NullableStringFieldUpdateOperationsInput | string | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlowExecutionCreateManyInput = {
    id?: string
    flowId: string
    status?: string
    input?: string | null
    output?: string | null
    error?: string | null
    startedAt?: Date | string | null
    endedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type FlowExecutionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    input?: NullableStringFieldUpdateOperationsInput | string | null
    output?: NullableStringFieldUpdateOperationsInput | string | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlowExecutionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    flowId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    input?: NullableStringFieldUpdateOperationsInput | string | null
    output?: NullableStringFieldUpdateOperationsInput | string | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSecretCreateInput = {
    id?: string
    name: string
    key: string
    label?: string | null
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutSecretsInput
  }

  export type UserSecretUncheckedCreateInput = {
    id?: string
    userId: string
    name: string
    key: string
    label?: string | null
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserSecretUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSecretsNestedInput
  }

  export type UserSecretUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSecretCreateManyInput = {
    id?: string
    userId: string
    name: string
    key: string
    label?: string | null
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserSecretUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSecretUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LLMProviderCreateInput = {
    id?: string
    name: string
    provider: string
    baseUrl?: string | null
    apiKey?: string | null
    config?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutProvidersInput
  }

  export type LLMProviderUncheckedCreateInput = {
    id?: string
    userId: string
    name: string
    provider: string
    baseUrl?: string | null
    apiKey?: string | null
    config?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LLMProviderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    baseUrl?: NullableStringFieldUpdateOperationsInput | string | null
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutProvidersNestedInput
  }

  export type LLMProviderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    baseUrl?: NullableStringFieldUpdateOperationsInput | string | null
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LLMProviderCreateManyInput = {
    id?: string
    userId: string
    name: string
    provider: string
    baseUrl?: string | null
    apiKey?: string | null
    config?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LLMProviderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    baseUrl?: NullableStringFieldUpdateOperationsInput | string | null
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LLMProviderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    baseUrl?: NullableStringFieldUpdateOperationsInput | string | null
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type FlowListRelationFilter = {
    every?: FlowWhereInput
    some?: FlowWhereInput
    none?: FlowWhereInput
  }

  export type UserSecretListRelationFilter = {
    every?: UserSecretWhereInput
    some?: UserSecretWhereInput
    none?: UserSecretWhereInput
  }

  export type LLMProviderListRelationFilter = {
    every?: LLMProviderWhereInput
    some?: LLMProviderWhereInput
    none?: LLMProviderWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type FlowOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserSecretOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LLMProviderOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    username?: SortOrder
    password?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type FlowExecutionListRelationFilter = {
    every?: FlowExecutionWhereInput
    some?: FlowExecutionWhereInput
    none?: FlowExecutionWhereInput
  }

  export type FlowExecutionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FlowCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    data?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FlowMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    data?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FlowMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    data?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type FlowScalarRelationFilter = {
    is?: FlowWhereInput
    isNot?: FlowWhereInput
  }

  export type FlowExecutionCountOrderByAggregateInput = {
    id?: SortOrder
    flowId?: SortOrder
    status?: SortOrder
    input?: SortOrder
    output?: SortOrder
    error?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type FlowExecutionMaxOrderByAggregateInput = {
    id?: SortOrder
    flowId?: SortOrder
    status?: SortOrder
    input?: SortOrder
    output?: SortOrder
    error?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type FlowExecutionMinOrderByAggregateInput = {
    id?: SortOrder
    flowId?: SortOrder
    status?: SortOrder
    input?: SortOrder
    output?: SortOrder
    error?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type UserSecretUserIdNameCompoundUniqueInput = {
    userId: string
    name: string
  }

  export type UserSecretCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    key?: SortOrder
    label?: SortOrder
    lastUsedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSecretMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    key?: SortOrder
    label?: SortOrder
    lastUsedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSecretMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    key?: SortOrder
    label?: SortOrder
    lastUsedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LLMProviderCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    provider?: SortOrder
    baseUrl?: SortOrder
    apiKey?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LLMProviderMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    provider?: SortOrder
    baseUrl?: SortOrder
    apiKey?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LLMProviderMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    provider?: SortOrder
    baseUrl?: SortOrder
    apiKey?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FlowCreateNestedManyWithoutUserInput = {
    create?: XOR<FlowCreateWithoutUserInput, FlowUncheckedCreateWithoutUserInput> | FlowCreateWithoutUserInput[] | FlowUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FlowCreateOrConnectWithoutUserInput | FlowCreateOrConnectWithoutUserInput[]
    createMany?: FlowCreateManyUserInputEnvelope
    connect?: FlowWhereUniqueInput | FlowWhereUniqueInput[]
  }

  export type UserSecretCreateNestedManyWithoutUserInput = {
    create?: XOR<UserSecretCreateWithoutUserInput, UserSecretUncheckedCreateWithoutUserInput> | UserSecretCreateWithoutUserInput[] | UserSecretUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserSecretCreateOrConnectWithoutUserInput | UserSecretCreateOrConnectWithoutUserInput[]
    createMany?: UserSecretCreateManyUserInputEnvelope
    connect?: UserSecretWhereUniqueInput | UserSecretWhereUniqueInput[]
  }

  export type LLMProviderCreateNestedManyWithoutUserInput = {
    create?: XOR<LLMProviderCreateWithoutUserInput, LLMProviderUncheckedCreateWithoutUserInput> | LLMProviderCreateWithoutUserInput[] | LLMProviderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LLMProviderCreateOrConnectWithoutUserInput | LLMProviderCreateOrConnectWithoutUserInput[]
    createMany?: LLMProviderCreateManyUserInputEnvelope
    connect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
  }

  export type FlowUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<FlowCreateWithoutUserInput, FlowUncheckedCreateWithoutUserInput> | FlowCreateWithoutUserInput[] | FlowUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FlowCreateOrConnectWithoutUserInput | FlowCreateOrConnectWithoutUserInput[]
    createMany?: FlowCreateManyUserInputEnvelope
    connect?: FlowWhereUniqueInput | FlowWhereUniqueInput[]
  }

  export type UserSecretUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserSecretCreateWithoutUserInput, UserSecretUncheckedCreateWithoutUserInput> | UserSecretCreateWithoutUserInput[] | UserSecretUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserSecretCreateOrConnectWithoutUserInput | UserSecretCreateOrConnectWithoutUserInput[]
    createMany?: UserSecretCreateManyUserInputEnvelope
    connect?: UserSecretWhereUniqueInput | UserSecretWhereUniqueInput[]
  }

  export type LLMProviderUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<LLMProviderCreateWithoutUserInput, LLMProviderUncheckedCreateWithoutUserInput> | LLMProviderCreateWithoutUserInput[] | LLMProviderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LLMProviderCreateOrConnectWithoutUserInput | LLMProviderCreateOrConnectWithoutUserInput[]
    createMany?: LLMProviderCreateManyUserInputEnvelope
    connect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type FlowUpdateManyWithoutUserNestedInput = {
    create?: XOR<FlowCreateWithoutUserInput, FlowUncheckedCreateWithoutUserInput> | FlowCreateWithoutUserInput[] | FlowUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FlowCreateOrConnectWithoutUserInput | FlowCreateOrConnectWithoutUserInput[]
    upsert?: FlowUpsertWithWhereUniqueWithoutUserInput | FlowUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: FlowCreateManyUserInputEnvelope
    set?: FlowWhereUniqueInput | FlowWhereUniqueInput[]
    disconnect?: FlowWhereUniqueInput | FlowWhereUniqueInput[]
    delete?: FlowWhereUniqueInput | FlowWhereUniqueInput[]
    connect?: FlowWhereUniqueInput | FlowWhereUniqueInput[]
    update?: FlowUpdateWithWhereUniqueWithoutUserInput | FlowUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: FlowUpdateManyWithWhereWithoutUserInput | FlowUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: FlowScalarWhereInput | FlowScalarWhereInput[]
  }

  export type UserSecretUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserSecretCreateWithoutUserInput, UserSecretUncheckedCreateWithoutUserInput> | UserSecretCreateWithoutUserInput[] | UserSecretUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserSecretCreateOrConnectWithoutUserInput | UserSecretCreateOrConnectWithoutUserInput[]
    upsert?: UserSecretUpsertWithWhereUniqueWithoutUserInput | UserSecretUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserSecretCreateManyUserInputEnvelope
    set?: UserSecretWhereUniqueInput | UserSecretWhereUniqueInput[]
    disconnect?: UserSecretWhereUniqueInput | UserSecretWhereUniqueInput[]
    delete?: UserSecretWhereUniqueInput | UserSecretWhereUniqueInput[]
    connect?: UserSecretWhereUniqueInput | UserSecretWhereUniqueInput[]
    update?: UserSecretUpdateWithWhereUniqueWithoutUserInput | UserSecretUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserSecretUpdateManyWithWhereWithoutUserInput | UserSecretUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserSecretScalarWhereInput | UserSecretScalarWhereInput[]
  }

  export type LLMProviderUpdateManyWithoutUserNestedInput = {
    create?: XOR<LLMProviderCreateWithoutUserInput, LLMProviderUncheckedCreateWithoutUserInput> | LLMProviderCreateWithoutUserInput[] | LLMProviderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LLMProviderCreateOrConnectWithoutUserInput | LLMProviderCreateOrConnectWithoutUserInput[]
    upsert?: LLMProviderUpsertWithWhereUniqueWithoutUserInput | LLMProviderUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: LLMProviderCreateManyUserInputEnvelope
    set?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    disconnect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    delete?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    connect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    update?: LLMProviderUpdateWithWhereUniqueWithoutUserInput | LLMProviderUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: LLMProviderUpdateManyWithWhereWithoutUserInput | LLMProviderUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: LLMProviderScalarWhereInput | LLMProviderScalarWhereInput[]
  }

  export type FlowUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<FlowCreateWithoutUserInput, FlowUncheckedCreateWithoutUserInput> | FlowCreateWithoutUserInput[] | FlowUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FlowCreateOrConnectWithoutUserInput | FlowCreateOrConnectWithoutUserInput[]
    upsert?: FlowUpsertWithWhereUniqueWithoutUserInput | FlowUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: FlowCreateManyUserInputEnvelope
    set?: FlowWhereUniqueInput | FlowWhereUniqueInput[]
    disconnect?: FlowWhereUniqueInput | FlowWhereUniqueInput[]
    delete?: FlowWhereUniqueInput | FlowWhereUniqueInput[]
    connect?: FlowWhereUniqueInput | FlowWhereUniqueInput[]
    update?: FlowUpdateWithWhereUniqueWithoutUserInput | FlowUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: FlowUpdateManyWithWhereWithoutUserInput | FlowUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: FlowScalarWhereInput | FlowScalarWhereInput[]
  }

  export type UserSecretUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserSecretCreateWithoutUserInput, UserSecretUncheckedCreateWithoutUserInput> | UserSecretCreateWithoutUserInput[] | UserSecretUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserSecretCreateOrConnectWithoutUserInput | UserSecretCreateOrConnectWithoutUserInput[]
    upsert?: UserSecretUpsertWithWhereUniqueWithoutUserInput | UserSecretUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserSecretCreateManyUserInputEnvelope
    set?: UserSecretWhereUniqueInput | UserSecretWhereUniqueInput[]
    disconnect?: UserSecretWhereUniqueInput | UserSecretWhereUniqueInput[]
    delete?: UserSecretWhereUniqueInput | UserSecretWhereUniqueInput[]
    connect?: UserSecretWhereUniqueInput | UserSecretWhereUniqueInput[]
    update?: UserSecretUpdateWithWhereUniqueWithoutUserInput | UserSecretUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserSecretUpdateManyWithWhereWithoutUserInput | UserSecretUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserSecretScalarWhereInput | UserSecretScalarWhereInput[]
  }

  export type LLMProviderUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<LLMProviderCreateWithoutUserInput, LLMProviderUncheckedCreateWithoutUserInput> | LLMProviderCreateWithoutUserInput[] | LLMProviderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: LLMProviderCreateOrConnectWithoutUserInput | LLMProviderCreateOrConnectWithoutUserInput[]
    upsert?: LLMProviderUpsertWithWhereUniqueWithoutUserInput | LLMProviderUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: LLMProviderCreateManyUserInputEnvelope
    set?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    disconnect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    delete?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    connect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    update?: LLMProviderUpdateWithWhereUniqueWithoutUserInput | LLMProviderUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: LLMProviderUpdateManyWithWhereWithoutUserInput | LLMProviderUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: LLMProviderScalarWhereInput | LLMProviderScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutFlowsInput = {
    create?: XOR<UserCreateWithoutFlowsInput, UserUncheckedCreateWithoutFlowsInput>
    connectOrCreate?: UserCreateOrConnectWithoutFlowsInput
    connect?: UserWhereUniqueInput
  }

  export type FlowExecutionCreateNestedManyWithoutFlowInput = {
    create?: XOR<FlowExecutionCreateWithoutFlowInput, FlowExecutionUncheckedCreateWithoutFlowInput> | FlowExecutionCreateWithoutFlowInput[] | FlowExecutionUncheckedCreateWithoutFlowInput[]
    connectOrCreate?: FlowExecutionCreateOrConnectWithoutFlowInput | FlowExecutionCreateOrConnectWithoutFlowInput[]
    createMany?: FlowExecutionCreateManyFlowInputEnvelope
    connect?: FlowExecutionWhereUniqueInput | FlowExecutionWhereUniqueInput[]
  }

  export type FlowExecutionUncheckedCreateNestedManyWithoutFlowInput = {
    create?: XOR<FlowExecutionCreateWithoutFlowInput, FlowExecutionUncheckedCreateWithoutFlowInput> | FlowExecutionCreateWithoutFlowInput[] | FlowExecutionUncheckedCreateWithoutFlowInput[]
    connectOrCreate?: FlowExecutionCreateOrConnectWithoutFlowInput | FlowExecutionCreateOrConnectWithoutFlowInput[]
    createMany?: FlowExecutionCreateManyFlowInputEnvelope
    connect?: FlowExecutionWhereUniqueInput | FlowExecutionWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutFlowsNestedInput = {
    create?: XOR<UserCreateWithoutFlowsInput, UserUncheckedCreateWithoutFlowsInput>
    connectOrCreate?: UserCreateOrConnectWithoutFlowsInput
    upsert?: UserUpsertWithoutFlowsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutFlowsInput, UserUpdateWithoutFlowsInput>, UserUncheckedUpdateWithoutFlowsInput>
  }

  export type FlowExecutionUpdateManyWithoutFlowNestedInput = {
    create?: XOR<FlowExecutionCreateWithoutFlowInput, FlowExecutionUncheckedCreateWithoutFlowInput> | FlowExecutionCreateWithoutFlowInput[] | FlowExecutionUncheckedCreateWithoutFlowInput[]
    connectOrCreate?: FlowExecutionCreateOrConnectWithoutFlowInput | FlowExecutionCreateOrConnectWithoutFlowInput[]
    upsert?: FlowExecutionUpsertWithWhereUniqueWithoutFlowInput | FlowExecutionUpsertWithWhereUniqueWithoutFlowInput[]
    createMany?: FlowExecutionCreateManyFlowInputEnvelope
    set?: FlowExecutionWhereUniqueInput | FlowExecutionWhereUniqueInput[]
    disconnect?: FlowExecutionWhereUniqueInput | FlowExecutionWhereUniqueInput[]
    delete?: FlowExecutionWhereUniqueInput | FlowExecutionWhereUniqueInput[]
    connect?: FlowExecutionWhereUniqueInput | FlowExecutionWhereUniqueInput[]
    update?: FlowExecutionUpdateWithWhereUniqueWithoutFlowInput | FlowExecutionUpdateWithWhereUniqueWithoutFlowInput[]
    updateMany?: FlowExecutionUpdateManyWithWhereWithoutFlowInput | FlowExecutionUpdateManyWithWhereWithoutFlowInput[]
    deleteMany?: FlowExecutionScalarWhereInput | FlowExecutionScalarWhereInput[]
  }

  export type FlowExecutionUncheckedUpdateManyWithoutFlowNestedInput = {
    create?: XOR<FlowExecutionCreateWithoutFlowInput, FlowExecutionUncheckedCreateWithoutFlowInput> | FlowExecutionCreateWithoutFlowInput[] | FlowExecutionUncheckedCreateWithoutFlowInput[]
    connectOrCreate?: FlowExecutionCreateOrConnectWithoutFlowInput | FlowExecutionCreateOrConnectWithoutFlowInput[]
    upsert?: FlowExecutionUpsertWithWhereUniqueWithoutFlowInput | FlowExecutionUpsertWithWhereUniqueWithoutFlowInput[]
    createMany?: FlowExecutionCreateManyFlowInputEnvelope
    set?: FlowExecutionWhereUniqueInput | FlowExecutionWhereUniqueInput[]
    disconnect?: FlowExecutionWhereUniqueInput | FlowExecutionWhereUniqueInput[]
    delete?: FlowExecutionWhereUniqueInput | FlowExecutionWhereUniqueInput[]
    connect?: FlowExecutionWhereUniqueInput | FlowExecutionWhereUniqueInput[]
    update?: FlowExecutionUpdateWithWhereUniqueWithoutFlowInput | FlowExecutionUpdateWithWhereUniqueWithoutFlowInput[]
    updateMany?: FlowExecutionUpdateManyWithWhereWithoutFlowInput | FlowExecutionUpdateManyWithWhereWithoutFlowInput[]
    deleteMany?: FlowExecutionScalarWhereInput | FlowExecutionScalarWhereInput[]
  }

  export type FlowCreateNestedOneWithoutExecutionsInput = {
    create?: XOR<FlowCreateWithoutExecutionsInput, FlowUncheckedCreateWithoutExecutionsInput>
    connectOrCreate?: FlowCreateOrConnectWithoutExecutionsInput
    connect?: FlowWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type FlowUpdateOneRequiredWithoutExecutionsNestedInput = {
    create?: XOR<FlowCreateWithoutExecutionsInput, FlowUncheckedCreateWithoutExecutionsInput>
    connectOrCreate?: FlowCreateOrConnectWithoutExecutionsInput
    upsert?: FlowUpsertWithoutExecutionsInput
    connect?: FlowWhereUniqueInput
    update?: XOR<XOR<FlowUpdateToOneWithWhereWithoutExecutionsInput, FlowUpdateWithoutExecutionsInput>, FlowUncheckedUpdateWithoutExecutionsInput>
  }

  export type UserCreateNestedOneWithoutSecretsInput = {
    create?: XOR<UserCreateWithoutSecretsInput, UserUncheckedCreateWithoutSecretsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSecretsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutSecretsNestedInput = {
    create?: XOR<UserCreateWithoutSecretsInput, UserUncheckedCreateWithoutSecretsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSecretsInput
    upsert?: UserUpsertWithoutSecretsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSecretsInput, UserUpdateWithoutSecretsInput>, UserUncheckedUpdateWithoutSecretsInput>
  }

  export type UserCreateNestedOneWithoutProvidersInput = {
    create?: XOR<UserCreateWithoutProvidersInput, UserUncheckedCreateWithoutProvidersInput>
    connectOrCreate?: UserCreateOrConnectWithoutProvidersInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutProvidersNestedInput = {
    create?: XOR<UserCreateWithoutProvidersInput, UserUncheckedCreateWithoutProvidersInput>
    connectOrCreate?: UserCreateOrConnectWithoutProvidersInput
    upsert?: UserUpsertWithoutProvidersInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutProvidersInput, UserUpdateWithoutProvidersInput>, UserUncheckedUpdateWithoutProvidersInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type FlowCreateWithoutUserInput = {
    id?: string
    name: string
    data: string
    createdAt?: Date | string
    updatedAt?: Date | string
    executions?: FlowExecutionCreateNestedManyWithoutFlowInput
  }

  export type FlowUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    data: string
    createdAt?: Date | string
    updatedAt?: Date | string
    executions?: FlowExecutionUncheckedCreateNestedManyWithoutFlowInput
  }

  export type FlowCreateOrConnectWithoutUserInput = {
    where: FlowWhereUniqueInput
    create: XOR<FlowCreateWithoutUserInput, FlowUncheckedCreateWithoutUserInput>
  }

  export type FlowCreateManyUserInputEnvelope = {
    data: FlowCreateManyUserInput | FlowCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserSecretCreateWithoutUserInput = {
    id?: string
    name: string
    key: string
    label?: string | null
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserSecretUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    key: string
    label?: string | null
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserSecretCreateOrConnectWithoutUserInput = {
    where: UserSecretWhereUniqueInput
    create: XOR<UserSecretCreateWithoutUserInput, UserSecretUncheckedCreateWithoutUserInput>
  }

  export type UserSecretCreateManyUserInputEnvelope = {
    data: UserSecretCreateManyUserInput | UserSecretCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type LLMProviderCreateWithoutUserInput = {
    id?: string
    name: string
    provider: string
    baseUrl?: string | null
    apiKey?: string | null
    config?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LLMProviderUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    provider: string
    baseUrl?: string | null
    apiKey?: string | null
    config?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LLMProviderCreateOrConnectWithoutUserInput = {
    where: LLMProviderWhereUniqueInput
    create: XOR<LLMProviderCreateWithoutUserInput, LLMProviderUncheckedCreateWithoutUserInput>
  }

  export type LLMProviderCreateManyUserInputEnvelope = {
    data: LLMProviderCreateManyUserInput | LLMProviderCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type FlowUpsertWithWhereUniqueWithoutUserInput = {
    where: FlowWhereUniqueInput
    update: XOR<FlowUpdateWithoutUserInput, FlowUncheckedUpdateWithoutUserInput>
    create: XOR<FlowCreateWithoutUserInput, FlowUncheckedCreateWithoutUserInput>
  }

  export type FlowUpdateWithWhereUniqueWithoutUserInput = {
    where: FlowWhereUniqueInput
    data: XOR<FlowUpdateWithoutUserInput, FlowUncheckedUpdateWithoutUserInput>
  }

  export type FlowUpdateManyWithWhereWithoutUserInput = {
    where: FlowScalarWhereInput
    data: XOR<FlowUpdateManyMutationInput, FlowUncheckedUpdateManyWithoutUserInput>
  }

  export type FlowScalarWhereInput = {
    AND?: FlowScalarWhereInput | FlowScalarWhereInput[]
    OR?: FlowScalarWhereInput[]
    NOT?: FlowScalarWhereInput | FlowScalarWhereInput[]
    id?: StringFilter<"Flow"> | string
    name?: StringFilter<"Flow"> | string
    data?: StringFilter<"Flow"> | string
    userId?: StringFilter<"Flow"> | string
    createdAt?: DateTimeFilter<"Flow"> | Date | string
    updatedAt?: DateTimeFilter<"Flow"> | Date | string
  }

  export type UserSecretUpsertWithWhereUniqueWithoutUserInput = {
    where: UserSecretWhereUniqueInput
    update: XOR<UserSecretUpdateWithoutUserInput, UserSecretUncheckedUpdateWithoutUserInput>
    create: XOR<UserSecretCreateWithoutUserInput, UserSecretUncheckedCreateWithoutUserInput>
  }

  export type UserSecretUpdateWithWhereUniqueWithoutUserInput = {
    where: UserSecretWhereUniqueInput
    data: XOR<UserSecretUpdateWithoutUserInput, UserSecretUncheckedUpdateWithoutUserInput>
  }

  export type UserSecretUpdateManyWithWhereWithoutUserInput = {
    where: UserSecretScalarWhereInput
    data: XOR<UserSecretUpdateManyMutationInput, UserSecretUncheckedUpdateManyWithoutUserInput>
  }

  export type UserSecretScalarWhereInput = {
    AND?: UserSecretScalarWhereInput | UserSecretScalarWhereInput[]
    OR?: UserSecretScalarWhereInput[]
    NOT?: UserSecretScalarWhereInput | UserSecretScalarWhereInput[]
    id?: StringFilter<"UserSecret"> | string
    userId?: StringFilter<"UserSecret"> | string
    name?: StringFilter<"UserSecret"> | string
    key?: StringFilter<"UserSecret"> | string
    label?: StringNullableFilter<"UserSecret"> | string | null
    lastUsedAt?: DateTimeNullableFilter<"UserSecret"> | Date | string | null
    createdAt?: DateTimeFilter<"UserSecret"> | Date | string
    updatedAt?: DateTimeFilter<"UserSecret"> | Date | string
  }

  export type LLMProviderUpsertWithWhereUniqueWithoutUserInput = {
    where: LLMProviderWhereUniqueInput
    update: XOR<LLMProviderUpdateWithoutUserInput, LLMProviderUncheckedUpdateWithoutUserInput>
    create: XOR<LLMProviderCreateWithoutUserInput, LLMProviderUncheckedCreateWithoutUserInput>
  }

  export type LLMProviderUpdateWithWhereUniqueWithoutUserInput = {
    where: LLMProviderWhereUniqueInput
    data: XOR<LLMProviderUpdateWithoutUserInput, LLMProviderUncheckedUpdateWithoutUserInput>
  }

  export type LLMProviderUpdateManyWithWhereWithoutUserInput = {
    where: LLMProviderScalarWhereInput
    data: XOR<LLMProviderUpdateManyMutationInput, LLMProviderUncheckedUpdateManyWithoutUserInput>
  }

  export type LLMProviderScalarWhereInput = {
    AND?: LLMProviderScalarWhereInput | LLMProviderScalarWhereInput[]
    OR?: LLMProviderScalarWhereInput[]
    NOT?: LLMProviderScalarWhereInput | LLMProviderScalarWhereInput[]
    id?: StringFilter<"LLMProvider"> | string
    userId?: StringFilter<"LLMProvider"> | string
    name?: StringFilter<"LLMProvider"> | string
    provider?: StringFilter<"LLMProvider"> | string
    baseUrl?: StringNullableFilter<"LLMProvider"> | string | null
    apiKey?: StringNullableFilter<"LLMProvider"> | string | null
    config?: StringNullableFilter<"LLMProvider"> | string | null
    createdAt?: DateTimeFilter<"LLMProvider"> | Date | string
    updatedAt?: DateTimeFilter<"LLMProvider"> | Date | string
  }

  export type UserCreateWithoutFlowsInput = {
    id?: string
    email: string
    username: string
    password: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    secrets?: UserSecretCreateNestedManyWithoutUserInput
    providers?: LLMProviderCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutFlowsInput = {
    id?: string
    email: string
    username: string
    password: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    secrets?: UserSecretUncheckedCreateNestedManyWithoutUserInput
    providers?: LLMProviderUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutFlowsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutFlowsInput, UserUncheckedCreateWithoutFlowsInput>
  }

  export type FlowExecutionCreateWithoutFlowInput = {
    id?: string
    status?: string
    input?: string | null
    output?: string | null
    error?: string | null
    startedAt?: Date | string | null
    endedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type FlowExecutionUncheckedCreateWithoutFlowInput = {
    id?: string
    status?: string
    input?: string | null
    output?: string | null
    error?: string | null
    startedAt?: Date | string | null
    endedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type FlowExecutionCreateOrConnectWithoutFlowInput = {
    where: FlowExecutionWhereUniqueInput
    create: XOR<FlowExecutionCreateWithoutFlowInput, FlowExecutionUncheckedCreateWithoutFlowInput>
  }

  export type FlowExecutionCreateManyFlowInputEnvelope = {
    data: FlowExecutionCreateManyFlowInput | FlowExecutionCreateManyFlowInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutFlowsInput = {
    update: XOR<UserUpdateWithoutFlowsInput, UserUncheckedUpdateWithoutFlowsInput>
    create: XOR<UserCreateWithoutFlowsInput, UserUncheckedCreateWithoutFlowsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutFlowsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutFlowsInput, UserUncheckedUpdateWithoutFlowsInput>
  }

  export type UserUpdateWithoutFlowsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    secrets?: UserSecretUpdateManyWithoutUserNestedInput
    providers?: LLMProviderUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutFlowsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    secrets?: UserSecretUncheckedUpdateManyWithoutUserNestedInput
    providers?: LLMProviderUncheckedUpdateManyWithoutUserNestedInput
  }

  export type FlowExecutionUpsertWithWhereUniqueWithoutFlowInput = {
    where: FlowExecutionWhereUniqueInput
    update: XOR<FlowExecutionUpdateWithoutFlowInput, FlowExecutionUncheckedUpdateWithoutFlowInput>
    create: XOR<FlowExecutionCreateWithoutFlowInput, FlowExecutionUncheckedCreateWithoutFlowInput>
  }

  export type FlowExecutionUpdateWithWhereUniqueWithoutFlowInput = {
    where: FlowExecutionWhereUniqueInput
    data: XOR<FlowExecutionUpdateWithoutFlowInput, FlowExecutionUncheckedUpdateWithoutFlowInput>
  }

  export type FlowExecutionUpdateManyWithWhereWithoutFlowInput = {
    where: FlowExecutionScalarWhereInput
    data: XOR<FlowExecutionUpdateManyMutationInput, FlowExecutionUncheckedUpdateManyWithoutFlowInput>
  }

  export type FlowExecutionScalarWhereInput = {
    AND?: FlowExecutionScalarWhereInput | FlowExecutionScalarWhereInput[]
    OR?: FlowExecutionScalarWhereInput[]
    NOT?: FlowExecutionScalarWhereInput | FlowExecutionScalarWhereInput[]
    id?: StringFilter<"FlowExecution"> | string
    flowId?: StringFilter<"FlowExecution"> | string
    status?: StringFilter<"FlowExecution"> | string
    input?: StringNullableFilter<"FlowExecution"> | string | null
    output?: StringNullableFilter<"FlowExecution"> | string | null
    error?: StringNullableFilter<"FlowExecution"> | string | null
    startedAt?: DateTimeNullableFilter<"FlowExecution"> | Date | string | null
    endedAt?: DateTimeNullableFilter<"FlowExecution"> | Date | string | null
    createdAt?: DateTimeFilter<"FlowExecution"> | Date | string
  }

  export type FlowCreateWithoutExecutionsInput = {
    id?: string
    name: string
    data: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutFlowsInput
  }

  export type FlowUncheckedCreateWithoutExecutionsInput = {
    id?: string
    name: string
    data: string
    userId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FlowCreateOrConnectWithoutExecutionsInput = {
    where: FlowWhereUniqueInput
    create: XOR<FlowCreateWithoutExecutionsInput, FlowUncheckedCreateWithoutExecutionsInput>
  }

  export type FlowUpsertWithoutExecutionsInput = {
    update: XOR<FlowUpdateWithoutExecutionsInput, FlowUncheckedUpdateWithoutExecutionsInput>
    create: XOR<FlowCreateWithoutExecutionsInput, FlowUncheckedCreateWithoutExecutionsInput>
    where?: FlowWhereInput
  }

  export type FlowUpdateToOneWithWhereWithoutExecutionsInput = {
    where?: FlowWhereInput
    data: XOR<FlowUpdateWithoutExecutionsInput, FlowUncheckedUpdateWithoutExecutionsInput>
  }

  export type FlowUpdateWithoutExecutionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutFlowsNestedInput
  }

  export type FlowUncheckedUpdateWithoutExecutionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutSecretsInput = {
    id?: string
    email: string
    username: string
    password: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    flows?: FlowCreateNestedManyWithoutUserInput
    providers?: LLMProviderCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSecretsInput = {
    id?: string
    email: string
    username: string
    password: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    flows?: FlowUncheckedCreateNestedManyWithoutUserInput
    providers?: LLMProviderUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSecretsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSecretsInput, UserUncheckedCreateWithoutSecretsInput>
  }

  export type UserUpsertWithoutSecretsInput = {
    update: XOR<UserUpdateWithoutSecretsInput, UserUncheckedUpdateWithoutSecretsInput>
    create: XOR<UserCreateWithoutSecretsInput, UserUncheckedCreateWithoutSecretsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSecretsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSecretsInput, UserUncheckedUpdateWithoutSecretsInput>
  }

  export type UserUpdateWithoutSecretsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    flows?: FlowUpdateManyWithoutUserNestedInput
    providers?: LLMProviderUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSecretsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    flows?: FlowUncheckedUpdateManyWithoutUserNestedInput
    providers?: LLMProviderUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutProvidersInput = {
    id?: string
    email: string
    username: string
    password: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    flows?: FlowCreateNestedManyWithoutUserInput
    secrets?: UserSecretCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutProvidersInput = {
    id?: string
    email: string
    username: string
    password: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    flows?: FlowUncheckedCreateNestedManyWithoutUserInput
    secrets?: UserSecretUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutProvidersInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutProvidersInput, UserUncheckedCreateWithoutProvidersInput>
  }

  export type UserUpsertWithoutProvidersInput = {
    update: XOR<UserUpdateWithoutProvidersInput, UserUncheckedUpdateWithoutProvidersInput>
    create: XOR<UserCreateWithoutProvidersInput, UserUncheckedCreateWithoutProvidersInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutProvidersInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutProvidersInput, UserUncheckedUpdateWithoutProvidersInput>
  }

  export type UserUpdateWithoutProvidersInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    flows?: FlowUpdateManyWithoutUserNestedInput
    secrets?: UserSecretUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutProvidersInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    flows?: FlowUncheckedUpdateManyWithoutUserNestedInput
    secrets?: UserSecretUncheckedUpdateManyWithoutUserNestedInput
  }

  export type FlowCreateManyUserInput = {
    id?: string
    name: string
    data: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserSecretCreateManyUserInput = {
    id?: string
    name: string
    key: string
    label?: string | null
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LLMProviderCreateManyUserInput = {
    id?: string
    name: string
    provider: string
    baseUrl?: string | null
    apiKey?: string | null
    config?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FlowUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    executions?: FlowExecutionUpdateManyWithoutFlowNestedInput
  }

  export type FlowUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    executions?: FlowExecutionUncheckedUpdateManyWithoutFlowNestedInput
  }

  export type FlowUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    data?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSecretUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSecretUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserSecretUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LLMProviderUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    baseUrl?: NullableStringFieldUpdateOperationsInput | string | null
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LLMProviderUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    baseUrl?: NullableStringFieldUpdateOperationsInput | string | null
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LLMProviderUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    baseUrl?: NullableStringFieldUpdateOperationsInput | string | null
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlowExecutionCreateManyFlowInput = {
    id?: string
    status?: string
    input?: string | null
    output?: string | null
    error?: string | null
    startedAt?: Date | string | null
    endedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type FlowExecutionUpdateWithoutFlowInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    input?: NullableStringFieldUpdateOperationsInput | string | null
    output?: NullableStringFieldUpdateOperationsInput | string | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlowExecutionUncheckedUpdateWithoutFlowInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    input?: NullableStringFieldUpdateOperationsInput | string | null
    output?: NullableStringFieldUpdateOperationsInput | string | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FlowExecutionUncheckedUpdateManyWithoutFlowInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    input?: NullableStringFieldUpdateOperationsInput | string | null
    output?: NullableStringFieldUpdateOperationsInput | string | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}