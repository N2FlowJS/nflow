
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Team
 * 
 */
export type Team = $Result.DefaultSelection<Prisma.$TeamPayload>
/**
 * Model MemberTeam
 * 
 */
export type MemberTeam = $Result.DefaultSelection<Prisma.$MemberTeamPayload>
/**
 * Model Knowledge
 * 
 */
export type Knowledge = $Result.DefaultSelection<Prisma.$KnowledgePayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model File
 * 
 */
export type File = $Result.DefaultSelection<Prisma.$FilePayload>
/**
 * Model FileParsingTask
 * 
 */
export type FileParsingTask = $Result.DefaultSelection<Prisma.$FileParsingTaskPayload>
/**
 * Model Agent
 * 
 */
export type Agent = $Result.DefaultSelection<Prisma.$AgentPayload>
/**
 * Model TextChunk
 * 
 */
export type TextChunk = $Result.DefaultSelection<Prisma.$TextChunkPayload>
/**
 * Model LLMProvider
 * 
 */
export type LLMProvider = $Result.DefaultSelection<Prisma.$LLMProviderPayload>
/**
 * Model LLMModel
 * 
 */
export type LLMModel = $Result.DefaultSelection<Prisma.$LLMModelPayload>
/**
 * Model Conversation
 * 
 */
export type Conversation = $Result.DefaultSelection<Prisma.$ConversationPayload>
/**
 * Model ConversationMessage
 * 
 */
export type ConversationMessage = $Result.DefaultSelection<Prisma.$ConversationMessagePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Teams
 * const teams = await prisma.team.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Teams
   * const teams = await prisma.team.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
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
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
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
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
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
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
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
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.team`: Exposes CRUD operations for the **Team** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Teams
    * const teams = await prisma.team.findMany()
    * ```
    */
  get team(): Prisma.TeamDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.memberTeam`: Exposes CRUD operations for the **MemberTeam** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MemberTeams
    * const memberTeams = await prisma.memberTeam.findMany()
    * ```
    */
  get memberTeam(): Prisma.MemberTeamDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.knowledge`: Exposes CRUD operations for the **Knowledge** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Knowledges
    * const knowledges = await prisma.knowledge.findMany()
    * ```
    */
  get knowledge(): Prisma.KnowledgeDelegate<ExtArgs, ClientOptions>;

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
   * `prisma.file`: Exposes CRUD operations for the **File** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Files
    * const files = await prisma.file.findMany()
    * ```
    */
  get file(): Prisma.FileDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.fileParsingTask`: Exposes CRUD operations for the **FileParsingTask** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FileParsingTasks
    * const fileParsingTasks = await prisma.fileParsingTask.findMany()
    * ```
    */
  get fileParsingTask(): Prisma.FileParsingTaskDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.agent`: Exposes CRUD operations for the **Agent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Agents
    * const agents = await prisma.agent.findMany()
    * ```
    */
  get agent(): Prisma.AgentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.textChunk`: Exposes CRUD operations for the **TextChunk** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TextChunks
    * const textChunks = await prisma.textChunk.findMany()
    * ```
    */
  get textChunk(): Prisma.TextChunkDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.lLMProvider`: Exposes CRUD operations for the **LLMProvider** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LLMProviders
    * const lLMProviders = await prisma.lLMProvider.findMany()
    * ```
    */
  get lLMProvider(): Prisma.LLMProviderDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.lLMModel`: Exposes CRUD operations for the **LLMModel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LLMModels
    * const lLMModels = await prisma.lLMModel.findMany()
    * ```
    */
  get lLMModel(): Prisma.LLMModelDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.conversation`: Exposes CRUD operations for the **Conversation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Conversations
    * const conversations = await prisma.conversation.findMany()
    * ```
    */
  get conversation(): Prisma.ConversationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.conversationMessage`: Exposes CRUD operations for the **ConversationMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ConversationMessages
    * const conversationMessages = await prisma.conversationMessage.findMany()
    * ```
    */
  get conversationMessage(): Prisma.ConversationMessageDelegate<ExtArgs, ClientOptions>;
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
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

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
   * Prisma Client JS version: 6.6.0
   * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


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
    Team: 'Team',
    MemberTeam: 'MemberTeam',
    Knowledge: 'Knowledge',
    User: 'User',
    File: 'File',
    FileParsingTask: 'FileParsingTask',
    Agent: 'Agent',
    TextChunk: 'TextChunk',
    LLMProvider: 'LLMProvider',
    LLMModel: 'LLMModel',
    Conversation: 'Conversation',
    ConversationMessage: 'ConversationMessage'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "team" | "memberTeam" | "knowledge" | "user" | "file" | "fileParsingTask" | "agent" | "textChunk" | "lLMProvider" | "lLMModel" | "conversation" | "conversationMessage"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Team: {
        payload: Prisma.$TeamPayload<ExtArgs>
        fields: Prisma.TeamFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TeamFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TeamFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          findFirst: {
            args: Prisma.TeamFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TeamFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          findMany: {
            args: Prisma.TeamFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>[]
          }
          create: {
            args: Prisma.TeamCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          createMany: {
            args: Prisma.TeamCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TeamCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>[]
          }
          delete: {
            args: Prisma.TeamDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          update: {
            args: Prisma.TeamUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          deleteMany: {
            args: Prisma.TeamDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TeamUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TeamUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>[]
          }
          upsert: {
            args: Prisma.TeamUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          aggregate: {
            args: Prisma.TeamAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTeam>
          }
          groupBy: {
            args: Prisma.TeamGroupByArgs<ExtArgs>
            result: $Utils.Optional<TeamGroupByOutputType>[]
          }
          count: {
            args: Prisma.TeamCountArgs<ExtArgs>
            result: $Utils.Optional<TeamCountAggregateOutputType> | number
          }
        }
      }
      MemberTeam: {
        payload: Prisma.$MemberTeamPayload<ExtArgs>
        fields: Prisma.MemberTeamFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MemberTeamFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberTeamPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MemberTeamFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberTeamPayload>
          }
          findFirst: {
            args: Prisma.MemberTeamFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberTeamPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MemberTeamFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberTeamPayload>
          }
          findMany: {
            args: Prisma.MemberTeamFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberTeamPayload>[]
          }
          create: {
            args: Prisma.MemberTeamCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberTeamPayload>
          }
          createMany: {
            args: Prisma.MemberTeamCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MemberTeamCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberTeamPayload>[]
          }
          delete: {
            args: Prisma.MemberTeamDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberTeamPayload>
          }
          update: {
            args: Prisma.MemberTeamUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberTeamPayload>
          }
          deleteMany: {
            args: Prisma.MemberTeamDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MemberTeamUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MemberTeamUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberTeamPayload>[]
          }
          upsert: {
            args: Prisma.MemberTeamUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MemberTeamPayload>
          }
          aggregate: {
            args: Prisma.MemberTeamAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMemberTeam>
          }
          groupBy: {
            args: Prisma.MemberTeamGroupByArgs<ExtArgs>
            result: $Utils.Optional<MemberTeamGroupByOutputType>[]
          }
          count: {
            args: Prisma.MemberTeamCountArgs<ExtArgs>
            result: $Utils.Optional<MemberTeamCountAggregateOutputType> | number
          }
        }
      }
      Knowledge: {
        payload: Prisma.$KnowledgePayload<ExtArgs>
        fields: Prisma.KnowledgeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.KnowledgeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.KnowledgeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>
          }
          findFirst: {
            args: Prisma.KnowledgeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.KnowledgeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>
          }
          findMany: {
            args: Prisma.KnowledgeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>[]
          }
          create: {
            args: Prisma.KnowledgeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>
          }
          createMany: {
            args: Prisma.KnowledgeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.KnowledgeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>[]
          }
          delete: {
            args: Prisma.KnowledgeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>
          }
          update: {
            args: Prisma.KnowledgeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>
          }
          deleteMany: {
            args: Prisma.KnowledgeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.KnowledgeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.KnowledgeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>[]
          }
          upsert: {
            args: Prisma.KnowledgeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>
          }
          aggregate: {
            args: Prisma.KnowledgeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateKnowledge>
          }
          groupBy: {
            args: Prisma.KnowledgeGroupByArgs<ExtArgs>
            result: $Utils.Optional<KnowledgeGroupByOutputType>[]
          }
          count: {
            args: Prisma.KnowledgeCountArgs<ExtArgs>
            result: $Utils.Optional<KnowledgeCountAggregateOutputType> | number
          }
        }
      }
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
      File: {
        payload: Prisma.$FilePayload<ExtArgs>
        fields: Prisma.FileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilePayload>
          }
          findFirst: {
            args: Prisma.FileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilePayload>
          }
          findMany: {
            args: Prisma.FileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilePayload>[]
          }
          create: {
            args: Prisma.FileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilePayload>
          }
          createMany: {
            args: Prisma.FileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilePayload>[]
          }
          delete: {
            args: Prisma.FileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilePayload>
          }
          update: {
            args: Prisma.FileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilePayload>
          }
          deleteMany: {
            args: Prisma.FileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FileUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilePayload>[]
          }
          upsert: {
            args: Prisma.FileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilePayload>
          }
          aggregate: {
            args: Prisma.FileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFile>
          }
          groupBy: {
            args: Prisma.FileGroupByArgs<ExtArgs>
            result: $Utils.Optional<FileGroupByOutputType>[]
          }
          count: {
            args: Prisma.FileCountArgs<ExtArgs>
            result: $Utils.Optional<FileCountAggregateOutputType> | number
          }
        }
      }
      FileParsingTask: {
        payload: Prisma.$FileParsingTaskPayload<ExtArgs>
        fields: Prisma.FileParsingTaskFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FileParsingTaskFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileParsingTaskPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FileParsingTaskFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileParsingTaskPayload>
          }
          findFirst: {
            args: Prisma.FileParsingTaskFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileParsingTaskPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FileParsingTaskFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileParsingTaskPayload>
          }
          findMany: {
            args: Prisma.FileParsingTaskFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileParsingTaskPayload>[]
          }
          create: {
            args: Prisma.FileParsingTaskCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileParsingTaskPayload>
          }
          createMany: {
            args: Prisma.FileParsingTaskCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FileParsingTaskCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileParsingTaskPayload>[]
          }
          delete: {
            args: Prisma.FileParsingTaskDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileParsingTaskPayload>
          }
          update: {
            args: Prisma.FileParsingTaskUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileParsingTaskPayload>
          }
          deleteMany: {
            args: Prisma.FileParsingTaskDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FileParsingTaskUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FileParsingTaskUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileParsingTaskPayload>[]
          }
          upsert: {
            args: Prisma.FileParsingTaskUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FileParsingTaskPayload>
          }
          aggregate: {
            args: Prisma.FileParsingTaskAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFileParsingTask>
          }
          groupBy: {
            args: Prisma.FileParsingTaskGroupByArgs<ExtArgs>
            result: $Utils.Optional<FileParsingTaskGroupByOutputType>[]
          }
          count: {
            args: Prisma.FileParsingTaskCountArgs<ExtArgs>
            result: $Utils.Optional<FileParsingTaskCountAggregateOutputType> | number
          }
        }
      }
      Agent: {
        payload: Prisma.$AgentPayload<ExtArgs>
        fields: Prisma.AgentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AgentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AgentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>
          }
          findFirst: {
            args: Prisma.AgentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AgentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>
          }
          findMany: {
            args: Prisma.AgentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>[]
          }
          create: {
            args: Prisma.AgentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>
          }
          createMany: {
            args: Prisma.AgentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AgentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>[]
          }
          delete: {
            args: Prisma.AgentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>
          }
          update: {
            args: Prisma.AgentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>
          }
          deleteMany: {
            args: Prisma.AgentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AgentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AgentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>[]
          }
          upsert: {
            args: Prisma.AgentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgentPayload>
          }
          aggregate: {
            args: Prisma.AgentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgent>
          }
          groupBy: {
            args: Prisma.AgentGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgentGroupByOutputType>[]
          }
          count: {
            args: Prisma.AgentCountArgs<ExtArgs>
            result: $Utils.Optional<AgentCountAggregateOutputType> | number
          }
        }
      }
      TextChunk: {
        payload: Prisma.$TextChunkPayload<ExtArgs>
        fields: Prisma.TextChunkFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TextChunkFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TextChunkPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TextChunkFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TextChunkPayload>
          }
          findFirst: {
            args: Prisma.TextChunkFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TextChunkPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TextChunkFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TextChunkPayload>
          }
          findMany: {
            args: Prisma.TextChunkFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TextChunkPayload>[]
          }
          create: {
            args: Prisma.TextChunkCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TextChunkPayload>
          }
          createMany: {
            args: Prisma.TextChunkCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TextChunkCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TextChunkPayload>[]
          }
          delete: {
            args: Prisma.TextChunkDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TextChunkPayload>
          }
          update: {
            args: Prisma.TextChunkUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TextChunkPayload>
          }
          deleteMany: {
            args: Prisma.TextChunkDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TextChunkUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TextChunkUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TextChunkPayload>[]
          }
          upsert: {
            args: Prisma.TextChunkUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TextChunkPayload>
          }
          aggregate: {
            args: Prisma.TextChunkAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTextChunk>
          }
          groupBy: {
            args: Prisma.TextChunkGroupByArgs<ExtArgs>
            result: $Utils.Optional<TextChunkGroupByOutputType>[]
          }
          count: {
            args: Prisma.TextChunkCountArgs<ExtArgs>
            result: $Utils.Optional<TextChunkCountAggregateOutputType> | number
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
      LLMModel: {
        payload: Prisma.$LLMModelPayload<ExtArgs>
        fields: Prisma.LLMModelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LLMModelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMModelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LLMModelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMModelPayload>
          }
          findFirst: {
            args: Prisma.LLMModelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMModelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LLMModelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMModelPayload>
          }
          findMany: {
            args: Prisma.LLMModelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMModelPayload>[]
          }
          create: {
            args: Prisma.LLMModelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMModelPayload>
          }
          createMany: {
            args: Prisma.LLMModelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LLMModelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMModelPayload>[]
          }
          delete: {
            args: Prisma.LLMModelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMModelPayload>
          }
          update: {
            args: Prisma.LLMModelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMModelPayload>
          }
          deleteMany: {
            args: Prisma.LLMModelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LLMModelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LLMModelUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMModelPayload>[]
          }
          upsert: {
            args: Prisma.LLMModelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LLMModelPayload>
          }
          aggregate: {
            args: Prisma.LLMModelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLLMModel>
          }
          groupBy: {
            args: Prisma.LLMModelGroupByArgs<ExtArgs>
            result: $Utils.Optional<LLMModelGroupByOutputType>[]
          }
          count: {
            args: Prisma.LLMModelCountArgs<ExtArgs>
            result: $Utils.Optional<LLMModelCountAggregateOutputType> | number
          }
        }
      }
      Conversation: {
        payload: Prisma.$ConversationPayload<ExtArgs>
        fields: Prisma.ConversationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConversationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConversationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          findFirst: {
            args: Prisma.ConversationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConversationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          findMany: {
            args: Prisma.ConversationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>[]
          }
          create: {
            args: Prisma.ConversationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          createMany: {
            args: Prisma.ConversationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConversationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>[]
          }
          delete: {
            args: Prisma.ConversationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          update: {
            args: Prisma.ConversationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          deleteMany: {
            args: Prisma.ConversationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConversationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ConversationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>[]
          }
          upsert: {
            args: Prisma.ConversationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationPayload>
          }
          aggregate: {
            args: Prisma.ConversationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConversation>
          }
          groupBy: {
            args: Prisma.ConversationGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConversationGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConversationCountArgs<ExtArgs>
            result: $Utils.Optional<ConversationCountAggregateOutputType> | number
          }
        }
      }
      ConversationMessage: {
        payload: Prisma.$ConversationMessagePayload<ExtArgs>
        fields: Prisma.ConversationMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConversationMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConversationMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>
          }
          findFirst: {
            args: Prisma.ConversationMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConversationMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>
          }
          findMany: {
            args: Prisma.ConversationMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>[]
          }
          create: {
            args: Prisma.ConversationMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>
          }
          createMany: {
            args: Prisma.ConversationMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConversationMessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>[]
          }
          delete: {
            args: Prisma.ConversationMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>
          }
          update: {
            args: Prisma.ConversationMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>
          }
          deleteMany: {
            args: Prisma.ConversationMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConversationMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ConversationMessageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>[]
          }
          upsert: {
            args: Prisma.ConversationMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConversationMessagePayload>
          }
          aggregate: {
            args: Prisma.ConversationMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConversationMessage>
          }
          groupBy: {
            args: Prisma.ConversationMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConversationMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConversationMessageCountArgs<ExtArgs>
            result: $Utils.Optional<ConversationMessageCountAggregateOutputType> | number
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
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
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
  }
  export type GlobalOmitConfig = {
    team?: TeamOmit
    memberTeam?: MemberTeamOmit
    knowledge?: KnowledgeOmit
    user?: UserOmit
    file?: FileOmit
    fileParsingTask?: FileParsingTaskOmit
    agent?: AgentOmit
    textChunk?: TextChunkOmit
    lLMProvider?: LLMProviderOmit
    lLMModel?: LLMModelOmit
    conversation?: ConversationOmit
    conversationMessage?: ConversationMessageOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

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

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

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
   * Count Type TeamCountOutputType
   */

  export type TeamCountOutputType = {
    members: number
    users: number
    knowledge: number
    ownedAgents: number
    ownedLLMProviders: number
  }

  export type TeamCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    members?: boolean | TeamCountOutputTypeCountMembersArgs
    users?: boolean | TeamCountOutputTypeCountUsersArgs
    knowledge?: boolean | TeamCountOutputTypeCountKnowledgeArgs
    ownedAgents?: boolean | TeamCountOutputTypeCountOwnedAgentsArgs
    ownedLLMProviders?: boolean | TeamCountOutputTypeCountOwnedLLMProvidersArgs
  }

  // Custom InputTypes
  /**
   * TeamCountOutputType without action
   */
  export type TeamCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamCountOutputType
     */
    select?: TeamCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TeamCountOutputType without action
   */
  export type TeamCountOutputTypeCountMembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemberTeamWhereInput
  }

  /**
   * TeamCountOutputType without action
   */
  export type TeamCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * TeamCountOutputType without action
   */
  export type TeamCountOutputTypeCountKnowledgeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KnowledgeWhereInput
  }

  /**
   * TeamCountOutputType without action
   */
  export type TeamCountOutputTypeCountOwnedAgentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentWhereInput
  }

  /**
   * TeamCountOutputType without action
   */
  export type TeamCountOutputTypeCountOwnedLLMProvidersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LLMProviderWhereInput
  }


  /**
   * Count Type KnowledgeCountOutputType
   */

  export type KnowledgeCountOutputType = {
    users: number
    teams: number
    files: number
  }

  export type KnowledgeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | KnowledgeCountOutputTypeCountUsersArgs
    teams?: boolean | KnowledgeCountOutputTypeCountTeamsArgs
    files?: boolean | KnowledgeCountOutputTypeCountFilesArgs
  }

  // Custom InputTypes
  /**
   * KnowledgeCountOutputType without action
   */
  export type KnowledgeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnowledgeCountOutputType
     */
    select?: KnowledgeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * KnowledgeCountOutputType without action
   */
  export type KnowledgeCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * KnowledgeCountOutputType without action
   */
  export type KnowledgeCountOutputTypeCountTeamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TeamWhereInput
  }

  /**
   * KnowledgeCountOutputType without action
   */
  export type KnowledgeCountOutputTypeCountFilesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FileWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    createdTeams: number
    teamMemberships: number
    teams: number
    createdKnowledge: number
    knowledge: number
    ownedAgents: number
    createdAgents: number
    FileParsingTask: number
    ownedLLMProviders: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdTeams?: boolean | UserCountOutputTypeCountCreatedTeamsArgs
    teamMemberships?: boolean | UserCountOutputTypeCountTeamMembershipsArgs
    teams?: boolean | UserCountOutputTypeCountTeamsArgs
    createdKnowledge?: boolean | UserCountOutputTypeCountCreatedKnowledgeArgs
    knowledge?: boolean | UserCountOutputTypeCountKnowledgeArgs
    ownedAgents?: boolean | UserCountOutputTypeCountOwnedAgentsArgs
    createdAgents?: boolean | UserCountOutputTypeCountCreatedAgentsArgs
    FileParsingTask?: boolean | UserCountOutputTypeCountFileParsingTaskArgs
    ownedLLMProviders?: boolean | UserCountOutputTypeCountOwnedLLMProvidersArgs
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
  export type UserCountOutputTypeCountCreatedTeamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TeamWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTeamMembershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemberTeamWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTeamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TeamWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCreatedKnowledgeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KnowledgeWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountKnowledgeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KnowledgeWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOwnedAgentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCreatedAgentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountFileParsingTaskArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FileParsingTaskWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOwnedLLMProvidersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LLMProviderWhereInput
  }


  /**
   * Count Type FileCountOutputType
   */

  export type FileCountOutputType = {
    parsingTasks: number
    TextChunk: number
  }

  export type FileCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parsingTasks?: boolean | FileCountOutputTypeCountParsingTasksArgs
    TextChunk?: boolean | FileCountOutputTypeCountTextChunkArgs
  }

  // Custom InputTypes
  /**
   * FileCountOutputType without action
   */
  export type FileCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileCountOutputType
     */
    select?: FileCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * FileCountOutputType without action
   */
  export type FileCountOutputTypeCountParsingTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FileParsingTaskWhereInput
  }

  /**
   * FileCountOutputType without action
   */
  export type FileCountOutputTypeCountTextChunkArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TextChunkWhereInput
  }


  /**
   * Count Type AgentCountOutputType
   */

  export type AgentCountOutputType = {
    conversations: number
  }

  export type AgentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversations?: boolean | AgentCountOutputTypeCountConversationsArgs
  }

  // Custom InputTypes
  /**
   * AgentCountOutputType without action
   */
  export type AgentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgentCountOutputType
     */
    select?: AgentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AgentCountOutputType without action
   */
  export type AgentCountOutputTypeCountConversationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConversationWhereInput
  }


  /**
   * Count Type LLMProviderCountOutputType
   */

  export type LLMProviderCountOutputType = {
    models: number
    usersWithDefault: number
  }

  export type LLMProviderCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    models?: boolean | LLMProviderCountOutputTypeCountModelsArgs
    usersWithDefault?: boolean | LLMProviderCountOutputTypeCountUsersWithDefaultArgs
  }

  // Custom InputTypes
  /**
   * LLMProviderCountOutputType without action
   */
  export type LLMProviderCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMProviderCountOutputType
     */
    select?: LLMProviderCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * LLMProviderCountOutputType without action
   */
  export type LLMProviderCountOutputTypeCountModelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LLMModelWhereInput
  }

  /**
   * LLMProviderCountOutputType without action
   */
  export type LLMProviderCountOutputTypeCountUsersWithDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }


  /**
   * Count Type ConversationCountOutputType
   */

  export type ConversationCountOutputType = {
    messages: number
  }

  export type ConversationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | ConversationCountOutputTypeCountMessagesArgs
  }

  // Custom InputTypes
  /**
   * ConversationCountOutputType without action
   */
  export type ConversationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationCountOutputType
     */
    select?: ConversationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ConversationCountOutputType without action
   */
  export type ConversationCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConversationMessageWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Team
   */

  export type AggregateTeam = {
    _count: TeamCountAggregateOutputType | null
    _min: TeamMinAggregateOutputType | null
    _max: TeamMaxAggregateOutputType | null
  }

  export type TeamMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
    createdById: string | null
  }

  export type TeamMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
    createdById: string | null
  }

  export type TeamCountAggregateOutputType = {
    id: number
    name: number
    description: number
    createdAt: number
    updatedAt: number
    createdById: number
    _all: number
  }


  export type TeamMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    createdById?: true
  }

  export type TeamMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    createdById?: true
  }

  export type TeamCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    createdById?: true
    _all?: true
  }

  export type TeamAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Team to aggregate.
     */
    where?: TeamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Teams to fetch.
     */
    orderBy?: TeamOrderByWithRelationInput | TeamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TeamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Teams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Teams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Teams
    **/
    _count?: true | TeamCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TeamMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TeamMaxAggregateInputType
  }

  export type GetTeamAggregateType<T extends TeamAggregateArgs> = {
        [P in keyof T & keyof AggregateTeam]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTeam[P]>
      : GetScalarType<T[P], AggregateTeam[P]>
  }




  export type TeamGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TeamWhereInput
    orderBy?: TeamOrderByWithAggregationInput | TeamOrderByWithAggregationInput[]
    by: TeamScalarFieldEnum[] | TeamScalarFieldEnum
    having?: TeamScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TeamCountAggregateInputType | true
    _min?: TeamMinAggregateInputType
    _max?: TeamMaxAggregateInputType
  }

  export type TeamGroupByOutputType = {
    id: string
    name: string
    description: string
    createdAt: Date
    updatedAt: Date
    createdById: string
    _count: TeamCountAggregateOutputType | null
    _min: TeamMinAggregateOutputType | null
    _max: TeamMaxAggregateOutputType | null
  }

  type GetTeamGroupByPayload<T extends TeamGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TeamGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TeamGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TeamGroupByOutputType[P]>
            : GetScalarType<T[P], TeamGroupByOutputType[P]>
        }
      >
    >


  export type TeamSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdById?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    members?: boolean | Team$membersArgs<ExtArgs>
    users?: boolean | Team$usersArgs<ExtArgs>
    knowledge?: boolean | Team$knowledgeArgs<ExtArgs>
    ownedAgents?: boolean | Team$ownedAgentsArgs<ExtArgs>
    ownedLLMProviders?: boolean | Team$ownedLLMProvidersArgs<ExtArgs>
    _count?: boolean | TeamCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["team"]>

  export type TeamSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdById?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["team"]>

  export type TeamSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdById?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["team"]>

  export type TeamSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdById?: boolean
  }

  export type TeamOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "createdAt" | "updatedAt" | "createdById", ExtArgs["result"]["team"]>
  export type TeamInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    members?: boolean | Team$membersArgs<ExtArgs>
    users?: boolean | Team$usersArgs<ExtArgs>
    knowledge?: boolean | Team$knowledgeArgs<ExtArgs>
    ownedAgents?: boolean | Team$ownedAgentsArgs<ExtArgs>
    ownedLLMProviders?: boolean | Team$ownedLLMProvidersArgs<ExtArgs>
    _count?: boolean | TeamCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TeamIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type TeamIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $TeamPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Team"
    objects: {
      createdBy: Prisma.$UserPayload<ExtArgs>
      members: Prisma.$MemberTeamPayload<ExtArgs>[]
      users: Prisma.$UserPayload<ExtArgs>[]
      knowledge: Prisma.$KnowledgePayload<ExtArgs>[]
      ownedAgents: Prisma.$AgentPayload<ExtArgs>[]
      ownedLLMProviders: Prisma.$LLMProviderPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string
      createdAt: Date
      updatedAt: Date
      createdById: string
    }, ExtArgs["result"]["team"]>
    composites: {}
  }

  type TeamGetPayload<S extends boolean | null | undefined | TeamDefaultArgs> = $Result.GetResult<Prisma.$TeamPayload, S>

  type TeamCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TeamFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TeamCountAggregateInputType | true
    }

  export interface TeamDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Team'], meta: { name: 'Team' } }
    /**
     * Find zero or one Team that matches the filter.
     * @param {TeamFindUniqueArgs} args - Arguments to find a Team
     * @example
     * // Get one Team
     * const team = await prisma.team.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TeamFindUniqueArgs>(args: SelectSubset<T, TeamFindUniqueArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Team that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TeamFindUniqueOrThrowArgs} args - Arguments to find a Team
     * @example
     * // Get one Team
     * const team = await prisma.team.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TeamFindUniqueOrThrowArgs>(args: SelectSubset<T, TeamFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Team that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamFindFirstArgs} args - Arguments to find a Team
     * @example
     * // Get one Team
     * const team = await prisma.team.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TeamFindFirstArgs>(args?: SelectSubset<T, TeamFindFirstArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Team that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamFindFirstOrThrowArgs} args - Arguments to find a Team
     * @example
     * // Get one Team
     * const team = await prisma.team.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TeamFindFirstOrThrowArgs>(args?: SelectSubset<T, TeamFindFirstOrThrowArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Teams that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Teams
     * const teams = await prisma.team.findMany()
     * 
     * // Get first 10 Teams
     * const teams = await prisma.team.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const teamWithIdOnly = await prisma.team.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TeamFindManyArgs>(args?: SelectSubset<T, TeamFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Team.
     * @param {TeamCreateArgs} args - Arguments to create a Team.
     * @example
     * // Create one Team
     * const Team = await prisma.team.create({
     *   data: {
     *     // ... data to create a Team
     *   }
     * })
     * 
     */
    create<T extends TeamCreateArgs>(args: SelectSubset<T, TeamCreateArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Teams.
     * @param {TeamCreateManyArgs} args - Arguments to create many Teams.
     * @example
     * // Create many Teams
     * const team = await prisma.team.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TeamCreateManyArgs>(args?: SelectSubset<T, TeamCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Teams and returns the data saved in the database.
     * @param {TeamCreateManyAndReturnArgs} args - Arguments to create many Teams.
     * @example
     * // Create many Teams
     * const team = await prisma.team.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Teams and only return the `id`
     * const teamWithIdOnly = await prisma.team.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TeamCreateManyAndReturnArgs>(args?: SelectSubset<T, TeamCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Team.
     * @param {TeamDeleteArgs} args - Arguments to delete one Team.
     * @example
     * // Delete one Team
     * const Team = await prisma.team.delete({
     *   where: {
     *     // ... filter to delete one Team
     *   }
     * })
     * 
     */
    delete<T extends TeamDeleteArgs>(args: SelectSubset<T, TeamDeleteArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Team.
     * @param {TeamUpdateArgs} args - Arguments to update one Team.
     * @example
     * // Update one Team
     * const team = await prisma.team.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TeamUpdateArgs>(args: SelectSubset<T, TeamUpdateArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Teams.
     * @param {TeamDeleteManyArgs} args - Arguments to filter Teams to delete.
     * @example
     * // Delete a few Teams
     * const { count } = await prisma.team.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TeamDeleteManyArgs>(args?: SelectSubset<T, TeamDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Teams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Teams
     * const team = await prisma.team.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TeamUpdateManyArgs>(args: SelectSubset<T, TeamUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Teams and returns the data updated in the database.
     * @param {TeamUpdateManyAndReturnArgs} args - Arguments to update many Teams.
     * @example
     * // Update many Teams
     * const team = await prisma.team.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Teams and only return the `id`
     * const teamWithIdOnly = await prisma.team.updateManyAndReturn({
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
    updateManyAndReturn<T extends TeamUpdateManyAndReturnArgs>(args: SelectSubset<T, TeamUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Team.
     * @param {TeamUpsertArgs} args - Arguments to update or create a Team.
     * @example
     * // Update or create a Team
     * const team = await prisma.team.upsert({
     *   create: {
     *     // ... data to create a Team
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Team we want to update
     *   }
     * })
     */
    upsert<T extends TeamUpsertArgs>(args: SelectSubset<T, TeamUpsertArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Teams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamCountArgs} args - Arguments to filter Teams to count.
     * @example
     * // Count the number of Teams
     * const count = await prisma.team.count({
     *   where: {
     *     // ... the filter for the Teams we want to count
     *   }
     * })
    **/
    count<T extends TeamCountArgs>(
      args?: Subset<T, TeamCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TeamCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Team.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TeamAggregateArgs>(args: Subset<T, TeamAggregateArgs>): Prisma.PrismaPromise<GetTeamAggregateType<T>>

    /**
     * Group by Team.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamGroupByArgs} args - Group by arguments.
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
      T extends TeamGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TeamGroupByArgs['orderBy'] }
        : { orderBy?: TeamGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TeamGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTeamGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Team model
   */
  readonly fields: TeamFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Team.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TeamClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    createdBy<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    members<T extends Team$membersArgs<ExtArgs> = {}>(args?: Subset<T, Team$membersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberTeamPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    users<T extends Team$usersArgs<ExtArgs> = {}>(args?: Subset<T, Team$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    knowledge<T extends Team$knowledgeArgs<ExtArgs> = {}>(args?: Subset<T, Team$knowledgeArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    ownedAgents<T extends Team$ownedAgentsArgs<ExtArgs> = {}>(args?: Subset<T, Team$ownedAgentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    ownedLLMProviders<T extends Team$ownedLLMProvidersArgs<ExtArgs> = {}>(args?: Subset<T, Team$ownedLLMProvidersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Team model
   */
  interface TeamFieldRefs {
    readonly id: FieldRef<"Team", 'String'>
    readonly name: FieldRef<"Team", 'String'>
    readonly description: FieldRef<"Team", 'String'>
    readonly createdAt: FieldRef<"Team", 'DateTime'>
    readonly updatedAt: FieldRef<"Team", 'DateTime'>
    readonly createdById: FieldRef<"Team", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Team findUnique
   */
  export type TeamFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter, which Team to fetch.
     */
    where: TeamWhereUniqueInput
  }

  /**
   * Team findUniqueOrThrow
   */
  export type TeamFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter, which Team to fetch.
     */
    where: TeamWhereUniqueInput
  }

  /**
   * Team findFirst
   */
  export type TeamFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter, which Team to fetch.
     */
    where?: TeamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Teams to fetch.
     */
    orderBy?: TeamOrderByWithRelationInput | TeamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Teams.
     */
    cursor?: TeamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Teams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Teams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Teams.
     */
    distinct?: TeamScalarFieldEnum | TeamScalarFieldEnum[]
  }

  /**
   * Team findFirstOrThrow
   */
  export type TeamFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter, which Team to fetch.
     */
    where?: TeamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Teams to fetch.
     */
    orderBy?: TeamOrderByWithRelationInput | TeamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Teams.
     */
    cursor?: TeamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Teams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Teams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Teams.
     */
    distinct?: TeamScalarFieldEnum | TeamScalarFieldEnum[]
  }

  /**
   * Team findMany
   */
  export type TeamFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter, which Teams to fetch.
     */
    where?: TeamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Teams to fetch.
     */
    orderBy?: TeamOrderByWithRelationInput | TeamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Teams.
     */
    cursor?: TeamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Teams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Teams.
     */
    skip?: number
    distinct?: TeamScalarFieldEnum | TeamScalarFieldEnum[]
  }

  /**
   * Team create
   */
  export type TeamCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * The data needed to create a Team.
     */
    data: XOR<TeamCreateInput, TeamUncheckedCreateInput>
  }

  /**
   * Team createMany
   */
  export type TeamCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Teams.
     */
    data: TeamCreateManyInput | TeamCreateManyInput[]
  }

  /**
   * Team createManyAndReturn
   */
  export type TeamCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * The data used to create many Teams.
     */
    data: TeamCreateManyInput | TeamCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Team update
   */
  export type TeamUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * The data needed to update a Team.
     */
    data: XOR<TeamUpdateInput, TeamUncheckedUpdateInput>
    /**
     * Choose, which Team to update.
     */
    where: TeamWhereUniqueInput
  }

  /**
   * Team updateMany
   */
  export type TeamUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Teams.
     */
    data: XOR<TeamUpdateManyMutationInput, TeamUncheckedUpdateManyInput>
    /**
     * Filter which Teams to update
     */
    where?: TeamWhereInput
    /**
     * Limit how many Teams to update.
     */
    limit?: number
  }

  /**
   * Team updateManyAndReturn
   */
  export type TeamUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * The data used to update Teams.
     */
    data: XOR<TeamUpdateManyMutationInput, TeamUncheckedUpdateManyInput>
    /**
     * Filter which Teams to update
     */
    where?: TeamWhereInput
    /**
     * Limit how many Teams to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Team upsert
   */
  export type TeamUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * The filter to search for the Team to update in case it exists.
     */
    where: TeamWhereUniqueInput
    /**
     * In case the Team found by the `where` argument doesn't exist, create a new Team with this data.
     */
    create: XOR<TeamCreateInput, TeamUncheckedCreateInput>
    /**
     * In case the Team was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TeamUpdateInput, TeamUncheckedUpdateInput>
  }

  /**
   * Team delete
   */
  export type TeamDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter which Team to delete.
     */
    where: TeamWhereUniqueInput
  }

  /**
   * Team deleteMany
   */
  export type TeamDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Teams to delete
     */
    where?: TeamWhereInput
    /**
     * Limit how many Teams to delete.
     */
    limit?: number
  }

  /**
   * Team.members
   */
  export type Team$membersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberTeam
     */
    select?: MemberTeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberTeam
     */
    omit?: MemberTeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberTeamInclude<ExtArgs> | null
    where?: MemberTeamWhereInput
    orderBy?: MemberTeamOrderByWithRelationInput | MemberTeamOrderByWithRelationInput[]
    cursor?: MemberTeamWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemberTeamScalarFieldEnum | MemberTeamScalarFieldEnum[]
  }

  /**
   * Team.users
   */
  export type Team$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Team.knowledge
   */
  export type Team$knowledgeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Knowledge
     */
    omit?: KnowledgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    where?: KnowledgeWhereInput
    orderBy?: KnowledgeOrderByWithRelationInput | KnowledgeOrderByWithRelationInput[]
    cursor?: KnowledgeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: KnowledgeScalarFieldEnum | KnowledgeScalarFieldEnum[]
  }

  /**
   * Team.ownedAgents
   */
  export type Team$ownedAgentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agent
     */
    omit?: AgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    where?: AgentWhereInput
    orderBy?: AgentOrderByWithRelationInput | AgentOrderByWithRelationInput[]
    cursor?: AgentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AgentScalarFieldEnum | AgentScalarFieldEnum[]
  }

  /**
   * Team.ownedLLMProviders
   */
  export type Team$ownedLLMProvidersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * Team without action
   */
  export type TeamDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
  }


  /**
   * Model MemberTeam
   */

  export type AggregateMemberTeam = {
    _count: MemberTeamCountAggregateOutputType | null
    _min: MemberTeamMinAggregateOutputType | null
    _max: MemberTeamMaxAggregateOutputType | null
  }

  export type MemberTeamMinAggregateOutputType = {
    id: string | null
    permission: string | null
    joinedAt: Date | null
    leftAt: Date | null
    teamId: string | null
    userId: string | null
  }

  export type MemberTeamMaxAggregateOutputType = {
    id: string | null
    permission: string | null
    joinedAt: Date | null
    leftAt: Date | null
    teamId: string | null
    userId: string | null
  }

  export type MemberTeamCountAggregateOutputType = {
    id: number
    permission: number
    joinedAt: number
    leftAt: number
    teamId: number
    userId: number
    _all: number
  }


  export type MemberTeamMinAggregateInputType = {
    id?: true
    permission?: true
    joinedAt?: true
    leftAt?: true
    teamId?: true
    userId?: true
  }

  export type MemberTeamMaxAggregateInputType = {
    id?: true
    permission?: true
    joinedAt?: true
    leftAt?: true
    teamId?: true
    userId?: true
  }

  export type MemberTeamCountAggregateInputType = {
    id?: true
    permission?: true
    joinedAt?: true
    leftAt?: true
    teamId?: true
    userId?: true
    _all?: true
  }

  export type MemberTeamAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemberTeam to aggregate.
     */
    where?: MemberTeamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemberTeams to fetch.
     */
    orderBy?: MemberTeamOrderByWithRelationInput | MemberTeamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MemberTeamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemberTeams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemberTeams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MemberTeams
    **/
    _count?: true | MemberTeamCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MemberTeamMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MemberTeamMaxAggregateInputType
  }

  export type GetMemberTeamAggregateType<T extends MemberTeamAggregateArgs> = {
        [P in keyof T & keyof AggregateMemberTeam]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMemberTeam[P]>
      : GetScalarType<T[P], AggregateMemberTeam[P]>
  }




  export type MemberTeamGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MemberTeamWhereInput
    orderBy?: MemberTeamOrderByWithAggregationInput | MemberTeamOrderByWithAggregationInput[]
    by: MemberTeamScalarFieldEnum[] | MemberTeamScalarFieldEnum
    having?: MemberTeamScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MemberTeamCountAggregateInputType | true
    _min?: MemberTeamMinAggregateInputType
    _max?: MemberTeamMaxAggregateInputType
  }

  export type MemberTeamGroupByOutputType = {
    id: string
    permission: string
    joinedAt: Date
    leftAt: Date | null
    teamId: string
    userId: string
    _count: MemberTeamCountAggregateOutputType | null
    _min: MemberTeamMinAggregateOutputType | null
    _max: MemberTeamMaxAggregateOutputType | null
  }

  type GetMemberTeamGroupByPayload<T extends MemberTeamGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MemberTeamGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MemberTeamGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MemberTeamGroupByOutputType[P]>
            : GetScalarType<T[P], MemberTeamGroupByOutputType[P]>
        }
      >
    >


  export type MemberTeamSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    permission?: boolean
    joinedAt?: boolean
    leftAt?: boolean
    teamId?: boolean
    userId?: boolean
    team?: boolean | TeamDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memberTeam"]>

  export type MemberTeamSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    permission?: boolean
    joinedAt?: boolean
    leftAt?: boolean
    teamId?: boolean
    userId?: boolean
    team?: boolean | TeamDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memberTeam"]>

  export type MemberTeamSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    permission?: boolean
    joinedAt?: boolean
    leftAt?: boolean
    teamId?: boolean
    userId?: boolean
    team?: boolean | TeamDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["memberTeam"]>

  export type MemberTeamSelectScalar = {
    id?: boolean
    permission?: boolean
    joinedAt?: boolean
    leftAt?: boolean
    teamId?: boolean
    userId?: boolean
  }

  export type MemberTeamOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "permission" | "joinedAt" | "leftAt" | "teamId" | "userId", ExtArgs["result"]["memberTeam"]>
  export type MemberTeamInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    team?: boolean | TeamDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type MemberTeamIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    team?: boolean | TeamDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type MemberTeamIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    team?: boolean | TeamDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $MemberTeamPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MemberTeam"
    objects: {
      team: Prisma.$TeamPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      permission: string
      joinedAt: Date
      leftAt: Date | null
      teamId: string
      userId: string
    }, ExtArgs["result"]["memberTeam"]>
    composites: {}
  }

  type MemberTeamGetPayload<S extends boolean | null | undefined | MemberTeamDefaultArgs> = $Result.GetResult<Prisma.$MemberTeamPayload, S>

  type MemberTeamCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MemberTeamFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MemberTeamCountAggregateInputType | true
    }

  export interface MemberTeamDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MemberTeam'], meta: { name: 'MemberTeam' } }
    /**
     * Find zero or one MemberTeam that matches the filter.
     * @param {MemberTeamFindUniqueArgs} args - Arguments to find a MemberTeam
     * @example
     * // Get one MemberTeam
     * const memberTeam = await prisma.memberTeam.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MemberTeamFindUniqueArgs>(args: SelectSubset<T, MemberTeamFindUniqueArgs<ExtArgs>>): Prisma__MemberTeamClient<$Result.GetResult<Prisma.$MemberTeamPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MemberTeam that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MemberTeamFindUniqueOrThrowArgs} args - Arguments to find a MemberTeam
     * @example
     * // Get one MemberTeam
     * const memberTeam = await prisma.memberTeam.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MemberTeamFindUniqueOrThrowArgs>(args: SelectSubset<T, MemberTeamFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MemberTeamClient<$Result.GetResult<Prisma.$MemberTeamPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemberTeam that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberTeamFindFirstArgs} args - Arguments to find a MemberTeam
     * @example
     * // Get one MemberTeam
     * const memberTeam = await prisma.memberTeam.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MemberTeamFindFirstArgs>(args?: SelectSubset<T, MemberTeamFindFirstArgs<ExtArgs>>): Prisma__MemberTeamClient<$Result.GetResult<Prisma.$MemberTeamPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MemberTeam that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberTeamFindFirstOrThrowArgs} args - Arguments to find a MemberTeam
     * @example
     * // Get one MemberTeam
     * const memberTeam = await prisma.memberTeam.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MemberTeamFindFirstOrThrowArgs>(args?: SelectSubset<T, MemberTeamFindFirstOrThrowArgs<ExtArgs>>): Prisma__MemberTeamClient<$Result.GetResult<Prisma.$MemberTeamPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MemberTeams that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberTeamFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MemberTeams
     * const memberTeams = await prisma.memberTeam.findMany()
     * 
     * // Get first 10 MemberTeams
     * const memberTeams = await prisma.memberTeam.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const memberTeamWithIdOnly = await prisma.memberTeam.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MemberTeamFindManyArgs>(args?: SelectSubset<T, MemberTeamFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberTeamPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MemberTeam.
     * @param {MemberTeamCreateArgs} args - Arguments to create a MemberTeam.
     * @example
     * // Create one MemberTeam
     * const MemberTeam = await prisma.memberTeam.create({
     *   data: {
     *     // ... data to create a MemberTeam
     *   }
     * })
     * 
     */
    create<T extends MemberTeamCreateArgs>(args: SelectSubset<T, MemberTeamCreateArgs<ExtArgs>>): Prisma__MemberTeamClient<$Result.GetResult<Prisma.$MemberTeamPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MemberTeams.
     * @param {MemberTeamCreateManyArgs} args - Arguments to create many MemberTeams.
     * @example
     * // Create many MemberTeams
     * const memberTeam = await prisma.memberTeam.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MemberTeamCreateManyArgs>(args?: SelectSubset<T, MemberTeamCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MemberTeams and returns the data saved in the database.
     * @param {MemberTeamCreateManyAndReturnArgs} args - Arguments to create many MemberTeams.
     * @example
     * // Create many MemberTeams
     * const memberTeam = await prisma.memberTeam.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MemberTeams and only return the `id`
     * const memberTeamWithIdOnly = await prisma.memberTeam.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MemberTeamCreateManyAndReturnArgs>(args?: SelectSubset<T, MemberTeamCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberTeamPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MemberTeam.
     * @param {MemberTeamDeleteArgs} args - Arguments to delete one MemberTeam.
     * @example
     * // Delete one MemberTeam
     * const MemberTeam = await prisma.memberTeam.delete({
     *   where: {
     *     // ... filter to delete one MemberTeam
     *   }
     * })
     * 
     */
    delete<T extends MemberTeamDeleteArgs>(args: SelectSubset<T, MemberTeamDeleteArgs<ExtArgs>>): Prisma__MemberTeamClient<$Result.GetResult<Prisma.$MemberTeamPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MemberTeam.
     * @param {MemberTeamUpdateArgs} args - Arguments to update one MemberTeam.
     * @example
     * // Update one MemberTeam
     * const memberTeam = await prisma.memberTeam.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MemberTeamUpdateArgs>(args: SelectSubset<T, MemberTeamUpdateArgs<ExtArgs>>): Prisma__MemberTeamClient<$Result.GetResult<Prisma.$MemberTeamPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MemberTeams.
     * @param {MemberTeamDeleteManyArgs} args - Arguments to filter MemberTeams to delete.
     * @example
     * // Delete a few MemberTeams
     * const { count } = await prisma.memberTeam.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MemberTeamDeleteManyArgs>(args?: SelectSubset<T, MemberTeamDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemberTeams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberTeamUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MemberTeams
     * const memberTeam = await prisma.memberTeam.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MemberTeamUpdateManyArgs>(args: SelectSubset<T, MemberTeamUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MemberTeams and returns the data updated in the database.
     * @param {MemberTeamUpdateManyAndReturnArgs} args - Arguments to update many MemberTeams.
     * @example
     * // Update many MemberTeams
     * const memberTeam = await prisma.memberTeam.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MemberTeams and only return the `id`
     * const memberTeamWithIdOnly = await prisma.memberTeam.updateManyAndReturn({
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
    updateManyAndReturn<T extends MemberTeamUpdateManyAndReturnArgs>(args: SelectSubset<T, MemberTeamUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberTeamPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MemberTeam.
     * @param {MemberTeamUpsertArgs} args - Arguments to update or create a MemberTeam.
     * @example
     * // Update or create a MemberTeam
     * const memberTeam = await prisma.memberTeam.upsert({
     *   create: {
     *     // ... data to create a MemberTeam
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MemberTeam we want to update
     *   }
     * })
     */
    upsert<T extends MemberTeamUpsertArgs>(args: SelectSubset<T, MemberTeamUpsertArgs<ExtArgs>>): Prisma__MemberTeamClient<$Result.GetResult<Prisma.$MemberTeamPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MemberTeams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberTeamCountArgs} args - Arguments to filter MemberTeams to count.
     * @example
     * // Count the number of MemberTeams
     * const count = await prisma.memberTeam.count({
     *   where: {
     *     // ... the filter for the MemberTeams we want to count
     *   }
     * })
    **/
    count<T extends MemberTeamCountArgs>(
      args?: Subset<T, MemberTeamCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MemberTeamCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MemberTeam.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberTeamAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MemberTeamAggregateArgs>(args: Subset<T, MemberTeamAggregateArgs>): Prisma.PrismaPromise<GetMemberTeamAggregateType<T>>

    /**
     * Group by MemberTeam.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MemberTeamGroupByArgs} args - Group by arguments.
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
      T extends MemberTeamGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MemberTeamGroupByArgs['orderBy'] }
        : { orderBy?: MemberTeamGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, MemberTeamGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMemberTeamGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MemberTeam model
   */
  readonly fields: MemberTeamFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MemberTeam.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MemberTeamClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    team<T extends TeamDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TeamDefaultArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the MemberTeam model
   */
  interface MemberTeamFieldRefs {
    readonly id: FieldRef<"MemberTeam", 'String'>
    readonly permission: FieldRef<"MemberTeam", 'String'>
    readonly joinedAt: FieldRef<"MemberTeam", 'DateTime'>
    readonly leftAt: FieldRef<"MemberTeam", 'DateTime'>
    readonly teamId: FieldRef<"MemberTeam", 'String'>
    readonly userId: FieldRef<"MemberTeam", 'String'>
  }
    

  // Custom InputTypes
  /**
   * MemberTeam findUnique
   */
  export type MemberTeamFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberTeam
     */
    select?: MemberTeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberTeam
     */
    omit?: MemberTeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberTeamInclude<ExtArgs> | null
    /**
     * Filter, which MemberTeam to fetch.
     */
    where: MemberTeamWhereUniqueInput
  }

  /**
   * MemberTeam findUniqueOrThrow
   */
  export type MemberTeamFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberTeam
     */
    select?: MemberTeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberTeam
     */
    omit?: MemberTeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberTeamInclude<ExtArgs> | null
    /**
     * Filter, which MemberTeam to fetch.
     */
    where: MemberTeamWhereUniqueInput
  }

  /**
   * MemberTeam findFirst
   */
  export type MemberTeamFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberTeam
     */
    select?: MemberTeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberTeam
     */
    omit?: MemberTeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberTeamInclude<ExtArgs> | null
    /**
     * Filter, which MemberTeam to fetch.
     */
    where?: MemberTeamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemberTeams to fetch.
     */
    orderBy?: MemberTeamOrderByWithRelationInput | MemberTeamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemberTeams.
     */
    cursor?: MemberTeamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemberTeams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemberTeams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemberTeams.
     */
    distinct?: MemberTeamScalarFieldEnum | MemberTeamScalarFieldEnum[]
  }

  /**
   * MemberTeam findFirstOrThrow
   */
  export type MemberTeamFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberTeam
     */
    select?: MemberTeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberTeam
     */
    omit?: MemberTeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberTeamInclude<ExtArgs> | null
    /**
     * Filter, which MemberTeam to fetch.
     */
    where?: MemberTeamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemberTeams to fetch.
     */
    orderBy?: MemberTeamOrderByWithRelationInput | MemberTeamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MemberTeams.
     */
    cursor?: MemberTeamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemberTeams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemberTeams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MemberTeams.
     */
    distinct?: MemberTeamScalarFieldEnum | MemberTeamScalarFieldEnum[]
  }

  /**
   * MemberTeam findMany
   */
  export type MemberTeamFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberTeam
     */
    select?: MemberTeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberTeam
     */
    omit?: MemberTeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberTeamInclude<ExtArgs> | null
    /**
     * Filter, which MemberTeams to fetch.
     */
    where?: MemberTeamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MemberTeams to fetch.
     */
    orderBy?: MemberTeamOrderByWithRelationInput | MemberTeamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MemberTeams.
     */
    cursor?: MemberTeamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MemberTeams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MemberTeams.
     */
    skip?: number
    distinct?: MemberTeamScalarFieldEnum | MemberTeamScalarFieldEnum[]
  }

  /**
   * MemberTeam create
   */
  export type MemberTeamCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberTeam
     */
    select?: MemberTeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberTeam
     */
    omit?: MemberTeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberTeamInclude<ExtArgs> | null
    /**
     * The data needed to create a MemberTeam.
     */
    data: XOR<MemberTeamCreateInput, MemberTeamUncheckedCreateInput>
  }

  /**
   * MemberTeam createMany
   */
  export type MemberTeamCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MemberTeams.
     */
    data: MemberTeamCreateManyInput | MemberTeamCreateManyInput[]
  }

  /**
   * MemberTeam createManyAndReturn
   */
  export type MemberTeamCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberTeam
     */
    select?: MemberTeamSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemberTeam
     */
    omit?: MemberTeamOmit<ExtArgs> | null
    /**
     * The data used to create many MemberTeams.
     */
    data: MemberTeamCreateManyInput | MemberTeamCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberTeamIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MemberTeam update
   */
  export type MemberTeamUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberTeam
     */
    select?: MemberTeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberTeam
     */
    omit?: MemberTeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberTeamInclude<ExtArgs> | null
    /**
     * The data needed to update a MemberTeam.
     */
    data: XOR<MemberTeamUpdateInput, MemberTeamUncheckedUpdateInput>
    /**
     * Choose, which MemberTeam to update.
     */
    where: MemberTeamWhereUniqueInput
  }

  /**
   * MemberTeam updateMany
   */
  export type MemberTeamUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MemberTeams.
     */
    data: XOR<MemberTeamUpdateManyMutationInput, MemberTeamUncheckedUpdateManyInput>
    /**
     * Filter which MemberTeams to update
     */
    where?: MemberTeamWhereInput
    /**
     * Limit how many MemberTeams to update.
     */
    limit?: number
  }

  /**
   * MemberTeam updateManyAndReturn
   */
  export type MemberTeamUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberTeam
     */
    select?: MemberTeamSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MemberTeam
     */
    omit?: MemberTeamOmit<ExtArgs> | null
    /**
     * The data used to update MemberTeams.
     */
    data: XOR<MemberTeamUpdateManyMutationInput, MemberTeamUncheckedUpdateManyInput>
    /**
     * Filter which MemberTeams to update
     */
    where?: MemberTeamWhereInput
    /**
     * Limit how many MemberTeams to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberTeamIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MemberTeam upsert
   */
  export type MemberTeamUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberTeam
     */
    select?: MemberTeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberTeam
     */
    omit?: MemberTeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberTeamInclude<ExtArgs> | null
    /**
     * The filter to search for the MemberTeam to update in case it exists.
     */
    where: MemberTeamWhereUniqueInput
    /**
     * In case the MemberTeam found by the `where` argument doesn't exist, create a new MemberTeam with this data.
     */
    create: XOR<MemberTeamCreateInput, MemberTeamUncheckedCreateInput>
    /**
     * In case the MemberTeam was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MemberTeamUpdateInput, MemberTeamUncheckedUpdateInput>
  }

  /**
   * MemberTeam delete
   */
  export type MemberTeamDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberTeam
     */
    select?: MemberTeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberTeam
     */
    omit?: MemberTeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberTeamInclude<ExtArgs> | null
    /**
     * Filter which MemberTeam to delete.
     */
    where: MemberTeamWhereUniqueInput
  }

  /**
   * MemberTeam deleteMany
   */
  export type MemberTeamDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MemberTeams to delete
     */
    where?: MemberTeamWhereInput
    /**
     * Limit how many MemberTeams to delete.
     */
    limit?: number
  }

  /**
   * MemberTeam without action
   */
  export type MemberTeamDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberTeam
     */
    select?: MemberTeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberTeam
     */
    omit?: MemberTeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberTeamInclude<ExtArgs> | null
  }


  /**
   * Model Knowledge
   */

  export type AggregateKnowledge = {
    _count: KnowledgeCountAggregateOutputType | null
    _min: KnowledgeMinAggregateOutputType | null
    _max: KnowledgeMaxAggregateOutputType | null
  }

  export type KnowledgeMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type KnowledgeMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
  }

  export type KnowledgeCountAggregateOutputType = {
    id: number
    name: number
    description: number
    config: number
    createdAt: number
    updatedAt: number
    userId: number
    _all: number
  }


  export type KnowledgeMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type KnowledgeMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
  }

  export type KnowledgeCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    config?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    _all?: true
  }

  export type KnowledgeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Knowledge to aggregate.
     */
    where?: KnowledgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Knowledges to fetch.
     */
    orderBy?: KnowledgeOrderByWithRelationInput | KnowledgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: KnowledgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Knowledges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Knowledges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Knowledges
    **/
    _count?: true | KnowledgeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: KnowledgeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: KnowledgeMaxAggregateInputType
  }

  export type GetKnowledgeAggregateType<T extends KnowledgeAggregateArgs> = {
        [P in keyof T & keyof AggregateKnowledge]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateKnowledge[P]>
      : GetScalarType<T[P], AggregateKnowledge[P]>
  }




  export type KnowledgeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KnowledgeWhereInput
    orderBy?: KnowledgeOrderByWithAggregationInput | KnowledgeOrderByWithAggregationInput[]
    by: KnowledgeScalarFieldEnum[] | KnowledgeScalarFieldEnum
    having?: KnowledgeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: KnowledgeCountAggregateInputType | true
    _min?: KnowledgeMinAggregateInputType
    _max?: KnowledgeMaxAggregateInputType
  }

  export type KnowledgeGroupByOutputType = {
    id: string
    name: string
    description: string
    config: JsonValue | null
    createdAt: Date
    updatedAt: Date
    userId: string
    _count: KnowledgeCountAggregateOutputType | null
    _min: KnowledgeMinAggregateOutputType | null
    _max: KnowledgeMaxAggregateOutputType | null
  }

  type GetKnowledgeGroupByPayload<T extends KnowledgeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<KnowledgeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof KnowledgeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], KnowledgeGroupByOutputType[P]>
            : GetScalarType<T[P], KnowledgeGroupByOutputType[P]>
        }
      >
    >


  export type KnowledgeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    users?: boolean | Knowledge$usersArgs<ExtArgs>
    teams?: boolean | Knowledge$teamsArgs<ExtArgs>
    files?: boolean | Knowledge$filesArgs<ExtArgs>
    _count?: boolean | KnowledgeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["knowledge"]>

  export type KnowledgeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["knowledge"]>

  export type KnowledgeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["knowledge"]>

  export type KnowledgeSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    config?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
  }

  export type KnowledgeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "config" | "createdAt" | "updatedAt" | "userId", ExtArgs["result"]["knowledge"]>
  export type KnowledgeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    users?: boolean | Knowledge$usersArgs<ExtArgs>
    teams?: boolean | Knowledge$teamsArgs<ExtArgs>
    files?: boolean | Knowledge$filesArgs<ExtArgs>
    _count?: boolean | KnowledgeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type KnowledgeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type KnowledgeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $KnowledgePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Knowledge"
    objects: {
      createdBy: Prisma.$UserPayload<ExtArgs>
      users: Prisma.$UserPayload<ExtArgs>[]
      teams: Prisma.$TeamPayload<ExtArgs>[]
      files: Prisma.$FilePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string
      config: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
      userId: string
    }, ExtArgs["result"]["knowledge"]>
    composites: {}
  }

  type KnowledgeGetPayload<S extends boolean | null | undefined | KnowledgeDefaultArgs> = $Result.GetResult<Prisma.$KnowledgePayload, S>

  type KnowledgeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<KnowledgeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: KnowledgeCountAggregateInputType | true
    }

  export interface KnowledgeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Knowledge'], meta: { name: 'Knowledge' } }
    /**
     * Find zero or one Knowledge that matches the filter.
     * @param {KnowledgeFindUniqueArgs} args - Arguments to find a Knowledge
     * @example
     * // Get one Knowledge
     * const knowledge = await prisma.knowledge.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends KnowledgeFindUniqueArgs>(args: SelectSubset<T, KnowledgeFindUniqueArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Knowledge that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {KnowledgeFindUniqueOrThrowArgs} args - Arguments to find a Knowledge
     * @example
     * // Get one Knowledge
     * const knowledge = await prisma.knowledge.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends KnowledgeFindUniqueOrThrowArgs>(args: SelectSubset<T, KnowledgeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Knowledge that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeFindFirstArgs} args - Arguments to find a Knowledge
     * @example
     * // Get one Knowledge
     * const knowledge = await prisma.knowledge.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends KnowledgeFindFirstArgs>(args?: SelectSubset<T, KnowledgeFindFirstArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Knowledge that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeFindFirstOrThrowArgs} args - Arguments to find a Knowledge
     * @example
     * // Get one Knowledge
     * const knowledge = await prisma.knowledge.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends KnowledgeFindFirstOrThrowArgs>(args?: SelectSubset<T, KnowledgeFindFirstOrThrowArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Knowledges that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Knowledges
     * const knowledges = await prisma.knowledge.findMany()
     * 
     * // Get first 10 Knowledges
     * const knowledges = await prisma.knowledge.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const knowledgeWithIdOnly = await prisma.knowledge.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends KnowledgeFindManyArgs>(args?: SelectSubset<T, KnowledgeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Knowledge.
     * @param {KnowledgeCreateArgs} args - Arguments to create a Knowledge.
     * @example
     * // Create one Knowledge
     * const Knowledge = await prisma.knowledge.create({
     *   data: {
     *     // ... data to create a Knowledge
     *   }
     * })
     * 
     */
    create<T extends KnowledgeCreateArgs>(args: SelectSubset<T, KnowledgeCreateArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Knowledges.
     * @param {KnowledgeCreateManyArgs} args - Arguments to create many Knowledges.
     * @example
     * // Create many Knowledges
     * const knowledge = await prisma.knowledge.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends KnowledgeCreateManyArgs>(args?: SelectSubset<T, KnowledgeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Knowledges and returns the data saved in the database.
     * @param {KnowledgeCreateManyAndReturnArgs} args - Arguments to create many Knowledges.
     * @example
     * // Create many Knowledges
     * const knowledge = await prisma.knowledge.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Knowledges and only return the `id`
     * const knowledgeWithIdOnly = await prisma.knowledge.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends KnowledgeCreateManyAndReturnArgs>(args?: SelectSubset<T, KnowledgeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Knowledge.
     * @param {KnowledgeDeleteArgs} args - Arguments to delete one Knowledge.
     * @example
     * // Delete one Knowledge
     * const Knowledge = await prisma.knowledge.delete({
     *   where: {
     *     // ... filter to delete one Knowledge
     *   }
     * })
     * 
     */
    delete<T extends KnowledgeDeleteArgs>(args: SelectSubset<T, KnowledgeDeleteArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Knowledge.
     * @param {KnowledgeUpdateArgs} args - Arguments to update one Knowledge.
     * @example
     * // Update one Knowledge
     * const knowledge = await prisma.knowledge.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends KnowledgeUpdateArgs>(args: SelectSubset<T, KnowledgeUpdateArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Knowledges.
     * @param {KnowledgeDeleteManyArgs} args - Arguments to filter Knowledges to delete.
     * @example
     * // Delete a few Knowledges
     * const { count } = await prisma.knowledge.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends KnowledgeDeleteManyArgs>(args?: SelectSubset<T, KnowledgeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Knowledges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Knowledges
     * const knowledge = await prisma.knowledge.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends KnowledgeUpdateManyArgs>(args: SelectSubset<T, KnowledgeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Knowledges and returns the data updated in the database.
     * @param {KnowledgeUpdateManyAndReturnArgs} args - Arguments to update many Knowledges.
     * @example
     * // Update many Knowledges
     * const knowledge = await prisma.knowledge.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Knowledges and only return the `id`
     * const knowledgeWithIdOnly = await prisma.knowledge.updateManyAndReturn({
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
    updateManyAndReturn<T extends KnowledgeUpdateManyAndReturnArgs>(args: SelectSubset<T, KnowledgeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Knowledge.
     * @param {KnowledgeUpsertArgs} args - Arguments to update or create a Knowledge.
     * @example
     * // Update or create a Knowledge
     * const knowledge = await prisma.knowledge.upsert({
     *   create: {
     *     // ... data to create a Knowledge
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Knowledge we want to update
     *   }
     * })
     */
    upsert<T extends KnowledgeUpsertArgs>(args: SelectSubset<T, KnowledgeUpsertArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Knowledges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeCountArgs} args - Arguments to filter Knowledges to count.
     * @example
     * // Count the number of Knowledges
     * const count = await prisma.knowledge.count({
     *   where: {
     *     // ... the filter for the Knowledges we want to count
     *   }
     * })
    **/
    count<T extends KnowledgeCountArgs>(
      args?: Subset<T, KnowledgeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], KnowledgeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Knowledge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends KnowledgeAggregateArgs>(args: Subset<T, KnowledgeAggregateArgs>): Prisma.PrismaPromise<GetKnowledgeAggregateType<T>>

    /**
     * Group by Knowledge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeGroupByArgs} args - Group by arguments.
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
      T extends KnowledgeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: KnowledgeGroupByArgs['orderBy'] }
        : { orderBy?: KnowledgeGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, KnowledgeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetKnowledgeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Knowledge model
   */
  readonly fields: KnowledgeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Knowledge.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__KnowledgeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    createdBy<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    users<T extends Knowledge$usersArgs<ExtArgs> = {}>(args?: Subset<T, Knowledge$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    teams<T extends Knowledge$teamsArgs<ExtArgs> = {}>(args?: Subset<T, Knowledge$teamsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    files<T extends Knowledge$filesArgs<ExtArgs> = {}>(args?: Subset<T, Knowledge$filesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Knowledge model
   */
  interface KnowledgeFieldRefs {
    readonly id: FieldRef<"Knowledge", 'String'>
    readonly name: FieldRef<"Knowledge", 'String'>
    readonly description: FieldRef<"Knowledge", 'String'>
    readonly config: FieldRef<"Knowledge", 'Json'>
    readonly createdAt: FieldRef<"Knowledge", 'DateTime'>
    readonly updatedAt: FieldRef<"Knowledge", 'DateTime'>
    readonly userId: FieldRef<"Knowledge", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Knowledge findUnique
   */
  export type KnowledgeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Knowledge
     */
    omit?: KnowledgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * Filter, which Knowledge to fetch.
     */
    where: KnowledgeWhereUniqueInput
  }

  /**
   * Knowledge findUniqueOrThrow
   */
  export type KnowledgeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Knowledge
     */
    omit?: KnowledgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * Filter, which Knowledge to fetch.
     */
    where: KnowledgeWhereUniqueInput
  }

  /**
   * Knowledge findFirst
   */
  export type KnowledgeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Knowledge
     */
    omit?: KnowledgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * Filter, which Knowledge to fetch.
     */
    where?: KnowledgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Knowledges to fetch.
     */
    orderBy?: KnowledgeOrderByWithRelationInput | KnowledgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Knowledges.
     */
    cursor?: KnowledgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Knowledges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Knowledges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Knowledges.
     */
    distinct?: KnowledgeScalarFieldEnum | KnowledgeScalarFieldEnum[]
  }

  /**
   * Knowledge findFirstOrThrow
   */
  export type KnowledgeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Knowledge
     */
    omit?: KnowledgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * Filter, which Knowledge to fetch.
     */
    where?: KnowledgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Knowledges to fetch.
     */
    orderBy?: KnowledgeOrderByWithRelationInput | KnowledgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Knowledges.
     */
    cursor?: KnowledgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Knowledges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Knowledges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Knowledges.
     */
    distinct?: KnowledgeScalarFieldEnum | KnowledgeScalarFieldEnum[]
  }

  /**
   * Knowledge findMany
   */
  export type KnowledgeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Knowledge
     */
    omit?: KnowledgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * Filter, which Knowledges to fetch.
     */
    where?: KnowledgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Knowledges to fetch.
     */
    orderBy?: KnowledgeOrderByWithRelationInput | KnowledgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Knowledges.
     */
    cursor?: KnowledgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Knowledges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Knowledges.
     */
    skip?: number
    distinct?: KnowledgeScalarFieldEnum | KnowledgeScalarFieldEnum[]
  }

  /**
   * Knowledge create
   */
  export type KnowledgeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Knowledge
     */
    omit?: KnowledgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * The data needed to create a Knowledge.
     */
    data: XOR<KnowledgeCreateInput, KnowledgeUncheckedCreateInput>
  }

  /**
   * Knowledge createMany
   */
  export type KnowledgeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Knowledges.
     */
    data: KnowledgeCreateManyInput | KnowledgeCreateManyInput[]
  }

  /**
   * Knowledge createManyAndReturn
   */
  export type KnowledgeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Knowledge
     */
    omit?: KnowledgeOmit<ExtArgs> | null
    /**
     * The data used to create many Knowledges.
     */
    data: KnowledgeCreateManyInput | KnowledgeCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Knowledge update
   */
  export type KnowledgeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Knowledge
     */
    omit?: KnowledgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * The data needed to update a Knowledge.
     */
    data: XOR<KnowledgeUpdateInput, KnowledgeUncheckedUpdateInput>
    /**
     * Choose, which Knowledge to update.
     */
    where: KnowledgeWhereUniqueInput
  }

  /**
   * Knowledge updateMany
   */
  export type KnowledgeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Knowledges.
     */
    data: XOR<KnowledgeUpdateManyMutationInput, KnowledgeUncheckedUpdateManyInput>
    /**
     * Filter which Knowledges to update
     */
    where?: KnowledgeWhereInput
    /**
     * Limit how many Knowledges to update.
     */
    limit?: number
  }

  /**
   * Knowledge updateManyAndReturn
   */
  export type KnowledgeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Knowledge
     */
    omit?: KnowledgeOmit<ExtArgs> | null
    /**
     * The data used to update Knowledges.
     */
    data: XOR<KnowledgeUpdateManyMutationInput, KnowledgeUncheckedUpdateManyInput>
    /**
     * Filter which Knowledges to update
     */
    where?: KnowledgeWhereInput
    /**
     * Limit how many Knowledges to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Knowledge upsert
   */
  export type KnowledgeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Knowledge
     */
    omit?: KnowledgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * The filter to search for the Knowledge to update in case it exists.
     */
    where: KnowledgeWhereUniqueInput
    /**
     * In case the Knowledge found by the `where` argument doesn't exist, create a new Knowledge with this data.
     */
    create: XOR<KnowledgeCreateInput, KnowledgeUncheckedCreateInput>
    /**
     * In case the Knowledge was found with the provided `where` argument, update it with this data.
     */
    update: XOR<KnowledgeUpdateInput, KnowledgeUncheckedUpdateInput>
  }

  /**
   * Knowledge delete
   */
  export type KnowledgeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Knowledge
     */
    omit?: KnowledgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * Filter which Knowledge to delete.
     */
    where: KnowledgeWhereUniqueInput
  }

  /**
   * Knowledge deleteMany
   */
  export type KnowledgeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Knowledges to delete
     */
    where?: KnowledgeWhereInput
    /**
     * Limit how many Knowledges to delete.
     */
    limit?: number
  }

  /**
   * Knowledge.users
   */
  export type Knowledge$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Knowledge.teams
   */
  export type Knowledge$teamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    where?: TeamWhereInput
    orderBy?: TeamOrderByWithRelationInput | TeamOrderByWithRelationInput[]
    cursor?: TeamWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TeamScalarFieldEnum | TeamScalarFieldEnum[]
  }

  /**
   * Knowledge.files
   */
  export type Knowledge$filesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the File
     */
    select?: FileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the File
     */
    omit?: FileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileInclude<ExtArgs> | null
    where?: FileWhereInput
    orderBy?: FileOrderByWithRelationInput | FileOrderByWithRelationInput[]
    cursor?: FileWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FileScalarFieldEnum | FileScalarFieldEnum[]
  }

  /**
   * Knowledge without action
   */
  export type KnowledgeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Knowledge
     */
    omit?: KnowledgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
  }


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
    name: string | null
    code: string | null
    password: string | null
    email: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
    permission: string | null
    defaultLLMProviderId: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    name: string | null
    code: string | null
    password: string | null
    email: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
    permission: string | null
    defaultLLMProviderId: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    name: number
    code: number
    password: number
    email: number
    description: number
    createdAt: number
    updatedAt: number
    permission: number
    defaultLLMProviderId: number
    llmPreferences: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    name?: true
    code?: true
    password?: true
    email?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    permission?: true
    defaultLLMProviderId?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    name?: true
    code?: true
    password?: true
    email?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    permission?: true
    defaultLLMProviderId?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    name?: true
    code?: true
    password?: true
    email?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    permission?: true
    defaultLLMProviderId?: true
    llmPreferences?: true
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
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt: Date
    updatedAt: Date
    permission: string
    defaultLLMProviderId: string | null
    llmPreferences: JsonValue | null
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
    name?: boolean
    code?: boolean
    password?: boolean
    email?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    permission?: boolean
    defaultLLMProviderId?: boolean
    llmPreferences?: boolean
    createdTeams?: boolean | User$createdTeamsArgs<ExtArgs>
    teamMemberships?: boolean | User$teamMembershipsArgs<ExtArgs>
    teams?: boolean | User$teamsArgs<ExtArgs>
    createdKnowledge?: boolean | User$createdKnowledgeArgs<ExtArgs>
    knowledge?: boolean | User$knowledgeArgs<ExtArgs>
    ownedAgents?: boolean | User$ownedAgentsArgs<ExtArgs>
    createdAgents?: boolean | User$createdAgentsArgs<ExtArgs>
    FileParsingTask?: boolean | User$FileParsingTaskArgs<ExtArgs>
    defaultLLMProvider?: boolean | User$defaultLLMProviderArgs<ExtArgs>
    ownedLLMProviders?: boolean | User$ownedLLMProvidersArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    password?: boolean
    email?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    permission?: boolean
    defaultLLMProviderId?: boolean
    llmPreferences?: boolean
    defaultLLMProvider?: boolean | User$defaultLLMProviderArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    password?: boolean
    email?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    permission?: boolean
    defaultLLMProviderId?: boolean
    llmPreferences?: boolean
    defaultLLMProvider?: boolean | User$defaultLLMProviderArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    name?: boolean
    code?: boolean
    password?: boolean
    email?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    permission?: boolean
    defaultLLMProviderId?: boolean
    llmPreferences?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "code" | "password" | "email" | "description" | "createdAt" | "updatedAt" | "permission" | "defaultLLMProviderId" | "llmPreferences", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdTeams?: boolean | User$createdTeamsArgs<ExtArgs>
    teamMemberships?: boolean | User$teamMembershipsArgs<ExtArgs>
    teams?: boolean | User$teamsArgs<ExtArgs>
    createdKnowledge?: boolean | User$createdKnowledgeArgs<ExtArgs>
    knowledge?: boolean | User$knowledgeArgs<ExtArgs>
    ownedAgents?: boolean | User$ownedAgentsArgs<ExtArgs>
    createdAgents?: boolean | User$createdAgentsArgs<ExtArgs>
    FileParsingTask?: boolean | User$FileParsingTaskArgs<ExtArgs>
    defaultLLMProvider?: boolean | User$defaultLLMProviderArgs<ExtArgs>
    ownedLLMProviders?: boolean | User$ownedLLMProvidersArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    defaultLLMProvider?: boolean | User$defaultLLMProviderArgs<ExtArgs>
  }
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    defaultLLMProvider?: boolean | User$defaultLLMProviderArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      createdTeams: Prisma.$TeamPayload<ExtArgs>[]
      teamMemberships: Prisma.$MemberTeamPayload<ExtArgs>[]
      teams: Prisma.$TeamPayload<ExtArgs>[]
      createdKnowledge: Prisma.$KnowledgePayload<ExtArgs>[]
      knowledge: Prisma.$KnowledgePayload<ExtArgs>[]
      ownedAgents: Prisma.$AgentPayload<ExtArgs>[]
      createdAgents: Prisma.$AgentPayload<ExtArgs>[]
      FileParsingTask: Prisma.$FileParsingTaskPayload<ExtArgs>[]
      defaultLLMProvider: Prisma.$LLMProviderPayload<ExtArgs> | null
      ownedLLMProviders: Prisma.$LLMProviderPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      code: string
      password: string
      email: string
      description: string
      createdAt: Date
      updatedAt: Date
      permission: string
      defaultLLMProviderId: string | null
      llmPreferences: Prisma.JsonValue | null
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
    createdTeams<T extends User$createdTeamsArgs<ExtArgs> = {}>(args?: Subset<T, User$createdTeamsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    teamMemberships<T extends User$teamMembershipsArgs<ExtArgs> = {}>(args?: Subset<T, User$teamMembershipsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MemberTeamPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    teams<T extends User$teamsArgs<ExtArgs> = {}>(args?: Subset<T, User$teamsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    createdKnowledge<T extends User$createdKnowledgeArgs<ExtArgs> = {}>(args?: Subset<T, User$createdKnowledgeArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    knowledge<T extends User$knowledgeArgs<ExtArgs> = {}>(args?: Subset<T, User$knowledgeArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    ownedAgents<T extends User$ownedAgentsArgs<ExtArgs> = {}>(args?: Subset<T, User$ownedAgentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    createdAgents<T extends User$createdAgentsArgs<ExtArgs> = {}>(args?: Subset<T, User$createdAgentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    FileParsingTask<T extends User$FileParsingTaskArgs<ExtArgs> = {}>(args?: Subset<T, User$FileParsingTaskArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FileParsingTaskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    defaultLLMProvider<T extends User$defaultLLMProviderArgs<ExtArgs> = {}>(args?: Subset<T, User$defaultLLMProviderArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    ownedLLMProviders<T extends User$ownedLLMProvidersArgs<ExtArgs> = {}>(args?: Subset<T, User$ownedLLMProvidersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
    readonly name: FieldRef<"User", 'String'>
    readonly code: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly description: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly permission: FieldRef<"User", 'String'>
    readonly defaultLLMProviderId: FieldRef<"User", 'String'>
    readonly llmPreferences: FieldRef<"User", 'Json'>
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
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
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
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeUpdateManyAndReturn<ExtArgs> | null
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
   * User.createdTeams
   */
  export type User$createdTeamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    where?: TeamWhereInput
    orderBy?: TeamOrderByWithRelationInput | TeamOrderByWithRelationInput[]
    cursor?: TeamWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TeamScalarFieldEnum | TeamScalarFieldEnum[]
  }

  /**
   * User.teamMemberships
   */
  export type User$teamMembershipsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MemberTeam
     */
    select?: MemberTeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MemberTeam
     */
    omit?: MemberTeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MemberTeamInclude<ExtArgs> | null
    where?: MemberTeamWhereInput
    orderBy?: MemberTeamOrderByWithRelationInput | MemberTeamOrderByWithRelationInput[]
    cursor?: MemberTeamWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MemberTeamScalarFieldEnum | MemberTeamScalarFieldEnum[]
  }

  /**
   * User.teams
   */
  export type User$teamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    where?: TeamWhereInput
    orderBy?: TeamOrderByWithRelationInput | TeamOrderByWithRelationInput[]
    cursor?: TeamWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TeamScalarFieldEnum | TeamScalarFieldEnum[]
  }

  /**
   * User.createdKnowledge
   */
  export type User$createdKnowledgeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Knowledge
     */
    omit?: KnowledgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    where?: KnowledgeWhereInput
    orderBy?: KnowledgeOrderByWithRelationInput | KnowledgeOrderByWithRelationInput[]
    cursor?: KnowledgeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: KnowledgeScalarFieldEnum | KnowledgeScalarFieldEnum[]
  }

  /**
   * User.knowledge
   */
  export type User$knowledgeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Knowledge
     */
    omit?: KnowledgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    where?: KnowledgeWhereInput
    orderBy?: KnowledgeOrderByWithRelationInput | KnowledgeOrderByWithRelationInput[]
    cursor?: KnowledgeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: KnowledgeScalarFieldEnum | KnowledgeScalarFieldEnum[]
  }

  /**
   * User.ownedAgents
   */
  export type User$ownedAgentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agent
     */
    omit?: AgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    where?: AgentWhereInput
    orderBy?: AgentOrderByWithRelationInput | AgentOrderByWithRelationInput[]
    cursor?: AgentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AgentScalarFieldEnum | AgentScalarFieldEnum[]
  }

  /**
   * User.createdAgents
   */
  export type User$createdAgentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agent
     */
    omit?: AgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    where?: AgentWhereInput
    orderBy?: AgentOrderByWithRelationInput | AgentOrderByWithRelationInput[]
    cursor?: AgentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AgentScalarFieldEnum | AgentScalarFieldEnum[]
  }

  /**
   * User.FileParsingTask
   */
  export type User$FileParsingTaskArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileParsingTask
     */
    select?: FileParsingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FileParsingTask
     */
    omit?: FileParsingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileParsingTaskInclude<ExtArgs> | null
    where?: FileParsingTaskWhereInput
    orderBy?: FileParsingTaskOrderByWithRelationInput | FileParsingTaskOrderByWithRelationInput[]
    cursor?: FileParsingTaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FileParsingTaskScalarFieldEnum | FileParsingTaskScalarFieldEnum[]
  }

  /**
   * User.defaultLLMProvider
   */
  export type User$defaultLLMProviderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
  }

  /**
   * User.ownedLLMProviders
   */
  export type User$ownedLLMProvidersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * Model File
   */

  export type AggregateFile = {
    _count: FileCountAggregateOutputType | null
    _avg: FileAvgAggregateOutputType | null
    _sum: FileSumAggregateOutputType | null
    _min: FileMinAggregateOutputType | null
    _max: FileMaxAggregateOutputType | null
  }

  export type FileAvgAggregateOutputType = {
    size: number | null
  }

  export type FileSumAggregateOutputType = {
    size: number | null
  }

  export type FileMinAggregateOutputType = {
    id: string | null
    filename: string | null
    originalName: string | null
    path: string | null
    mimetype: string | null
    size: number | null
    content: string | null
    createdAt: Date | null
    parsingStatus: string | null
    knowledgeId: string | null
  }

  export type FileMaxAggregateOutputType = {
    id: string | null
    filename: string | null
    originalName: string | null
    path: string | null
    mimetype: string | null
    size: number | null
    content: string | null
    createdAt: Date | null
    parsingStatus: string | null
    knowledgeId: string | null
  }

  export type FileCountAggregateOutputType = {
    id: number
    filename: number
    originalName: number
    path: number
    mimetype: number
    size: number
    content: number
    config: number
    createdAt: number
    parsingStatus: number
    knowledgeId: number
    _all: number
  }


  export type FileAvgAggregateInputType = {
    size?: true
  }

  export type FileSumAggregateInputType = {
    size?: true
  }

  export type FileMinAggregateInputType = {
    id?: true
    filename?: true
    originalName?: true
    path?: true
    mimetype?: true
    size?: true
    content?: true
    createdAt?: true
    parsingStatus?: true
    knowledgeId?: true
  }

  export type FileMaxAggregateInputType = {
    id?: true
    filename?: true
    originalName?: true
    path?: true
    mimetype?: true
    size?: true
    content?: true
    createdAt?: true
    parsingStatus?: true
    knowledgeId?: true
  }

  export type FileCountAggregateInputType = {
    id?: true
    filename?: true
    originalName?: true
    path?: true
    mimetype?: true
    size?: true
    content?: true
    config?: true
    createdAt?: true
    parsingStatus?: true
    knowledgeId?: true
    _all?: true
  }

  export type FileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which File to aggregate.
     */
    where?: FileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Files to fetch.
     */
    orderBy?: FileOrderByWithRelationInput | FileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Files from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Files.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Files
    **/
    _count?: true | FileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FileMaxAggregateInputType
  }

  export type GetFileAggregateType<T extends FileAggregateArgs> = {
        [P in keyof T & keyof AggregateFile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFile[P]>
      : GetScalarType<T[P], AggregateFile[P]>
  }




  export type FileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FileWhereInput
    orderBy?: FileOrderByWithAggregationInput | FileOrderByWithAggregationInput[]
    by: FileScalarFieldEnum[] | FileScalarFieldEnum
    having?: FileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FileCountAggregateInputType | true
    _avg?: FileAvgAggregateInputType
    _sum?: FileSumAggregateInputType
    _min?: FileMinAggregateInputType
    _max?: FileMaxAggregateInputType
  }

  export type FileGroupByOutputType = {
    id: string
    filename: string
    originalName: string
    path: string
    mimetype: string
    size: number
    content: string | null
    config: JsonValue | null
    createdAt: Date
    parsingStatus: string | null
    knowledgeId: string
    _count: FileCountAggregateOutputType | null
    _avg: FileAvgAggregateOutputType | null
    _sum: FileSumAggregateOutputType | null
    _min: FileMinAggregateOutputType | null
    _max: FileMaxAggregateOutputType | null
  }

  type GetFileGroupByPayload<T extends FileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FileGroupByOutputType[P]>
            : GetScalarType<T[P], FileGroupByOutputType[P]>
        }
      >
    >


  export type FileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    filename?: boolean
    originalName?: boolean
    path?: boolean
    mimetype?: boolean
    size?: boolean
    content?: boolean
    config?: boolean
    createdAt?: boolean
    parsingStatus?: boolean
    knowledgeId?: boolean
    knowledge?: boolean | KnowledgeDefaultArgs<ExtArgs>
    parsingTasks?: boolean | File$parsingTasksArgs<ExtArgs>
    TextChunk?: boolean | File$TextChunkArgs<ExtArgs>
    _count?: boolean | FileCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["file"]>

  export type FileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    filename?: boolean
    originalName?: boolean
    path?: boolean
    mimetype?: boolean
    size?: boolean
    content?: boolean
    config?: boolean
    createdAt?: boolean
    parsingStatus?: boolean
    knowledgeId?: boolean
    knowledge?: boolean | KnowledgeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["file"]>

  export type FileSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    filename?: boolean
    originalName?: boolean
    path?: boolean
    mimetype?: boolean
    size?: boolean
    content?: boolean
    config?: boolean
    createdAt?: boolean
    parsingStatus?: boolean
    knowledgeId?: boolean
    knowledge?: boolean | KnowledgeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["file"]>

  export type FileSelectScalar = {
    id?: boolean
    filename?: boolean
    originalName?: boolean
    path?: boolean
    mimetype?: boolean
    size?: boolean
    content?: boolean
    config?: boolean
    createdAt?: boolean
    parsingStatus?: boolean
    knowledgeId?: boolean
  }

  export type FileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "filename" | "originalName" | "path" | "mimetype" | "size" | "content" | "config" | "createdAt" | "parsingStatus" | "knowledgeId", ExtArgs["result"]["file"]>
  export type FileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    knowledge?: boolean | KnowledgeDefaultArgs<ExtArgs>
    parsingTasks?: boolean | File$parsingTasksArgs<ExtArgs>
    TextChunk?: boolean | File$TextChunkArgs<ExtArgs>
    _count?: boolean | FileCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type FileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    knowledge?: boolean | KnowledgeDefaultArgs<ExtArgs>
  }
  export type FileIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    knowledge?: boolean | KnowledgeDefaultArgs<ExtArgs>
  }

  export type $FilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "File"
    objects: {
      knowledge: Prisma.$KnowledgePayload<ExtArgs>
      parsingTasks: Prisma.$FileParsingTaskPayload<ExtArgs>[]
      TextChunk: Prisma.$TextChunkPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      filename: string
      originalName: string
      path: string
      mimetype: string
      size: number
      content: string | null
      config: Prisma.JsonValue | null
      createdAt: Date
      parsingStatus: string | null
      knowledgeId: string
    }, ExtArgs["result"]["file"]>
    composites: {}
  }

  type FileGetPayload<S extends boolean | null | undefined | FileDefaultArgs> = $Result.GetResult<Prisma.$FilePayload, S>

  type FileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FileCountAggregateInputType | true
    }

  export interface FileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['File'], meta: { name: 'File' } }
    /**
     * Find zero or one File that matches the filter.
     * @param {FileFindUniqueArgs} args - Arguments to find a File
     * @example
     * // Get one File
     * const file = await prisma.file.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FileFindUniqueArgs>(args: SelectSubset<T, FileFindUniqueArgs<ExtArgs>>): Prisma__FileClient<$Result.GetResult<Prisma.$FilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one File that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FileFindUniqueOrThrowArgs} args - Arguments to find a File
     * @example
     * // Get one File
     * const file = await prisma.file.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FileFindUniqueOrThrowArgs>(args: SelectSubset<T, FileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FileClient<$Result.GetResult<Prisma.$FilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first File that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFindFirstArgs} args - Arguments to find a File
     * @example
     * // Get one File
     * const file = await prisma.file.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FileFindFirstArgs>(args?: SelectSubset<T, FileFindFirstArgs<ExtArgs>>): Prisma__FileClient<$Result.GetResult<Prisma.$FilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first File that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFindFirstOrThrowArgs} args - Arguments to find a File
     * @example
     * // Get one File
     * const file = await prisma.file.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FileFindFirstOrThrowArgs>(args?: SelectSubset<T, FileFindFirstOrThrowArgs<ExtArgs>>): Prisma__FileClient<$Result.GetResult<Prisma.$FilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Files that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Files
     * const files = await prisma.file.findMany()
     * 
     * // Get first 10 Files
     * const files = await prisma.file.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const fileWithIdOnly = await prisma.file.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FileFindManyArgs>(args?: SelectSubset<T, FileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a File.
     * @param {FileCreateArgs} args - Arguments to create a File.
     * @example
     * // Create one File
     * const File = await prisma.file.create({
     *   data: {
     *     // ... data to create a File
     *   }
     * })
     * 
     */
    create<T extends FileCreateArgs>(args: SelectSubset<T, FileCreateArgs<ExtArgs>>): Prisma__FileClient<$Result.GetResult<Prisma.$FilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Files.
     * @param {FileCreateManyArgs} args - Arguments to create many Files.
     * @example
     * // Create many Files
     * const file = await prisma.file.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FileCreateManyArgs>(args?: SelectSubset<T, FileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Files and returns the data saved in the database.
     * @param {FileCreateManyAndReturnArgs} args - Arguments to create many Files.
     * @example
     * // Create many Files
     * const file = await prisma.file.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Files and only return the `id`
     * const fileWithIdOnly = await prisma.file.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FileCreateManyAndReturnArgs>(args?: SelectSubset<T, FileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a File.
     * @param {FileDeleteArgs} args - Arguments to delete one File.
     * @example
     * // Delete one File
     * const File = await prisma.file.delete({
     *   where: {
     *     // ... filter to delete one File
     *   }
     * })
     * 
     */
    delete<T extends FileDeleteArgs>(args: SelectSubset<T, FileDeleteArgs<ExtArgs>>): Prisma__FileClient<$Result.GetResult<Prisma.$FilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one File.
     * @param {FileUpdateArgs} args - Arguments to update one File.
     * @example
     * // Update one File
     * const file = await prisma.file.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FileUpdateArgs>(args: SelectSubset<T, FileUpdateArgs<ExtArgs>>): Prisma__FileClient<$Result.GetResult<Prisma.$FilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Files.
     * @param {FileDeleteManyArgs} args - Arguments to filter Files to delete.
     * @example
     * // Delete a few Files
     * const { count } = await prisma.file.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FileDeleteManyArgs>(args?: SelectSubset<T, FileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Files.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Files
     * const file = await prisma.file.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FileUpdateManyArgs>(args: SelectSubset<T, FileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Files and returns the data updated in the database.
     * @param {FileUpdateManyAndReturnArgs} args - Arguments to update many Files.
     * @example
     * // Update many Files
     * const file = await prisma.file.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Files and only return the `id`
     * const fileWithIdOnly = await prisma.file.updateManyAndReturn({
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
    updateManyAndReturn<T extends FileUpdateManyAndReturnArgs>(args: SelectSubset<T, FileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one File.
     * @param {FileUpsertArgs} args - Arguments to update or create a File.
     * @example
     * // Update or create a File
     * const file = await prisma.file.upsert({
     *   create: {
     *     // ... data to create a File
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the File we want to update
     *   }
     * })
     */
    upsert<T extends FileUpsertArgs>(args: SelectSubset<T, FileUpsertArgs<ExtArgs>>): Prisma__FileClient<$Result.GetResult<Prisma.$FilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Files.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileCountArgs} args - Arguments to filter Files to count.
     * @example
     * // Count the number of Files
     * const count = await prisma.file.count({
     *   where: {
     *     // ... the filter for the Files we want to count
     *   }
     * })
    **/
    count<T extends FileCountArgs>(
      args?: Subset<T, FileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a File.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends FileAggregateArgs>(args: Subset<T, FileAggregateArgs>): Prisma.PrismaPromise<GetFileAggregateType<T>>

    /**
     * Group by File.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileGroupByArgs} args - Group by arguments.
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
      T extends FileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FileGroupByArgs['orderBy'] }
        : { orderBy?: FileGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, FileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the File model
   */
  readonly fields: FileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for File.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    knowledge<T extends KnowledgeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, KnowledgeDefaultArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    parsingTasks<T extends File$parsingTasksArgs<ExtArgs> = {}>(args?: Subset<T, File$parsingTasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FileParsingTaskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    TextChunk<T extends File$TextChunkArgs<ExtArgs> = {}>(args?: Subset<T, File$TextChunkArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TextChunkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the File model
   */
  interface FileFieldRefs {
    readonly id: FieldRef<"File", 'String'>
    readonly filename: FieldRef<"File", 'String'>
    readonly originalName: FieldRef<"File", 'String'>
    readonly path: FieldRef<"File", 'String'>
    readonly mimetype: FieldRef<"File", 'String'>
    readonly size: FieldRef<"File", 'Int'>
    readonly content: FieldRef<"File", 'String'>
    readonly config: FieldRef<"File", 'Json'>
    readonly createdAt: FieldRef<"File", 'DateTime'>
    readonly parsingStatus: FieldRef<"File", 'String'>
    readonly knowledgeId: FieldRef<"File", 'String'>
  }
    

  // Custom InputTypes
  /**
   * File findUnique
   */
  export type FileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the File
     */
    select?: FileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the File
     */
    omit?: FileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileInclude<ExtArgs> | null
    /**
     * Filter, which File to fetch.
     */
    where: FileWhereUniqueInput
  }

  /**
   * File findUniqueOrThrow
   */
  export type FileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the File
     */
    select?: FileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the File
     */
    omit?: FileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileInclude<ExtArgs> | null
    /**
     * Filter, which File to fetch.
     */
    where: FileWhereUniqueInput
  }

  /**
   * File findFirst
   */
  export type FileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the File
     */
    select?: FileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the File
     */
    omit?: FileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileInclude<ExtArgs> | null
    /**
     * Filter, which File to fetch.
     */
    where?: FileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Files to fetch.
     */
    orderBy?: FileOrderByWithRelationInput | FileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Files.
     */
    cursor?: FileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Files from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Files.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Files.
     */
    distinct?: FileScalarFieldEnum | FileScalarFieldEnum[]
  }

  /**
   * File findFirstOrThrow
   */
  export type FileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the File
     */
    select?: FileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the File
     */
    omit?: FileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileInclude<ExtArgs> | null
    /**
     * Filter, which File to fetch.
     */
    where?: FileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Files to fetch.
     */
    orderBy?: FileOrderByWithRelationInput | FileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Files.
     */
    cursor?: FileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Files from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Files.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Files.
     */
    distinct?: FileScalarFieldEnum | FileScalarFieldEnum[]
  }

  /**
   * File findMany
   */
  export type FileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the File
     */
    select?: FileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the File
     */
    omit?: FileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileInclude<ExtArgs> | null
    /**
     * Filter, which Files to fetch.
     */
    where?: FileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Files to fetch.
     */
    orderBy?: FileOrderByWithRelationInput | FileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Files.
     */
    cursor?: FileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Files from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Files.
     */
    skip?: number
    distinct?: FileScalarFieldEnum | FileScalarFieldEnum[]
  }

  /**
   * File create
   */
  export type FileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the File
     */
    select?: FileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the File
     */
    omit?: FileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileInclude<ExtArgs> | null
    /**
     * The data needed to create a File.
     */
    data: XOR<FileCreateInput, FileUncheckedCreateInput>
  }

  /**
   * File createMany
   */
  export type FileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Files.
     */
    data: FileCreateManyInput | FileCreateManyInput[]
  }

  /**
   * File createManyAndReturn
   */
  export type FileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the File
     */
    select?: FileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the File
     */
    omit?: FileOmit<ExtArgs> | null
    /**
     * The data used to create many Files.
     */
    data: FileCreateManyInput | FileCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * File update
   */
  export type FileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the File
     */
    select?: FileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the File
     */
    omit?: FileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileInclude<ExtArgs> | null
    /**
     * The data needed to update a File.
     */
    data: XOR<FileUpdateInput, FileUncheckedUpdateInput>
    /**
     * Choose, which File to update.
     */
    where: FileWhereUniqueInput
  }

  /**
   * File updateMany
   */
  export type FileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Files.
     */
    data: XOR<FileUpdateManyMutationInput, FileUncheckedUpdateManyInput>
    /**
     * Filter which Files to update
     */
    where?: FileWhereInput
    /**
     * Limit how many Files to update.
     */
    limit?: number
  }

  /**
   * File updateManyAndReturn
   */
  export type FileUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the File
     */
    select?: FileSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the File
     */
    omit?: FileOmit<ExtArgs> | null
    /**
     * The data used to update Files.
     */
    data: XOR<FileUpdateManyMutationInput, FileUncheckedUpdateManyInput>
    /**
     * Filter which Files to update
     */
    where?: FileWhereInput
    /**
     * Limit how many Files to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * File upsert
   */
  export type FileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the File
     */
    select?: FileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the File
     */
    omit?: FileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileInclude<ExtArgs> | null
    /**
     * The filter to search for the File to update in case it exists.
     */
    where: FileWhereUniqueInput
    /**
     * In case the File found by the `where` argument doesn't exist, create a new File with this data.
     */
    create: XOR<FileCreateInput, FileUncheckedCreateInput>
    /**
     * In case the File was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FileUpdateInput, FileUncheckedUpdateInput>
  }

  /**
   * File delete
   */
  export type FileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the File
     */
    select?: FileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the File
     */
    omit?: FileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileInclude<ExtArgs> | null
    /**
     * Filter which File to delete.
     */
    where: FileWhereUniqueInput
  }

  /**
   * File deleteMany
   */
  export type FileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Files to delete
     */
    where?: FileWhereInput
    /**
     * Limit how many Files to delete.
     */
    limit?: number
  }

  /**
   * File.parsingTasks
   */
  export type File$parsingTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileParsingTask
     */
    select?: FileParsingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FileParsingTask
     */
    omit?: FileParsingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileParsingTaskInclude<ExtArgs> | null
    where?: FileParsingTaskWhereInput
    orderBy?: FileParsingTaskOrderByWithRelationInput | FileParsingTaskOrderByWithRelationInput[]
    cursor?: FileParsingTaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FileParsingTaskScalarFieldEnum | FileParsingTaskScalarFieldEnum[]
  }

  /**
   * File.TextChunk
   */
  export type File$TextChunkArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TextChunk
     */
    select?: TextChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TextChunk
     */
    omit?: TextChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TextChunkInclude<ExtArgs> | null
    where?: TextChunkWhereInput
    orderBy?: TextChunkOrderByWithRelationInput | TextChunkOrderByWithRelationInput[]
    cursor?: TextChunkWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TextChunkScalarFieldEnum | TextChunkScalarFieldEnum[]
  }

  /**
   * File without action
   */
  export type FileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the File
     */
    select?: FileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the File
     */
    omit?: FileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileInclude<ExtArgs> | null
  }


  /**
   * Model FileParsingTask
   */

  export type AggregateFileParsingTask = {
    _count: FileParsingTaskCountAggregateOutputType | null
    _min: FileParsingTaskMinAggregateOutputType | null
    _max: FileParsingTaskMaxAggregateOutputType | null
  }

  export type FileParsingTaskMinAggregateOutputType = {
    id: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
    completedAt: Date | null
    message: string | null
    fileId: string | null
    createdById: string | null
  }

  export type FileParsingTaskMaxAggregateOutputType = {
    id: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
    completedAt: Date | null
    message: string | null
    fileId: string | null
    createdById: string | null
  }

  export type FileParsingTaskCountAggregateOutputType = {
    id: number
    status: number
    createdAt: number
    updatedAt: number
    completedAt: number
    message: number
    fileId: number
    createdById: number
    _all: number
  }


  export type FileParsingTaskMinAggregateInputType = {
    id?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    completedAt?: true
    message?: true
    fileId?: true
    createdById?: true
  }

  export type FileParsingTaskMaxAggregateInputType = {
    id?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    completedAt?: true
    message?: true
    fileId?: true
    createdById?: true
  }

  export type FileParsingTaskCountAggregateInputType = {
    id?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    completedAt?: true
    message?: true
    fileId?: true
    createdById?: true
    _all?: true
  }

  export type FileParsingTaskAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FileParsingTask to aggregate.
     */
    where?: FileParsingTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FileParsingTasks to fetch.
     */
    orderBy?: FileParsingTaskOrderByWithRelationInput | FileParsingTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FileParsingTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FileParsingTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FileParsingTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FileParsingTasks
    **/
    _count?: true | FileParsingTaskCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FileParsingTaskMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FileParsingTaskMaxAggregateInputType
  }

  export type GetFileParsingTaskAggregateType<T extends FileParsingTaskAggregateArgs> = {
        [P in keyof T & keyof AggregateFileParsingTask]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFileParsingTask[P]>
      : GetScalarType<T[P], AggregateFileParsingTask[P]>
  }




  export type FileParsingTaskGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FileParsingTaskWhereInput
    orderBy?: FileParsingTaskOrderByWithAggregationInput | FileParsingTaskOrderByWithAggregationInput[]
    by: FileParsingTaskScalarFieldEnum[] | FileParsingTaskScalarFieldEnum
    having?: FileParsingTaskScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FileParsingTaskCountAggregateInputType | true
    _min?: FileParsingTaskMinAggregateInputType
    _max?: FileParsingTaskMaxAggregateInputType
  }

  export type FileParsingTaskGroupByOutputType = {
    id: string
    status: string
    createdAt: Date
    updatedAt: Date
    completedAt: Date | null
    message: string | null
    fileId: string
    createdById: string
    _count: FileParsingTaskCountAggregateOutputType | null
    _min: FileParsingTaskMinAggregateOutputType | null
    _max: FileParsingTaskMaxAggregateOutputType | null
  }

  type GetFileParsingTaskGroupByPayload<T extends FileParsingTaskGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FileParsingTaskGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FileParsingTaskGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FileParsingTaskGroupByOutputType[P]>
            : GetScalarType<T[P], FileParsingTaskGroupByOutputType[P]>
        }
      >
    >


  export type FileParsingTaskSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    completedAt?: boolean
    message?: boolean
    fileId?: boolean
    createdById?: boolean
    file?: boolean | FileDefaultArgs<ExtArgs>
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fileParsingTask"]>

  export type FileParsingTaskSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    completedAt?: boolean
    message?: boolean
    fileId?: boolean
    createdById?: boolean
    file?: boolean | FileDefaultArgs<ExtArgs>
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fileParsingTask"]>

  export type FileParsingTaskSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    completedAt?: boolean
    message?: boolean
    fileId?: boolean
    createdById?: boolean
    file?: boolean | FileDefaultArgs<ExtArgs>
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fileParsingTask"]>

  export type FileParsingTaskSelectScalar = {
    id?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    completedAt?: boolean
    message?: boolean
    fileId?: boolean
    createdById?: boolean
  }

  export type FileParsingTaskOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "status" | "createdAt" | "updatedAt" | "completedAt" | "message" | "fileId" | "createdById", ExtArgs["result"]["fileParsingTask"]>
  export type FileParsingTaskInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    file?: boolean | FileDefaultArgs<ExtArgs>
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type FileParsingTaskIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    file?: boolean | FileDefaultArgs<ExtArgs>
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type FileParsingTaskIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    file?: boolean | FileDefaultArgs<ExtArgs>
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $FileParsingTaskPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FileParsingTask"
    objects: {
      file: Prisma.$FilePayload<ExtArgs>
      createdBy: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      status: string
      createdAt: Date
      updatedAt: Date
      completedAt: Date | null
      message: string | null
      fileId: string
      createdById: string
    }, ExtArgs["result"]["fileParsingTask"]>
    composites: {}
  }

  type FileParsingTaskGetPayload<S extends boolean | null | undefined | FileParsingTaskDefaultArgs> = $Result.GetResult<Prisma.$FileParsingTaskPayload, S>

  type FileParsingTaskCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FileParsingTaskFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FileParsingTaskCountAggregateInputType | true
    }

  export interface FileParsingTaskDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FileParsingTask'], meta: { name: 'FileParsingTask' } }
    /**
     * Find zero or one FileParsingTask that matches the filter.
     * @param {FileParsingTaskFindUniqueArgs} args - Arguments to find a FileParsingTask
     * @example
     * // Get one FileParsingTask
     * const fileParsingTask = await prisma.fileParsingTask.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FileParsingTaskFindUniqueArgs>(args: SelectSubset<T, FileParsingTaskFindUniqueArgs<ExtArgs>>): Prisma__FileParsingTaskClient<$Result.GetResult<Prisma.$FileParsingTaskPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one FileParsingTask that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FileParsingTaskFindUniqueOrThrowArgs} args - Arguments to find a FileParsingTask
     * @example
     * // Get one FileParsingTask
     * const fileParsingTask = await prisma.fileParsingTask.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FileParsingTaskFindUniqueOrThrowArgs>(args: SelectSubset<T, FileParsingTaskFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FileParsingTaskClient<$Result.GetResult<Prisma.$FileParsingTaskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FileParsingTask that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileParsingTaskFindFirstArgs} args - Arguments to find a FileParsingTask
     * @example
     * // Get one FileParsingTask
     * const fileParsingTask = await prisma.fileParsingTask.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FileParsingTaskFindFirstArgs>(args?: SelectSubset<T, FileParsingTaskFindFirstArgs<ExtArgs>>): Prisma__FileParsingTaskClient<$Result.GetResult<Prisma.$FileParsingTaskPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FileParsingTask that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileParsingTaskFindFirstOrThrowArgs} args - Arguments to find a FileParsingTask
     * @example
     * // Get one FileParsingTask
     * const fileParsingTask = await prisma.fileParsingTask.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FileParsingTaskFindFirstOrThrowArgs>(args?: SelectSubset<T, FileParsingTaskFindFirstOrThrowArgs<ExtArgs>>): Prisma__FileParsingTaskClient<$Result.GetResult<Prisma.$FileParsingTaskPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more FileParsingTasks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileParsingTaskFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FileParsingTasks
     * const fileParsingTasks = await prisma.fileParsingTask.findMany()
     * 
     * // Get first 10 FileParsingTasks
     * const fileParsingTasks = await prisma.fileParsingTask.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const fileParsingTaskWithIdOnly = await prisma.fileParsingTask.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FileParsingTaskFindManyArgs>(args?: SelectSubset<T, FileParsingTaskFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FileParsingTaskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a FileParsingTask.
     * @param {FileParsingTaskCreateArgs} args - Arguments to create a FileParsingTask.
     * @example
     * // Create one FileParsingTask
     * const FileParsingTask = await prisma.fileParsingTask.create({
     *   data: {
     *     // ... data to create a FileParsingTask
     *   }
     * })
     * 
     */
    create<T extends FileParsingTaskCreateArgs>(args: SelectSubset<T, FileParsingTaskCreateArgs<ExtArgs>>): Prisma__FileParsingTaskClient<$Result.GetResult<Prisma.$FileParsingTaskPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many FileParsingTasks.
     * @param {FileParsingTaskCreateManyArgs} args - Arguments to create many FileParsingTasks.
     * @example
     * // Create many FileParsingTasks
     * const fileParsingTask = await prisma.fileParsingTask.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FileParsingTaskCreateManyArgs>(args?: SelectSubset<T, FileParsingTaskCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FileParsingTasks and returns the data saved in the database.
     * @param {FileParsingTaskCreateManyAndReturnArgs} args - Arguments to create many FileParsingTasks.
     * @example
     * // Create many FileParsingTasks
     * const fileParsingTask = await prisma.fileParsingTask.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FileParsingTasks and only return the `id`
     * const fileParsingTaskWithIdOnly = await prisma.fileParsingTask.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FileParsingTaskCreateManyAndReturnArgs>(args?: SelectSubset<T, FileParsingTaskCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FileParsingTaskPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a FileParsingTask.
     * @param {FileParsingTaskDeleteArgs} args - Arguments to delete one FileParsingTask.
     * @example
     * // Delete one FileParsingTask
     * const FileParsingTask = await prisma.fileParsingTask.delete({
     *   where: {
     *     // ... filter to delete one FileParsingTask
     *   }
     * })
     * 
     */
    delete<T extends FileParsingTaskDeleteArgs>(args: SelectSubset<T, FileParsingTaskDeleteArgs<ExtArgs>>): Prisma__FileParsingTaskClient<$Result.GetResult<Prisma.$FileParsingTaskPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one FileParsingTask.
     * @param {FileParsingTaskUpdateArgs} args - Arguments to update one FileParsingTask.
     * @example
     * // Update one FileParsingTask
     * const fileParsingTask = await prisma.fileParsingTask.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FileParsingTaskUpdateArgs>(args: SelectSubset<T, FileParsingTaskUpdateArgs<ExtArgs>>): Prisma__FileParsingTaskClient<$Result.GetResult<Prisma.$FileParsingTaskPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more FileParsingTasks.
     * @param {FileParsingTaskDeleteManyArgs} args - Arguments to filter FileParsingTasks to delete.
     * @example
     * // Delete a few FileParsingTasks
     * const { count } = await prisma.fileParsingTask.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FileParsingTaskDeleteManyArgs>(args?: SelectSubset<T, FileParsingTaskDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FileParsingTasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileParsingTaskUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FileParsingTasks
     * const fileParsingTask = await prisma.fileParsingTask.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FileParsingTaskUpdateManyArgs>(args: SelectSubset<T, FileParsingTaskUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FileParsingTasks and returns the data updated in the database.
     * @param {FileParsingTaskUpdateManyAndReturnArgs} args - Arguments to update many FileParsingTasks.
     * @example
     * // Update many FileParsingTasks
     * const fileParsingTask = await prisma.fileParsingTask.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more FileParsingTasks and only return the `id`
     * const fileParsingTaskWithIdOnly = await prisma.fileParsingTask.updateManyAndReturn({
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
    updateManyAndReturn<T extends FileParsingTaskUpdateManyAndReturnArgs>(args: SelectSubset<T, FileParsingTaskUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FileParsingTaskPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one FileParsingTask.
     * @param {FileParsingTaskUpsertArgs} args - Arguments to update or create a FileParsingTask.
     * @example
     * // Update or create a FileParsingTask
     * const fileParsingTask = await prisma.fileParsingTask.upsert({
     *   create: {
     *     // ... data to create a FileParsingTask
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FileParsingTask we want to update
     *   }
     * })
     */
    upsert<T extends FileParsingTaskUpsertArgs>(args: SelectSubset<T, FileParsingTaskUpsertArgs<ExtArgs>>): Prisma__FileParsingTaskClient<$Result.GetResult<Prisma.$FileParsingTaskPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of FileParsingTasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileParsingTaskCountArgs} args - Arguments to filter FileParsingTasks to count.
     * @example
     * // Count the number of FileParsingTasks
     * const count = await prisma.fileParsingTask.count({
     *   where: {
     *     // ... the filter for the FileParsingTasks we want to count
     *   }
     * })
    **/
    count<T extends FileParsingTaskCountArgs>(
      args?: Subset<T, FileParsingTaskCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FileParsingTaskCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FileParsingTask.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileParsingTaskAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends FileParsingTaskAggregateArgs>(args: Subset<T, FileParsingTaskAggregateArgs>): Prisma.PrismaPromise<GetFileParsingTaskAggregateType<T>>

    /**
     * Group by FileParsingTask.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FileParsingTaskGroupByArgs} args - Group by arguments.
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
      T extends FileParsingTaskGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FileParsingTaskGroupByArgs['orderBy'] }
        : { orderBy?: FileParsingTaskGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, FileParsingTaskGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFileParsingTaskGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FileParsingTask model
   */
  readonly fields: FileParsingTaskFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FileParsingTask.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FileParsingTaskClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    file<T extends FileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FileDefaultArgs<ExtArgs>>): Prisma__FileClient<$Result.GetResult<Prisma.$FilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    createdBy<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the FileParsingTask model
   */
  interface FileParsingTaskFieldRefs {
    readonly id: FieldRef<"FileParsingTask", 'String'>
    readonly status: FieldRef<"FileParsingTask", 'String'>
    readonly createdAt: FieldRef<"FileParsingTask", 'DateTime'>
    readonly updatedAt: FieldRef<"FileParsingTask", 'DateTime'>
    readonly completedAt: FieldRef<"FileParsingTask", 'DateTime'>
    readonly message: FieldRef<"FileParsingTask", 'String'>
    readonly fileId: FieldRef<"FileParsingTask", 'String'>
    readonly createdById: FieldRef<"FileParsingTask", 'String'>
  }
    

  // Custom InputTypes
  /**
   * FileParsingTask findUnique
   */
  export type FileParsingTaskFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileParsingTask
     */
    select?: FileParsingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FileParsingTask
     */
    omit?: FileParsingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileParsingTaskInclude<ExtArgs> | null
    /**
     * Filter, which FileParsingTask to fetch.
     */
    where: FileParsingTaskWhereUniqueInput
  }

  /**
   * FileParsingTask findUniqueOrThrow
   */
  export type FileParsingTaskFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileParsingTask
     */
    select?: FileParsingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FileParsingTask
     */
    omit?: FileParsingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileParsingTaskInclude<ExtArgs> | null
    /**
     * Filter, which FileParsingTask to fetch.
     */
    where: FileParsingTaskWhereUniqueInput
  }

  /**
   * FileParsingTask findFirst
   */
  export type FileParsingTaskFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileParsingTask
     */
    select?: FileParsingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FileParsingTask
     */
    omit?: FileParsingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileParsingTaskInclude<ExtArgs> | null
    /**
     * Filter, which FileParsingTask to fetch.
     */
    where?: FileParsingTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FileParsingTasks to fetch.
     */
    orderBy?: FileParsingTaskOrderByWithRelationInput | FileParsingTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FileParsingTasks.
     */
    cursor?: FileParsingTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FileParsingTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FileParsingTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FileParsingTasks.
     */
    distinct?: FileParsingTaskScalarFieldEnum | FileParsingTaskScalarFieldEnum[]
  }

  /**
   * FileParsingTask findFirstOrThrow
   */
  export type FileParsingTaskFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileParsingTask
     */
    select?: FileParsingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FileParsingTask
     */
    omit?: FileParsingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileParsingTaskInclude<ExtArgs> | null
    /**
     * Filter, which FileParsingTask to fetch.
     */
    where?: FileParsingTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FileParsingTasks to fetch.
     */
    orderBy?: FileParsingTaskOrderByWithRelationInput | FileParsingTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FileParsingTasks.
     */
    cursor?: FileParsingTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FileParsingTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FileParsingTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FileParsingTasks.
     */
    distinct?: FileParsingTaskScalarFieldEnum | FileParsingTaskScalarFieldEnum[]
  }

  /**
   * FileParsingTask findMany
   */
  export type FileParsingTaskFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileParsingTask
     */
    select?: FileParsingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FileParsingTask
     */
    omit?: FileParsingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileParsingTaskInclude<ExtArgs> | null
    /**
     * Filter, which FileParsingTasks to fetch.
     */
    where?: FileParsingTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FileParsingTasks to fetch.
     */
    orderBy?: FileParsingTaskOrderByWithRelationInput | FileParsingTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FileParsingTasks.
     */
    cursor?: FileParsingTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FileParsingTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FileParsingTasks.
     */
    skip?: number
    distinct?: FileParsingTaskScalarFieldEnum | FileParsingTaskScalarFieldEnum[]
  }

  /**
   * FileParsingTask create
   */
  export type FileParsingTaskCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileParsingTask
     */
    select?: FileParsingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FileParsingTask
     */
    omit?: FileParsingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileParsingTaskInclude<ExtArgs> | null
    /**
     * The data needed to create a FileParsingTask.
     */
    data: XOR<FileParsingTaskCreateInput, FileParsingTaskUncheckedCreateInput>
  }

  /**
   * FileParsingTask createMany
   */
  export type FileParsingTaskCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FileParsingTasks.
     */
    data: FileParsingTaskCreateManyInput | FileParsingTaskCreateManyInput[]
  }

  /**
   * FileParsingTask createManyAndReturn
   */
  export type FileParsingTaskCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileParsingTask
     */
    select?: FileParsingTaskSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FileParsingTask
     */
    omit?: FileParsingTaskOmit<ExtArgs> | null
    /**
     * The data used to create many FileParsingTasks.
     */
    data: FileParsingTaskCreateManyInput | FileParsingTaskCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileParsingTaskIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FileParsingTask update
   */
  export type FileParsingTaskUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileParsingTask
     */
    select?: FileParsingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FileParsingTask
     */
    omit?: FileParsingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileParsingTaskInclude<ExtArgs> | null
    /**
     * The data needed to update a FileParsingTask.
     */
    data: XOR<FileParsingTaskUpdateInput, FileParsingTaskUncheckedUpdateInput>
    /**
     * Choose, which FileParsingTask to update.
     */
    where: FileParsingTaskWhereUniqueInput
  }

  /**
   * FileParsingTask updateMany
   */
  export type FileParsingTaskUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FileParsingTasks.
     */
    data: XOR<FileParsingTaskUpdateManyMutationInput, FileParsingTaskUncheckedUpdateManyInput>
    /**
     * Filter which FileParsingTasks to update
     */
    where?: FileParsingTaskWhereInput
    /**
     * Limit how many FileParsingTasks to update.
     */
    limit?: number
  }

  /**
   * FileParsingTask updateManyAndReturn
   */
  export type FileParsingTaskUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileParsingTask
     */
    select?: FileParsingTaskSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FileParsingTask
     */
    omit?: FileParsingTaskOmit<ExtArgs> | null
    /**
     * The data used to update FileParsingTasks.
     */
    data: XOR<FileParsingTaskUpdateManyMutationInput, FileParsingTaskUncheckedUpdateManyInput>
    /**
     * Filter which FileParsingTasks to update
     */
    where?: FileParsingTaskWhereInput
    /**
     * Limit how many FileParsingTasks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileParsingTaskIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * FileParsingTask upsert
   */
  export type FileParsingTaskUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileParsingTask
     */
    select?: FileParsingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FileParsingTask
     */
    omit?: FileParsingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileParsingTaskInclude<ExtArgs> | null
    /**
     * The filter to search for the FileParsingTask to update in case it exists.
     */
    where: FileParsingTaskWhereUniqueInput
    /**
     * In case the FileParsingTask found by the `where` argument doesn't exist, create a new FileParsingTask with this data.
     */
    create: XOR<FileParsingTaskCreateInput, FileParsingTaskUncheckedCreateInput>
    /**
     * In case the FileParsingTask was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FileParsingTaskUpdateInput, FileParsingTaskUncheckedUpdateInput>
  }

  /**
   * FileParsingTask delete
   */
  export type FileParsingTaskDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileParsingTask
     */
    select?: FileParsingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FileParsingTask
     */
    omit?: FileParsingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileParsingTaskInclude<ExtArgs> | null
    /**
     * Filter which FileParsingTask to delete.
     */
    where: FileParsingTaskWhereUniqueInput
  }

  /**
   * FileParsingTask deleteMany
   */
  export type FileParsingTaskDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FileParsingTasks to delete
     */
    where?: FileParsingTaskWhereInput
    /**
     * Limit how many FileParsingTasks to delete.
     */
    limit?: number
  }

  /**
   * FileParsingTask without action
   */
  export type FileParsingTaskDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FileParsingTask
     */
    select?: FileParsingTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FileParsingTask
     */
    omit?: FileParsingTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FileParsingTaskInclude<ExtArgs> | null
  }


  /**
   * Model Agent
   */

  export type AggregateAgent = {
    _count: AgentCountAggregateOutputType | null
    _min: AgentMinAggregateOutputType | null
    _max: AgentMaxAggregateOutputType | null
  }

  export type AgentMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    flowConfig: string | null
    isActive: boolean | null
    ownerType: string | null
    createdAt: Date | null
    updatedAt: Date | null
    createdById: string | null
    userId: string | null
    teamId: string | null
  }

  export type AgentMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    flowConfig: string | null
    isActive: boolean | null
    ownerType: string | null
    createdAt: Date | null
    updatedAt: Date | null
    createdById: string | null
    userId: string | null
    teamId: string | null
  }

  export type AgentCountAggregateOutputType = {
    id: number
    name: number
    description: number
    flowConfig: number
    isActive: number
    ownerType: number
    createdAt: number
    updatedAt: number
    createdById: number
    userId: number
    teamId: number
    _all: number
  }


  export type AgentMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    flowConfig?: true
    isActive?: true
    ownerType?: true
    createdAt?: true
    updatedAt?: true
    createdById?: true
    userId?: true
    teamId?: true
  }

  export type AgentMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    flowConfig?: true
    isActive?: true
    ownerType?: true
    createdAt?: true
    updatedAt?: true
    createdById?: true
    userId?: true
    teamId?: true
  }

  export type AgentCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    flowConfig?: true
    isActive?: true
    ownerType?: true
    createdAt?: true
    updatedAt?: true
    createdById?: true
    userId?: true
    teamId?: true
    _all?: true
  }

  export type AgentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Agent to aggregate.
     */
    where?: AgentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agents to fetch.
     */
    orderBy?: AgentOrderByWithRelationInput | AgentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AgentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Agents
    **/
    _count?: true | AgentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgentMaxAggregateInputType
  }

  export type GetAgentAggregateType<T extends AgentAggregateArgs> = {
        [P in keyof T & keyof AggregateAgent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgent[P]>
      : GetScalarType<T[P], AggregateAgent[P]>
  }




  export type AgentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgentWhereInput
    orderBy?: AgentOrderByWithAggregationInput | AgentOrderByWithAggregationInput[]
    by: AgentScalarFieldEnum[] | AgentScalarFieldEnum
    having?: AgentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgentCountAggregateInputType | true
    _min?: AgentMinAggregateInputType
    _max?: AgentMaxAggregateInputType
  }

  export type AgentGroupByOutputType = {
    id: string
    name: string
    description: string
    flowConfig: string
    isActive: boolean
    ownerType: string
    createdAt: Date
    updatedAt: Date
    createdById: string
    userId: string | null
    teamId: string | null
    _count: AgentCountAggregateOutputType | null
    _min: AgentMinAggregateOutputType | null
    _max: AgentMaxAggregateOutputType | null
  }

  type GetAgentGroupByPayload<T extends AgentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgentGroupByOutputType[P]>
            : GetScalarType<T[P], AgentGroupByOutputType[P]>
        }
      >
    >


  export type AgentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    flowConfig?: boolean
    isActive?: boolean
    ownerType?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdById?: boolean
    userId?: boolean
    teamId?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    user?: boolean | Agent$userArgs<ExtArgs>
    team?: boolean | Agent$teamArgs<ExtArgs>
    conversations?: boolean | Agent$conversationsArgs<ExtArgs>
    _count?: boolean | AgentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["agent"]>

  export type AgentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    flowConfig?: boolean
    isActive?: boolean
    ownerType?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdById?: boolean
    userId?: boolean
    teamId?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    user?: boolean | Agent$userArgs<ExtArgs>
    team?: boolean | Agent$teamArgs<ExtArgs>
  }, ExtArgs["result"]["agent"]>

  export type AgentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    flowConfig?: boolean
    isActive?: boolean
    ownerType?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdById?: boolean
    userId?: boolean
    teamId?: boolean
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    user?: boolean | Agent$userArgs<ExtArgs>
    team?: boolean | Agent$teamArgs<ExtArgs>
  }, ExtArgs["result"]["agent"]>

  export type AgentSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    flowConfig?: boolean
    isActive?: boolean
    ownerType?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdById?: boolean
    userId?: boolean
    teamId?: boolean
  }

  export type AgentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "flowConfig" | "isActive" | "ownerType" | "createdAt" | "updatedAt" | "createdById" | "userId" | "teamId", ExtArgs["result"]["agent"]>
  export type AgentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    user?: boolean | Agent$userArgs<ExtArgs>
    team?: boolean | Agent$teamArgs<ExtArgs>
    conversations?: boolean | Agent$conversationsArgs<ExtArgs>
    _count?: boolean | AgentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AgentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    user?: boolean | Agent$userArgs<ExtArgs>
    team?: boolean | Agent$teamArgs<ExtArgs>
  }
  export type AgentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserDefaultArgs<ExtArgs>
    user?: boolean | Agent$userArgs<ExtArgs>
    team?: boolean | Agent$teamArgs<ExtArgs>
  }

  export type $AgentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Agent"
    objects: {
      createdBy: Prisma.$UserPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs> | null
      team: Prisma.$TeamPayload<ExtArgs> | null
      conversations: Prisma.$ConversationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string
      flowConfig: string
      isActive: boolean
      ownerType: string
      createdAt: Date
      updatedAt: Date
      createdById: string
      userId: string | null
      teamId: string | null
    }, ExtArgs["result"]["agent"]>
    composites: {}
  }

  type AgentGetPayload<S extends boolean | null | undefined | AgentDefaultArgs> = $Result.GetResult<Prisma.$AgentPayload, S>

  type AgentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AgentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AgentCountAggregateInputType | true
    }

  export interface AgentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Agent'], meta: { name: 'Agent' } }
    /**
     * Find zero or one Agent that matches the filter.
     * @param {AgentFindUniqueArgs} args - Arguments to find a Agent
     * @example
     * // Get one Agent
     * const agent = await prisma.agent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AgentFindUniqueArgs>(args: SelectSubset<T, AgentFindUniqueArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Agent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AgentFindUniqueOrThrowArgs} args - Arguments to find a Agent
     * @example
     * // Get one Agent
     * const agent = await prisma.agent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AgentFindUniqueOrThrowArgs>(args: SelectSubset<T, AgentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Agent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentFindFirstArgs} args - Arguments to find a Agent
     * @example
     * // Get one Agent
     * const agent = await prisma.agent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AgentFindFirstArgs>(args?: SelectSubset<T, AgentFindFirstArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Agent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentFindFirstOrThrowArgs} args - Arguments to find a Agent
     * @example
     * // Get one Agent
     * const agent = await prisma.agent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AgentFindFirstOrThrowArgs>(args?: SelectSubset<T, AgentFindFirstOrThrowArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Agents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Agents
     * const agents = await prisma.agent.findMany()
     * 
     * // Get first 10 Agents
     * const agents = await prisma.agent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const agentWithIdOnly = await prisma.agent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AgentFindManyArgs>(args?: SelectSubset<T, AgentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Agent.
     * @param {AgentCreateArgs} args - Arguments to create a Agent.
     * @example
     * // Create one Agent
     * const Agent = await prisma.agent.create({
     *   data: {
     *     // ... data to create a Agent
     *   }
     * })
     * 
     */
    create<T extends AgentCreateArgs>(args: SelectSubset<T, AgentCreateArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Agents.
     * @param {AgentCreateManyArgs} args - Arguments to create many Agents.
     * @example
     * // Create many Agents
     * const agent = await prisma.agent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AgentCreateManyArgs>(args?: SelectSubset<T, AgentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Agents and returns the data saved in the database.
     * @param {AgentCreateManyAndReturnArgs} args - Arguments to create many Agents.
     * @example
     * // Create many Agents
     * const agent = await prisma.agent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Agents and only return the `id`
     * const agentWithIdOnly = await prisma.agent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AgentCreateManyAndReturnArgs>(args?: SelectSubset<T, AgentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Agent.
     * @param {AgentDeleteArgs} args - Arguments to delete one Agent.
     * @example
     * // Delete one Agent
     * const Agent = await prisma.agent.delete({
     *   where: {
     *     // ... filter to delete one Agent
     *   }
     * })
     * 
     */
    delete<T extends AgentDeleteArgs>(args: SelectSubset<T, AgentDeleteArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Agent.
     * @param {AgentUpdateArgs} args - Arguments to update one Agent.
     * @example
     * // Update one Agent
     * const agent = await prisma.agent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AgentUpdateArgs>(args: SelectSubset<T, AgentUpdateArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Agents.
     * @param {AgentDeleteManyArgs} args - Arguments to filter Agents to delete.
     * @example
     * // Delete a few Agents
     * const { count } = await prisma.agent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AgentDeleteManyArgs>(args?: SelectSubset<T, AgentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Agents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Agents
     * const agent = await prisma.agent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AgentUpdateManyArgs>(args: SelectSubset<T, AgentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Agents and returns the data updated in the database.
     * @param {AgentUpdateManyAndReturnArgs} args - Arguments to update many Agents.
     * @example
     * // Update many Agents
     * const agent = await prisma.agent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Agents and only return the `id`
     * const agentWithIdOnly = await prisma.agent.updateManyAndReturn({
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
    updateManyAndReturn<T extends AgentUpdateManyAndReturnArgs>(args: SelectSubset<T, AgentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Agent.
     * @param {AgentUpsertArgs} args - Arguments to update or create a Agent.
     * @example
     * // Update or create a Agent
     * const agent = await prisma.agent.upsert({
     *   create: {
     *     // ... data to create a Agent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Agent we want to update
     *   }
     * })
     */
    upsert<T extends AgentUpsertArgs>(args: SelectSubset<T, AgentUpsertArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Agents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentCountArgs} args - Arguments to filter Agents to count.
     * @example
     * // Count the number of Agents
     * const count = await prisma.agent.count({
     *   where: {
     *     // ... the filter for the Agents we want to count
     *   }
     * })
    **/
    count<T extends AgentCountArgs>(
      args?: Subset<T, AgentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Agent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AgentAggregateArgs>(args: Subset<T, AgentAggregateArgs>): Prisma.PrismaPromise<GetAgentAggregateType<T>>

    /**
     * Group by Agent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgentGroupByArgs} args - Group by arguments.
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
      T extends AgentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AgentGroupByArgs['orderBy'] }
        : { orderBy?: AgentGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AgentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Agent model
   */
  readonly fields: AgentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Agent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AgentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    createdBy<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends Agent$userArgs<ExtArgs> = {}>(args?: Subset<T, Agent$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    team<T extends Agent$teamArgs<ExtArgs> = {}>(args?: Subset<T, Agent$teamArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    conversations<T extends Agent$conversationsArgs<ExtArgs> = {}>(args?: Subset<T, Agent$conversationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Agent model
   */
  interface AgentFieldRefs {
    readonly id: FieldRef<"Agent", 'String'>
    readonly name: FieldRef<"Agent", 'String'>
    readonly description: FieldRef<"Agent", 'String'>
    readonly flowConfig: FieldRef<"Agent", 'String'>
    readonly isActive: FieldRef<"Agent", 'Boolean'>
    readonly ownerType: FieldRef<"Agent", 'String'>
    readonly createdAt: FieldRef<"Agent", 'DateTime'>
    readonly updatedAt: FieldRef<"Agent", 'DateTime'>
    readonly createdById: FieldRef<"Agent", 'String'>
    readonly userId: FieldRef<"Agent", 'String'>
    readonly teamId: FieldRef<"Agent", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Agent findUnique
   */
  export type AgentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agent
     */
    omit?: AgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * Filter, which Agent to fetch.
     */
    where: AgentWhereUniqueInput
  }

  /**
   * Agent findUniqueOrThrow
   */
  export type AgentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agent
     */
    omit?: AgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * Filter, which Agent to fetch.
     */
    where: AgentWhereUniqueInput
  }

  /**
   * Agent findFirst
   */
  export type AgentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agent
     */
    omit?: AgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * Filter, which Agent to fetch.
     */
    where?: AgentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agents to fetch.
     */
    orderBy?: AgentOrderByWithRelationInput | AgentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Agents.
     */
    cursor?: AgentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Agents.
     */
    distinct?: AgentScalarFieldEnum | AgentScalarFieldEnum[]
  }

  /**
   * Agent findFirstOrThrow
   */
  export type AgentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agent
     */
    omit?: AgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * Filter, which Agent to fetch.
     */
    where?: AgentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agents to fetch.
     */
    orderBy?: AgentOrderByWithRelationInput | AgentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Agents.
     */
    cursor?: AgentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Agents.
     */
    distinct?: AgentScalarFieldEnum | AgentScalarFieldEnum[]
  }

  /**
   * Agent findMany
   */
  export type AgentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agent
     */
    omit?: AgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * Filter, which Agents to fetch.
     */
    where?: AgentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agents to fetch.
     */
    orderBy?: AgentOrderByWithRelationInput | AgentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Agents.
     */
    cursor?: AgentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agents.
     */
    skip?: number
    distinct?: AgentScalarFieldEnum | AgentScalarFieldEnum[]
  }

  /**
   * Agent create
   */
  export type AgentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agent
     */
    omit?: AgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * The data needed to create a Agent.
     */
    data: XOR<AgentCreateInput, AgentUncheckedCreateInput>
  }

  /**
   * Agent createMany
   */
  export type AgentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Agents.
     */
    data: AgentCreateManyInput | AgentCreateManyInput[]
  }

  /**
   * Agent createManyAndReturn
   */
  export type AgentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Agent
     */
    omit?: AgentOmit<ExtArgs> | null
    /**
     * The data used to create many Agents.
     */
    data: AgentCreateManyInput | AgentCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Agent update
   */
  export type AgentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agent
     */
    omit?: AgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * The data needed to update a Agent.
     */
    data: XOR<AgentUpdateInput, AgentUncheckedUpdateInput>
    /**
     * Choose, which Agent to update.
     */
    where: AgentWhereUniqueInput
  }

  /**
   * Agent updateMany
   */
  export type AgentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Agents.
     */
    data: XOR<AgentUpdateManyMutationInput, AgentUncheckedUpdateManyInput>
    /**
     * Filter which Agents to update
     */
    where?: AgentWhereInput
    /**
     * Limit how many Agents to update.
     */
    limit?: number
  }

  /**
   * Agent updateManyAndReturn
   */
  export type AgentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Agent
     */
    omit?: AgentOmit<ExtArgs> | null
    /**
     * The data used to update Agents.
     */
    data: XOR<AgentUpdateManyMutationInput, AgentUncheckedUpdateManyInput>
    /**
     * Filter which Agents to update
     */
    where?: AgentWhereInput
    /**
     * Limit how many Agents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Agent upsert
   */
  export type AgentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agent
     */
    omit?: AgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * The filter to search for the Agent to update in case it exists.
     */
    where: AgentWhereUniqueInput
    /**
     * In case the Agent found by the `where` argument doesn't exist, create a new Agent with this data.
     */
    create: XOR<AgentCreateInput, AgentUncheckedCreateInput>
    /**
     * In case the Agent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AgentUpdateInput, AgentUncheckedUpdateInput>
  }

  /**
   * Agent delete
   */
  export type AgentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agent
     */
    omit?: AgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
    /**
     * Filter which Agent to delete.
     */
    where: AgentWhereUniqueInput
  }

  /**
   * Agent deleteMany
   */
  export type AgentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Agents to delete
     */
    where?: AgentWhereInput
    /**
     * Limit how many Agents to delete.
     */
    limit?: number
  }

  /**
   * Agent.user
   */
  export type Agent$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
    where?: UserWhereInput
  }

  /**
   * Agent.team
   */
  export type Agent$teamArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    where?: TeamWhereInput
  }

  /**
   * Agent.conversations
   */
  export type Agent$conversationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Conversation
     */
    omit?: ConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    where?: ConversationWhereInput
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    cursor?: ConversationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ConversationScalarFieldEnum | ConversationScalarFieldEnum[]
  }

  /**
   * Agent without action
   */
  export type AgentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agent
     */
    select?: AgentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agent
     */
    omit?: AgentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgentInclude<ExtArgs> | null
  }


  /**
   * Model TextChunk
   */

  export type AggregateTextChunk = {
    _count: TextChunkCountAggregateOutputType | null
    _avg: TextChunkAvgAggregateOutputType | null
    _sum: TextChunkSumAggregateOutputType | null
    _min: TextChunkMinAggregateOutputType | null
    _max: TextChunkMaxAggregateOutputType | null
  }

  export type TextChunkAvgAggregateOutputType = {
    chunkIndex: number | null
  }

  export type TextChunkSumAggregateOutputType = {
    chunkIndex: number | null
  }

  export type TextChunkMinAggregateOutputType = {
    id: string | null
    fileId: string | null
    content: string | null
    chunkIndex: number | null
    vectorData: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TextChunkMaxAggregateOutputType = {
    id: string | null
    fileId: string | null
    content: string | null
    chunkIndex: number | null
    vectorData: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TextChunkCountAggregateOutputType = {
    id: number
    fileId: number
    content: number
    chunkIndex: number
    metadata: number
    vectorData: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TextChunkAvgAggregateInputType = {
    chunkIndex?: true
  }

  export type TextChunkSumAggregateInputType = {
    chunkIndex?: true
  }

  export type TextChunkMinAggregateInputType = {
    id?: true
    fileId?: true
    content?: true
    chunkIndex?: true
    vectorData?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TextChunkMaxAggregateInputType = {
    id?: true
    fileId?: true
    content?: true
    chunkIndex?: true
    vectorData?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TextChunkCountAggregateInputType = {
    id?: true
    fileId?: true
    content?: true
    chunkIndex?: true
    metadata?: true
    vectorData?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TextChunkAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TextChunk to aggregate.
     */
    where?: TextChunkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TextChunks to fetch.
     */
    orderBy?: TextChunkOrderByWithRelationInput | TextChunkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TextChunkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TextChunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TextChunks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TextChunks
    **/
    _count?: true | TextChunkCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TextChunkAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TextChunkSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TextChunkMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TextChunkMaxAggregateInputType
  }

  export type GetTextChunkAggregateType<T extends TextChunkAggregateArgs> = {
        [P in keyof T & keyof AggregateTextChunk]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTextChunk[P]>
      : GetScalarType<T[P], AggregateTextChunk[P]>
  }




  export type TextChunkGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TextChunkWhereInput
    orderBy?: TextChunkOrderByWithAggregationInput | TextChunkOrderByWithAggregationInput[]
    by: TextChunkScalarFieldEnum[] | TextChunkScalarFieldEnum
    having?: TextChunkScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TextChunkCountAggregateInputType | true
    _avg?: TextChunkAvgAggregateInputType
    _sum?: TextChunkSumAggregateInputType
    _min?: TextChunkMinAggregateInputType
    _max?: TextChunkMaxAggregateInputType
  }

  export type TextChunkGroupByOutputType = {
    id: string
    fileId: string
    content: string
    chunkIndex: number
    metadata: JsonValue | null
    vectorData: string | null
    createdAt: Date
    updatedAt: Date
    _count: TextChunkCountAggregateOutputType | null
    _avg: TextChunkAvgAggregateOutputType | null
    _sum: TextChunkSumAggregateOutputType | null
    _min: TextChunkMinAggregateOutputType | null
    _max: TextChunkMaxAggregateOutputType | null
  }

  type GetTextChunkGroupByPayload<T extends TextChunkGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TextChunkGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TextChunkGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TextChunkGroupByOutputType[P]>
            : GetScalarType<T[P], TextChunkGroupByOutputType[P]>
        }
      >
    >


  export type TextChunkSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fileId?: boolean
    content?: boolean
    chunkIndex?: boolean
    metadata?: boolean
    vectorData?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    file?: boolean | FileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["textChunk"]>

  export type TextChunkSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fileId?: boolean
    content?: boolean
    chunkIndex?: boolean
    metadata?: boolean
    vectorData?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    file?: boolean | FileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["textChunk"]>

  export type TextChunkSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fileId?: boolean
    content?: boolean
    chunkIndex?: boolean
    metadata?: boolean
    vectorData?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    file?: boolean | FileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["textChunk"]>

  export type TextChunkSelectScalar = {
    id?: boolean
    fileId?: boolean
    content?: boolean
    chunkIndex?: boolean
    metadata?: boolean
    vectorData?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TextChunkOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "fileId" | "content" | "chunkIndex" | "metadata" | "vectorData" | "createdAt" | "updatedAt", ExtArgs["result"]["textChunk"]>
  export type TextChunkInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    file?: boolean | FileDefaultArgs<ExtArgs>
  }
  export type TextChunkIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    file?: boolean | FileDefaultArgs<ExtArgs>
  }
  export type TextChunkIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    file?: boolean | FileDefaultArgs<ExtArgs>
  }

  export type $TextChunkPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TextChunk"
    objects: {
      file: Prisma.$FilePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      fileId: string
      content: string
      chunkIndex: number
      metadata: Prisma.JsonValue | null
      vectorData: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["textChunk"]>
    composites: {}
  }

  type TextChunkGetPayload<S extends boolean | null | undefined | TextChunkDefaultArgs> = $Result.GetResult<Prisma.$TextChunkPayload, S>

  type TextChunkCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TextChunkFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TextChunkCountAggregateInputType | true
    }

  export interface TextChunkDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TextChunk'], meta: { name: 'TextChunk' } }
    /**
     * Find zero or one TextChunk that matches the filter.
     * @param {TextChunkFindUniqueArgs} args - Arguments to find a TextChunk
     * @example
     * // Get one TextChunk
     * const textChunk = await prisma.textChunk.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TextChunkFindUniqueArgs>(args: SelectSubset<T, TextChunkFindUniqueArgs<ExtArgs>>): Prisma__TextChunkClient<$Result.GetResult<Prisma.$TextChunkPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TextChunk that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TextChunkFindUniqueOrThrowArgs} args - Arguments to find a TextChunk
     * @example
     * // Get one TextChunk
     * const textChunk = await prisma.textChunk.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TextChunkFindUniqueOrThrowArgs>(args: SelectSubset<T, TextChunkFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TextChunkClient<$Result.GetResult<Prisma.$TextChunkPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TextChunk that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TextChunkFindFirstArgs} args - Arguments to find a TextChunk
     * @example
     * // Get one TextChunk
     * const textChunk = await prisma.textChunk.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TextChunkFindFirstArgs>(args?: SelectSubset<T, TextChunkFindFirstArgs<ExtArgs>>): Prisma__TextChunkClient<$Result.GetResult<Prisma.$TextChunkPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TextChunk that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TextChunkFindFirstOrThrowArgs} args - Arguments to find a TextChunk
     * @example
     * // Get one TextChunk
     * const textChunk = await prisma.textChunk.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TextChunkFindFirstOrThrowArgs>(args?: SelectSubset<T, TextChunkFindFirstOrThrowArgs<ExtArgs>>): Prisma__TextChunkClient<$Result.GetResult<Prisma.$TextChunkPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TextChunks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TextChunkFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TextChunks
     * const textChunks = await prisma.textChunk.findMany()
     * 
     * // Get first 10 TextChunks
     * const textChunks = await prisma.textChunk.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const textChunkWithIdOnly = await prisma.textChunk.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TextChunkFindManyArgs>(args?: SelectSubset<T, TextChunkFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TextChunkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TextChunk.
     * @param {TextChunkCreateArgs} args - Arguments to create a TextChunk.
     * @example
     * // Create one TextChunk
     * const TextChunk = await prisma.textChunk.create({
     *   data: {
     *     // ... data to create a TextChunk
     *   }
     * })
     * 
     */
    create<T extends TextChunkCreateArgs>(args: SelectSubset<T, TextChunkCreateArgs<ExtArgs>>): Prisma__TextChunkClient<$Result.GetResult<Prisma.$TextChunkPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TextChunks.
     * @param {TextChunkCreateManyArgs} args - Arguments to create many TextChunks.
     * @example
     * // Create many TextChunks
     * const textChunk = await prisma.textChunk.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TextChunkCreateManyArgs>(args?: SelectSubset<T, TextChunkCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TextChunks and returns the data saved in the database.
     * @param {TextChunkCreateManyAndReturnArgs} args - Arguments to create many TextChunks.
     * @example
     * // Create many TextChunks
     * const textChunk = await prisma.textChunk.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TextChunks and only return the `id`
     * const textChunkWithIdOnly = await prisma.textChunk.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TextChunkCreateManyAndReturnArgs>(args?: SelectSubset<T, TextChunkCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TextChunkPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TextChunk.
     * @param {TextChunkDeleteArgs} args - Arguments to delete one TextChunk.
     * @example
     * // Delete one TextChunk
     * const TextChunk = await prisma.textChunk.delete({
     *   where: {
     *     // ... filter to delete one TextChunk
     *   }
     * })
     * 
     */
    delete<T extends TextChunkDeleteArgs>(args: SelectSubset<T, TextChunkDeleteArgs<ExtArgs>>): Prisma__TextChunkClient<$Result.GetResult<Prisma.$TextChunkPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TextChunk.
     * @param {TextChunkUpdateArgs} args - Arguments to update one TextChunk.
     * @example
     * // Update one TextChunk
     * const textChunk = await prisma.textChunk.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TextChunkUpdateArgs>(args: SelectSubset<T, TextChunkUpdateArgs<ExtArgs>>): Prisma__TextChunkClient<$Result.GetResult<Prisma.$TextChunkPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TextChunks.
     * @param {TextChunkDeleteManyArgs} args - Arguments to filter TextChunks to delete.
     * @example
     * // Delete a few TextChunks
     * const { count } = await prisma.textChunk.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TextChunkDeleteManyArgs>(args?: SelectSubset<T, TextChunkDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TextChunks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TextChunkUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TextChunks
     * const textChunk = await prisma.textChunk.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TextChunkUpdateManyArgs>(args: SelectSubset<T, TextChunkUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TextChunks and returns the data updated in the database.
     * @param {TextChunkUpdateManyAndReturnArgs} args - Arguments to update many TextChunks.
     * @example
     * // Update many TextChunks
     * const textChunk = await prisma.textChunk.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TextChunks and only return the `id`
     * const textChunkWithIdOnly = await prisma.textChunk.updateManyAndReturn({
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
    updateManyAndReturn<T extends TextChunkUpdateManyAndReturnArgs>(args: SelectSubset<T, TextChunkUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TextChunkPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TextChunk.
     * @param {TextChunkUpsertArgs} args - Arguments to update or create a TextChunk.
     * @example
     * // Update or create a TextChunk
     * const textChunk = await prisma.textChunk.upsert({
     *   create: {
     *     // ... data to create a TextChunk
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TextChunk we want to update
     *   }
     * })
     */
    upsert<T extends TextChunkUpsertArgs>(args: SelectSubset<T, TextChunkUpsertArgs<ExtArgs>>): Prisma__TextChunkClient<$Result.GetResult<Prisma.$TextChunkPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TextChunks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TextChunkCountArgs} args - Arguments to filter TextChunks to count.
     * @example
     * // Count the number of TextChunks
     * const count = await prisma.textChunk.count({
     *   where: {
     *     // ... the filter for the TextChunks we want to count
     *   }
     * })
    **/
    count<T extends TextChunkCountArgs>(
      args?: Subset<T, TextChunkCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TextChunkCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TextChunk.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TextChunkAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TextChunkAggregateArgs>(args: Subset<T, TextChunkAggregateArgs>): Prisma.PrismaPromise<GetTextChunkAggregateType<T>>

    /**
     * Group by TextChunk.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TextChunkGroupByArgs} args - Group by arguments.
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
      T extends TextChunkGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TextChunkGroupByArgs['orderBy'] }
        : { orderBy?: TextChunkGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TextChunkGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTextChunkGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TextChunk model
   */
  readonly fields: TextChunkFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TextChunk.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TextChunkClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    file<T extends FileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FileDefaultArgs<ExtArgs>>): Prisma__FileClient<$Result.GetResult<Prisma.$FilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the TextChunk model
   */
  interface TextChunkFieldRefs {
    readonly id: FieldRef<"TextChunk", 'String'>
    readonly fileId: FieldRef<"TextChunk", 'String'>
    readonly content: FieldRef<"TextChunk", 'String'>
    readonly chunkIndex: FieldRef<"TextChunk", 'Int'>
    readonly metadata: FieldRef<"TextChunk", 'Json'>
    readonly vectorData: FieldRef<"TextChunk", 'String'>
    readonly createdAt: FieldRef<"TextChunk", 'DateTime'>
    readonly updatedAt: FieldRef<"TextChunk", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TextChunk findUnique
   */
  export type TextChunkFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TextChunk
     */
    select?: TextChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TextChunk
     */
    omit?: TextChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TextChunkInclude<ExtArgs> | null
    /**
     * Filter, which TextChunk to fetch.
     */
    where: TextChunkWhereUniqueInput
  }

  /**
   * TextChunk findUniqueOrThrow
   */
  export type TextChunkFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TextChunk
     */
    select?: TextChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TextChunk
     */
    omit?: TextChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TextChunkInclude<ExtArgs> | null
    /**
     * Filter, which TextChunk to fetch.
     */
    where: TextChunkWhereUniqueInput
  }

  /**
   * TextChunk findFirst
   */
  export type TextChunkFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TextChunk
     */
    select?: TextChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TextChunk
     */
    omit?: TextChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TextChunkInclude<ExtArgs> | null
    /**
     * Filter, which TextChunk to fetch.
     */
    where?: TextChunkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TextChunks to fetch.
     */
    orderBy?: TextChunkOrderByWithRelationInput | TextChunkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TextChunks.
     */
    cursor?: TextChunkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TextChunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TextChunks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TextChunks.
     */
    distinct?: TextChunkScalarFieldEnum | TextChunkScalarFieldEnum[]
  }

  /**
   * TextChunk findFirstOrThrow
   */
  export type TextChunkFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TextChunk
     */
    select?: TextChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TextChunk
     */
    omit?: TextChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TextChunkInclude<ExtArgs> | null
    /**
     * Filter, which TextChunk to fetch.
     */
    where?: TextChunkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TextChunks to fetch.
     */
    orderBy?: TextChunkOrderByWithRelationInput | TextChunkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TextChunks.
     */
    cursor?: TextChunkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TextChunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TextChunks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TextChunks.
     */
    distinct?: TextChunkScalarFieldEnum | TextChunkScalarFieldEnum[]
  }

  /**
   * TextChunk findMany
   */
  export type TextChunkFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TextChunk
     */
    select?: TextChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TextChunk
     */
    omit?: TextChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TextChunkInclude<ExtArgs> | null
    /**
     * Filter, which TextChunks to fetch.
     */
    where?: TextChunkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TextChunks to fetch.
     */
    orderBy?: TextChunkOrderByWithRelationInput | TextChunkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TextChunks.
     */
    cursor?: TextChunkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TextChunks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TextChunks.
     */
    skip?: number
    distinct?: TextChunkScalarFieldEnum | TextChunkScalarFieldEnum[]
  }

  /**
   * TextChunk create
   */
  export type TextChunkCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TextChunk
     */
    select?: TextChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TextChunk
     */
    omit?: TextChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TextChunkInclude<ExtArgs> | null
    /**
     * The data needed to create a TextChunk.
     */
    data: XOR<TextChunkCreateInput, TextChunkUncheckedCreateInput>
  }

  /**
   * TextChunk createMany
   */
  export type TextChunkCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TextChunks.
     */
    data: TextChunkCreateManyInput | TextChunkCreateManyInput[]
  }

  /**
   * TextChunk createManyAndReturn
   */
  export type TextChunkCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TextChunk
     */
    select?: TextChunkSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TextChunk
     */
    omit?: TextChunkOmit<ExtArgs> | null
    /**
     * The data used to create many TextChunks.
     */
    data: TextChunkCreateManyInput | TextChunkCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TextChunkIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TextChunk update
   */
  export type TextChunkUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TextChunk
     */
    select?: TextChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TextChunk
     */
    omit?: TextChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TextChunkInclude<ExtArgs> | null
    /**
     * The data needed to update a TextChunk.
     */
    data: XOR<TextChunkUpdateInput, TextChunkUncheckedUpdateInput>
    /**
     * Choose, which TextChunk to update.
     */
    where: TextChunkWhereUniqueInput
  }

  /**
   * TextChunk updateMany
   */
  export type TextChunkUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TextChunks.
     */
    data: XOR<TextChunkUpdateManyMutationInput, TextChunkUncheckedUpdateManyInput>
    /**
     * Filter which TextChunks to update
     */
    where?: TextChunkWhereInput
    /**
     * Limit how many TextChunks to update.
     */
    limit?: number
  }

  /**
   * TextChunk updateManyAndReturn
   */
  export type TextChunkUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TextChunk
     */
    select?: TextChunkSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TextChunk
     */
    omit?: TextChunkOmit<ExtArgs> | null
    /**
     * The data used to update TextChunks.
     */
    data: XOR<TextChunkUpdateManyMutationInput, TextChunkUncheckedUpdateManyInput>
    /**
     * Filter which TextChunks to update
     */
    where?: TextChunkWhereInput
    /**
     * Limit how many TextChunks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TextChunkIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TextChunk upsert
   */
  export type TextChunkUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TextChunk
     */
    select?: TextChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TextChunk
     */
    omit?: TextChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TextChunkInclude<ExtArgs> | null
    /**
     * The filter to search for the TextChunk to update in case it exists.
     */
    where: TextChunkWhereUniqueInput
    /**
     * In case the TextChunk found by the `where` argument doesn't exist, create a new TextChunk with this data.
     */
    create: XOR<TextChunkCreateInput, TextChunkUncheckedCreateInput>
    /**
     * In case the TextChunk was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TextChunkUpdateInput, TextChunkUncheckedUpdateInput>
  }

  /**
   * TextChunk delete
   */
  export type TextChunkDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TextChunk
     */
    select?: TextChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TextChunk
     */
    omit?: TextChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TextChunkInclude<ExtArgs> | null
    /**
     * Filter which TextChunk to delete.
     */
    where: TextChunkWhereUniqueInput
  }

  /**
   * TextChunk deleteMany
   */
  export type TextChunkDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TextChunks to delete
     */
    where?: TextChunkWhereInput
    /**
     * Limit how many TextChunks to delete.
     */
    limit?: number
  }

  /**
   * TextChunk without action
   */
  export type TextChunkDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TextChunk
     */
    select?: TextChunkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TextChunk
     */
    omit?: TextChunkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TextChunkInclude<ExtArgs> | null
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
    name: string | null
    description: string | null
    providerType: string | null
    endpointUrl: string | null
    isActive: boolean | null
    isDefault: boolean | null
    apiKey: string | null
    createdAt: Date | null
    updatedAt: Date | null
    ownerType: string | null
    userOwnerId: string | null
    teamOwnerId: string | null
  }

  export type LLMProviderMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    providerType: string | null
    endpointUrl: string | null
    isActive: boolean | null
    isDefault: boolean | null
    apiKey: string | null
    createdAt: Date | null
    updatedAt: Date | null
    ownerType: string | null
    userOwnerId: string | null
    teamOwnerId: string | null
  }

  export type LLMProviderCountAggregateOutputType = {
    id: number
    name: number
    description: number
    providerType: number
    endpointUrl: number
    isActive: number
    isDefault: number
    apiKey: number
    createdAt: number
    updatedAt: number
    ownerType: number
    config: number
    userOwnerId: number
    teamOwnerId: number
    permissionSettings: number
    _all: number
  }


  export type LLMProviderMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    providerType?: true
    endpointUrl?: true
    isActive?: true
    isDefault?: true
    apiKey?: true
    createdAt?: true
    updatedAt?: true
    ownerType?: true
    userOwnerId?: true
    teamOwnerId?: true
  }

  export type LLMProviderMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    providerType?: true
    endpointUrl?: true
    isActive?: true
    isDefault?: true
    apiKey?: true
    createdAt?: true
    updatedAt?: true
    ownerType?: true
    userOwnerId?: true
    teamOwnerId?: true
  }

  export type LLMProviderCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    providerType?: true
    endpointUrl?: true
    isActive?: true
    isDefault?: true
    apiKey?: true
    createdAt?: true
    updatedAt?: true
    ownerType?: true
    config?: true
    userOwnerId?: true
    teamOwnerId?: true
    permissionSettings?: true
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
    name: string
    description: string | null
    providerType: string
    endpointUrl: string
    isActive: boolean
    isDefault: boolean
    apiKey: string | null
    createdAt: Date
    updatedAt: Date
    ownerType: string
    config: JsonValue | null
    userOwnerId: string | null
    teamOwnerId: string | null
    permissionSettings: JsonValue | null
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
    name?: boolean
    description?: boolean
    providerType?: boolean
    endpointUrl?: boolean
    isActive?: boolean
    isDefault?: boolean
    apiKey?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ownerType?: boolean
    config?: boolean
    userOwnerId?: boolean
    teamOwnerId?: boolean
    permissionSettings?: boolean
    models?: boolean | LLMProvider$modelsArgs<ExtArgs>
    usersWithDefault?: boolean | LLMProvider$usersWithDefaultArgs<ExtArgs>
    userOwner?: boolean | LLMProvider$userOwnerArgs<ExtArgs>
    teamOwner?: boolean | LLMProvider$teamOwnerArgs<ExtArgs>
    _count?: boolean | LLMProviderCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lLMProvider"]>

  export type LLMProviderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    providerType?: boolean
    endpointUrl?: boolean
    isActive?: boolean
    isDefault?: boolean
    apiKey?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ownerType?: boolean
    config?: boolean
    userOwnerId?: boolean
    teamOwnerId?: boolean
    permissionSettings?: boolean
    userOwner?: boolean | LLMProvider$userOwnerArgs<ExtArgs>
    teamOwner?: boolean | LLMProvider$teamOwnerArgs<ExtArgs>
  }, ExtArgs["result"]["lLMProvider"]>

  export type LLMProviderSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    providerType?: boolean
    endpointUrl?: boolean
    isActive?: boolean
    isDefault?: boolean
    apiKey?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ownerType?: boolean
    config?: boolean
    userOwnerId?: boolean
    teamOwnerId?: boolean
    permissionSettings?: boolean
    userOwner?: boolean | LLMProvider$userOwnerArgs<ExtArgs>
    teamOwner?: boolean | LLMProvider$teamOwnerArgs<ExtArgs>
  }, ExtArgs["result"]["lLMProvider"]>

  export type LLMProviderSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    providerType?: boolean
    endpointUrl?: boolean
    isActive?: boolean
    isDefault?: boolean
    apiKey?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ownerType?: boolean
    config?: boolean
    userOwnerId?: boolean
    teamOwnerId?: boolean
    permissionSettings?: boolean
  }

  export type LLMProviderOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "providerType" | "endpointUrl" | "isActive" | "isDefault" | "apiKey" | "createdAt" | "updatedAt" | "ownerType" | "config" | "userOwnerId" | "teamOwnerId" | "permissionSettings", ExtArgs["result"]["lLMProvider"]>
  export type LLMProviderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    models?: boolean | LLMProvider$modelsArgs<ExtArgs>
    usersWithDefault?: boolean | LLMProvider$usersWithDefaultArgs<ExtArgs>
    userOwner?: boolean | LLMProvider$userOwnerArgs<ExtArgs>
    teamOwner?: boolean | LLMProvider$teamOwnerArgs<ExtArgs>
    _count?: boolean | LLMProviderCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type LLMProviderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userOwner?: boolean | LLMProvider$userOwnerArgs<ExtArgs>
    teamOwner?: boolean | LLMProvider$teamOwnerArgs<ExtArgs>
  }
  export type LLMProviderIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userOwner?: boolean | LLMProvider$userOwnerArgs<ExtArgs>
    teamOwner?: boolean | LLMProvider$teamOwnerArgs<ExtArgs>
  }

  export type $LLMProviderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LLMProvider"
    objects: {
      models: Prisma.$LLMModelPayload<ExtArgs>[]
      usersWithDefault: Prisma.$UserPayload<ExtArgs>[]
      userOwner: Prisma.$UserPayload<ExtArgs> | null
      teamOwner: Prisma.$TeamPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      providerType: string
      endpointUrl: string
      isActive: boolean
      isDefault: boolean
      apiKey: string | null
      createdAt: Date
      updatedAt: Date
      ownerType: string
      config: Prisma.JsonValue | null
      userOwnerId: string | null
      teamOwnerId: string | null
      permissionSettings: Prisma.JsonValue | null
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
    models<T extends LLMProvider$modelsArgs<ExtArgs> = {}>(args?: Subset<T, LLMProvider$modelsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LLMModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    usersWithDefault<T extends LLMProvider$usersWithDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LLMProvider$usersWithDefaultArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    userOwner<T extends LLMProvider$userOwnerArgs<ExtArgs> = {}>(args?: Subset<T, LLMProvider$userOwnerArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    teamOwner<T extends LLMProvider$teamOwnerArgs<ExtArgs> = {}>(args?: Subset<T, LLMProvider$teamOwnerArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
    readonly name: FieldRef<"LLMProvider", 'String'>
    readonly description: FieldRef<"LLMProvider", 'String'>
    readonly providerType: FieldRef<"LLMProvider", 'String'>
    readonly endpointUrl: FieldRef<"LLMProvider", 'String'>
    readonly isActive: FieldRef<"LLMProvider", 'Boolean'>
    readonly isDefault: FieldRef<"LLMProvider", 'Boolean'>
    readonly apiKey: FieldRef<"LLMProvider", 'String'>
    readonly createdAt: FieldRef<"LLMProvider", 'DateTime'>
    readonly updatedAt: FieldRef<"LLMProvider", 'DateTime'>
    readonly ownerType: FieldRef<"LLMProvider", 'String'>
    readonly config: FieldRef<"LLMProvider", 'Json'>
    readonly userOwnerId: FieldRef<"LLMProvider", 'String'>
    readonly teamOwnerId: FieldRef<"LLMProvider", 'String'>
    readonly permissionSettings: FieldRef<"LLMProvider", 'Json'>
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
   * LLMProvider.models
   */
  export type LLMProvider$modelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMModel
     */
    select?: LLMModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMModel
     */
    omit?: LLMModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMModelInclude<ExtArgs> | null
    where?: LLMModelWhereInput
    orderBy?: LLMModelOrderByWithRelationInput | LLMModelOrderByWithRelationInput[]
    cursor?: LLMModelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LLMModelScalarFieldEnum | LLMModelScalarFieldEnum[]
  }

  /**
   * LLMProvider.usersWithDefault
   */
  export type LLMProvider$usersWithDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * LLMProvider.userOwner
   */
  export type LLMProvider$userOwnerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
    where?: UserWhereInput
  }

  /**
   * LLMProvider.teamOwner
   */
  export type LLMProvider$teamOwnerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Team
     */
    omit?: TeamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    where?: TeamWhereInput
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
   * Model LLMModel
   */

  export type AggregateLLMModel = {
    _count: LLMModelCountAggregateOutputType | null
    _avg: LLMModelAvgAggregateOutputType | null
    _sum: LLMModelSumAggregateOutputType | null
    _min: LLMModelMinAggregateOutputType | null
    _max: LLMModelMaxAggregateOutputType | null
  }

  export type LLMModelAvgAggregateOutputType = {
    contextWindow: number | null
  }

  export type LLMModelSumAggregateOutputType = {
    contextWindow: number | null
  }

  export type LLMModelMinAggregateOutputType = {
    id: string | null
    name: string | null
    displayName: string | null
    description: string | null
    modelType: string | null
    contextWindow: number | null
    isActive: boolean | null
    isDefault: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    providerId: string | null
  }

  export type LLMModelMaxAggregateOutputType = {
    id: string | null
    name: string | null
    displayName: string | null
    description: string | null
    modelType: string | null
    contextWindow: number | null
    isActive: boolean | null
    isDefault: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    providerId: string | null
  }

  export type LLMModelCountAggregateOutputType = {
    id: number
    name: number
    displayName: number
    description: number
    modelType: number
    contextWindow: number
    isActive: number
    isDefault: number
    createdAt: number
    updatedAt: number
    config: number
    providerId: number
    _all: number
  }


  export type LLMModelAvgAggregateInputType = {
    contextWindow?: true
  }

  export type LLMModelSumAggregateInputType = {
    contextWindow?: true
  }

  export type LLMModelMinAggregateInputType = {
    id?: true
    name?: true
    displayName?: true
    description?: true
    modelType?: true
    contextWindow?: true
    isActive?: true
    isDefault?: true
    createdAt?: true
    updatedAt?: true
    providerId?: true
  }

  export type LLMModelMaxAggregateInputType = {
    id?: true
    name?: true
    displayName?: true
    description?: true
    modelType?: true
    contextWindow?: true
    isActive?: true
    isDefault?: true
    createdAt?: true
    updatedAt?: true
    providerId?: true
  }

  export type LLMModelCountAggregateInputType = {
    id?: true
    name?: true
    displayName?: true
    description?: true
    modelType?: true
    contextWindow?: true
    isActive?: true
    isDefault?: true
    createdAt?: true
    updatedAt?: true
    config?: true
    providerId?: true
    _all?: true
  }

  export type LLMModelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LLMModel to aggregate.
     */
    where?: LLMModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LLMModels to fetch.
     */
    orderBy?: LLMModelOrderByWithRelationInput | LLMModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LLMModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LLMModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LLMModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LLMModels
    **/
    _count?: true | LLMModelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LLMModelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LLMModelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LLMModelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LLMModelMaxAggregateInputType
  }

  export type GetLLMModelAggregateType<T extends LLMModelAggregateArgs> = {
        [P in keyof T & keyof AggregateLLMModel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLLMModel[P]>
      : GetScalarType<T[P], AggregateLLMModel[P]>
  }




  export type LLMModelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LLMModelWhereInput
    orderBy?: LLMModelOrderByWithAggregationInput | LLMModelOrderByWithAggregationInput[]
    by: LLMModelScalarFieldEnum[] | LLMModelScalarFieldEnum
    having?: LLMModelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LLMModelCountAggregateInputType | true
    _avg?: LLMModelAvgAggregateInputType
    _sum?: LLMModelSumAggregateInputType
    _min?: LLMModelMinAggregateInputType
    _max?: LLMModelMaxAggregateInputType
  }

  export type LLMModelGroupByOutputType = {
    id: string
    name: string
    displayName: string | null
    description: string | null
    modelType: string
    contextWindow: number | null
    isActive: boolean
    isDefault: boolean
    createdAt: Date
    updatedAt: Date
    config: JsonValue | null
    providerId: string
    _count: LLMModelCountAggregateOutputType | null
    _avg: LLMModelAvgAggregateOutputType | null
    _sum: LLMModelSumAggregateOutputType | null
    _min: LLMModelMinAggregateOutputType | null
    _max: LLMModelMaxAggregateOutputType | null
  }

  type GetLLMModelGroupByPayload<T extends LLMModelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LLMModelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LLMModelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LLMModelGroupByOutputType[P]>
            : GetScalarType<T[P], LLMModelGroupByOutputType[P]>
        }
      >
    >


  export type LLMModelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    displayName?: boolean
    description?: boolean
    modelType?: boolean
    contextWindow?: boolean
    isActive?: boolean
    isDefault?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    config?: boolean
    providerId?: boolean
    provider?: boolean | LLMProviderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lLMModel"]>

  export type LLMModelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    displayName?: boolean
    description?: boolean
    modelType?: boolean
    contextWindow?: boolean
    isActive?: boolean
    isDefault?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    config?: boolean
    providerId?: boolean
    provider?: boolean | LLMProviderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lLMModel"]>

  export type LLMModelSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    displayName?: boolean
    description?: boolean
    modelType?: boolean
    contextWindow?: boolean
    isActive?: boolean
    isDefault?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    config?: boolean
    providerId?: boolean
    provider?: boolean | LLMProviderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lLMModel"]>

  export type LLMModelSelectScalar = {
    id?: boolean
    name?: boolean
    displayName?: boolean
    description?: boolean
    modelType?: boolean
    contextWindow?: boolean
    isActive?: boolean
    isDefault?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    config?: boolean
    providerId?: boolean
  }

  export type LLMModelOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "displayName" | "description" | "modelType" | "contextWindow" | "isActive" | "isDefault" | "createdAt" | "updatedAt" | "config" | "providerId", ExtArgs["result"]["lLMModel"]>
  export type LLMModelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    provider?: boolean | LLMProviderDefaultArgs<ExtArgs>
  }
  export type LLMModelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    provider?: boolean | LLMProviderDefaultArgs<ExtArgs>
  }
  export type LLMModelIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    provider?: boolean | LLMProviderDefaultArgs<ExtArgs>
  }

  export type $LLMModelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LLMModel"
    objects: {
      provider: Prisma.$LLMProviderPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      displayName: string | null
      description: string | null
      modelType: string
      contextWindow: number | null
      isActive: boolean
      isDefault: boolean
      createdAt: Date
      updatedAt: Date
      config: Prisma.JsonValue | null
      providerId: string
    }, ExtArgs["result"]["lLMModel"]>
    composites: {}
  }

  type LLMModelGetPayload<S extends boolean | null | undefined | LLMModelDefaultArgs> = $Result.GetResult<Prisma.$LLMModelPayload, S>

  type LLMModelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LLMModelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LLMModelCountAggregateInputType | true
    }

  export interface LLMModelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LLMModel'], meta: { name: 'LLMModel' } }
    /**
     * Find zero or one LLMModel that matches the filter.
     * @param {LLMModelFindUniqueArgs} args - Arguments to find a LLMModel
     * @example
     * // Get one LLMModel
     * const lLMModel = await prisma.lLMModel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LLMModelFindUniqueArgs>(args: SelectSubset<T, LLMModelFindUniqueArgs<ExtArgs>>): Prisma__LLMModelClient<$Result.GetResult<Prisma.$LLMModelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LLMModel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LLMModelFindUniqueOrThrowArgs} args - Arguments to find a LLMModel
     * @example
     * // Get one LLMModel
     * const lLMModel = await prisma.lLMModel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LLMModelFindUniqueOrThrowArgs>(args: SelectSubset<T, LLMModelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LLMModelClient<$Result.GetResult<Prisma.$LLMModelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LLMModel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMModelFindFirstArgs} args - Arguments to find a LLMModel
     * @example
     * // Get one LLMModel
     * const lLMModel = await prisma.lLMModel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LLMModelFindFirstArgs>(args?: SelectSubset<T, LLMModelFindFirstArgs<ExtArgs>>): Prisma__LLMModelClient<$Result.GetResult<Prisma.$LLMModelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LLMModel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMModelFindFirstOrThrowArgs} args - Arguments to find a LLMModel
     * @example
     * // Get one LLMModel
     * const lLMModel = await prisma.lLMModel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LLMModelFindFirstOrThrowArgs>(args?: SelectSubset<T, LLMModelFindFirstOrThrowArgs<ExtArgs>>): Prisma__LLMModelClient<$Result.GetResult<Prisma.$LLMModelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LLMModels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMModelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LLMModels
     * const lLMModels = await prisma.lLMModel.findMany()
     * 
     * // Get first 10 LLMModels
     * const lLMModels = await prisma.lLMModel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const lLMModelWithIdOnly = await prisma.lLMModel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LLMModelFindManyArgs>(args?: SelectSubset<T, LLMModelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LLMModelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LLMModel.
     * @param {LLMModelCreateArgs} args - Arguments to create a LLMModel.
     * @example
     * // Create one LLMModel
     * const LLMModel = await prisma.lLMModel.create({
     *   data: {
     *     // ... data to create a LLMModel
     *   }
     * })
     * 
     */
    create<T extends LLMModelCreateArgs>(args: SelectSubset<T, LLMModelCreateArgs<ExtArgs>>): Prisma__LLMModelClient<$Result.GetResult<Prisma.$LLMModelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LLMModels.
     * @param {LLMModelCreateManyArgs} args - Arguments to create many LLMModels.
     * @example
     * // Create many LLMModels
     * const lLMModel = await prisma.lLMModel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LLMModelCreateManyArgs>(args?: SelectSubset<T, LLMModelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LLMModels and returns the data saved in the database.
     * @param {LLMModelCreateManyAndReturnArgs} args - Arguments to create many LLMModels.
     * @example
     * // Create many LLMModels
     * const lLMModel = await prisma.lLMModel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LLMModels and only return the `id`
     * const lLMModelWithIdOnly = await prisma.lLMModel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LLMModelCreateManyAndReturnArgs>(args?: SelectSubset<T, LLMModelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LLMModelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LLMModel.
     * @param {LLMModelDeleteArgs} args - Arguments to delete one LLMModel.
     * @example
     * // Delete one LLMModel
     * const LLMModel = await prisma.lLMModel.delete({
     *   where: {
     *     // ... filter to delete one LLMModel
     *   }
     * })
     * 
     */
    delete<T extends LLMModelDeleteArgs>(args: SelectSubset<T, LLMModelDeleteArgs<ExtArgs>>): Prisma__LLMModelClient<$Result.GetResult<Prisma.$LLMModelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LLMModel.
     * @param {LLMModelUpdateArgs} args - Arguments to update one LLMModel.
     * @example
     * // Update one LLMModel
     * const lLMModel = await prisma.lLMModel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LLMModelUpdateArgs>(args: SelectSubset<T, LLMModelUpdateArgs<ExtArgs>>): Prisma__LLMModelClient<$Result.GetResult<Prisma.$LLMModelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LLMModels.
     * @param {LLMModelDeleteManyArgs} args - Arguments to filter LLMModels to delete.
     * @example
     * // Delete a few LLMModels
     * const { count } = await prisma.lLMModel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LLMModelDeleteManyArgs>(args?: SelectSubset<T, LLMModelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LLMModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMModelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LLMModels
     * const lLMModel = await prisma.lLMModel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LLMModelUpdateManyArgs>(args: SelectSubset<T, LLMModelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LLMModels and returns the data updated in the database.
     * @param {LLMModelUpdateManyAndReturnArgs} args - Arguments to update many LLMModels.
     * @example
     * // Update many LLMModels
     * const lLMModel = await prisma.lLMModel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LLMModels and only return the `id`
     * const lLMModelWithIdOnly = await prisma.lLMModel.updateManyAndReturn({
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
    updateManyAndReturn<T extends LLMModelUpdateManyAndReturnArgs>(args: SelectSubset<T, LLMModelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LLMModelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LLMModel.
     * @param {LLMModelUpsertArgs} args - Arguments to update or create a LLMModel.
     * @example
     * // Update or create a LLMModel
     * const lLMModel = await prisma.lLMModel.upsert({
     *   create: {
     *     // ... data to create a LLMModel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LLMModel we want to update
     *   }
     * })
     */
    upsert<T extends LLMModelUpsertArgs>(args: SelectSubset<T, LLMModelUpsertArgs<ExtArgs>>): Prisma__LLMModelClient<$Result.GetResult<Prisma.$LLMModelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LLMModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMModelCountArgs} args - Arguments to filter LLMModels to count.
     * @example
     * // Count the number of LLMModels
     * const count = await prisma.lLMModel.count({
     *   where: {
     *     // ... the filter for the LLMModels we want to count
     *   }
     * })
    **/
    count<T extends LLMModelCountArgs>(
      args?: Subset<T, LLMModelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LLMModelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LLMModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMModelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends LLMModelAggregateArgs>(args: Subset<T, LLMModelAggregateArgs>): Prisma.PrismaPromise<GetLLMModelAggregateType<T>>

    /**
     * Group by LLMModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LLMModelGroupByArgs} args - Group by arguments.
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
      T extends LLMModelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LLMModelGroupByArgs['orderBy'] }
        : { orderBy?: LLMModelGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, LLMModelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLLMModelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LLMModel model
   */
  readonly fields: LLMModelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LLMModel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LLMModelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    provider<T extends LLMProviderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LLMProviderDefaultArgs<ExtArgs>>): Prisma__LLMProviderClient<$Result.GetResult<Prisma.$LLMProviderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the LLMModel model
   */
  interface LLMModelFieldRefs {
    readonly id: FieldRef<"LLMModel", 'String'>
    readonly name: FieldRef<"LLMModel", 'String'>
    readonly displayName: FieldRef<"LLMModel", 'String'>
    readonly description: FieldRef<"LLMModel", 'String'>
    readonly modelType: FieldRef<"LLMModel", 'String'>
    readonly contextWindow: FieldRef<"LLMModel", 'Int'>
    readonly isActive: FieldRef<"LLMModel", 'Boolean'>
    readonly isDefault: FieldRef<"LLMModel", 'Boolean'>
    readonly createdAt: FieldRef<"LLMModel", 'DateTime'>
    readonly updatedAt: FieldRef<"LLMModel", 'DateTime'>
    readonly config: FieldRef<"LLMModel", 'Json'>
    readonly providerId: FieldRef<"LLMModel", 'String'>
  }
    

  // Custom InputTypes
  /**
   * LLMModel findUnique
   */
  export type LLMModelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMModel
     */
    select?: LLMModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMModel
     */
    omit?: LLMModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMModelInclude<ExtArgs> | null
    /**
     * Filter, which LLMModel to fetch.
     */
    where: LLMModelWhereUniqueInput
  }

  /**
   * LLMModel findUniqueOrThrow
   */
  export type LLMModelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMModel
     */
    select?: LLMModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMModel
     */
    omit?: LLMModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMModelInclude<ExtArgs> | null
    /**
     * Filter, which LLMModel to fetch.
     */
    where: LLMModelWhereUniqueInput
  }

  /**
   * LLMModel findFirst
   */
  export type LLMModelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMModel
     */
    select?: LLMModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMModel
     */
    omit?: LLMModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMModelInclude<ExtArgs> | null
    /**
     * Filter, which LLMModel to fetch.
     */
    where?: LLMModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LLMModels to fetch.
     */
    orderBy?: LLMModelOrderByWithRelationInput | LLMModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LLMModels.
     */
    cursor?: LLMModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LLMModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LLMModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LLMModels.
     */
    distinct?: LLMModelScalarFieldEnum | LLMModelScalarFieldEnum[]
  }

  /**
   * LLMModel findFirstOrThrow
   */
  export type LLMModelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMModel
     */
    select?: LLMModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMModel
     */
    omit?: LLMModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMModelInclude<ExtArgs> | null
    /**
     * Filter, which LLMModel to fetch.
     */
    where?: LLMModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LLMModels to fetch.
     */
    orderBy?: LLMModelOrderByWithRelationInput | LLMModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LLMModels.
     */
    cursor?: LLMModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LLMModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LLMModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LLMModels.
     */
    distinct?: LLMModelScalarFieldEnum | LLMModelScalarFieldEnum[]
  }

  /**
   * LLMModel findMany
   */
  export type LLMModelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMModel
     */
    select?: LLMModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMModel
     */
    omit?: LLMModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMModelInclude<ExtArgs> | null
    /**
     * Filter, which LLMModels to fetch.
     */
    where?: LLMModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LLMModels to fetch.
     */
    orderBy?: LLMModelOrderByWithRelationInput | LLMModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LLMModels.
     */
    cursor?: LLMModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LLMModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LLMModels.
     */
    skip?: number
    distinct?: LLMModelScalarFieldEnum | LLMModelScalarFieldEnum[]
  }

  /**
   * LLMModel create
   */
  export type LLMModelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMModel
     */
    select?: LLMModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMModel
     */
    omit?: LLMModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMModelInclude<ExtArgs> | null
    /**
     * The data needed to create a LLMModel.
     */
    data: XOR<LLMModelCreateInput, LLMModelUncheckedCreateInput>
  }

  /**
   * LLMModel createMany
   */
  export type LLMModelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LLMModels.
     */
    data: LLMModelCreateManyInput | LLMModelCreateManyInput[]
  }

  /**
   * LLMModel createManyAndReturn
   */
  export type LLMModelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMModel
     */
    select?: LLMModelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LLMModel
     */
    omit?: LLMModelOmit<ExtArgs> | null
    /**
     * The data used to create many LLMModels.
     */
    data: LLMModelCreateManyInput | LLMModelCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMModelIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LLMModel update
   */
  export type LLMModelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMModel
     */
    select?: LLMModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMModel
     */
    omit?: LLMModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMModelInclude<ExtArgs> | null
    /**
     * The data needed to update a LLMModel.
     */
    data: XOR<LLMModelUpdateInput, LLMModelUncheckedUpdateInput>
    /**
     * Choose, which LLMModel to update.
     */
    where: LLMModelWhereUniqueInput
  }

  /**
   * LLMModel updateMany
   */
  export type LLMModelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LLMModels.
     */
    data: XOR<LLMModelUpdateManyMutationInput, LLMModelUncheckedUpdateManyInput>
    /**
     * Filter which LLMModels to update
     */
    where?: LLMModelWhereInput
    /**
     * Limit how many LLMModels to update.
     */
    limit?: number
  }

  /**
   * LLMModel updateManyAndReturn
   */
  export type LLMModelUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMModel
     */
    select?: LLMModelSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LLMModel
     */
    omit?: LLMModelOmit<ExtArgs> | null
    /**
     * The data used to update LLMModels.
     */
    data: XOR<LLMModelUpdateManyMutationInput, LLMModelUncheckedUpdateManyInput>
    /**
     * Filter which LLMModels to update
     */
    where?: LLMModelWhereInput
    /**
     * Limit how many LLMModels to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMModelIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * LLMModel upsert
   */
  export type LLMModelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMModel
     */
    select?: LLMModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMModel
     */
    omit?: LLMModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMModelInclude<ExtArgs> | null
    /**
     * The filter to search for the LLMModel to update in case it exists.
     */
    where: LLMModelWhereUniqueInput
    /**
     * In case the LLMModel found by the `where` argument doesn't exist, create a new LLMModel with this data.
     */
    create: XOR<LLMModelCreateInput, LLMModelUncheckedCreateInput>
    /**
     * In case the LLMModel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LLMModelUpdateInput, LLMModelUncheckedUpdateInput>
  }

  /**
   * LLMModel delete
   */
  export type LLMModelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMModel
     */
    select?: LLMModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMModel
     */
    omit?: LLMModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMModelInclude<ExtArgs> | null
    /**
     * Filter which LLMModel to delete.
     */
    where: LLMModelWhereUniqueInput
  }

  /**
   * LLMModel deleteMany
   */
  export type LLMModelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LLMModels to delete
     */
    where?: LLMModelWhereInput
    /**
     * Limit how many LLMModels to delete.
     */
    limit?: number
  }

  /**
   * LLMModel without action
   */
  export type LLMModelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LLMModel
     */
    select?: LLMModelSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LLMModel
     */
    omit?: LLMModelOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LLMModelInclude<ExtArgs> | null
  }


  /**
   * Model Conversation
   */

  export type AggregateConversation = {
    _count: ConversationCountAggregateOutputType | null
    _min: ConversationMinAggregateOutputType | null
    _max: ConversationMaxAggregateOutputType | null
  }

  export type ConversationMinAggregateOutputType = {
    id: string | null
    title: string | null
    agentId: string | null
    flowState: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
    lastMessageAt: Date | null
  }

  export type ConversationMaxAggregateOutputType = {
    id: string | null
    title: string | null
    agentId: string | null
    flowState: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
    lastMessageAt: Date | null
  }

  export type ConversationCountAggregateOutputType = {
    id: number
    title: number
    agentId: number
    flowState: number
    status: number
    createdAt: number
    updatedAt: number
    lastMessageAt: number
    _all: number
  }


  export type ConversationMinAggregateInputType = {
    id?: true
    title?: true
    agentId?: true
    flowState?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    lastMessageAt?: true
  }

  export type ConversationMaxAggregateInputType = {
    id?: true
    title?: true
    agentId?: true
    flowState?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    lastMessageAt?: true
  }

  export type ConversationCountAggregateInputType = {
    id?: true
    title?: true
    agentId?: true
    flowState?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    lastMessageAt?: true
    _all?: true
  }

  export type ConversationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Conversation to aggregate.
     */
    where?: ConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conversations to fetch.
     */
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Conversations
    **/
    _count?: true | ConversationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConversationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConversationMaxAggregateInputType
  }

  export type GetConversationAggregateType<T extends ConversationAggregateArgs> = {
        [P in keyof T & keyof AggregateConversation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConversation[P]>
      : GetScalarType<T[P], AggregateConversation[P]>
  }




  export type ConversationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConversationWhereInput
    orderBy?: ConversationOrderByWithAggregationInput | ConversationOrderByWithAggregationInput[]
    by: ConversationScalarFieldEnum[] | ConversationScalarFieldEnum
    having?: ConversationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConversationCountAggregateInputType | true
    _min?: ConversationMinAggregateInputType
    _max?: ConversationMaxAggregateInputType
  }

  export type ConversationGroupByOutputType = {
    id: string
    title: string | null
    agentId: string
    flowState: string
    status: string
    createdAt: Date
    updatedAt: Date
    lastMessageAt: Date
    _count: ConversationCountAggregateOutputType | null
    _min: ConversationMinAggregateOutputType | null
    _max: ConversationMaxAggregateOutputType | null
  }

  type GetConversationGroupByPayload<T extends ConversationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConversationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConversationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConversationGroupByOutputType[P]>
            : GetScalarType<T[P], ConversationGroupByOutputType[P]>
        }
      >
    >


  export type ConversationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    agentId?: boolean
    flowState?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastMessageAt?: boolean
    agent?: boolean | AgentDefaultArgs<ExtArgs>
    messages?: boolean | Conversation$messagesArgs<ExtArgs>
    _count?: boolean | ConversationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conversation"]>

  export type ConversationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    agentId?: boolean
    flowState?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastMessageAt?: boolean
    agent?: boolean | AgentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conversation"]>

  export type ConversationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    agentId?: boolean
    flowState?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastMessageAt?: boolean
    agent?: boolean | AgentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conversation"]>

  export type ConversationSelectScalar = {
    id?: boolean
    title?: boolean
    agentId?: boolean
    flowState?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastMessageAt?: boolean
  }

  export type ConversationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "agentId" | "flowState" | "status" | "createdAt" | "updatedAt" | "lastMessageAt", ExtArgs["result"]["conversation"]>
  export type ConversationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agent?: boolean | AgentDefaultArgs<ExtArgs>
    messages?: boolean | Conversation$messagesArgs<ExtArgs>
    _count?: boolean | ConversationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ConversationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agent?: boolean | AgentDefaultArgs<ExtArgs>
  }
  export type ConversationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agent?: boolean | AgentDefaultArgs<ExtArgs>
  }

  export type $ConversationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Conversation"
    objects: {
      agent: Prisma.$AgentPayload<ExtArgs>
      messages: Prisma.$ConversationMessagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string | null
      agentId: string
      flowState: string
      status: string
      createdAt: Date
      updatedAt: Date
      lastMessageAt: Date
    }, ExtArgs["result"]["conversation"]>
    composites: {}
  }

  type ConversationGetPayload<S extends boolean | null | undefined | ConversationDefaultArgs> = $Result.GetResult<Prisma.$ConversationPayload, S>

  type ConversationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ConversationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConversationCountAggregateInputType | true
    }

  export interface ConversationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Conversation'], meta: { name: 'Conversation' } }
    /**
     * Find zero or one Conversation that matches the filter.
     * @param {ConversationFindUniqueArgs} args - Arguments to find a Conversation
     * @example
     * // Get one Conversation
     * const conversation = await prisma.conversation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConversationFindUniqueArgs>(args: SelectSubset<T, ConversationFindUniqueArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Conversation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ConversationFindUniqueOrThrowArgs} args - Arguments to find a Conversation
     * @example
     * // Get one Conversation
     * const conversation = await prisma.conversation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConversationFindUniqueOrThrowArgs>(args: SelectSubset<T, ConversationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Conversation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationFindFirstArgs} args - Arguments to find a Conversation
     * @example
     * // Get one Conversation
     * const conversation = await prisma.conversation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConversationFindFirstArgs>(args?: SelectSubset<T, ConversationFindFirstArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Conversation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationFindFirstOrThrowArgs} args - Arguments to find a Conversation
     * @example
     * // Get one Conversation
     * const conversation = await prisma.conversation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConversationFindFirstOrThrowArgs>(args?: SelectSubset<T, ConversationFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Conversations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Conversations
     * const conversations = await prisma.conversation.findMany()
     * 
     * // Get first 10 Conversations
     * const conversations = await prisma.conversation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const conversationWithIdOnly = await prisma.conversation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConversationFindManyArgs>(args?: SelectSubset<T, ConversationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Conversation.
     * @param {ConversationCreateArgs} args - Arguments to create a Conversation.
     * @example
     * // Create one Conversation
     * const Conversation = await prisma.conversation.create({
     *   data: {
     *     // ... data to create a Conversation
     *   }
     * })
     * 
     */
    create<T extends ConversationCreateArgs>(args: SelectSubset<T, ConversationCreateArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Conversations.
     * @param {ConversationCreateManyArgs} args - Arguments to create many Conversations.
     * @example
     * // Create many Conversations
     * const conversation = await prisma.conversation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConversationCreateManyArgs>(args?: SelectSubset<T, ConversationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Conversations and returns the data saved in the database.
     * @param {ConversationCreateManyAndReturnArgs} args - Arguments to create many Conversations.
     * @example
     * // Create many Conversations
     * const conversation = await prisma.conversation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Conversations and only return the `id`
     * const conversationWithIdOnly = await prisma.conversation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConversationCreateManyAndReturnArgs>(args?: SelectSubset<T, ConversationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Conversation.
     * @param {ConversationDeleteArgs} args - Arguments to delete one Conversation.
     * @example
     * // Delete one Conversation
     * const Conversation = await prisma.conversation.delete({
     *   where: {
     *     // ... filter to delete one Conversation
     *   }
     * })
     * 
     */
    delete<T extends ConversationDeleteArgs>(args: SelectSubset<T, ConversationDeleteArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Conversation.
     * @param {ConversationUpdateArgs} args - Arguments to update one Conversation.
     * @example
     * // Update one Conversation
     * const conversation = await prisma.conversation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConversationUpdateArgs>(args: SelectSubset<T, ConversationUpdateArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Conversations.
     * @param {ConversationDeleteManyArgs} args - Arguments to filter Conversations to delete.
     * @example
     * // Delete a few Conversations
     * const { count } = await prisma.conversation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConversationDeleteManyArgs>(args?: SelectSubset<T, ConversationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Conversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Conversations
     * const conversation = await prisma.conversation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConversationUpdateManyArgs>(args: SelectSubset<T, ConversationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Conversations and returns the data updated in the database.
     * @param {ConversationUpdateManyAndReturnArgs} args - Arguments to update many Conversations.
     * @example
     * // Update many Conversations
     * const conversation = await prisma.conversation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Conversations and only return the `id`
     * const conversationWithIdOnly = await prisma.conversation.updateManyAndReturn({
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
    updateManyAndReturn<T extends ConversationUpdateManyAndReturnArgs>(args: SelectSubset<T, ConversationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Conversation.
     * @param {ConversationUpsertArgs} args - Arguments to update or create a Conversation.
     * @example
     * // Update or create a Conversation
     * const conversation = await prisma.conversation.upsert({
     *   create: {
     *     // ... data to create a Conversation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Conversation we want to update
     *   }
     * })
     */
    upsert<T extends ConversationUpsertArgs>(args: SelectSubset<T, ConversationUpsertArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Conversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationCountArgs} args - Arguments to filter Conversations to count.
     * @example
     * // Count the number of Conversations
     * const count = await prisma.conversation.count({
     *   where: {
     *     // ... the filter for the Conversations we want to count
     *   }
     * })
    **/
    count<T extends ConversationCountArgs>(
      args?: Subset<T, ConversationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConversationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Conversation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ConversationAggregateArgs>(args: Subset<T, ConversationAggregateArgs>): Prisma.PrismaPromise<GetConversationAggregateType<T>>

    /**
     * Group by Conversation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationGroupByArgs} args - Group by arguments.
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
      T extends ConversationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConversationGroupByArgs['orderBy'] }
        : { orderBy?: ConversationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ConversationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConversationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Conversation model
   */
  readonly fields: ConversationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Conversation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConversationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    agent<T extends AgentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AgentDefaultArgs<ExtArgs>>): Prisma__AgentClient<$Result.GetResult<Prisma.$AgentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    messages<T extends Conversation$messagesArgs<ExtArgs> = {}>(args?: Subset<T, Conversation$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Conversation model
   */
  interface ConversationFieldRefs {
    readonly id: FieldRef<"Conversation", 'String'>
    readonly title: FieldRef<"Conversation", 'String'>
    readonly agentId: FieldRef<"Conversation", 'String'>
    readonly flowState: FieldRef<"Conversation", 'String'>
    readonly status: FieldRef<"Conversation", 'String'>
    readonly createdAt: FieldRef<"Conversation", 'DateTime'>
    readonly updatedAt: FieldRef<"Conversation", 'DateTime'>
    readonly lastMessageAt: FieldRef<"Conversation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Conversation findUnique
   */
  export type ConversationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Conversation
     */
    omit?: ConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter, which Conversation to fetch.
     */
    where: ConversationWhereUniqueInput
  }

  /**
   * Conversation findUniqueOrThrow
   */
  export type ConversationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Conversation
     */
    omit?: ConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter, which Conversation to fetch.
     */
    where: ConversationWhereUniqueInput
  }

  /**
   * Conversation findFirst
   */
  export type ConversationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Conversation
     */
    omit?: ConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter, which Conversation to fetch.
     */
    where?: ConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conversations to fetch.
     */
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Conversations.
     */
    cursor?: ConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Conversations.
     */
    distinct?: ConversationScalarFieldEnum | ConversationScalarFieldEnum[]
  }

  /**
   * Conversation findFirstOrThrow
   */
  export type ConversationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Conversation
     */
    omit?: ConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter, which Conversation to fetch.
     */
    where?: ConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conversations to fetch.
     */
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Conversations.
     */
    cursor?: ConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Conversations.
     */
    distinct?: ConversationScalarFieldEnum | ConversationScalarFieldEnum[]
  }

  /**
   * Conversation findMany
   */
  export type ConversationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Conversation
     */
    omit?: ConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter, which Conversations to fetch.
     */
    where?: ConversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conversations to fetch.
     */
    orderBy?: ConversationOrderByWithRelationInput | ConversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Conversations.
     */
    cursor?: ConversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conversations.
     */
    skip?: number
    distinct?: ConversationScalarFieldEnum | ConversationScalarFieldEnum[]
  }

  /**
   * Conversation create
   */
  export type ConversationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Conversation
     */
    omit?: ConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * The data needed to create a Conversation.
     */
    data: XOR<ConversationCreateInput, ConversationUncheckedCreateInput>
  }

  /**
   * Conversation createMany
   */
  export type ConversationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Conversations.
     */
    data: ConversationCreateManyInput | ConversationCreateManyInput[]
  }

  /**
   * Conversation createManyAndReturn
   */
  export type ConversationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Conversation
     */
    omit?: ConversationOmit<ExtArgs> | null
    /**
     * The data used to create many Conversations.
     */
    data: ConversationCreateManyInput | ConversationCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Conversation update
   */
  export type ConversationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Conversation
     */
    omit?: ConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * The data needed to update a Conversation.
     */
    data: XOR<ConversationUpdateInput, ConversationUncheckedUpdateInput>
    /**
     * Choose, which Conversation to update.
     */
    where: ConversationWhereUniqueInput
  }

  /**
   * Conversation updateMany
   */
  export type ConversationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Conversations.
     */
    data: XOR<ConversationUpdateManyMutationInput, ConversationUncheckedUpdateManyInput>
    /**
     * Filter which Conversations to update
     */
    where?: ConversationWhereInput
    /**
     * Limit how many Conversations to update.
     */
    limit?: number
  }

  /**
   * Conversation updateManyAndReturn
   */
  export type ConversationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Conversation
     */
    omit?: ConversationOmit<ExtArgs> | null
    /**
     * The data used to update Conversations.
     */
    data: XOR<ConversationUpdateManyMutationInput, ConversationUncheckedUpdateManyInput>
    /**
     * Filter which Conversations to update
     */
    where?: ConversationWhereInput
    /**
     * Limit how many Conversations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Conversation upsert
   */
  export type ConversationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Conversation
     */
    omit?: ConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * The filter to search for the Conversation to update in case it exists.
     */
    where: ConversationWhereUniqueInput
    /**
     * In case the Conversation found by the `where` argument doesn't exist, create a new Conversation with this data.
     */
    create: XOR<ConversationCreateInput, ConversationUncheckedCreateInput>
    /**
     * In case the Conversation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConversationUpdateInput, ConversationUncheckedUpdateInput>
  }

  /**
   * Conversation delete
   */
  export type ConversationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Conversation
     */
    omit?: ConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
    /**
     * Filter which Conversation to delete.
     */
    where: ConversationWhereUniqueInput
  }

  /**
   * Conversation deleteMany
   */
  export type ConversationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Conversations to delete
     */
    where?: ConversationWhereInput
    /**
     * Limit how many Conversations to delete.
     */
    limit?: number
  }

  /**
   * Conversation.messages
   */
  export type Conversation$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationMessageInclude<ExtArgs> | null
    where?: ConversationMessageWhereInput
    orderBy?: ConversationMessageOrderByWithRelationInput | ConversationMessageOrderByWithRelationInput[]
    cursor?: ConversationMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ConversationMessageScalarFieldEnum | ConversationMessageScalarFieldEnum[]
  }

  /**
   * Conversation without action
   */
  export type ConversationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conversation
     */
    select?: ConversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Conversation
     */
    omit?: ConversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationInclude<ExtArgs> | null
  }


  /**
   * Model ConversationMessage
   */

  export type AggregateConversationMessage = {
    _count: ConversationMessageCountAggregateOutputType | null
    _min: ConversationMessageMinAggregateOutputType | null
    _max: ConversationMessageMaxAggregateOutputType | null
  }

  export type ConversationMessageMinAggregateOutputType = {
    id: string | null
    conversationId: string | null
    content: string | null
    role: string | null
    timestamp: Date | null
    nodeId: string | null
    nodeType: string | null
  }

  export type ConversationMessageMaxAggregateOutputType = {
    id: string | null
    conversationId: string | null
    content: string | null
    role: string | null
    timestamp: Date | null
    nodeId: string | null
    nodeType: string | null
  }

  export type ConversationMessageCountAggregateOutputType = {
    id: number
    conversationId: number
    content: number
    role: number
    timestamp: number
    metadata: number
    nodeId: number
    nodeType: number
    _all: number
  }


  export type ConversationMessageMinAggregateInputType = {
    id?: true
    conversationId?: true
    content?: true
    role?: true
    timestamp?: true
    nodeId?: true
    nodeType?: true
  }

  export type ConversationMessageMaxAggregateInputType = {
    id?: true
    conversationId?: true
    content?: true
    role?: true
    timestamp?: true
    nodeId?: true
    nodeType?: true
  }

  export type ConversationMessageCountAggregateInputType = {
    id?: true
    conversationId?: true
    content?: true
    role?: true
    timestamp?: true
    metadata?: true
    nodeId?: true
    nodeType?: true
    _all?: true
  }

  export type ConversationMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConversationMessage to aggregate.
     */
    where?: ConversationMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConversationMessages to fetch.
     */
    orderBy?: ConversationMessageOrderByWithRelationInput | ConversationMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConversationMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConversationMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConversationMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ConversationMessages
    **/
    _count?: true | ConversationMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConversationMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConversationMessageMaxAggregateInputType
  }

  export type GetConversationMessageAggregateType<T extends ConversationMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateConversationMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConversationMessage[P]>
      : GetScalarType<T[P], AggregateConversationMessage[P]>
  }




  export type ConversationMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConversationMessageWhereInput
    orderBy?: ConversationMessageOrderByWithAggregationInput | ConversationMessageOrderByWithAggregationInput[]
    by: ConversationMessageScalarFieldEnum[] | ConversationMessageScalarFieldEnum
    having?: ConversationMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConversationMessageCountAggregateInputType | true
    _min?: ConversationMessageMinAggregateInputType
    _max?: ConversationMessageMaxAggregateInputType
  }

  export type ConversationMessageGroupByOutputType = {
    id: string
    conversationId: string
    content: string
    role: string
    timestamp: Date
    metadata: JsonValue | null
    nodeId: string | null
    nodeType: string | null
    _count: ConversationMessageCountAggregateOutputType | null
    _min: ConversationMessageMinAggregateOutputType | null
    _max: ConversationMessageMaxAggregateOutputType | null
  }

  type GetConversationMessageGroupByPayload<T extends ConversationMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConversationMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConversationMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConversationMessageGroupByOutputType[P]>
            : GetScalarType<T[P], ConversationMessageGroupByOutputType[P]>
        }
      >
    >


  export type ConversationMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    conversationId?: boolean
    content?: boolean
    role?: boolean
    timestamp?: boolean
    metadata?: boolean
    nodeId?: boolean
    nodeType?: boolean
    conversation?: boolean | ConversationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conversationMessage"]>

  export type ConversationMessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    conversationId?: boolean
    content?: boolean
    role?: boolean
    timestamp?: boolean
    metadata?: boolean
    nodeId?: boolean
    nodeType?: boolean
    conversation?: boolean | ConversationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conversationMessage"]>

  export type ConversationMessageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    conversationId?: boolean
    content?: boolean
    role?: boolean
    timestamp?: boolean
    metadata?: boolean
    nodeId?: boolean
    nodeType?: boolean
    conversation?: boolean | ConversationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conversationMessage"]>

  export type ConversationMessageSelectScalar = {
    id?: boolean
    conversationId?: boolean
    content?: boolean
    role?: boolean
    timestamp?: boolean
    metadata?: boolean
    nodeId?: boolean
    nodeType?: boolean
  }

  export type ConversationMessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "conversationId" | "content" | "role" | "timestamp" | "metadata" | "nodeId" | "nodeType", ExtArgs["result"]["conversationMessage"]>
  export type ConversationMessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversation?: boolean | ConversationDefaultArgs<ExtArgs>
  }
  export type ConversationMessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversation?: boolean | ConversationDefaultArgs<ExtArgs>
  }
  export type ConversationMessageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversation?: boolean | ConversationDefaultArgs<ExtArgs>
  }

  export type $ConversationMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ConversationMessage"
    objects: {
      conversation: Prisma.$ConversationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      conversationId: string
      content: string
      role: string
      timestamp: Date
      metadata: Prisma.JsonValue | null
      nodeId: string | null
      nodeType: string | null
    }, ExtArgs["result"]["conversationMessage"]>
    composites: {}
  }

  type ConversationMessageGetPayload<S extends boolean | null | undefined | ConversationMessageDefaultArgs> = $Result.GetResult<Prisma.$ConversationMessagePayload, S>

  type ConversationMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ConversationMessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConversationMessageCountAggregateInputType | true
    }

  export interface ConversationMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ConversationMessage'], meta: { name: 'ConversationMessage' } }
    /**
     * Find zero or one ConversationMessage that matches the filter.
     * @param {ConversationMessageFindUniqueArgs} args - Arguments to find a ConversationMessage
     * @example
     * // Get one ConversationMessage
     * const conversationMessage = await prisma.conversationMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConversationMessageFindUniqueArgs>(args: SelectSubset<T, ConversationMessageFindUniqueArgs<ExtArgs>>): Prisma__ConversationMessageClient<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ConversationMessage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ConversationMessageFindUniqueOrThrowArgs} args - Arguments to find a ConversationMessage
     * @example
     * // Get one ConversationMessage
     * const conversationMessage = await prisma.conversationMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConversationMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, ConversationMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConversationMessageClient<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConversationMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationMessageFindFirstArgs} args - Arguments to find a ConversationMessage
     * @example
     * // Get one ConversationMessage
     * const conversationMessage = await prisma.conversationMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConversationMessageFindFirstArgs>(args?: SelectSubset<T, ConversationMessageFindFirstArgs<ExtArgs>>): Prisma__ConversationMessageClient<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConversationMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationMessageFindFirstOrThrowArgs} args - Arguments to find a ConversationMessage
     * @example
     * // Get one ConversationMessage
     * const conversationMessage = await prisma.conversationMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConversationMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, ConversationMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConversationMessageClient<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ConversationMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ConversationMessages
     * const conversationMessages = await prisma.conversationMessage.findMany()
     * 
     * // Get first 10 ConversationMessages
     * const conversationMessages = await prisma.conversationMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const conversationMessageWithIdOnly = await prisma.conversationMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConversationMessageFindManyArgs>(args?: SelectSubset<T, ConversationMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ConversationMessage.
     * @param {ConversationMessageCreateArgs} args - Arguments to create a ConversationMessage.
     * @example
     * // Create one ConversationMessage
     * const ConversationMessage = await prisma.conversationMessage.create({
     *   data: {
     *     // ... data to create a ConversationMessage
     *   }
     * })
     * 
     */
    create<T extends ConversationMessageCreateArgs>(args: SelectSubset<T, ConversationMessageCreateArgs<ExtArgs>>): Prisma__ConversationMessageClient<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ConversationMessages.
     * @param {ConversationMessageCreateManyArgs} args - Arguments to create many ConversationMessages.
     * @example
     * // Create many ConversationMessages
     * const conversationMessage = await prisma.conversationMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConversationMessageCreateManyArgs>(args?: SelectSubset<T, ConversationMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ConversationMessages and returns the data saved in the database.
     * @param {ConversationMessageCreateManyAndReturnArgs} args - Arguments to create many ConversationMessages.
     * @example
     * // Create many ConversationMessages
     * const conversationMessage = await prisma.conversationMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ConversationMessages and only return the `id`
     * const conversationMessageWithIdOnly = await prisma.conversationMessage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConversationMessageCreateManyAndReturnArgs>(args?: SelectSubset<T, ConversationMessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ConversationMessage.
     * @param {ConversationMessageDeleteArgs} args - Arguments to delete one ConversationMessage.
     * @example
     * // Delete one ConversationMessage
     * const ConversationMessage = await prisma.conversationMessage.delete({
     *   where: {
     *     // ... filter to delete one ConversationMessage
     *   }
     * })
     * 
     */
    delete<T extends ConversationMessageDeleteArgs>(args: SelectSubset<T, ConversationMessageDeleteArgs<ExtArgs>>): Prisma__ConversationMessageClient<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ConversationMessage.
     * @param {ConversationMessageUpdateArgs} args - Arguments to update one ConversationMessage.
     * @example
     * // Update one ConversationMessage
     * const conversationMessage = await prisma.conversationMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConversationMessageUpdateArgs>(args: SelectSubset<T, ConversationMessageUpdateArgs<ExtArgs>>): Prisma__ConversationMessageClient<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ConversationMessages.
     * @param {ConversationMessageDeleteManyArgs} args - Arguments to filter ConversationMessages to delete.
     * @example
     * // Delete a few ConversationMessages
     * const { count } = await prisma.conversationMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConversationMessageDeleteManyArgs>(args?: SelectSubset<T, ConversationMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConversationMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ConversationMessages
     * const conversationMessage = await prisma.conversationMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConversationMessageUpdateManyArgs>(args: SelectSubset<T, ConversationMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConversationMessages and returns the data updated in the database.
     * @param {ConversationMessageUpdateManyAndReturnArgs} args - Arguments to update many ConversationMessages.
     * @example
     * // Update many ConversationMessages
     * const conversationMessage = await prisma.conversationMessage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ConversationMessages and only return the `id`
     * const conversationMessageWithIdOnly = await prisma.conversationMessage.updateManyAndReturn({
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
    updateManyAndReturn<T extends ConversationMessageUpdateManyAndReturnArgs>(args: SelectSubset<T, ConversationMessageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ConversationMessage.
     * @param {ConversationMessageUpsertArgs} args - Arguments to update or create a ConversationMessage.
     * @example
     * // Update or create a ConversationMessage
     * const conversationMessage = await prisma.conversationMessage.upsert({
     *   create: {
     *     // ... data to create a ConversationMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ConversationMessage we want to update
     *   }
     * })
     */
    upsert<T extends ConversationMessageUpsertArgs>(args: SelectSubset<T, ConversationMessageUpsertArgs<ExtArgs>>): Prisma__ConversationMessageClient<$Result.GetResult<Prisma.$ConversationMessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ConversationMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationMessageCountArgs} args - Arguments to filter ConversationMessages to count.
     * @example
     * // Count the number of ConversationMessages
     * const count = await prisma.conversationMessage.count({
     *   where: {
     *     // ... the filter for the ConversationMessages we want to count
     *   }
     * })
    **/
    count<T extends ConversationMessageCountArgs>(
      args?: Subset<T, ConversationMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConversationMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ConversationMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ConversationMessageAggregateArgs>(args: Subset<T, ConversationMessageAggregateArgs>): Prisma.PrismaPromise<GetConversationMessageAggregateType<T>>

    /**
     * Group by ConversationMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationMessageGroupByArgs} args - Group by arguments.
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
      T extends ConversationMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConversationMessageGroupByArgs['orderBy'] }
        : { orderBy?: ConversationMessageGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ConversationMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConversationMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ConversationMessage model
   */
  readonly fields: ConversationMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ConversationMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConversationMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    conversation<T extends ConversationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ConversationDefaultArgs<ExtArgs>>): Prisma__ConversationClient<$Result.GetResult<Prisma.$ConversationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the ConversationMessage model
   */
  interface ConversationMessageFieldRefs {
    readonly id: FieldRef<"ConversationMessage", 'String'>
    readonly conversationId: FieldRef<"ConversationMessage", 'String'>
    readonly content: FieldRef<"ConversationMessage", 'String'>
    readonly role: FieldRef<"ConversationMessage", 'String'>
    readonly timestamp: FieldRef<"ConversationMessage", 'DateTime'>
    readonly metadata: FieldRef<"ConversationMessage", 'Json'>
    readonly nodeId: FieldRef<"ConversationMessage", 'String'>
    readonly nodeType: FieldRef<"ConversationMessage", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ConversationMessage findUnique
   */
  export type ConversationMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationMessageInclude<ExtArgs> | null
    /**
     * Filter, which ConversationMessage to fetch.
     */
    where: ConversationMessageWhereUniqueInput
  }

  /**
   * ConversationMessage findUniqueOrThrow
   */
  export type ConversationMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationMessageInclude<ExtArgs> | null
    /**
     * Filter, which ConversationMessage to fetch.
     */
    where: ConversationMessageWhereUniqueInput
  }

  /**
   * ConversationMessage findFirst
   */
  export type ConversationMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationMessageInclude<ExtArgs> | null
    /**
     * Filter, which ConversationMessage to fetch.
     */
    where?: ConversationMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConversationMessages to fetch.
     */
    orderBy?: ConversationMessageOrderByWithRelationInput | ConversationMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConversationMessages.
     */
    cursor?: ConversationMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConversationMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConversationMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConversationMessages.
     */
    distinct?: ConversationMessageScalarFieldEnum | ConversationMessageScalarFieldEnum[]
  }

  /**
   * ConversationMessage findFirstOrThrow
   */
  export type ConversationMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationMessageInclude<ExtArgs> | null
    /**
     * Filter, which ConversationMessage to fetch.
     */
    where?: ConversationMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConversationMessages to fetch.
     */
    orderBy?: ConversationMessageOrderByWithRelationInput | ConversationMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConversationMessages.
     */
    cursor?: ConversationMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConversationMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConversationMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConversationMessages.
     */
    distinct?: ConversationMessageScalarFieldEnum | ConversationMessageScalarFieldEnum[]
  }

  /**
   * ConversationMessage findMany
   */
  export type ConversationMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationMessageInclude<ExtArgs> | null
    /**
     * Filter, which ConversationMessages to fetch.
     */
    where?: ConversationMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConversationMessages to fetch.
     */
    orderBy?: ConversationMessageOrderByWithRelationInput | ConversationMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ConversationMessages.
     */
    cursor?: ConversationMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConversationMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConversationMessages.
     */
    skip?: number
    distinct?: ConversationMessageScalarFieldEnum | ConversationMessageScalarFieldEnum[]
  }

  /**
   * ConversationMessage create
   */
  export type ConversationMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationMessageInclude<ExtArgs> | null
    /**
     * The data needed to create a ConversationMessage.
     */
    data: XOR<ConversationMessageCreateInput, ConversationMessageUncheckedCreateInput>
  }

  /**
   * ConversationMessage createMany
   */
  export type ConversationMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ConversationMessages.
     */
    data: ConversationMessageCreateManyInput | ConversationMessageCreateManyInput[]
  }

  /**
   * ConversationMessage createManyAndReturn
   */
  export type ConversationMessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * The data used to create many ConversationMessages.
     */
    data: ConversationMessageCreateManyInput | ConversationMessageCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationMessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ConversationMessage update
   */
  export type ConversationMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationMessageInclude<ExtArgs> | null
    /**
     * The data needed to update a ConversationMessage.
     */
    data: XOR<ConversationMessageUpdateInput, ConversationMessageUncheckedUpdateInput>
    /**
     * Choose, which ConversationMessage to update.
     */
    where: ConversationMessageWhereUniqueInput
  }

  /**
   * ConversationMessage updateMany
   */
  export type ConversationMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ConversationMessages.
     */
    data: XOR<ConversationMessageUpdateManyMutationInput, ConversationMessageUncheckedUpdateManyInput>
    /**
     * Filter which ConversationMessages to update
     */
    where?: ConversationMessageWhereInput
    /**
     * Limit how many ConversationMessages to update.
     */
    limit?: number
  }

  /**
   * ConversationMessage updateManyAndReturn
   */
  export type ConversationMessageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * The data used to update ConversationMessages.
     */
    data: XOR<ConversationMessageUpdateManyMutationInput, ConversationMessageUncheckedUpdateManyInput>
    /**
     * Filter which ConversationMessages to update
     */
    where?: ConversationMessageWhereInput
    /**
     * Limit how many ConversationMessages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationMessageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ConversationMessage upsert
   */
  export type ConversationMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationMessageInclude<ExtArgs> | null
    /**
     * The filter to search for the ConversationMessage to update in case it exists.
     */
    where: ConversationMessageWhereUniqueInput
    /**
     * In case the ConversationMessage found by the `where` argument doesn't exist, create a new ConversationMessage with this data.
     */
    create: XOR<ConversationMessageCreateInput, ConversationMessageUncheckedCreateInput>
    /**
     * In case the ConversationMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConversationMessageUpdateInput, ConversationMessageUncheckedUpdateInput>
  }

  /**
   * ConversationMessage delete
   */
  export type ConversationMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationMessageInclude<ExtArgs> | null
    /**
     * Filter which ConversationMessage to delete.
     */
    where: ConversationMessageWhereUniqueInput
  }

  /**
   * ConversationMessage deleteMany
   */
  export type ConversationMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConversationMessages to delete
     */
    where?: ConversationMessageWhereInput
    /**
     * Limit how many ConversationMessages to delete.
     */
    limit?: number
  }

  /**
   * ConversationMessage without action
   */
  export type ConversationMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationMessage
     */
    select?: ConversationMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConversationMessage
     */
    omit?: ConversationMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ConversationMessageInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TeamScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    createdById: 'createdById'
  };

  export type TeamScalarFieldEnum = (typeof TeamScalarFieldEnum)[keyof typeof TeamScalarFieldEnum]


  export const MemberTeamScalarFieldEnum: {
    id: 'id',
    permission: 'permission',
    joinedAt: 'joinedAt',
    leftAt: 'leftAt',
    teamId: 'teamId',
    userId: 'userId'
  };

  export type MemberTeamScalarFieldEnum = (typeof MemberTeamScalarFieldEnum)[keyof typeof MemberTeamScalarFieldEnum]


  export const KnowledgeScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    config: 'config',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId'
  };

  export type KnowledgeScalarFieldEnum = (typeof KnowledgeScalarFieldEnum)[keyof typeof KnowledgeScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    name: 'name',
    code: 'code',
    password: 'password',
    email: 'email',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    permission: 'permission',
    defaultLLMProviderId: 'defaultLLMProviderId',
    llmPreferences: 'llmPreferences'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const FileScalarFieldEnum: {
    id: 'id',
    filename: 'filename',
    originalName: 'originalName',
    path: 'path',
    mimetype: 'mimetype',
    size: 'size',
    content: 'content',
    config: 'config',
    createdAt: 'createdAt',
    parsingStatus: 'parsingStatus',
    knowledgeId: 'knowledgeId'
  };

  export type FileScalarFieldEnum = (typeof FileScalarFieldEnum)[keyof typeof FileScalarFieldEnum]


  export const FileParsingTaskScalarFieldEnum: {
    id: 'id',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    completedAt: 'completedAt',
    message: 'message',
    fileId: 'fileId',
    createdById: 'createdById'
  };

  export type FileParsingTaskScalarFieldEnum = (typeof FileParsingTaskScalarFieldEnum)[keyof typeof FileParsingTaskScalarFieldEnum]


  export const AgentScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    flowConfig: 'flowConfig',
    isActive: 'isActive',
    ownerType: 'ownerType',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    createdById: 'createdById',
    userId: 'userId',
    teamId: 'teamId'
  };

  export type AgentScalarFieldEnum = (typeof AgentScalarFieldEnum)[keyof typeof AgentScalarFieldEnum]


  export const TextChunkScalarFieldEnum: {
    id: 'id',
    fileId: 'fileId',
    content: 'content',
    chunkIndex: 'chunkIndex',
    metadata: 'metadata',
    vectorData: 'vectorData',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TextChunkScalarFieldEnum = (typeof TextChunkScalarFieldEnum)[keyof typeof TextChunkScalarFieldEnum]


  export const LLMProviderScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    providerType: 'providerType',
    endpointUrl: 'endpointUrl',
    isActive: 'isActive',
    isDefault: 'isDefault',
    apiKey: 'apiKey',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    ownerType: 'ownerType',
    config: 'config',
    userOwnerId: 'userOwnerId',
    teamOwnerId: 'teamOwnerId',
    permissionSettings: 'permissionSettings'
  };

  export type LLMProviderScalarFieldEnum = (typeof LLMProviderScalarFieldEnum)[keyof typeof LLMProviderScalarFieldEnum]


  export const LLMModelScalarFieldEnum: {
    id: 'id',
    name: 'name',
    displayName: 'displayName',
    description: 'description',
    modelType: 'modelType',
    contextWindow: 'contextWindow',
    isActive: 'isActive',
    isDefault: 'isDefault',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    config: 'config',
    providerId: 'providerId'
  };

  export type LLMModelScalarFieldEnum = (typeof LLMModelScalarFieldEnum)[keyof typeof LLMModelScalarFieldEnum]


  export const ConversationScalarFieldEnum: {
    id: 'id',
    title: 'title',
    agentId: 'agentId',
    flowState: 'flowState',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    lastMessageAt: 'lastMessageAt'
  };

  export type ConversationScalarFieldEnum = (typeof ConversationScalarFieldEnum)[keyof typeof ConversationScalarFieldEnum]


  export const ConversationMessageScalarFieldEnum: {
    id: 'id',
    conversationId: 'conversationId',
    content: 'content',
    role: 'role',
    timestamp: 'timestamp',
    metadata: 'metadata',
    nodeId: 'nodeId',
    nodeType: 'nodeType'
  };

  export type ConversationMessageScalarFieldEnum = (typeof ConversationMessageScalarFieldEnum)[keyof typeof ConversationMessageScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type TeamWhereInput = {
    AND?: TeamWhereInput | TeamWhereInput[]
    OR?: TeamWhereInput[]
    NOT?: TeamWhereInput | TeamWhereInput[]
    id?: StringFilter<"Team"> | string
    name?: StringFilter<"Team"> | string
    description?: StringFilter<"Team"> | string
    createdAt?: DateTimeFilter<"Team"> | Date | string
    updatedAt?: DateTimeFilter<"Team"> | Date | string
    createdById?: StringFilter<"Team"> | string
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
    members?: MemberTeamListRelationFilter
    users?: UserListRelationFilter
    knowledge?: KnowledgeListRelationFilter
    ownedAgents?: AgentListRelationFilter
    ownedLLMProviders?: LLMProviderListRelationFilter
  }

  export type TeamOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
    createdBy?: UserOrderByWithRelationInput
    members?: MemberTeamOrderByRelationAggregateInput
    users?: UserOrderByRelationAggregateInput
    knowledge?: KnowledgeOrderByRelationAggregateInput
    ownedAgents?: AgentOrderByRelationAggregateInput
    ownedLLMProviders?: LLMProviderOrderByRelationAggregateInput
  }

  export type TeamWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TeamWhereInput | TeamWhereInput[]
    OR?: TeamWhereInput[]
    NOT?: TeamWhereInput | TeamWhereInput[]
    name?: StringFilter<"Team"> | string
    description?: StringFilter<"Team"> | string
    createdAt?: DateTimeFilter<"Team"> | Date | string
    updatedAt?: DateTimeFilter<"Team"> | Date | string
    createdById?: StringFilter<"Team"> | string
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
    members?: MemberTeamListRelationFilter
    users?: UserListRelationFilter
    knowledge?: KnowledgeListRelationFilter
    ownedAgents?: AgentListRelationFilter
    ownedLLMProviders?: LLMProviderListRelationFilter
  }, "id">

  export type TeamOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
    _count?: TeamCountOrderByAggregateInput
    _max?: TeamMaxOrderByAggregateInput
    _min?: TeamMinOrderByAggregateInput
  }

  export type TeamScalarWhereWithAggregatesInput = {
    AND?: TeamScalarWhereWithAggregatesInput | TeamScalarWhereWithAggregatesInput[]
    OR?: TeamScalarWhereWithAggregatesInput[]
    NOT?: TeamScalarWhereWithAggregatesInput | TeamScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Team"> | string
    name?: StringWithAggregatesFilter<"Team"> | string
    description?: StringWithAggregatesFilter<"Team"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Team"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Team"> | Date | string
    createdById?: StringWithAggregatesFilter<"Team"> | string
  }

  export type MemberTeamWhereInput = {
    AND?: MemberTeamWhereInput | MemberTeamWhereInput[]
    OR?: MemberTeamWhereInput[]
    NOT?: MemberTeamWhereInput | MemberTeamWhereInput[]
    id?: StringFilter<"MemberTeam"> | string
    permission?: StringFilter<"MemberTeam"> | string
    joinedAt?: DateTimeFilter<"MemberTeam"> | Date | string
    leftAt?: DateTimeNullableFilter<"MemberTeam"> | Date | string | null
    teamId?: StringFilter<"MemberTeam"> | string
    userId?: StringFilter<"MemberTeam"> | string
    team?: XOR<TeamScalarRelationFilter, TeamWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type MemberTeamOrderByWithRelationInput = {
    id?: SortOrder
    permission?: SortOrder
    joinedAt?: SortOrder
    leftAt?: SortOrderInput | SortOrder
    teamId?: SortOrder
    userId?: SortOrder
    team?: TeamOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type MemberTeamWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_teamId?: MemberTeamUserIdTeamIdCompoundUniqueInput
    AND?: MemberTeamWhereInput | MemberTeamWhereInput[]
    OR?: MemberTeamWhereInput[]
    NOT?: MemberTeamWhereInput | MemberTeamWhereInput[]
    permission?: StringFilter<"MemberTeam"> | string
    joinedAt?: DateTimeFilter<"MemberTeam"> | Date | string
    leftAt?: DateTimeNullableFilter<"MemberTeam"> | Date | string | null
    teamId?: StringFilter<"MemberTeam"> | string
    userId?: StringFilter<"MemberTeam"> | string
    team?: XOR<TeamScalarRelationFilter, TeamWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId_teamId">

  export type MemberTeamOrderByWithAggregationInput = {
    id?: SortOrder
    permission?: SortOrder
    joinedAt?: SortOrder
    leftAt?: SortOrderInput | SortOrder
    teamId?: SortOrder
    userId?: SortOrder
    _count?: MemberTeamCountOrderByAggregateInput
    _max?: MemberTeamMaxOrderByAggregateInput
    _min?: MemberTeamMinOrderByAggregateInput
  }

  export type MemberTeamScalarWhereWithAggregatesInput = {
    AND?: MemberTeamScalarWhereWithAggregatesInput | MemberTeamScalarWhereWithAggregatesInput[]
    OR?: MemberTeamScalarWhereWithAggregatesInput[]
    NOT?: MemberTeamScalarWhereWithAggregatesInput | MemberTeamScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MemberTeam"> | string
    permission?: StringWithAggregatesFilter<"MemberTeam"> | string
    joinedAt?: DateTimeWithAggregatesFilter<"MemberTeam"> | Date | string
    leftAt?: DateTimeNullableWithAggregatesFilter<"MemberTeam"> | Date | string | null
    teamId?: StringWithAggregatesFilter<"MemberTeam"> | string
    userId?: StringWithAggregatesFilter<"MemberTeam"> | string
  }

  export type KnowledgeWhereInput = {
    AND?: KnowledgeWhereInput | KnowledgeWhereInput[]
    OR?: KnowledgeWhereInput[]
    NOT?: KnowledgeWhereInput | KnowledgeWhereInput[]
    id?: StringFilter<"Knowledge"> | string
    name?: StringFilter<"Knowledge"> | string
    description?: StringFilter<"Knowledge"> | string
    config?: JsonNullableFilter<"Knowledge">
    createdAt?: DateTimeFilter<"Knowledge"> | Date | string
    updatedAt?: DateTimeFilter<"Knowledge"> | Date | string
    userId?: StringFilter<"Knowledge"> | string
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
    users?: UserListRelationFilter
    teams?: TeamListRelationFilter
    files?: FileListRelationFilter
  }

  export type KnowledgeOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    config?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    createdBy?: UserOrderByWithRelationInput
    users?: UserOrderByRelationAggregateInput
    teams?: TeamOrderByRelationAggregateInput
    files?: FileOrderByRelationAggregateInput
  }

  export type KnowledgeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: KnowledgeWhereInput | KnowledgeWhereInput[]
    OR?: KnowledgeWhereInput[]
    NOT?: KnowledgeWhereInput | KnowledgeWhereInput[]
    name?: StringFilter<"Knowledge"> | string
    description?: StringFilter<"Knowledge"> | string
    config?: JsonNullableFilter<"Knowledge">
    createdAt?: DateTimeFilter<"Knowledge"> | Date | string
    updatedAt?: DateTimeFilter<"Knowledge"> | Date | string
    userId?: StringFilter<"Knowledge"> | string
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
    users?: UserListRelationFilter
    teams?: TeamListRelationFilter
    files?: FileListRelationFilter
  }, "id">

  export type KnowledgeOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    config?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    _count?: KnowledgeCountOrderByAggregateInput
    _max?: KnowledgeMaxOrderByAggregateInput
    _min?: KnowledgeMinOrderByAggregateInput
  }

  export type KnowledgeScalarWhereWithAggregatesInput = {
    AND?: KnowledgeScalarWhereWithAggregatesInput | KnowledgeScalarWhereWithAggregatesInput[]
    OR?: KnowledgeScalarWhereWithAggregatesInput[]
    NOT?: KnowledgeScalarWhereWithAggregatesInput | KnowledgeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Knowledge"> | string
    name?: StringWithAggregatesFilter<"Knowledge"> | string
    description?: StringWithAggregatesFilter<"Knowledge"> | string
    config?: JsonNullableWithAggregatesFilter<"Knowledge">
    createdAt?: DateTimeWithAggregatesFilter<"Knowledge"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Knowledge"> | Date | string
    userId?: StringWithAggregatesFilter<"Knowledge"> | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    code?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    description?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    permission?: StringFilter<"User"> | string
    defaultLLMProviderId?: StringNullableFilter<"User"> | string | null
    llmPreferences?: JsonNullableFilter<"User">
    createdTeams?: TeamListRelationFilter
    teamMemberships?: MemberTeamListRelationFilter
    teams?: TeamListRelationFilter
    createdKnowledge?: KnowledgeListRelationFilter
    knowledge?: KnowledgeListRelationFilter
    ownedAgents?: AgentListRelationFilter
    createdAgents?: AgentListRelationFilter
    FileParsingTask?: FileParsingTaskListRelationFilter
    defaultLLMProvider?: XOR<LLMProviderNullableScalarRelationFilter, LLMProviderWhereInput> | null
    ownedLLMProviders?: LLMProviderListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    password?: SortOrder
    email?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    permission?: SortOrder
    defaultLLMProviderId?: SortOrderInput | SortOrder
    llmPreferences?: SortOrderInput | SortOrder
    createdTeams?: TeamOrderByRelationAggregateInput
    teamMemberships?: MemberTeamOrderByRelationAggregateInput
    teams?: TeamOrderByRelationAggregateInput
    createdKnowledge?: KnowledgeOrderByRelationAggregateInput
    knowledge?: KnowledgeOrderByRelationAggregateInput
    ownedAgents?: AgentOrderByRelationAggregateInput
    createdAgents?: AgentOrderByRelationAggregateInput
    FileParsingTask?: FileParsingTaskOrderByRelationAggregateInput
    defaultLLMProvider?: LLMProviderOrderByWithRelationInput
    ownedLLMProviders?: LLMProviderOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringFilter<"User"> | string
    code?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    description?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    permission?: StringFilter<"User"> | string
    defaultLLMProviderId?: StringNullableFilter<"User"> | string | null
    llmPreferences?: JsonNullableFilter<"User">
    createdTeams?: TeamListRelationFilter
    teamMemberships?: MemberTeamListRelationFilter
    teams?: TeamListRelationFilter
    createdKnowledge?: KnowledgeListRelationFilter
    knowledge?: KnowledgeListRelationFilter
    ownedAgents?: AgentListRelationFilter
    createdAgents?: AgentListRelationFilter
    FileParsingTask?: FileParsingTaskListRelationFilter
    defaultLLMProvider?: XOR<LLMProviderNullableScalarRelationFilter, LLMProviderWhereInput> | null
    ownedLLMProviders?: LLMProviderListRelationFilter
  }, "id">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    password?: SortOrder
    email?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    permission?: SortOrder
    defaultLLMProviderId?: SortOrderInput | SortOrder
    llmPreferences?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    code?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    description?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    permission?: StringWithAggregatesFilter<"User"> | string
    defaultLLMProviderId?: StringNullableWithAggregatesFilter<"User"> | string | null
    llmPreferences?: JsonNullableWithAggregatesFilter<"User">
  }

  export type FileWhereInput = {
    AND?: FileWhereInput | FileWhereInput[]
    OR?: FileWhereInput[]
    NOT?: FileWhereInput | FileWhereInput[]
    id?: StringFilter<"File"> | string
    filename?: StringFilter<"File"> | string
    originalName?: StringFilter<"File"> | string
    path?: StringFilter<"File"> | string
    mimetype?: StringFilter<"File"> | string
    size?: IntFilter<"File"> | number
    content?: StringNullableFilter<"File"> | string | null
    config?: JsonNullableFilter<"File">
    createdAt?: DateTimeFilter<"File"> | Date | string
    parsingStatus?: StringNullableFilter<"File"> | string | null
    knowledgeId?: StringFilter<"File"> | string
    knowledge?: XOR<KnowledgeScalarRelationFilter, KnowledgeWhereInput>
    parsingTasks?: FileParsingTaskListRelationFilter
    TextChunk?: TextChunkListRelationFilter
  }

  export type FileOrderByWithRelationInput = {
    id?: SortOrder
    filename?: SortOrder
    originalName?: SortOrder
    path?: SortOrder
    mimetype?: SortOrder
    size?: SortOrder
    content?: SortOrderInput | SortOrder
    config?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    parsingStatus?: SortOrderInput | SortOrder
    knowledgeId?: SortOrder
    knowledge?: KnowledgeOrderByWithRelationInput
    parsingTasks?: FileParsingTaskOrderByRelationAggregateInput
    TextChunk?: TextChunkOrderByRelationAggregateInput
  }

  export type FileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FileWhereInput | FileWhereInput[]
    OR?: FileWhereInput[]
    NOT?: FileWhereInput | FileWhereInput[]
    filename?: StringFilter<"File"> | string
    originalName?: StringFilter<"File"> | string
    path?: StringFilter<"File"> | string
    mimetype?: StringFilter<"File"> | string
    size?: IntFilter<"File"> | number
    content?: StringNullableFilter<"File"> | string | null
    config?: JsonNullableFilter<"File">
    createdAt?: DateTimeFilter<"File"> | Date | string
    parsingStatus?: StringNullableFilter<"File"> | string | null
    knowledgeId?: StringFilter<"File"> | string
    knowledge?: XOR<KnowledgeScalarRelationFilter, KnowledgeWhereInput>
    parsingTasks?: FileParsingTaskListRelationFilter
    TextChunk?: TextChunkListRelationFilter
  }, "id">

  export type FileOrderByWithAggregationInput = {
    id?: SortOrder
    filename?: SortOrder
    originalName?: SortOrder
    path?: SortOrder
    mimetype?: SortOrder
    size?: SortOrder
    content?: SortOrderInput | SortOrder
    config?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    parsingStatus?: SortOrderInput | SortOrder
    knowledgeId?: SortOrder
    _count?: FileCountOrderByAggregateInput
    _avg?: FileAvgOrderByAggregateInput
    _max?: FileMaxOrderByAggregateInput
    _min?: FileMinOrderByAggregateInput
    _sum?: FileSumOrderByAggregateInput
  }

  export type FileScalarWhereWithAggregatesInput = {
    AND?: FileScalarWhereWithAggregatesInput | FileScalarWhereWithAggregatesInput[]
    OR?: FileScalarWhereWithAggregatesInput[]
    NOT?: FileScalarWhereWithAggregatesInput | FileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"File"> | string
    filename?: StringWithAggregatesFilter<"File"> | string
    originalName?: StringWithAggregatesFilter<"File"> | string
    path?: StringWithAggregatesFilter<"File"> | string
    mimetype?: StringWithAggregatesFilter<"File"> | string
    size?: IntWithAggregatesFilter<"File"> | number
    content?: StringNullableWithAggregatesFilter<"File"> | string | null
    config?: JsonNullableWithAggregatesFilter<"File">
    createdAt?: DateTimeWithAggregatesFilter<"File"> | Date | string
    parsingStatus?: StringNullableWithAggregatesFilter<"File"> | string | null
    knowledgeId?: StringWithAggregatesFilter<"File"> | string
  }

  export type FileParsingTaskWhereInput = {
    AND?: FileParsingTaskWhereInput | FileParsingTaskWhereInput[]
    OR?: FileParsingTaskWhereInput[]
    NOT?: FileParsingTaskWhereInput | FileParsingTaskWhereInput[]
    id?: StringFilter<"FileParsingTask"> | string
    status?: StringFilter<"FileParsingTask"> | string
    createdAt?: DateTimeFilter<"FileParsingTask"> | Date | string
    updatedAt?: DateTimeFilter<"FileParsingTask"> | Date | string
    completedAt?: DateTimeNullableFilter<"FileParsingTask"> | Date | string | null
    message?: StringNullableFilter<"FileParsingTask"> | string | null
    fileId?: StringFilter<"FileParsingTask"> | string
    createdById?: StringFilter<"FileParsingTask"> | string
    file?: XOR<FileScalarRelationFilter, FileWhereInput>
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type FileParsingTaskOrderByWithRelationInput = {
    id?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    message?: SortOrderInput | SortOrder
    fileId?: SortOrder
    createdById?: SortOrder
    file?: FileOrderByWithRelationInput
    createdBy?: UserOrderByWithRelationInput
  }

  export type FileParsingTaskWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FileParsingTaskWhereInput | FileParsingTaskWhereInput[]
    OR?: FileParsingTaskWhereInput[]
    NOT?: FileParsingTaskWhereInput | FileParsingTaskWhereInput[]
    status?: StringFilter<"FileParsingTask"> | string
    createdAt?: DateTimeFilter<"FileParsingTask"> | Date | string
    updatedAt?: DateTimeFilter<"FileParsingTask"> | Date | string
    completedAt?: DateTimeNullableFilter<"FileParsingTask"> | Date | string | null
    message?: StringNullableFilter<"FileParsingTask"> | string | null
    fileId?: StringFilter<"FileParsingTask"> | string
    createdById?: StringFilter<"FileParsingTask"> | string
    file?: XOR<FileScalarRelationFilter, FileWhereInput>
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type FileParsingTaskOrderByWithAggregationInput = {
    id?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    message?: SortOrderInput | SortOrder
    fileId?: SortOrder
    createdById?: SortOrder
    _count?: FileParsingTaskCountOrderByAggregateInput
    _max?: FileParsingTaskMaxOrderByAggregateInput
    _min?: FileParsingTaskMinOrderByAggregateInput
  }

  export type FileParsingTaskScalarWhereWithAggregatesInput = {
    AND?: FileParsingTaskScalarWhereWithAggregatesInput | FileParsingTaskScalarWhereWithAggregatesInput[]
    OR?: FileParsingTaskScalarWhereWithAggregatesInput[]
    NOT?: FileParsingTaskScalarWhereWithAggregatesInput | FileParsingTaskScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FileParsingTask"> | string
    status?: StringWithAggregatesFilter<"FileParsingTask"> | string
    createdAt?: DateTimeWithAggregatesFilter<"FileParsingTask"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"FileParsingTask"> | Date | string
    completedAt?: DateTimeNullableWithAggregatesFilter<"FileParsingTask"> | Date | string | null
    message?: StringNullableWithAggregatesFilter<"FileParsingTask"> | string | null
    fileId?: StringWithAggregatesFilter<"FileParsingTask"> | string
    createdById?: StringWithAggregatesFilter<"FileParsingTask"> | string
  }

  export type AgentWhereInput = {
    AND?: AgentWhereInput | AgentWhereInput[]
    OR?: AgentWhereInput[]
    NOT?: AgentWhereInput | AgentWhereInput[]
    id?: StringFilter<"Agent"> | string
    name?: StringFilter<"Agent"> | string
    description?: StringFilter<"Agent"> | string
    flowConfig?: StringFilter<"Agent"> | string
    isActive?: BoolFilter<"Agent"> | boolean
    ownerType?: StringFilter<"Agent"> | string
    createdAt?: DateTimeFilter<"Agent"> | Date | string
    updatedAt?: DateTimeFilter<"Agent"> | Date | string
    createdById?: StringFilter<"Agent"> | string
    userId?: StringNullableFilter<"Agent"> | string | null
    teamId?: StringNullableFilter<"Agent"> | string | null
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    team?: XOR<TeamNullableScalarRelationFilter, TeamWhereInput> | null
    conversations?: ConversationListRelationFilter
  }

  export type AgentOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    flowConfig?: SortOrder
    isActive?: SortOrder
    ownerType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
    userId?: SortOrderInput | SortOrder
    teamId?: SortOrderInput | SortOrder
    createdBy?: UserOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
    team?: TeamOrderByWithRelationInput
    conversations?: ConversationOrderByRelationAggregateInput
  }

  export type AgentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AgentWhereInput | AgentWhereInput[]
    OR?: AgentWhereInput[]
    NOT?: AgentWhereInput | AgentWhereInput[]
    name?: StringFilter<"Agent"> | string
    description?: StringFilter<"Agent"> | string
    flowConfig?: StringFilter<"Agent"> | string
    isActive?: BoolFilter<"Agent"> | boolean
    ownerType?: StringFilter<"Agent"> | string
    createdAt?: DateTimeFilter<"Agent"> | Date | string
    updatedAt?: DateTimeFilter<"Agent"> | Date | string
    createdById?: StringFilter<"Agent"> | string
    userId?: StringNullableFilter<"Agent"> | string | null
    teamId?: StringNullableFilter<"Agent"> | string | null
    createdBy?: XOR<UserScalarRelationFilter, UserWhereInput>
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    team?: XOR<TeamNullableScalarRelationFilter, TeamWhereInput> | null
    conversations?: ConversationListRelationFilter
  }, "id">

  export type AgentOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    flowConfig?: SortOrder
    isActive?: SortOrder
    ownerType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
    userId?: SortOrderInput | SortOrder
    teamId?: SortOrderInput | SortOrder
    _count?: AgentCountOrderByAggregateInput
    _max?: AgentMaxOrderByAggregateInput
    _min?: AgentMinOrderByAggregateInput
  }

  export type AgentScalarWhereWithAggregatesInput = {
    AND?: AgentScalarWhereWithAggregatesInput | AgentScalarWhereWithAggregatesInput[]
    OR?: AgentScalarWhereWithAggregatesInput[]
    NOT?: AgentScalarWhereWithAggregatesInput | AgentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Agent"> | string
    name?: StringWithAggregatesFilter<"Agent"> | string
    description?: StringWithAggregatesFilter<"Agent"> | string
    flowConfig?: StringWithAggregatesFilter<"Agent"> | string
    isActive?: BoolWithAggregatesFilter<"Agent"> | boolean
    ownerType?: StringWithAggregatesFilter<"Agent"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Agent"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Agent"> | Date | string
    createdById?: StringWithAggregatesFilter<"Agent"> | string
    userId?: StringNullableWithAggregatesFilter<"Agent"> | string | null
    teamId?: StringNullableWithAggregatesFilter<"Agent"> | string | null
  }

  export type TextChunkWhereInput = {
    AND?: TextChunkWhereInput | TextChunkWhereInput[]
    OR?: TextChunkWhereInput[]
    NOT?: TextChunkWhereInput | TextChunkWhereInput[]
    id?: StringFilter<"TextChunk"> | string
    fileId?: StringFilter<"TextChunk"> | string
    content?: StringFilter<"TextChunk"> | string
    chunkIndex?: IntFilter<"TextChunk"> | number
    metadata?: JsonNullableFilter<"TextChunk">
    vectorData?: StringNullableFilter<"TextChunk"> | string | null
    createdAt?: DateTimeFilter<"TextChunk"> | Date | string
    updatedAt?: DateTimeFilter<"TextChunk"> | Date | string
    file?: XOR<FileScalarRelationFilter, FileWhereInput>
  }

  export type TextChunkOrderByWithRelationInput = {
    id?: SortOrder
    fileId?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    metadata?: SortOrderInput | SortOrder
    vectorData?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    file?: FileOrderByWithRelationInput
  }

  export type TextChunkWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TextChunkWhereInput | TextChunkWhereInput[]
    OR?: TextChunkWhereInput[]
    NOT?: TextChunkWhereInput | TextChunkWhereInput[]
    fileId?: StringFilter<"TextChunk"> | string
    content?: StringFilter<"TextChunk"> | string
    chunkIndex?: IntFilter<"TextChunk"> | number
    metadata?: JsonNullableFilter<"TextChunk">
    vectorData?: StringNullableFilter<"TextChunk"> | string | null
    createdAt?: DateTimeFilter<"TextChunk"> | Date | string
    updatedAt?: DateTimeFilter<"TextChunk"> | Date | string
    file?: XOR<FileScalarRelationFilter, FileWhereInput>
  }, "id">

  export type TextChunkOrderByWithAggregationInput = {
    id?: SortOrder
    fileId?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    metadata?: SortOrderInput | SortOrder
    vectorData?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TextChunkCountOrderByAggregateInput
    _avg?: TextChunkAvgOrderByAggregateInput
    _max?: TextChunkMaxOrderByAggregateInput
    _min?: TextChunkMinOrderByAggregateInput
    _sum?: TextChunkSumOrderByAggregateInput
  }

  export type TextChunkScalarWhereWithAggregatesInput = {
    AND?: TextChunkScalarWhereWithAggregatesInput | TextChunkScalarWhereWithAggregatesInput[]
    OR?: TextChunkScalarWhereWithAggregatesInput[]
    NOT?: TextChunkScalarWhereWithAggregatesInput | TextChunkScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TextChunk"> | string
    fileId?: StringWithAggregatesFilter<"TextChunk"> | string
    content?: StringWithAggregatesFilter<"TextChunk"> | string
    chunkIndex?: IntWithAggregatesFilter<"TextChunk"> | number
    metadata?: JsonNullableWithAggregatesFilter<"TextChunk">
    vectorData?: StringNullableWithAggregatesFilter<"TextChunk"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"TextChunk"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TextChunk"> | Date | string
  }

  export type LLMProviderWhereInput = {
    AND?: LLMProviderWhereInput | LLMProviderWhereInput[]
    OR?: LLMProviderWhereInput[]
    NOT?: LLMProviderWhereInput | LLMProviderWhereInput[]
    id?: StringFilter<"LLMProvider"> | string
    name?: StringFilter<"LLMProvider"> | string
    description?: StringNullableFilter<"LLMProvider"> | string | null
    providerType?: StringFilter<"LLMProvider"> | string
    endpointUrl?: StringFilter<"LLMProvider"> | string
    isActive?: BoolFilter<"LLMProvider"> | boolean
    isDefault?: BoolFilter<"LLMProvider"> | boolean
    apiKey?: StringNullableFilter<"LLMProvider"> | string | null
    createdAt?: DateTimeFilter<"LLMProvider"> | Date | string
    updatedAt?: DateTimeFilter<"LLMProvider"> | Date | string
    ownerType?: StringFilter<"LLMProvider"> | string
    config?: JsonNullableFilter<"LLMProvider">
    userOwnerId?: StringNullableFilter<"LLMProvider"> | string | null
    teamOwnerId?: StringNullableFilter<"LLMProvider"> | string | null
    permissionSettings?: JsonNullableFilter<"LLMProvider">
    models?: LLMModelListRelationFilter
    usersWithDefault?: UserListRelationFilter
    userOwner?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    teamOwner?: XOR<TeamNullableScalarRelationFilter, TeamWhereInput> | null
  }

  export type LLMProviderOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    providerType?: SortOrder
    endpointUrl?: SortOrder
    isActive?: SortOrder
    isDefault?: SortOrder
    apiKey?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ownerType?: SortOrder
    config?: SortOrderInput | SortOrder
    userOwnerId?: SortOrderInput | SortOrder
    teamOwnerId?: SortOrderInput | SortOrder
    permissionSettings?: SortOrderInput | SortOrder
    models?: LLMModelOrderByRelationAggregateInput
    usersWithDefault?: UserOrderByRelationAggregateInput
    userOwner?: UserOrderByWithRelationInput
    teamOwner?: TeamOrderByWithRelationInput
  }

  export type LLMProviderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LLMProviderWhereInput | LLMProviderWhereInput[]
    OR?: LLMProviderWhereInput[]
    NOT?: LLMProviderWhereInput | LLMProviderWhereInput[]
    name?: StringFilter<"LLMProvider"> | string
    description?: StringNullableFilter<"LLMProvider"> | string | null
    providerType?: StringFilter<"LLMProvider"> | string
    endpointUrl?: StringFilter<"LLMProvider"> | string
    isActive?: BoolFilter<"LLMProvider"> | boolean
    isDefault?: BoolFilter<"LLMProvider"> | boolean
    apiKey?: StringNullableFilter<"LLMProvider"> | string | null
    createdAt?: DateTimeFilter<"LLMProvider"> | Date | string
    updatedAt?: DateTimeFilter<"LLMProvider"> | Date | string
    ownerType?: StringFilter<"LLMProvider"> | string
    config?: JsonNullableFilter<"LLMProvider">
    userOwnerId?: StringNullableFilter<"LLMProvider"> | string | null
    teamOwnerId?: StringNullableFilter<"LLMProvider"> | string | null
    permissionSettings?: JsonNullableFilter<"LLMProvider">
    models?: LLMModelListRelationFilter
    usersWithDefault?: UserListRelationFilter
    userOwner?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    teamOwner?: XOR<TeamNullableScalarRelationFilter, TeamWhereInput> | null
  }, "id">

  export type LLMProviderOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    providerType?: SortOrder
    endpointUrl?: SortOrder
    isActive?: SortOrder
    isDefault?: SortOrder
    apiKey?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ownerType?: SortOrder
    config?: SortOrderInput | SortOrder
    userOwnerId?: SortOrderInput | SortOrder
    teamOwnerId?: SortOrderInput | SortOrder
    permissionSettings?: SortOrderInput | SortOrder
    _count?: LLMProviderCountOrderByAggregateInput
    _max?: LLMProviderMaxOrderByAggregateInput
    _min?: LLMProviderMinOrderByAggregateInput
  }

  export type LLMProviderScalarWhereWithAggregatesInput = {
    AND?: LLMProviderScalarWhereWithAggregatesInput | LLMProviderScalarWhereWithAggregatesInput[]
    OR?: LLMProviderScalarWhereWithAggregatesInput[]
    NOT?: LLMProviderScalarWhereWithAggregatesInput | LLMProviderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LLMProvider"> | string
    name?: StringWithAggregatesFilter<"LLMProvider"> | string
    description?: StringNullableWithAggregatesFilter<"LLMProvider"> | string | null
    providerType?: StringWithAggregatesFilter<"LLMProvider"> | string
    endpointUrl?: StringWithAggregatesFilter<"LLMProvider"> | string
    isActive?: BoolWithAggregatesFilter<"LLMProvider"> | boolean
    isDefault?: BoolWithAggregatesFilter<"LLMProvider"> | boolean
    apiKey?: StringNullableWithAggregatesFilter<"LLMProvider"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"LLMProvider"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"LLMProvider"> | Date | string
    ownerType?: StringWithAggregatesFilter<"LLMProvider"> | string
    config?: JsonNullableWithAggregatesFilter<"LLMProvider">
    userOwnerId?: StringNullableWithAggregatesFilter<"LLMProvider"> | string | null
    teamOwnerId?: StringNullableWithAggregatesFilter<"LLMProvider"> | string | null
    permissionSettings?: JsonNullableWithAggregatesFilter<"LLMProvider">
  }

  export type LLMModelWhereInput = {
    AND?: LLMModelWhereInput | LLMModelWhereInput[]
    OR?: LLMModelWhereInput[]
    NOT?: LLMModelWhereInput | LLMModelWhereInput[]
    id?: StringFilter<"LLMModel"> | string
    name?: StringFilter<"LLMModel"> | string
    displayName?: StringNullableFilter<"LLMModel"> | string | null
    description?: StringNullableFilter<"LLMModel"> | string | null
    modelType?: StringFilter<"LLMModel"> | string
    contextWindow?: IntNullableFilter<"LLMModel"> | number | null
    isActive?: BoolFilter<"LLMModel"> | boolean
    isDefault?: BoolFilter<"LLMModel"> | boolean
    createdAt?: DateTimeFilter<"LLMModel"> | Date | string
    updatedAt?: DateTimeFilter<"LLMModel"> | Date | string
    config?: JsonNullableFilter<"LLMModel">
    providerId?: StringFilter<"LLMModel"> | string
    provider?: XOR<LLMProviderScalarRelationFilter, LLMProviderWhereInput>
  }

  export type LLMModelOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    displayName?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    modelType?: SortOrder
    contextWindow?: SortOrderInput | SortOrder
    isActive?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    config?: SortOrderInput | SortOrder
    providerId?: SortOrder
    provider?: LLMProviderOrderByWithRelationInput
  }

  export type LLMModelWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LLMModelWhereInput | LLMModelWhereInput[]
    OR?: LLMModelWhereInput[]
    NOT?: LLMModelWhereInput | LLMModelWhereInput[]
    name?: StringFilter<"LLMModel"> | string
    displayName?: StringNullableFilter<"LLMModel"> | string | null
    description?: StringNullableFilter<"LLMModel"> | string | null
    modelType?: StringFilter<"LLMModel"> | string
    contextWindow?: IntNullableFilter<"LLMModel"> | number | null
    isActive?: BoolFilter<"LLMModel"> | boolean
    isDefault?: BoolFilter<"LLMModel"> | boolean
    createdAt?: DateTimeFilter<"LLMModel"> | Date | string
    updatedAt?: DateTimeFilter<"LLMModel"> | Date | string
    config?: JsonNullableFilter<"LLMModel">
    providerId?: StringFilter<"LLMModel"> | string
    provider?: XOR<LLMProviderScalarRelationFilter, LLMProviderWhereInput>
  }, "id">

  export type LLMModelOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    displayName?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    modelType?: SortOrder
    contextWindow?: SortOrderInput | SortOrder
    isActive?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    config?: SortOrderInput | SortOrder
    providerId?: SortOrder
    _count?: LLMModelCountOrderByAggregateInput
    _avg?: LLMModelAvgOrderByAggregateInput
    _max?: LLMModelMaxOrderByAggregateInput
    _min?: LLMModelMinOrderByAggregateInput
    _sum?: LLMModelSumOrderByAggregateInput
  }

  export type LLMModelScalarWhereWithAggregatesInput = {
    AND?: LLMModelScalarWhereWithAggregatesInput | LLMModelScalarWhereWithAggregatesInput[]
    OR?: LLMModelScalarWhereWithAggregatesInput[]
    NOT?: LLMModelScalarWhereWithAggregatesInput | LLMModelScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LLMModel"> | string
    name?: StringWithAggregatesFilter<"LLMModel"> | string
    displayName?: StringNullableWithAggregatesFilter<"LLMModel"> | string | null
    description?: StringNullableWithAggregatesFilter<"LLMModel"> | string | null
    modelType?: StringWithAggregatesFilter<"LLMModel"> | string
    contextWindow?: IntNullableWithAggregatesFilter<"LLMModel"> | number | null
    isActive?: BoolWithAggregatesFilter<"LLMModel"> | boolean
    isDefault?: BoolWithAggregatesFilter<"LLMModel"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"LLMModel"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"LLMModel"> | Date | string
    config?: JsonNullableWithAggregatesFilter<"LLMModel">
    providerId?: StringWithAggregatesFilter<"LLMModel"> | string
  }

  export type ConversationWhereInput = {
    AND?: ConversationWhereInput | ConversationWhereInput[]
    OR?: ConversationWhereInput[]
    NOT?: ConversationWhereInput | ConversationWhereInput[]
    id?: StringFilter<"Conversation"> | string
    title?: StringNullableFilter<"Conversation"> | string | null
    agentId?: StringFilter<"Conversation"> | string
    flowState?: StringFilter<"Conversation"> | string
    status?: StringFilter<"Conversation"> | string
    createdAt?: DateTimeFilter<"Conversation"> | Date | string
    updatedAt?: DateTimeFilter<"Conversation"> | Date | string
    lastMessageAt?: DateTimeFilter<"Conversation"> | Date | string
    agent?: XOR<AgentScalarRelationFilter, AgentWhereInput>
    messages?: ConversationMessageListRelationFilter
  }

  export type ConversationOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrderInput | SortOrder
    agentId?: SortOrder
    flowState?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastMessageAt?: SortOrder
    agent?: AgentOrderByWithRelationInput
    messages?: ConversationMessageOrderByRelationAggregateInput
  }

  export type ConversationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConversationWhereInput | ConversationWhereInput[]
    OR?: ConversationWhereInput[]
    NOT?: ConversationWhereInput | ConversationWhereInput[]
    title?: StringNullableFilter<"Conversation"> | string | null
    agentId?: StringFilter<"Conversation"> | string
    flowState?: StringFilter<"Conversation"> | string
    status?: StringFilter<"Conversation"> | string
    createdAt?: DateTimeFilter<"Conversation"> | Date | string
    updatedAt?: DateTimeFilter<"Conversation"> | Date | string
    lastMessageAt?: DateTimeFilter<"Conversation"> | Date | string
    agent?: XOR<AgentScalarRelationFilter, AgentWhereInput>
    messages?: ConversationMessageListRelationFilter
  }, "id">

  export type ConversationOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrderInput | SortOrder
    agentId?: SortOrder
    flowState?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastMessageAt?: SortOrder
    _count?: ConversationCountOrderByAggregateInput
    _max?: ConversationMaxOrderByAggregateInput
    _min?: ConversationMinOrderByAggregateInput
  }

  export type ConversationScalarWhereWithAggregatesInput = {
    AND?: ConversationScalarWhereWithAggregatesInput | ConversationScalarWhereWithAggregatesInput[]
    OR?: ConversationScalarWhereWithAggregatesInput[]
    NOT?: ConversationScalarWhereWithAggregatesInput | ConversationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Conversation"> | string
    title?: StringNullableWithAggregatesFilter<"Conversation"> | string | null
    agentId?: StringWithAggregatesFilter<"Conversation"> | string
    flowState?: StringWithAggregatesFilter<"Conversation"> | string
    status?: StringWithAggregatesFilter<"Conversation"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Conversation"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Conversation"> | Date | string
    lastMessageAt?: DateTimeWithAggregatesFilter<"Conversation"> | Date | string
  }

  export type ConversationMessageWhereInput = {
    AND?: ConversationMessageWhereInput | ConversationMessageWhereInput[]
    OR?: ConversationMessageWhereInput[]
    NOT?: ConversationMessageWhereInput | ConversationMessageWhereInput[]
    id?: StringFilter<"ConversationMessage"> | string
    conversationId?: StringFilter<"ConversationMessage"> | string
    content?: StringFilter<"ConversationMessage"> | string
    role?: StringFilter<"ConversationMessage"> | string
    timestamp?: DateTimeFilter<"ConversationMessage"> | Date | string
    metadata?: JsonNullableFilter<"ConversationMessage">
    nodeId?: StringNullableFilter<"ConversationMessage"> | string | null
    nodeType?: StringNullableFilter<"ConversationMessage"> | string | null
    conversation?: XOR<ConversationScalarRelationFilter, ConversationWhereInput>
  }

  export type ConversationMessageOrderByWithRelationInput = {
    id?: SortOrder
    conversationId?: SortOrder
    content?: SortOrder
    role?: SortOrder
    timestamp?: SortOrder
    metadata?: SortOrderInput | SortOrder
    nodeId?: SortOrderInput | SortOrder
    nodeType?: SortOrderInput | SortOrder
    conversation?: ConversationOrderByWithRelationInput
  }

  export type ConversationMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConversationMessageWhereInput | ConversationMessageWhereInput[]
    OR?: ConversationMessageWhereInput[]
    NOT?: ConversationMessageWhereInput | ConversationMessageWhereInput[]
    conversationId?: StringFilter<"ConversationMessage"> | string
    content?: StringFilter<"ConversationMessage"> | string
    role?: StringFilter<"ConversationMessage"> | string
    timestamp?: DateTimeFilter<"ConversationMessage"> | Date | string
    metadata?: JsonNullableFilter<"ConversationMessage">
    nodeId?: StringNullableFilter<"ConversationMessage"> | string | null
    nodeType?: StringNullableFilter<"ConversationMessage"> | string | null
    conversation?: XOR<ConversationScalarRelationFilter, ConversationWhereInput>
  }, "id">

  export type ConversationMessageOrderByWithAggregationInput = {
    id?: SortOrder
    conversationId?: SortOrder
    content?: SortOrder
    role?: SortOrder
    timestamp?: SortOrder
    metadata?: SortOrderInput | SortOrder
    nodeId?: SortOrderInput | SortOrder
    nodeType?: SortOrderInput | SortOrder
    _count?: ConversationMessageCountOrderByAggregateInput
    _max?: ConversationMessageMaxOrderByAggregateInput
    _min?: ConversationMessageMinOrderByAggregateInput
  }

  export type ConversationMessageScalarWhereWithAggregatesInput = {
    AND?: ConversationMessageScalarWhereWithAggregatesInput | ConversationMessageScalarWhereWithAggregatesInput[]
    OR?: ConversationMessageScalarWhereWithAggregatesInput[]
    NOT?: ConversationMessageScalarWhereWithAggregatesInput | ConversationMessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ConversationMessage"> | string
    conversationId?: StringWithAggregatesFilter<"ConversationMessage"> | string
    content?: StringWithAggregatesFilter<"ConversationMessage"> | string
    role?: StringWithAggregatesFilter<"ConversationMessage"> | string
    timestamp?: DateTimeWithAggregatesFilter<"ConversationMessage"> | Date | string
    metadata?: JsonNullableWithAggregatesFilter<"ConversationMessage">
    nodeId?: StringNullableWithAggregatesFilter<"ConversationMessage"> | string | null
    nodeType?: StringNullableWithAggregatesFilter<"ConversationMessage"> | string | null
  }

  export type TeamCreateInput = {
    id?: string
    name: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedTeamsInput
    members?: MemberTeamCreateNestedManyWithoutTeamInput
    users?: UserCreateNestedManyWithoutTeamsInput
    knowledge?: KnowledgeCreateNestedManyWithoutTeamsInput
    ownedAgents?: AgentCreateNestedManyWithoutTeamInput
    ownedLLMProviders?: LLMProviderCreateNestedManyWithoutTeamOwnerInput
  }

  export type TeamUncheckedCreateInput = {
    id?: string
    name: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    members?: MemberTeamUncheckedCreateNestedManyWithoutTeamInput
    users?: UserUncheckedCreateNestedManyWithoutTeamsInput
    knowledge?: KnowledgeUncheckedCreateNestedManyWithoutTeamsInput
    ownedAgents?: AgentUncheckedCreateNestedManyWithoutTeamInput
    ownedLLMProviders?: LLMProviderUncheckedCreateNestedManyWithoutTeamOwnerInput
  }

  export type TeamUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedTeamsNestedInput
    members?: MemberTeamUpdateManyWithoutTeamNestedInput
    users?: UserUpdateManyWithoutTeamsNestedInput
    knowledge?: KnowledgeUpdateManyWithoutTeamsNestedInput
    ownedAgents?: AgentUpdateManyWithoutTeamNestedInput
    ownedLLMProviders?: LLMProviderUpdateManyWithoutTeamOwnerNestedInput
  }

  export type TeamUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    members?: MemberTeamUncheckedUpdateManyWithoutTeamNestedInput
    users?: UserUncheckedUpdateManyWithoutTeamsNestedInput
    knowledge?: KnowledgeUncheckedUpdateManyWithoutTeamsNestedInput
    ownedAgents?: AgentUncheckedUpdateManyWithoutTeamNestedInput
    ownedLLMProviders?: LLMProviderUncheckedUpdateManyWithoutTeamOwnerNestedInput
  }

  export type TeamCreateManyInput = {
    id?: string
    name: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
  }

  export type TeamUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
  }

  export type MemberTeamCreateInput = {
    id?: string
    permission?: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    team: TeamCreateNestedOneWithoutMembersInput
    user: UserCreateNestedOneWithoutTeamMembershipsInput
  }

  export type MemberTeamUncheckedCreateInput = {
    id?: string
    permission?: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    teamId: string
    userId: string
  }

  export type MemberTeamUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    team?: TeamUpdateOneRequiredWithoutMembersNestedInput
    user?: UserUpdateOneRequiredWithoutTeamMembershipsNestedInput
  }

  export type MemberTeamUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teamId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type MemberTeamCreateManyInput = {
    id?: string
    permission?: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    teamId: string
    userId: string
  }

  export type MemberTeamUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MemberTeamUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teamId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type KnowledgeCreateInput = {
    id?: string
    name: string
    description: string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedKnowledgeInput
    users?: UserCreateNestedManyWithoutKnowledgeInput
    teams?: TeamCreateNestedManyWithoutKnowledgeInput
    files?: FileCreateNestedManyWithoutKnowledgeInput
  }

  export type KnowledgeUncheckedCreateInput = {
    id?: string
    name: string
    description: string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    users?: UserUncheckedCreateNestedManyWithoutKnowledgeInput
    teams?: TeamUncheckedCreateNestedManyWithoutKnowledgeInput
    files?: FileUncheckedCreateNestedManyWithoutKnowledgeInput
  }

  export type KnowledgeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedKnowledgeNestedInput
    users?: UserUpdateManyWithoutKnowledgeNestedInput
    teams?: TeamUpdateManyWithoutKnowledgeNestedInput
    files?: FileUpdateManyWithoutKnowledgeNestedInput
  }

  export type KnowledgeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    users?: UserUncheckedUpdateManyWithoutKnowledgeNestedInput
    teams?: TeamUncheckedUpdateManyWithoutKnowledgeNestedInput
    files?: FileUncheckedUpdateManyWithoutKnowledgeNestedInput
  }

  export type KnowledgeCreateManyInput = {
    id?: string
    name: string
    description: string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
  }

  export type KnowledgeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type UserCreateInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamCreateNestedManyWithoutUserInput
    teams?: TeamCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentCreateNestedManyWithoutUserInput
    createdAgents?: AgentCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskCreateNestedManyWithoutCreatedByInput
    defaultLLMProvider?: LLMProviderCreateNestedOneWithoutUsersWithDefaultInput
    ownedLLMProviders?: LLMProviderCreateNestedManyWithoutUserOwnerInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    defaultLLMProviderId?: string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamUncheckedCreateNestedManyWithoutUserInput
    teams?: TeamUncheckedCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeUncheckedCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeUncheckedCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentUncheckedCreateNestedManyWithoutUserInput
    createdAgents?: AgentUncheckedCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskUncheckedCreateNestedManyWithoutCreatedByInput
    ownedLLMProviders?: LLMProviderUncheckedCreateNestedManyWithoutUserOwnerInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUpdateManyWithoutUserNestedInput
    teams?: TeamUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUpdateManyWithoutCreatedByNestedInput
    defaultLLMProvider?: LLMProviderUpdateOneWithoutUsersWithDefaultNestedInput
    ownedLLMProviders?: LLMProviderUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    defaultLLMProviderId?: NullableStringFieldUpdateOperationsInput | string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUncheckedUpdateManyWithoutUserNestedInput
    teams?: TeamUncheckedUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUncheckedUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUncheckedUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUncheckedUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUncheckedUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUncheckedUpdateManyWithoutCreatedByNestedInput
    ownedLLMProviders?: LLMProviderUncheckedUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    defaultLLMProviderId?: string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    defaultLLMProviderId?: NullableStringFieldUpdateOperationsInput | string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
  }

  export type FileCreateInput = {
    id?: string
    filename: string
    originalName: string
    path: string
    mimetype: string
    size: number
    content?: string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    parsingStatus?: string | null
    knowledge: KnowledgeCreateNestedOneWithoutFilesInput
    parsingTasks?: FileParsingTaskCreateNestedManyWithoutFileInput
    TextChunk?: TextChunkCreateNestedManyWithoutFileInput
  }

  export type FileUncheckedCreateInput = {
    id?: string
    filename: string
    originalName: string
    path: string
    mimetype: string
    size: number
    content?: string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    parsingStatus?: string | null
    knowledgeId: string
    parsingTasks?: FileParsingTaskUncheckedCreateNestedManyWithoutFileInput
    TextChunk?: TextChunkUncheckedCreateNestedManyWithoutFileInput
  }

  export type FileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    mimetype?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    content?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsingStatus?: NullableStringFieldUpdateOperationsInput | string | null
    knowledge?: KnowledgeUpdateOneRequiredWithoutFilesNestedInput
    parsingTasks?: FileParsingTaskUpdateManyWithoutFileNestedInput
    TextChunk?: TextChunkUpdateManyWithoutFileNestedInput
  }

  export type FileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    mimetype?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    content?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsingStatus?: NullableStringFieldUpdateOperationsInput | string | null
    knowledgeId?: StringFieldUpdateOperationsInput | string
    parsingTasks?: FileParsingTaskUncheckedUpdateManyWithoutFileNestedInput
    TextChunk?: TextChunkUncheckedUpdateManyWithoutFileNestedInput
  }

  export type FileCreateManyInput = {
    id?: string
    filename: string
    originalName: string
    path: string
    mimetype: string
    size: number
    content?: string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    parsingStatus?: string | null
    knowledgeId: string
  }

  export type FileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    mimetype?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    content?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsingStatus?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    mimetype?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    content?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsingStatus?: NullableStringFieldUpdateOperationsInput | string | null
    knowledgeId?: StringFieldUpdateOperationsInput | string
  }

  export type FileParsingTaskCreateInput = {
    id?: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    message?: string | null
    file: FileCreateNestedOneWithoutParsingTasksInput
    createdBy: UserCreateNestedOneWithoutFileParsingTaskInput
  }

  export type FileParsingTaskUncheckedCreateInput = {
    id?: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    message?: string | null
    fileId: string
    createdById: string
  }

  export type FileParsingTaskUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    file?: FileUpdateOneRequiredWithoutParsingTasksNestedInput
    createdBy?: UserUpdateOneRequiredWithoutFileParsingTaskNestedInput
  }

  export type FileParsingTaskUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    fileId?: StringFieldUpdateOperationsInput | string
    createdById?: StringFieldUpdateOperationsInput | string
  }

  export type FileParsingTaskCreateManyInput = {
    id?: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    message?: string | null
    fileId: string
    createdById: string
  }

  export type FileParsingTaskUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FileParsingTaskUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    fileId?: StringFieldUpdateOperationsInput | string
    createdById?: StringFieldUpdateOperationsInput | string
  }

  export type AgentCreateInput = {
    id?: string
    name: string
    description: string
    flowConfig: string
    isActive?: boolean
    ownerType: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedAgentsInput
    user?: UserCreateNestedOneWithoutOwnedAgentsInput
    team?: TeamCreateNestedOneWithoutOwnedAgentsInput
    conversations?: ConversationCreateNestedManyWithoutAgentInput
  }

  export type AgentUncheckedCreateInput = {
    id?: string
    name: string
    description: string
    flowConfig: string
    isActive?: boolean
    ownerType: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    userId?: string | null
    teamId?: string | null
    conversations?: ConversationUncheckedCreateNestedManyWithoutAgentInput
  }

  export type AgentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    flowConfig?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    ownerType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedAgentsNestedInput
    user?: UserUpdateOneWithoutOwnedAgentsNestedInput
    team?: TeamUpdateOneWithoutOwnedAgentsNestedInput
    conversations?: ConversationUpdateManyWithoutAgentNestedInput
  }

  export type AgentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    flowConfig?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    ownerType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    teamId?: NullableStringFieldUpdateOperationsInput | string | null
    conversations?: ConversationUncheckedUpdateManyWithoutAgentNestedInput
  }

  export type AgentCreateManyInput = {
    id?: string
    name: string
    description: string
    flowConfig: string
    isActive?: boolean
    ownerType: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    userId?: string | null
    teamId?: string | null
  }

  export type AgentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    flowConfig?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    ownerType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    flowConfig?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    ownerType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    teamId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TextChunkCreateInput = {
    id?: string
    content: string
    chunkIndex: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    vectorData?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    file: FileCreateNestedOneWithoutTextChunkInput
  }

  export type TextChunkUncheckedCreateInput = {
    id?: string
    fileId: string
    content: string
    chunkIndex: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    vectorData?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TextChunkUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    vectorData?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    file?: FileUpdateOneRequiredWithoutTextChunkNestedInput
  }

  export type TextChunkUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    vectorData?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TextChunkCreateManyInput = {
    id?: string
    fileId: string
    content: string
    chunkIndex: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    vectorData?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TextChunkUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    vectorData?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TextChunkUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    fileId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    vectorData?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LLMProviderCreateInput = {
    id?: string
    name?: string
    description?: string | null
    providerType: string
    endpointUrl: string
    isActive?: boolean
    isDefault?: boolean
    apiKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerType?: string
    config?: NullableJsonNullValueInput | InputJsonValue
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    models?: LLMModelCreateNestedManyWithoutProviderInput
    usersWithDefault?: UserCreateNestedManyWithoutDefaultLLMProviderInput
    userOwner?: UserCreateNestedOneWithoutOwnedLLMProvidersInput
    teamOwner?: TeamCreateNestedOneWithoutOwnedLLMProvidersInput
  }

  export type LLMProviderUncheckedCreateInput = {
    id?: string
    name?: string
    description?: string | null
    providerType: string
    endpointUrl: string
    isActive?: boolean
    isDefault?: boolean
    apiKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerType?: string
    config?: NullableJsonNullValueInput | InputJsonValue
    userOwnerId?: string | null
    teamOwnerId?: string | null
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    models?: LLMModelUncheckedCreateNestedManyWithoutProviderInput
    usersWithDefault?: UserUncheckedCreateNestedManyWithoutDefaultLLMProviderInput
  }

  export type LLMProviderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    providerType?: StringFieldUpdateOperationsInput | string
    endpointUrl?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerType?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    models?: LLMModelUpdateManyWithoutProviderNestedInput
    usersWithDefault?: UserUpdateManyWithoutDefaultLLMProviderNestedInput
    userOwner?: UserUpdateOneWithoutOwnedLLMProvidersNestedInput
    teamOwner?: TeamUpdateOneWithoutOwnedLLMProvidersNestedInput
  }

  export type LLMProviderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    providerType?: StringFieldUpdateOperationsInput | string
    endpointUrl?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerType?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    userOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    teamOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    models?: LLMModelUncheckedUpdateManyWithoutProviderNestedInput
    usersWithDefault?: UserUncheckedUpdateManyWithoutDefaultLLMProviderNestedInput
  }

  export type LLMProviderCreateManyInput = {
    id?: string
    name?: string
    description?: string | null
    providerType: string
    endpointUrl: string
    isActive?: boolean
    isDefault?: boolean
    apiKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerType?: string
    config?: NullableJsonNullValueInput | InputJsonValue
    userOwnerId?: string | null
    teamOwnerId?: string | null
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
  }

  export type LLMProviderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    providerType?: StringFieldUpdateOperationsInput | string
    endpointUrl?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerType?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
  }

  export type LLMProviderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    providerType?: StringFieldUpdateOperationsInput | string
    endpointUrl?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerType?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    userOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    teamOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
  }

  export type LLMModelCreateInput = {
    id?: string
    name: string
    displayName?: string | null
    description?: string | null
    modelType: string
    contextWindow?: number | null
    isActive?: boolean
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    config?: NullableJsonNullValueInput | InputJsonValue
    provider: LLMProviderCreateNestedOneWithoutModelsInput
  }

  export type LLMModelUncheckedCreateInput = {
    id?: string
    name: string
    displayName?: string | null
    description?: string | null
    modelType: string
    contextWindow?: number | null
    isActive?: boolean
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    config?: NullableJsonNullValueInput | InputJsonValue
    providerId: string
  }

  export type LLMModelUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    modelType?: StringFieldUpdateOperationsInput | string
    contextWindow?: NullableIntFieldUpdateOperationsInput | number | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    config?: NullableJsonNullValueInput | InputJsonValue
    provider?: LLMProviderUpdateOneRequiredWithoutModelsNestedInput
  }

  export type LLMModelUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    modelType?: StringFieldUpdateOperationsInput | string
    contextWindow?: NullableIntFieldUpdateOperationsInput | number | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    config?: NullableJsonNullValueInput | InputJsonValue
    providerId?: StringFieldUpdateOperationsInput | string
  }

  export type LLMModelCreateManyInput = {
    id?: string
    name: string
    displayName?: string | null
    description?: string | null
    modelType: string
    contextWindow?: number | null
    isActive?: boolean
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    config?: NullableJsonNullValueInput | InputJsonValue
    providerId: string
  }

  export type LLMModelUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    modelType?: StringFieldUpdateOperationsInput | string
    contextWindow?: NullableIntFieldUpdateOperationsInput | number | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type LLMModelUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    modelType?: StringFieldUpdateOperationsInput | string
    contextWindow?: NullableIntFieldUpdateOperationsInput | number | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    config?: NullableJsonNullValueInput | InputJsonValue
    providerId?: StringFieldUpdateOperationsInput | string
  }

  export type ConversationCreateInput = {
    id?: string
    title?: string | null
    flowState: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastMessageAt?: Date | string
    agent: AgentCreateNestedOneWithoutConversationsInput
    messages?: ConversationMessageCreateNestedManyWithoutConversationInput
  }

  export type ConversationUncheckedCreateInput = {
    id?: string
    title?: string | null
    agentId: string
    flowState: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastMessageAt?: Date | string
    messages?: ConversationMessageUncheckedCreateNestedManyWithoutConversationInput
  }

  export type ConversationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    flowState?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastMessageAt?: DateTimeFieldUpdateOperationsInput | Date | string
    agent?: AgentUpdateOneRequiredWithoutConversationsNestedInput
    messages?: ConversationMessageUpdateManyWithoutConversationNestedInput
  }

  export type ConversationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    agentId?: StringFieldUpdateOperationsInput | string
    flowState?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastMessageAt?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: ConversationMessageUncheckedUpdateManyWithoutConversationNestedInput
  }

  export type ConversationCreateManyInput = {
    id?: string
    title?: string | null
    agentId: string
    flowState: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastMessageAt?: Date | string
  }

  export type ConversationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    flowState?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastMessageAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    agentId?: StringFieldUpdateOperationsInput | string
    flowState?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastMessageAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationMessageCreateInput = {
    id?: string
    content: string
    role: string
    timestamp?: Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    nodeId?: string | null
    nodeType?: string | null
    conversation: ConversationCreateNestedOneWithoutMessagesInput
  }

  export type ConversationMessageUncheckedCreateInput = {
    id?: string
    conversationId: string
    content: string
    role: string
    timestamp?: Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    nodeId?: string | null
    nodeType?: string | null
  }

  export type ConversationMessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    nodeId?: NullableStringFieldUpdateOperationsInput | string | null
    nodeType?: NullableStringFieldUpdateOperationsInput | string | null
    conversation?: ConversationUpdateOneRequiredWithoutMessagesNestedInput
  }

  export type ConversationMessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    conversationId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    nodeId?: NullableStringFieldUpdateOperationsInput | string | null
    nodeType?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ConversationMessageCreateManyInput = {
    id?: string
    conversationId: string
    content: string
    role: string
    timestamp?: Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    nodeId?: string | null
    nodeType?: string | null
  }

  export type ConversationMessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    nodeId?: NullableStringFieldUpdateOperationsInput | string | null
    nodeType?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ConversationMessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    conversationId?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    nodeId?: NullableStringFieldUpdateOperationsInput | string | null
    nodeType?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type MemberTeamListRelationFilter = {
    every?: MemberTeamWhereInput
    some?: MemberTeamWhereInput
    none?: MemberTeamWhereInput
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type KnowledgeListRelationFilter = {
    every?: KnowledgeWhereInput
    some?: KnowledgeWhereInput
    none?: KnowledgeWhereInput
  }

  export type AgentListRelationFilter = {
    every?: AgentWhereInput
    some?: AgentWhereInput
    none?: AgentWhereInput
  }

  export type LLMProviderListRelationFilter = {
    every?: LLMProviderWhereInput
    some?: LLMProviderWhereInput
    none?: LLMProviderWhereInput
  }

  export type MemberTeamOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type KnowledgeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AgentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LLMProviderOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TeamCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
  }

  export type TeamMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
  }

  export type TeamMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
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

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type TeamScalarRelationFilter = {
    is?: TeamWhereInput
    isNot?: TeamWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type MemberTeamUserIdTeamIdCompoundUniqueInput = {
    userId: string
    teamId: string
  }

  export type MemberTeamCountOrderByAggregateInput = {
    id?: SortOrder
    permission?: SortOrder
    joinedAt?: SortOrder
    leftAt?: SortOrder
    teamId?: SortOrder
    userId?: SortOrder
  }

  export type MemberTeamMaxOrderByAggregateInput = {
    id?: SortOrder
    permission?: SortOrder
    joinedAt?: SortOrder
    leftAt?: SortOrder
    teamId?: SortOrder
    userId?: SortOrder
  }

  export type MemberTeamMinOrderByAggregateInput = {
    id?: SortOrder
    permission?: SortOrder
    joinedAt?: SortOrder
    leftAt?: SortOrder
    teamId?: SortOrder
    userId?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type TeamListRelationFilter = {
    every?: TeamWhereInput
    some?: TeamWhereInput
    none?: TeamWhereInput
  }

  export type FileListRelationFilter = {
    every?: FileWhereInput
    some?: FileWhereInput
    none?: FileWhereInput
  }

  export type TeamOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FileOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type KnowledgeCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type KnowledgeMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }

  export type KnowledgeMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type FileParsingTaskListRelationFilter = {
    every?: FileParsingTaskWhereInput
    some?: FileParsingTaskWhereInput
    none?: FileParsingTaskWhereInput
  }

  export type LLMProviderNullableScalarRelationFilter = {
    is?: LLMProviderWhereInput | null
    isNot?: LLMProviderWhereInput | null
  }

  export type FileParsingTaskOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    password?: SortOrder
    email?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    permission?: SortOrder
    defaultLLMProviderId?: SortOrder
    llmPreferences?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    password?: SortOrder
    email?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    permission?: SortOrder
    defaultLLMProviderId?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    password?: SortOrder
    email?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    permission?: SortOrder
    defaultLLMProviderId?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
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

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type KnowledgeScalarRelationFilter = {
    is?: KnowledgeWhereInput
    isNot?: KnowledgeWhereInput
  }

  export type TextChunkListRelationFilter = {
    every?: TextChunkWhereInput
    some?: TextChunkWhereInput
    none?: TextChunkWhereInput
  }

  export type TextChunkOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FileCountOrderByAggregateInput = {
    id?: SortOrder
    filename?: SortOrder
    originalName?: SortOrder
    path?: SortOrder
    mimetype?: SortOrder
    size?: SortOrder
    content?: SortOrder
    config?: SortOrder
    createdAt?: SortOrder
    parsingStatus?: SortOrder
    knowledgeId?: SortOrder
  }

  export type FileAvgOrderByAggregateInput = {
    size?: SortOrder
  }

  export type FileMaxOrderByAggregateInput = {
    id?: SortOrder
    filename?: SortOrder
    originalName?: SortOrder
    path?: SortOrder
    mimetype?: SortOrder
    size?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    parsingStatus?: SortOrder
    knowledgeId?: SortOrder
  }

  export type FileMinOrderByAggregateInput = {
    id?: SortOrder
    filename?: SortOrder
    originalName?: SortOrder
    path?: SortOrder
    mimetype?: SortOrder
    size?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    parsingStatus?: SortOrder
    knowledgeId?: SortOrder
  }

  export type FileSumOrderByAggregateInput = {
    size?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type FileScalarRelationFilter = {
    is?: FileWhereInput
    isNot?: FileWhereInput
  }

  export type FileParsingTaskCountOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    completedAt?: SortOrder
    message?: SortOrder
    fileId?: SortOrder
    createdById?: SortOrder
  }

  export type FileParsingTaskMaxOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    completedAt?: SortOrder
    message?: SortOrder
    fileId?: SortOrder
    createdById?: SortOrder
  }

  export type FileParsingTaskMinOrderByAggregateInput = {
    id?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    completedAt?: SortOrder
    message?: SortOrder
    fileId?: SortOrder
    createdById?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type TeamNullableScalarRelationFilter = {
    is?: TeamWhereInput | null
    isNot?: TeamWhereInput | null
  }

  export type ConversationListRelationFilter = {
    every?: ConversationWhereInput
    some?: ConversationWhereInput
    none?: ConversationWhereInput
  }

  export type ConversationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AgentCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    flowConfig?: SortOrder
    isActive?: SortOrder
    ownerType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
    userId?: SortOrder
    teamId?: SortOrder
  }

  export type AgentMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    flowConfig?: SortOrder
    isActive?: SortOrder
    ownerType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
    userId?: SortOrder
    teamId?: SortOrder
  }

  export type AgentMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    flowConfig?: SortOrder
    isActive?: SortOrder
    ownerType?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdById?: SortOrder
    userId?: SortOrder
    teamId?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type TextChunkCountOrderByAggregateInput = {
    id?: SortOrder
    fileId?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    metadata?: SortOrder
    vectorData?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TextChunkAvgOrderByAggregateInput = {
    chunkIndex?: SortOrder
  }

  export type TextChunkMaxOrderByAggregateInput = {
    id?: SortOrder
    fileId?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    vectorData?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TextChunkMinOrderByAggregateInput = {
    id?: SortOrder
    fileId?: SortOrder
    content?: SortOrder
    chunkIndex?: SortOrder
    vectorData?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TextChunkSumOrderByAggregateInput = {
    chunkIndex?: SortOrder
  }

  export type LLMModelListRelationFilter = {
    every?: LLMModelWhereInput
    some?: LLMModelWhereInput
    none?: LLMModelWhereInput
  }

  export type LLMModelOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LLMProviderCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    providerType?: SortOrder
    endpointUrl?: SortOrder
    isActive?: SortOrder
    isDefault?: SortOrder
    apiKey?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ownerType?: SortOrder
    config?: SortOrder
    userOwnerId?: SortOrder
    teamOwnerId?: SortOrder
    permissionSettings?: SortOrder
  }

  export type LLMProviderMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    providerType?: SortOrder
    endpointUrl?: SortOrder
    isActive?: SortOrder
    isDefault?: SortOrder
    apiKey?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ownerType?: SortOrder
    userOwnerId?: SortOrder
    teamOwnerId?: SortOrder
  }

  export type LLMProviderMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    providerType?: SortOrder
    endpointUrl?: SortOrder
    isActive?: SortOrder
    isDefault?: SortOrder
    apiKey?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ownerType?: SortOrder
    userOwnerId?: SortOrder
    teamOwnerId?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type LLMProviderScalarRelationFilter = {
    is?: LLMProviderWhereInput
    isNot?: LLMProviderWhereInput
  }

  export type LLMModelCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    displayName?: SortOrder
    description?: SortOrder
    modelType?: SortOrder
    contextWindow?: SortOrder
    isActive?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    config?: SortOrder
    providerId?: SortOrder
  }

  export type LLMModelAvgOrderByAggregateInput = {
    contextWindow?: SortOrder
  }

  export type LLMModelMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    displayName?: SortOrder
    description?: SortOrder
    modelType?: SortOrder
    contextWindow?: SortOrder
    isActive?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    providerId?: SortOrder
  }

  export type LLMModelMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    displayName?: SortOrder
    description?: SortOrder
    modelType?: SortOrder
    contextWindow?: SortOrder
    isActive?: SortOrder
    isDefault?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    providerId?: SortOrder
  }

  export type LLMModelSumOrderByAggregateInput = {
    contextWindow?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type AgentScalarRelationFilter = {
    is?: AgentWhereInput
    isNot?: AgentWhereInput
  }

  export type ConversationMessageListRelationFilter = {
    every?: ConversationMessageWhereInput
    some?: ConversationMessageWhereInput
    none?: ConversationMessageWhereInput
  }

  export type ConversationMessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ConversationCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    agentId?: SortOrder
    flowState?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastMessageAt?: SortOrder
  }

  export type ConversationMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    agentId?: SortOrder
    flowState?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastMessageAt?: SortOrder
  }

  export type ConversationMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    agentId?: SortOrder
    flowState?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastMessageAt?: SortOrder
  }

  export type ConversationScalarRelationFilter = {
    is?: ConversationWhereInput
    isNot?: ConversationWhereInput
  }

  export type ConversationMessageCountOrderByAggregateInput = {
    id?: SortOrder
    conversationId?: SortOrder
    content?: SortOrder
    role?: SortOrder
    timestamp?: SortOrder
    metadata?: SortOrder
    nodeId?: SortOrder
    nodeType?: SortOrder
  }

  export type ConversationMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    conversationId?: SortOrder
    content?: SortOrder
    role?: SortOrder
    timestamp?: SortOrder
    nodeId?: SortOrder
    nodeType?: SortOrder
  }

  export type ConversationMessageMinOrderByAggregateInput = {
    id?: SortOrder
    conversationId?: SortOrder
    content?: SortOrder
    role?: SortOrder
    timestamp?: SortOrder
    nodeId?: SortOrder
    nodeType?: SortOrder
  }

  export type UserCreateNestedOneWithoutCreatedTeamsInput = {
    create?: XOR<UserCreateWithoutCreatedTeamsInput, UserUncheckedCreateWithoutCreatedTeamsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedTeamsInput
    connect?: UserWhereUniqueInput
  }

  export type MemberTeamCreateNestedManyWithoutTeamInput = {
    create?: XOR<MemberTeamCreateWithoutTeamInput, MemberTeamUncheckedCreateWithoutTeamInput> | MemberTeamCreateWithoutTeamInput[] | MemberTeamUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: MemberTeamCreateOrConnectWithoutTeamInput | MemberTeamCreateOrConnectWithoutTeamInput[]
    createMany?: MemberTeamCreateManyTeamInputEnvelope
    connect?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
  }

  export type UserCreateNestedManyWithoutTeamsInput = {
    create?: XOR<UserCreateWithoutTeamsInput, UserUncheckedCreateWithoutTeamsInput> | UserCreateWithoutTeamsInput[] | UserUncheckedCreateWithoutTeamsInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTeamsInput | UserCreateOrConnectWithoutTeamsInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type KnowledgeCreateNestedManyWithoutTeamsInput = {
    create?: XOR<KnowledgeCreateWithoutTeamsInput, KnowledgeUncheckedCreateWithoutTeamsInput> | KnowledgeCreateWithoutTeamsInput[] | KnowledgeUncheckedCreateWithoutTeamsInput[]
    connectOrCreate?: KnowledgeCreateOrConnectWithoutTeamsInput | KnowledgeCreateOrConnectWithoutTeamsInput[]
    connect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
  }

  export type AgentCreateNestedManyWithoutTeamInput = {
    create?: XOR<AgentCreateWithoutTeamInput, AgentUncheckedCreateWithoutTeamInput> | AgentCreateWithoutTeamInput[] | AgentUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: AgentCreateOrConnectWithoutTeamInput | AgentCreateOrConnectWithoutTeamInput[]
    createMany?: AgentCreateManyTeamInputEnvelope
    connect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
  }

  export type LLMProviderCreateNestedManyWithoutTeamOwnerInput = {
    create?: XOR<LLMProviderCreateWithoutTeamOwnerInput, LLMProviderUncheckedCreateWithoutTeamOwnerInput> | LLMProviderCreateWithoutTeamOwnerInput[] | LLMProviderUncheckedCreateWithoutTeamOwnerInput[]
    connectOrCreate?: LLMProviderCreateOrConnectWithoutTeamOwnerInput | LLMProviderCreateOrConnectWithoutTeamOwnerInput[]
    createMany?: LLMProviderCreateManyTeamOwnerInputEnvelope
    connect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
  }

  export type MemberTeamUncheckedCreateNestedManyWithoutTeamInput = {
    create?: XOR<MemberTeamCreateWithoutTeamInput, MemberTeamUncheckedCreateWithoutTeamInput> | MemberTeamCreateWithoutTeamInput[] | MemberTeamUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: MemberTeamCreateOrConnectWithoutTeamInput | MemberTeamCreateOrConnectWithoutTeamInput[]
    createMany?: MemberTeamCreateManyTeamInputEnvelope
    connect?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutTeamsInput = {
    create?: XOR<UserCreateWithoutTeamsInput, UserUncheckedCreateWithoutTeamsInput> | UserCreateWithoutTeamsInput[] | UserUncheckedCreateWithoutTeamsInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTeamsInput | UserCreateOrConnectWithoutTeamsInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type KnowledgeUncheckedCreateNestedManyWithoutTeamsInput = {
    create?: XOR<KnowledgeCreateWithoutTeamsInput, KnowledgeUncheckedCreateWithoutTeamsInput> | KnowledgeCreateWithoutTeamsInput[] | KnowledgeUncheckedCreateWithoutTeamsInput[]
    connectOrCreate?: KnowledgeCreateOrConnectWithoutTeamsInput | KnowledgeCreateOrConnectWithoutTeamsInput[]
    connect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
  }

  export type AgentUncheckedCreateNestedManyWithoutTeamInput = {
    create?: XOR<AgentCreateWithoutTeamInput, AgentUncheckedCreateWithoutTeamInput> | AgentCreateWithoutTeamInput[] | AgentUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: AgentCreateOrConnectWithoutTeamInput | AgentCreateOrConnectWithoutTeamInput[]
    createMany?: AgentCreateManyTeamInputEnvelope
    connect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
  }

  export type LLMProviderUncheckedCreateNestedManyWithoutTeamOwnerInput = {
    create?: XOR<LLMProviderCreateWithoutTeamOwnerInput, LLMProviderUncheckedCreateWithoutTeamOwnerInput> | LLMProviderCreateWithoutTeamOwnerInput[] | LLMProviderUncheckedCreateWithoutTeamOwnerInput[]
    connectOrCreate?: LLMProviderCreateOrConnectWithoutTeamOwnerInput | LLMProviderCreateOrConnectWithoutTeamOwnerInput[]
    createMany?: LLMProviderCreateManyTeamOwnerInputEnvelope
    connect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateOneRequiredWithoutCreatedTeamsNestedInput = {
    create?: XOR<UserCreateWithoutCreatedTeamsInput, UserUncheckedCreateWithoutCreatedTeamsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedTeamsInput
    upsert?: UserUpsertWithoutCreatedTeamsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCreatedTeamsInput, UserUpdateWithoutCreatedTeamsInput>, UserUncheckedUpdateWithoutCreatedTeamsInput>
  }

  export type MemberTeamUpdateManyWithoutTeamNestedInput = {
    create?: XOR<MemberTeamCreateWithoutTeamInput, MemberTeamUncheckedCreateWithoutTeamInput> | MemberTeamCreateWithoutTeamInput[] | MemberTeamUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: MemberTeamCreateOrConnectWithoutTeamInput | MemberTeamCreateOrConnectWithoutTeamInput[]
    upsert?: MemberTeamUpsertWithWhereUniqueWithoutTeamInput | MemberTeamUpsertWithWhereUniqueWithoutTeamInput[]
    createMany?: MemberTeamCreateManyTeamInputEnvelope
    set?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
    disconnect?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
    delete?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
    connect?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
    update?: MemberTeamUpdateWithWhereUniqueWithoutTeamInput | MemberTeamUpdateWithWhereUniqueWithoutTeamInput[]
    updateMany?: MemberTeamUpdateManyWithWhereWithoutTeamInput | MemberTeamUpdateManyWithWhereWithoutTeamInput[]
    deleteMany?: MemberTeamScalarWhereInput | MemberTeamScalarWhereInput[]
  }

  export type UserUpdateManyWithoutTeamsNestedInput = {
    create?: XOR<UserCreateWithoutTeamsInput, UserUncheckedCreateWithoutTeamsInput> | UserCreateWithoutTeamsInput[] | UserUncheckedCreateWithoutTeamsInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTeamsInput | UserCreateOrConnectWithoutTeamsInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutTeamsInput | UserUpsertWithWhereUniqueWithoutTeamsInput[]
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutTeamsInput | UserUpdateWithWhereUniqueWithoutTeamsInput[]
    updateMany?: UserUpdateManyWithWhereWithoutTeamsInput | UserUpdateManyWithWhereWithoutTeamsInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type KnowledgeUpdateManyWithoutTeamsNestedInput = {
    create?: XOR<KnowledgeCreateWithoutTeamsInput, KnowledgeUncheckedCreateWithoutTeamsInput> | KnowledgeCreateWithoutTeamsInput[] | KnowledgeUncheckedCreateWithoutTeamsInput[]
    connectOrCreate?: KnowledgeCreateOrConnectWithoutTeamsInput | KnowledgeCreateOrConnectWithoutTeamsInput[]
    upsert?: KnowledgeUpsertWithWhereUniqueWithoutTeamsInput | KnowledgeUpsertWithWhereUniqueWithoutTeamsInput[]
    set?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    disconnect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    delete?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    connect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    update?: KnowledgeUpdateWithWhereUniqueWithoutTeamsInput | KnowledgeUpdateWithWhereUniqueWithoutTeamsInput[]
    updateMany?: KnowledgeUpdateManyWithWhereWithoutTeamsInput | KnowledgeUpdateManyWithWhereWithoutTeamsInput[]
    deleteMany?: KnowledgeScalarWhereInput | KnowledgeScalarWhereInput[]
  }

  export type AgentUpdateManyWithoutTeamNestedInput = {
    create?: XOR<AgentCreateWithoutTeamInput, AgentUncheckedCreateWithoutTeamInput> | AgentCreateWithoutTeamInput[] | AgentUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: AgentCreateOrConnectWithoutTeamInput | AgentCreateOrConnectWithoutTeamInput[]
    upsert?: AgentUpsertWithWhereUniqueWithoutTeamInput | AgentUpsertWithWhereUniqueWithoutTeamInput[]
    createMany?: AgentCreateManyTeamInputEnvelope
    set?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    disconnect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    delete?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    connect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    update?: AgentUpdateWithWhereUniqueWithoutTeamInput | AgentUpdateWithWhereUniqueWithoutTeamInput[]
    updateMany?: AgentUpdateManyWithWhereWithoutTeamInput | AgentUpdateManyWithWhereWithoutTeamInput[]
    deleteMany?: AgentScalarWhereInput | AgentScalarWhereInput[]
  }

  export type LLMProviderUpdateManyWithoutTeamOwnerNestedInput = {
    create?: XOR<LLMProviderCreateWithoutTeamOwnerInput, LLMProviderUncheckedCreateWithoutTeamOwnerInput> | LLMProviderCreateWithoutTeamOwnerInput[] | LLMProviderUncheckedCreateWithoutTeamOwnerInput[]
    connectOrCreate?: LLMProviderCreateOrConnectWithoutTeamOwnerInput | LLMProviderCreateOrConnectWithoutTeamOwnerInput[]
    upsert?: LLMProviderUpsertWithWhereUniqueWithoutTeamOwnerInput | LLMProviderUpsertWithWhereUniqueWithoutTeamOwnerInput[]
    createMany?: LLMProviderCreateManyTeamOwnerInputEnvelope
    set?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    disconnect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    delete?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    connect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    update?: LLMProviderUpdateWithWhereUniqueWithoutTeamOwnerInput | LLMProviderUpdateWithWhereUniqueWithoutTeamOwnerInput[]
    updateMany?: LLMProviderUpdateManyWithWhereWithoutTeamOwnerInput | LLMProviderUpdateManyWithWhereWithoutTeamOwnerInput[]
    deleteMany?: LLMProviderScalarWhereInput | LLMProviderScalarWhereInput[]
  }

  export type MemberTeamUncheckedUpdateManyWithoutTeamNestedInput = {
    create?: XOR<MemberTeamCreateWithoutTeamInput, MemberTeamUncheckedCreateWithoutTeamInput> | MemberTeamCreateWithoutTeamInput[] | MemberTeamUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: MemberTeamCreateOrConnectWithoutTeamInput | MemberTeamCreateOrConnectWithoutTeamInput[]
    upsert?: MemberTeamUpsertWithWhereUniqueWithoutTeamInput | MemberTeamUpsertWithWhereUniqueWithoutTeamInput[]
    createMany?: MemberTeamCreateManyTeamInputEnvelope
    set?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
    disconnect?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
    delete?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
    connect?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
    update?: MemberTeamUpdateWithWhereUniqueWithoutTeamInput | MemberTeamUpdateWithWhereUniqueWithoutTeamInput[]
    updateMany?: MemberTeamUpdateManyWithWhereWithoutTeamInput | MemberTeamUpdateManyWithWhereWithoutTeamInput[]
    deleteMany?: MemberTeamScalarWhereInput | MemberTeamScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutTeamsNestedInput = {
    create?: XOR<UserCreateWithoutTeamsInput, UserUncheckedCreateWithoutTeamsInput> | UserCreateWithoutTeamsInput[] | UserUncheckedCreateWithoutTeamsInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTeamsInput | UserCreateOrConnectWithoutTeamsInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutTeamsInput | UserUpsertWithWhereUniqueWithoutTeamsInput[]
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutTeamsInput | UserUpdateWithWhereUniqueWithoutTeamsInput[]
    updateMany?: UserUpdateManyWithWhereWithoutTeamsInput | UserUpdateManyWithWhereWithoutTeamsInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type KnowledgeUncheckedUpdateManyWithoutTeamsNestedInput = {
    create?: XOR<KnowledgeCreateWithoutTeamsInput, KnowledgeUncheckedCreateWithoutTeamsInput> | KnowledgeCreateWithoutTeamsInput[] | KnowledgeUncheckedCreateWithoutTeamsInput[]
    connectOrCreate?: KnowledgeCreateOrConnectWithoutTeamsInput | KnowledgeCreateOrConnectWithoutTeamsInput[]
    upsert?: KnowledgeUpsertWithWhereUniqueWithoutTeamsInput | KnowledgeUpsertWithWhereUniqueWithoutTeamsInput[]
    set?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    disconnect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    delete?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    connect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    update?: KnowledgeUpdateWithWhereUniqueWithoutTeamsInput | KnowledgeUpdateWithWhereUniqueWithoutTeamsInput[]
    updateMany?: KnowledgeUpdateManyWithWhereWithoutTeamsInput | KnowledgeUpdateManyWithWhereWithoutTeamsInput[]
    deleteMany?: KnowledgeScalarWhereInput | KnowledgeScalarWhereInput[]
  }

  export type AgentUncheckedUpdateManyWithoutTeamNestedInput = {
    create?: XOR<AgentCreateWithoutTeamInput, AgentUncheckedCreateWithoutTeamInput> | AgentCreateWithoutTeamInput[] | AgentUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: AgentCreateOrConnectWithoutTeamInput | AgentCreateOrConnectWithoutTeamInput[]
    upsert?: AgentUpsertWithWhereUniqueWithoutTeamInput | AgentUpsertWithWhereUniqueWithoutTeamInput[]
    createMany?: AgentCreateManyTeamInputEnvelope
    set?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    disconnect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    delete?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    connect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    update?: AgentUpdateWithWhereUniqueWithoutTeamInput | AgentUpdateWithWhereUniqueWithoutTeamInput[]
    updateMany?: AgentUpdateManyWithWhereWithoutTeamInput | AgentUpdateManyWithWhereWithoutTeamInput[]
    deleteMany?: AgentScalarWhereInput | AgentScalarWhereInput[]
  }

  export type LLMProviderUncheckedUpdateManyWithoutTeamOwnerNestedInput = {
    create?: XOR<LLMProviderCreateWithoutTeamOwnerInput, LLMProviderUncheckedCreateWithoutTeamOwnerInput> | LLMProviderCreateWithoutTeamOwnerInput[] | LLMProviderUncheckedCreateWithoutTeamOwnerInput[]
    connectOrCreate?: LLMProviderCreateOrConnectWithoutTeamOwnerInput | LLMProviderCreateOrConnectWithoutTeamOwnerInput[]
    upsert?: LLMProviderUpsertWithWhereUniqueWithoutTeamOwnerInput | LLMProviderUpsertWithWhereUniqueWithoutTeamOwnerInput[]
    createMany?: LLMProviderCreateManyTeamOwnerInputEnvelope
    set?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    disconnect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    delete?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    connect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    update?: LLMProviderUpdateWithWhereUniqueWithoutTeamOwnerInput | LLMProviderUpdateWithWhereUniqueWithoutTeamOwnerInput[]
    updateMany?: LLMProviderUpdateManyWithWhereWithoutTeamOwnerInput | LLMProviderUpdateManyWithWhereWithoutTeamOwnerInput[]
    deleteMany?: LLMProviderScalarWhereInput | LLMProviderScalarWhereInput[]
  }

  export type TeamCreateNestedOneWithoutMembersInput = {
    create?: XOR<TeamCreateWithoutMembersInput, TeamUncheckedCreateWithoutMembersInput>
    connectOrCreate?: TeamCreateOrConnectWithoutMembersInput
    connect?: TeamWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutTeamMembershipsInput = {
    create?: XOR<UserCreateWithoutTeamMembershipsInput, UserUncheckedCreateWithoutTeamMembershipsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTeamMembershipsInput
    connect?: UserWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type TeamUpdateOneRequiredWithoutMembersNestedInput = {
    create?: XOR<TeamCreateWithoutMembersInput, TeamUncheckedCreateWithoutMembersInput>
    connectOrCreate?: TeamCreateOrConnectWithoutMembersInput
    upsert?: TeamUpsertWithoutMembersInput
    connect?: TeamWhereUniqueInput
    update?: XOR<XOR<TeamUpdateToOneWithWhereWithoutMembersInput, TeamUpdateWithoutMembersInput>, TeamUncheckedUpdateWithoutMembersInput>
  }

  export type UserUpdateOneRequiredWithoutTeamMembershipsNestedInput = {
    create?: XOR<UserCreateWithoutTeamMembershipsInput, UserUncheckedCreateWithoutTeamMembershipsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTeamMembershipsInput
    upsert?: UserUpsertWithoutTeamMembershipsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTeamMembershipsInput, UserUpdateWithoutTeamMembershipsInput>, UserUncheckedUpdateWithoutTeamMembershipsInput>
  }

  export type UserCreateNestedOneWithoutCreatedKnowledgeInput = {
    create?: XOR<UserCreateWithoutCreatedKnowledgeInput, UserUncheckedCreateWithoutCreatedKnowledgeInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedKnowledgeInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedManyWithoutKnowledgeInput = {
    create?: XOR<UserCreateWithoutKnowledgeInput, UserUncheckedCreateWithoutKnowledgeInput> | UserCreateWithoutKnowledgeInput[] | UserUncheckedCreateWithoutKnowledgeInput[]
    connectOrCreate?: UserCreateOrConnectWithoutKnowledgeInput | UserCreateOrConnectWithoutKnowledgeInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type TeamCreateNestedManyWithoutKnowledgeInput = {
    create?: XOR<TeamCreateWithoutKnowledgeInput, TeamUncheckedCreateWithoutKnowledgeInput> | TeamCreateWithoutKnowledgeInput[] | TeamUncheckedCreateWithoutKnowledgeInput[]
    connectOrCreate?: TeamCreateOrConnectWithoutKnowledgeInput | TeamCreateOrConnectWithoutKnowledgeInput[]
    connect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
  }

  export type FileCreateNestedManyWithoutKnowledgeInput = {
    create?: XOR<FileCreateWithoutKnowledgeInput, FileUncheckedCreateWithoutKnowledgeInput> | FileCreateWithoutKnowledgeInput[] | FileUncheckedCreateWithoutKnowledgeInput[]
    connectOrCreate?: FileCreateOrConnectWithoutKnowledgeInput | FileCreateOrConnectWithoutKnowledgeInput[]
    createMany?: FileCreateManyKnowledgeInputEnvelope
    connect?: FileWhereUniqueInput | FileWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutKnowledgeInput = {
    create?: XOR<UserCreateWithoutKnowledgeInput, UserUncheckedCreateWithoutKnowledgeInput> | UserCreateWithoutKnowledgeInput[] | UserUncheckedCreateWithoutKnowledgeInput[]
    connectOrCreate?: UserCreateOrConnectWithoutKnowledgeInput | UserCreateOrConnectWithoutKnowledgeInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type TeamUncheckedCreateNestedManyWithoutKnowledgeInput = {
    create?: XOR<TeamCreateWithoutKnowledgeInput, TeamUncheckedCreateWithoutKnowledgeInput> | TeamCreateWithoutKnowledgeInput[] | TeamUncheckedCreateWithoutKnowledgeInput[]
    connectOrCreate?: TeamCreateOrConnectWithoutKnowledgeInput | TeamCreateOrConnectWithoutKnowledgeInput[]
    connect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
  }

  export type FileUncheckedCreateNestedManyWithoutKnowledgeInput = {
    create?: XOR<FileCreateWithoutKnowledgeInput, FileUncheckedCreateWithoutKnowledgeInput> | FileCreateWithoutKnowledgeInput[] | FileUncheckedCreateWithoutKnowledgeInput[]
    connectOrCreate?: FileCreateOrConnectWithoutKnowledgeInput | FileCreateOrConnectWithoutKnowledgeInput[]
    createMany?: FileCreateManyKnowledgeInputEnvelope
    connect?: FileWhereUniqueInput | FileWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutCreatedKnowledgeNestedInput = {
    create?: XOR<UserCreateWithoutCreatedKnowledgeInput, UserUncheckedCreateWithoutCreatedKnowledgeInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedKnowledgeInput
    upsert?: UserUpsertWithoutCreatedKnowledgeInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCreatedKnowledgeInput, UserUpdateWithoutCreatedKnowledgeInput>, UserUncheckedUpdateWithoutCreatedKnowledgeInput>
  }

  export type UserUpdateManyWithoutKnowledgeNestedInput = {
    create?: XOR<UserCreateWithoutKnowledgeInput, UserUncheckedCreateWithoutKnowledgeInput> | UserCreateWithoutKnowledgeInput[] | UserUncheckedCreateWithoutKnowledgeInput[]
    connectOrCreate?: UserCreateOrConnectWithoutKnowledgeInput | UserCreateOrConnectWithoutKnowledgeInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutKnowledgeInput | UserUpsertWithWhereUniqueWithoutKnowledgeInput[]
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutKnowledgeInput | UserUpdateWithWhereUniqueWithoutKnowledgeInput[]
    updateMany?: UserUpdateManyWithWhereWithoutKnowledgeInput | UserUpdateManyWithWhereWithoutKnowledgeInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type TeamUpdateManyWithoutKnowledgeNestedInput = {
    create?: XOR<TeamCreateWithoutKnowledgeInput, TeamUncheckedCreateWithoutKnowledgeInput> | TeamCreateWithoutKnowledgeInput[] | TeamUncheckedCreateWithoutKnowledgeInput[]
    connectOrCreate?: TeamCreateOrConnectWithoutKnowledgeInput | TeamCreateOrConnectWithoutKnowledgeInput[]
    upsert?: TeamUpsertWithWhereUniqueWithoutKnowledgeInput | TeamUpsertWithWhereUniqueWithoutKnowledgeInput[]
    set?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    disconnect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    delete?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    connect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    update?: TeamUpdateWithWhereUniqueWithoutKnowledgeInput | TeamUpdateWithWhereUniqueWithoutKnowledgeInput[]
    updateMany?: TeamUpdateManyWithWhereWithoutKnowledgeInput | TeamUpdateManyWithWhereWithoutKnowledgeInput[]
    deleteMany?: TeamScalarWhereInput | TeamScalarWhereInput[]
  }

  export type FileUpdateManyWithoutKnowledgeNestedInput = {
    create?: XOR<FileCreateWithoutKnowledgeInput, FileUncheckedCreateWithoutKnowledgeInput> | FileCreateWithoutKnowledgeInput[] | FileUncheckedCreateWithoutKnowledgeInput[]
    connectOrCreate?: FileCreateOrConnectWithoutKnowledgeInput | FileCreateOrConnectWithoutKnowledgeInput[]
    upsert?: FileUpsertWithWhereUniqueWithoutKnowledgeInput | FileUpsertWithWhereUniqueWithoutKnowledgeInput[]
    createMany?: FileCreateManyKnowledgeInputEnvelope
    set?: FileWhereUniqueInput | FileWhereUniqueInput[]
    disconnect?: FileWhereUniqueInput | FileWhereUniqueInput[]
    delete?: FileWhereUniqueInput | FileWhereUniqueInput[]
    connect?: FileWhereUniqueInput | FileWhereUniqueInput[]
    update?: FileUpdateWithWhereUniqueWithoutKnowledgeInput | FileUpdateWithWhereUniqueWithoutKnowledgeInput[]
    updateMany?: FileUpdateManyWithWhereWithoutKnowledgeInput | FileUpdateManyWithWhereWithoutKnowledgeInput[]
    deleteMany?: FileScalarWhereInput | FileScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutKnowledgeNestedInput = {
    create?: XOR<UserCreateWithoutKnowledgeInput, UserUncheckedCreateWithoutKnowledgeInput> | UserCreateWithoutKnowledgeInput[] | UserUncheckedCreateWithoutKnowledgeInput[]
    connectOrCreate?: UserCreateOrConnectWithoutKnowledgeInput | UserCreateOrConnectWithoutKnowledgeInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutKnowledgeInput | UserUpsertWithWhereUniqueWithoutKnowledgeInput[]
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutKnowledgeInput | UserUpdateWithWhereUniqueWithoutKnowledgeInput[]
    updateMany?: UserUpdateManyWithWhereWithoutKnowledgeInput | UserUpdateManyWithWhereWithoutKnowledgeInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type TeamUncheckedUpdateManyWithoutKnowledgeNestedInput = {
    create?: XOR<TeamCreateWithoutKnowledgeInput, TeamUncheckedCreateWithoutKnowledgeInput> | TeamCreateWithoutKnowledgeInput[] | TeamUncheckedCreateWithoutKnowledgeInput[]
    connectOrCreate?: TeamCreateOrConnectWithoutKnowledgeInput | TeamCreateOrConnectWithoutKnowledgeInput[]
    upsert?: TeamUpsertWithWhereUniqueWithoutKnowledgeInput | TeamUpsertWithWhereUniqueWithoutKnowledgeInput[]
    set?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    disconnect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    delete?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    connect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    update?: TeamUpdateWithWhereUniqueWithoutKnowledgeInput | TeamUpdateWithWhereUniqueWithoutKnowledgeInput[]
    updateMany?: TeamUpdateManyWithWhereWithoutKnowledgeInput | TeamUpdateManyWithWhereWithoutKnowledgeInput[]
    deleteMany?: TeamScalarWhereInput | TeamScalarWhereInput[]
  }

  export type FileUncheckedUpdateManyWithoutKnowledgeNestedInput = {
    create?: XOR<FileCreateWithoutKnowledgeInput, FileUncheckedCreateWithoutKnowledgeInput> | FileCreateWithoutKnowledgeInput[] | FileUncheckedCreateWithoutKnowledgeInput[]
    connectOrCreate?: FileCreateOrConnectWithoutKnowledgeInput | FileCreateOrConnectWithoutKnowledgeInput[]
    upsert?: FileUpsertWithWhereUniqueWithoutKnowledgeInput | FileUpsertWithWhereUniqueWithoutKnowledgeInput[]
    createMany?: FileCreateManyKnowledgeInputEnvelope
    set?: FileWhereUniqueInput | FileWhereUniqueInput[]
    disconnect?: FileWhereUniqueInput | FileWhereUniqueInput[]
    delete?: FileWhereUniqueInput | FileWhereUniqueInput[]
    connect?: FileWhereUniqueInput | FileWhereUniqueInput[]
    update?: FileUpdateWithWhereUniqueWithoutKnowledgeInput | FileUpdateWithWhereUniqueWithoutKnowledgeInput[]
    updateMany?: FileUpdateManyWithWhereWithoutKnowledgeInput | FileUpdateManyWithWhereWithoutKnowledgeInput[]
    deleteMany?: FileScalarWhereInput | FileScalarWhereInput[]
  }

  export type TeamCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<TeamCreateWithoutCreatedByInput, TeamUncheckedCreateWithoutCreatedByInput> | TeamCreateWithoutCreatedByInput[] | TeamUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: TeamCreateOrConnectWithoutCreatedByInput | TeamCreateOrConnectWithoutCreatedByInput[]
    createMany?: TeamCreateManyCreatedByInputEnvelope
    connect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
  }

  export type MemberTeamCreateNestedManyWithoutUserInput = {
    create?: XOR<MemberTeamCreateWithoutUserInput, MemberTeamUncheckedCreateWithoutUserInput> | MemberTeamCreateWithoutUserInput[] | MemberTeamUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MemberTeamCreateOrConnectWithoutUserInput | MemberTeamCreateOrConnectWithoutUserInput[]
    createMany?: MemberTeamCreateManyUserInputEnvelope
    connect?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
  }

  export type TeamCreateNestedManyWithoutUsersInput = {
    create?: XOR<TeamCreateWithoutUsersInput, TeamUncheckedCreateWithoutUsersInput> | TeamCreateWithoutUsersInput[] | TeamUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: TeamCreateOrConnectWithoutUsersInput | TeamCreateOrConnectWithoutUsersInput[]
    connect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
  }

  export type KnowledgeCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<KnowledgeCreateWithoutCreatedByInput, KnowledgeUncheckedCreateWithoutCreatedByInput> | KnowledgeCreateWithoutCreatedByInput[] | KnowledgeUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: KnowledgeCreateOrConnectWithoutCreatedByInput | KnowledgeCreateOrConnectWithoutCreatedByInput[]
    createMany?: KnowledgeCreateManyCreatedByInputEnvelope
    connect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
  }

  export type KnowledgeCreateNestedManyWithoutUsersInput = {
    create?: XOR<KnowledgeCreateWithoutUsersInput, KnowledgeUncheckedCreateWithoutUsersInput> | KnowledgeCreateWithoutUsersInput[] | KnowledgeUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: KnowledgeCreateOrConnectWithoutUsersInput | KnowledgeCreateOrConnectWithoutUsersInput[]
    connect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
  }

  export type AgentCreateNestedManyWithoutUserInput = {
    create?: XOR<AgentCreateWithoutUserInput, AgentUncheckedCreateWithoutUserInput> | AgentCreateWithoutUserInput[] | AgentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgentCreateOrConnectWithoutUserInput | AgentCreateOrConnectWithoutUserInput[]
    createMany?: AgentCreateManyUserInputEnvelope
    connect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
  }

  export type AgentCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<AgentCreateWithoutCreatedByInput, AgentUncheckedCreateWithoutCreatedByInput> | AgentCreateWithoutCreatedByInput[] | AgentUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: AgentCreateOrConnectWithoutCreatedByInput | AgentCreateOrConnectWithoutCreatedByInput[]
    createMany?: AgentCreateManyCreatedByInputEnvelope
    connect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
  }

  export type FileParsingTaskCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<FileParsingTaskCreateWithoutCreatedByInput, FileParsingTaskUncheckedCreateWithoutCreatedByInput> | FileParsingTaskCreateWithoutCreatedByInput[] | FileParsingTaskUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: FileParsingTaskCreateOrConnectWithoutCreatedByInput | FileParsingTaskCreateOrConnectWithoutCreatedByInput[]
    createMany?: FileParsingTaskCreateManyCreatedByInputEnvelope
    connect?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
  }

  export type LLMProviderCreateNestedOneWithoutUsersWithDefaultInput = {
    create?: XOR<LLMProviderCreateWithoutUsersWithDefaultInput, LLMProviderUncheckedCreateWithoutUsersWithDefaultInput>
    connectOrCreate?: LLMProviderCreateOrConnectWithoutUsersWithDefaultInput
    connect?: LLMProviderWhereUniqueInput
  }

  export type LLMProviderCreateNestedManyWithoutUserOwnerInput = {
    create?: XOR<LLMProviderCreateWithoutUserOwnerInput, LLMProviderUncheckedCreateWithoutUserOwnerInput> | LLMProviderCreateWithoutUserOwnerInput[] | LLMProviderUncheckedCreateWithoutUserOwnerInput[]
    connectOrCreate?: LLMProviderCreateOrConnectWithoutUserOwnerInput | LLMProviderCreateOrConnectWithoutUserOwnerInput[]
    createMany?: LLMProviderCreateManyUserOwnerInputEnvelope
    connect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
  }

  export type TeamUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<TeamCreateWithoutCreatedByInput, TeamUncheckedCreateWithoutCreatedByInput> | TeamCreateWithoutCreatedByInput[] | TeamUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: TeamCreateOrConnectWithoutCreatedByInput | TeamCreateOrConnectWithoutCreatedByInput[]
    createMany?: TeamCreateManyCreatedByInputEnvelope
    connect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
  }

  export type MemberTeamUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<MemberTeamCreateWithoutUserInput, MemberTeamUncheckedCreateWithoutUserInput> | MemberTeamCreateWithoutUserInput[] | MemberTeamUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MemberTeamCreateOrConnectWithoutUserInput | MemberTeamCreateOrConnectWithoutUserInput[]
    createMany?: MemberTeamCreateManyUserInputEnvelope
    connect?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
  }

  export type TeamUncheckedCreateNestedManyWithoutUsersInput = {
    create?: XOR<TeamCreateWithoutUsersInput, TeamUncheckedCreateWithoutUsersInput> | TeamCreateWithoutUsersInput[] | TeamUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: TeamCreateOrConnectWithoutUsersInput | TeamCreateOrConnectWithoutUsersInput[]
    connect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
  }

  export type KnowledgeUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<KnowledgeCreateWithoutCreatedByInput, KnowledgeUncheckedCreateWithoutCreatedByInput> | KnowledgeCreateWithoutCreatedByInput[] | KnowledgeUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: KnowledgeCreateOrConnectWithoutCreatedByInput | KnowledgeCreateOrConnectWithoutCreatedByInput[]
    createMany?: KnowledgeCreateManyCreatedByInputEnvelope
    connect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
  }

  export type KnowledgeUncheckedCreateNestedManyWithoutUsersInput = {
    create?: XOR<KnowledgeCreateWithoutUsersInput, KnowledgeUncheckedCreateWithoutUsersInput> | KnowledgeCreateWithoutUsersInput[] | KnowledgeUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: KnowledgeCreateOrConnectWithoutUsersInput | KnowledgeCreateOrConnectWithoutUsersInput[]
    connect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
  }

  export type AgentUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AgentCreateWithoutUserInput, AgentUncheckedCreateWithoutUserInput> | AgentCreateWithoutUserInput[] | AgentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgentCreateOrConnectWithoutUserInput | AgentCreateOrConnectWithoutUserInput[]
    createMany?: AgentCreateManyUserInputEnvelope
    connect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
  }

  export type AgentUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<AgentCreateWithoutCreatedByInput, AgentUncheckedCreateWithoutCreatedByInput> | AgentCreateWithoutCreatedByInput[] | AgentUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: AgentCreateOrConnectWithoutCreatedByInput | AgentCreateOrConnectWithoutCreatedByInput[]
    createMany?: AgentCreateManyCreatedByInputEnvelope
    connect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
  }

  export type FileParsingTaskUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<FileParsingTaskCreateWithoutCreatedByInput, FileParsingTaskUncheckedCreateWithoutCreatedByInput> | FileParsingTaskCreateWithoutCreatedByInput[] | FileParsingTaskUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: FileParsingTaskCreateOrConnectWithoutCreatedByInput | FileParsingTaskCreateOrConnectWithoutCreatedByInput[]
    createMany?: FileParsingTaskCreateManyCreatedByInputEnvelope
    connect?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
  }

  export type LLMProviderUncheckedCreateNestedManyWithoutUserOwnerInput = {
    create?: XOR<LLMProviderCreateWithoutUserOwnerInput, LLMProviderUncheckedCreateWithoutUserOwnerInput> | LLMProviderCreateWithoutUserOwnerInput[] | LLMProviderUncheckedCreateWithoutUserOwnerInput[]
    connectOrCreate?: LLMProviderCreateOrConnectWithoutUserOwnerInput | LLMProviderCreateOrConnectWithoutUserOwnerInput[]
    createMany?: LLMProviderCreateManyUserOwnerInputEnvelope
    connect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
  }

  export type TeamUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<TeamCreateWithoutCreatedByInput, TeamUncheckedCreateWithoutCreatedByInput> | TeamCreateWithoutCreatedByInput[] | TeamUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: TeamCreateOrConnectWithoutCreatedByInput | TeamCreateOrConnectWithoutCreatedByInput[]
    upsert?: TeamUpsertWithWhereUniqueWithoutCreatedByInput | TeamUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: TeamCreateManyCreatedByInputEnvelope
    set?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    disconnect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    delete?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    connect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    update?: TeamUpdateWithWhereUniqueWithoutCreatedByInput | TeamUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: TeamUpdateManyWithWhereWithoutCreatedByInput | TeamUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: TeamScalarWhereInput | TeamScalarWhereInput[]
  }

  export type MemberTeamUpdateManyWithoutUserNestedInput = {
    create?: XOR<MemberTeamCreateWithoutUserInput, MemberTeamUncheckedCreateWithoutUserInput> | MemberTeamCreateWithoutUserInput[] | MemberTeamUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MemberTeamCreateOrConnectWithoutUserInput | MemberTeamCreateOrConnectWithoutUserInput[]
    upsert?: MemberTeamUpsertWithWhereUniqueWithoutUserInput | MemberTeamUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MemberTeamCreateManyUserInputEnvelope
    set?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
    disconnect?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
    delete?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
    connect?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
    update?: MemberTeamUpdateWithWhereUniqueWithoutUserInput | MemberTeamUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MemberTeamUpdateManyWithWhereWithoutUserInput | MemberTeamUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MemberTeamScalarWhereInput | MemberTeamScalarWhereInput[]
  }

  export type TeamUpdateManyWithoutUsersNestedInput = {
    create?: XOR<TeamCreateWithoutUsersInput, TeamUncheckedCreateWithoutUsersInput> | TeamCreateWithoutUsersInput[] | TeamUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: TeamCreateOrConnectWithoutUsersInput | TeamCreateOrConnectWithoutUsersInput[]
    upsert?: TeamUpsertWithWhereUniqueWithoutUsersInput | TeamUpsertWithWhereUniqueWithoutUsersInput[]
    set?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    disconnect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    delete?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    connect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    update?: TeamUpdateWithWhereUniqueWithoutUsersInput | TeamUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: TeamUpdateManyWithWhereWithoutUsersInput | TeamUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: TeamScalarWhereInput | TeamScalarWhereInput[]
  }

  export type KnowledgeUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<KnowledgeCreateWithoutCreatedByInput, KnowledgeUncheckedCreateWithoutCreatedByInput> | KnowledgeCreateWithoutCreatedByInput[] | KnowledgeUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: KnowledgeCreateOrConnectWithoutCreatedByInput | KnowledgeCreateOrConnectWithoutCreatedByInput[]
    upsert?: KnowledgeUpsertWithWhereUniqueWithoutCreatedByInput | KnowledgeUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: KnowledgeCreateManyCreatedByInputEnvelope
    set?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    disconnect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    delete?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    connect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    update?: KnowledgeUpdateWithWhereUniqueWithoutCreatedByInput | KnowledgeUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: KnowledgeUpdateManyWithWhereWithoutCreatedByInput | KnowledgeUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: KnowledgeScalarWhereInput | KnowledgeScalarWhereInput[]
  }

  export type KnowledgeUpdateManyWithoutUsersNestedInput = {
    create?: XOR<KnowledgeCreateWithoutUsersInput, KnowledgeUncheckedCreateWithoutUsersInput> | KnowledgeCreateWithoutUsersInput[] | KnowledgeUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: KnowledgeCreateOrConnectWithoutUsersInput | KnowledgeCreateOrConnectWithoutUsersInput[]
    upsert?: KnowledgeUpsertWithWhereUniqueWithoutUsersInput | KnowledgeUpsertWithWhereUniqueWithoutUsersInput[]
    set?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    disconnect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    delete?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    connect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    update?: KnowledgeUpdateWithWhereUniqueWithoutUsersInput | KnowledgeUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: KnowledgeUpdateManyWithWhereWithoutUsersInput | KnowledgeUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: KnowledgeScalarWhereInput | KnowledgeScalarWhereInput[]
  }

  export type AgentUpdateManyWithoutUserNestedInput = {
    create?: XOR<AgentCreateWithoutUserInput, AgentUncheckedCreateWithoutUserInput> | AgentCreateWithoutUserInput[] | AgentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgentCreateOrConnectWithoutUserInput | AgentCreateOrConnectWithoutUserInput[]
    upsert?: AgentUpsertWithWhereUniqueWithoutUserInput | AgentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AgentCreateManyUserInputEnvelope
    set?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    disconnect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    delete?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    connect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    update?: AgentUpdateWithWhereUniqueWithoutUserInput | AgentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AgentUpdateManyWithWhereWithoutUserInput | AgentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AgentScalarWhereInput | AgentScalarWhereInput[]
  }

  export type AgentUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<AgentCreateWithoutCreatedByInput, AgentUncheckedCreateWithoutCreatedByInput> | AgentCreateWithoutCreatedByInput[] | AgentUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: AgentCreateOrConnectWithoutCreatedByInput | AgentCreateOrConnectWithoutCreatedByInput[]
    upsert?: AgentUpsertWithWhereUniqueWithoutCreatedByInput | AgentUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: AgentCreateManyCreatedByInputEnvelope
    set?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    disconnect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    delete?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    connect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    update?: AgentUpdateWithWhereUniqueWithoutCreatedByInput | AgentUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: AgentUpdateManyWithWhereWithoutCreatedByInput | AgentUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: AgentScalarWhereInput | AgentScalarWhereInput[]
  }

  export type FileParsingTaskUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<FileParsingTaskCreateWithoutCreatedByInput, FileParsingTaskUncheckedCreateWithoutCreatedByInput> | FileParsingTaskCreateWithoutCreatedByInput[] | FileParsingTaskUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: FileParsingTaskCreateOrConnectWithoutCreatedByInput | FileParsingTaskCreateOrConnectWithoutCreatedByInput[]
    upsert?: FileParsingTaskUpsertWithWhereUniqueWithoutCreatedByInput | FileParsingTaskUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: FileParsingTaskCreateManyCreatedByInputEnvelope
    set?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
    disconnect?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
    delete?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
    connect?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
    update?: FileParsingTaskUpdateWithWhereUniqueWithoutCreatedByInput | FileParsingTaskUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: FileParsingTaskUpdateManyWithWhereWithoutCreatedByInput | FileParsingTaskUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: FileParsingTaskScalarWhereInput | FileParsingTaskScalarWhereInput[]
  }

  export type LLMProviderUpdateOneWithoutUsersWithDefaultNestedInput = {
    create?: XOR<LLMProviderCreateWithoutUsersWithDefaultInput, LLMProviderUncheckedCreateWithoutUsersWithDefaultInput>
    connectOrCreate?: LLMProviderCreateOrConnectWithoutUsersWithDefaultInput
    upsert?: LLMProviderUpsertWithoutUsersWithDefaultInput
    disconnect?: LLMProviderWhereInput | boolean
    delete?: LLMProviderWhereInput | boolean
    connect?: LLMProviderWhereUniqueInput
    update?: XOR<XOR<LLMProviderUpdateToOneWithWhereWithoutUsersWithDefaultInput, LLMProviderUpdateWithoutUsersWithDefaultInput>, LLMProviderUncheckedUpdateWithoutUsersWithDefaultInput>
  }

  export type LLMProviderUpdateManyWithoutUserOwnerNestedInput = {
    create?: XOR<LLMProviderCreateWithoutUserOwnerInput, LLMProviderUncheckedCreateWithoutUserOwnerInput> | LLMProviderCreateWithoutUserOwnerInput[] | LLMProviderUncheckedCreateWithoutUserOwnerInput[]
    connectOrCreate?: LLMProviderCreateOrConnectWithoutUserOwnerInput | LLMProviderCreateOrConnectWithoutUserOwnerInput[]
    upsert?: LLMProviderUpsertWithWhereUniqueWithoutUserOwnerInput | LLMProviderUpsertWithWhereUniqueWithoutUserOwnerInput[]
    createMany?: LLMProviderCreateManyUserOwnerInputEnvelope
    set?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    disconnect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    delete?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    connect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    update?: LLMProviderUpdateWithWhereUniqueWithoutUserOwnerInput | LLMProviderUpdateWithWhereUniqueWithoutUserOwnerInput[]
    updateMany?: LLMProviderUpdateManyWithWhereWithoutUserOwnerInput | LLMProviderUpdateManyWithWhereWithoutUserOwnerInput[]
    deleteMany?: LLMProviderScalarWhereInput | LLMProviderScalarWhereInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type TeamUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<TeamCreateWithoutCreatedByInput, TeamUncheckedCreateWithoutCreatedByInput> | TeamCreateWithoutCreatedByInput[] | TeamUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: TeamCreateOrConnectWithoutCreatedByInput | TeamCreateOrConnectWithoutCreatedByInput[]
    upsert?: TeamUpsertWithWhereUniqueWithoutCreatedByInput | TeamUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: TeamCreateManyCreatedByInputEnvelope
    set?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    disconnect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    delete?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    connect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    update?: TeamUpdateWithWhereUniqueWithoutCreatedByInput | TeamUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: TeamUpdateManyWithWhereWithoutCreatedByInput | TeamUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: TeamScalarWhereInput | TeamScalarWhereInput[]
  }

  export type MemberTeamUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<MemberTeamCreateWithoutUserInput, MemberTeamUncheckedCreateWithoutUserInput> | MemberTeamCreateWithoutUserInput[] | MemberTeamUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MemberTeamCreateOrConnectWithoutUserInput | MemberTeamCreateOrConnectWithoutUserInput[]
    upsert?: MemberTeamUpsertWithWhereUniqueWithoutUserInput | MemberTeamUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MemberTeamCreateManyUserInputEnvelope
    set?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
    disconnect?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
    delete?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
    connect?: MemberTeamWhereUniqueInput | MemberTeamWhereUniqueInput[]
    update?: MemberTeamUpdateWithWhereUniqueWithoutUserInput | MemberTeamUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MemberTeamUpdateManyWithWhereWithoutUserInput | MemberTeamUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MemberTeamScalarWhereInput | MemberTeamScalarWhereInput[]
  }

  export type TeamUncheckedUpdateManyWithoutUsersNestedInput = {
    create?: XOR<TeamCreateWithoutUsersInput, TeamUncheckedCreateWithoutUsersInput> | TeamCreateWithoutUsersInput[] | TeamUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: TeamCreateOrConnectWithoutUsersInput | TeamCreateOrConnectWithoutUsersInput[]
    upsert?: TeamUpsertWithWhereUniqueWithoutUsersInput | TeamUpsertWithWhereUniqueWithoutUsersInput[]
    set?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    disconnect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    delete?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    connect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    update?: TeamUpdateWithWhereUniqueWithoutUsersInput | TeamUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: TeamUpdateManyWithWhereWithoutUsersInput | TeamUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: TeamScalarWhereInput | TeamScalarWhereInput[]
  }

  export type KnowledgeUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<KnowledgeCreateWithoutCreatedByInput, KnowledgeUncheckedCreateWithoutCreatedByInput> | KnowledgeCreateWithoutCreatedByInput[] | KnowledgeUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: KnowledgeCreateOrConnectWithoutCreatedByInput | KnowledgeCreateOrConnectWithoutCreatedByInput[]
    upsert?: KnowledgeUpsertWithWhereUniqueWithoutCreatedByInput | KnowledgeUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: KnowledgeCreateManyCreatedByInputEnvelope
    set?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    disconnect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    delete?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    connect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    update?: KnowledgeUpdateWithWhereUniqueWithoutCreatedByInput | KnowledgeUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: KnowledgeUpdateManyWithWhereWithoutCreatedByInput | KnowledgeUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: KnowledgeScalarWhereInput | KnowledgeScalarWhereInput[]
  }

  export type KnowledgeUncheckedUpdateManyWithoutUsersNestedInput = {
    create?: XOR<KnowledgeCreateWithoutUsersInput, KnowledgeUncheckedCreateWithoutUsersInput> | KnowledgeCreateWithoutUsersInput[] | KnowledgeUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: KnowledgeCreateOrConnectWithoutUsersInput | KnowledgeCreateOrConnectWithoutUsersInput[]
    upsert?: KnowledgeUpsertWithWhereUniqueWithoutUsersInput | KnowledgeUpsertWithWhereUniqueWithoutUsersInput[]
    set?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    disconnect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    delete?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    connect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    update?: KnowledgeUpdateWithWhereUniqueWithoutUsersInput | KnowledgeUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: KnowledgeUpdateManyWithWhereWithoutUsersInput | KnowledgeUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: KnowledgeScalarWhereInput | KnowledgeScalarWhereInput[]
  }

  export type AgentUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AgentCreateWithoutUserInput, AgentUncheckedCreateWithoutUserInput> | AgentCreateWithoutUserInput[] | AgentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AgentCreateOrConnectWithoutUserInput | AgentCreateOrConnectWithoutUserInput[]
    upsert?: AgentUpsertWithWhereUniqueWithoutUserInput | AgentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AgentCreateManyUserInputEnvelope
    set?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    disconnect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    delete?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    connect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    update?: AgentUpdateWithWhereUniqueWithoutUserInput | AgentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AgentUpdateManyWithWhereWithoutUserInput | AgentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AgentScalarWhereInput | AgentScalarWhereInput[]
  }

  export type AgentUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<AgentCreateWithoutCreatedByInput, AgentUncheckedCreateWithoutCreatedByInput> | AgentCreateWithoutCreatedByInput[] | AgentUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: AgentCreateOrConnectWithoutCreatedByInput | AgentCreateOrConnectWithoutCreatedByInput[]
    upsert?: AgentUpsertWithWhereUniqueWithoutCreatedByInput | AgentUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: AgentCreateManyCreatedByInputEnvelope
    set?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    disconnect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    delete?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    connect?: AgentWhereUniqueInput | AgentWhereUniqueInput[]
    update?: AgentUpdateWithWhereUniqueWithoutCreatedByInput | AgentUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: AgentUpdateManyWithWhereWithoutCreatedByInput | AgentUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: AgentScalarWhereInput | AgentScalarWhereInput[]
  }

  export type FileParsingTaskUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<FileParsingTaskCreateWithoutCreatedByInput, FileParsingTaskUncheckedCreateWithoutCreatedByInput> | FileParsingTaskCreateWithoutCreatedByInput[] | FileParsingTaskUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: FileParsingTaskCreateOrConnectWithoutCreatedByInput | FileParsingTaskCreateOrConnectWithoutCreatedByInput[]
    upsert?: FileParsingTaskUpsertWithWhereUniqueWithoutCreatedByInput | FileParsingTaskUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: FileParsingTaskCreateManyCreatedByInputEnvelope
    set?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
    disconnect?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
    delete?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
    connect?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
    update?: FileParsingTaskUpdateWithWhereUniqueWithoutCreatedByInput | FileParsingTaskUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: FileParsingTaskUpdateManyWithWhereWithoutCreatedByInput | FileParsingTaskUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: FileParsingTaskScalarWhereInput | FileParsingTaskScalarWhereInput[]
  }

  export type LLMProviderUncheckedUpdateManyWithoutUserOwnerNestedInput = {
    create?: XOR<LLMProviderCreateWithoutUserOwnerInput, LLMProviderUncheckedCreateWithoutUserOwnerInput> | LLMProviderCreateWithoutUserOwnerInput[] | LLMProviderUncheckedCreateWithoutUserOwnerInput[]
    connectOrCreate?: LLMProviderCreateOrConnectWithoutUserOwnerInput | LLMProviderCreateOrConnectWithoutUserOwnerInput[]
    upsert?: LLMProviderUpsertWithWhereUniqueWithoutUserOwnerInput | LLMProviderUpsertWithWhereUniqueWithoutUserOwnerInput[]
    createMany?: LLMProviderCreateManyUserOwnerInputEnvelope
    set?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    disconnect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    delete?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    connect?: LLMProviderWhereUniqueInput | LLMProviderWhereUniqueInput[]
    update?: LLMProviderUpdateWithWhereUniqueWithoutUserOwnerInput | LLMProviderUpdateWithWhereUniqueWithoutUserOwnerInput[]
    updateMany?: LLMProviderUpdateManyWithWhereWithoutUserOwnerInput | LLMProviderUpdateManyWithWhereWithoutUserOwnerInput[]
    deleteMany?: LLMProviderScalarWhereInput | LLMProviderScalarWhereInput[]
  }

  export type KnowledgeCreateNestedOneWithoutFilesInput = {
    create?: XOR<KnowledgeCreateWithoutFilesInput, KnowledgeUncheckedCreateWithoutFilesInput>
    connectOrCreate?: KnowledgeCreateOrConnectWithoutFilesInput
    connect?: KnowledgeWhereUniqueInput
  }

  export type FileParsingTaskCreateNestedManyWithoutFileInput = {
    create?: XOR<FileParsingTaskCreateWithoutFileInput, FileParsingTaskUncheckedCreateWithoutFileInput> | FileParsingTaskCreateWithoutFileInput[] | FileParsingTaskUncheckedCreateWithoutFileInput[]
    connectOrCreate?: FileParsingTaskCreateOrConnectWithoutFileInput | FileParsingTaskCreateOrConnectWithoutFileInput[]
    createMany?: FileParsingTaskCreateManyFileInputEnvelope
    connect?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
  }

  export type TextChunkCreateNestedManyWithoutFileInput = {
    create?: XOR<TextChunkCreateWithoutFileInput, TextChunkUncheckedCreateWithoutFileInput> | TextChunkCreateWithoutFileInput[] | TextChunkUncheckedCreateWithoutFileInput[]
    connectOrCreate?: TextChunkCreateOrConnectWithoutFileInput | TextChunkCreateOrConnectWithoutFileInput[]
    createMany?: TextChunkCreateManyFileInputEnvelope
    connect?: TextChunkWhereUniqueInput | TextChunkWhereUniqueInput[]
  }

  export type FileParsingTaskUncheckedCreateNestedManyWithoutFileInput = {
    create?: XOR<FileParsingTaskCreateWithoutFileInput, FileParsingTaskUncheckedCreateWithoutFileInput> | FileParsingTaskCreateWithoutFileInput[] | FileParsingTaskUncheckedCreateWithoutFileInput[]
    connectOrCreate?: FileParsingTaskCreateOrConnectWithoutFileInput | FileParsingTaskCreateOrConnectWithoutFileInput[]
    createMany?: FileParsingTaskCreateManyFileInputEnvelope
    connect?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
  }

  export type TextChunkUncheckedCreateNestedManyWithoutFileInput = {
    create?: XOR<TextChunkCreateWithoutFileInput, TextChunkUncheckedCreateWithoutFileInput> | TextChunkCreateWithoutFileInput[] | TextChunkUncheckedCreateWithoutFileInput[]
    connectOrCreate?: TextChunkCreateOrConnectWithoutFileInput | TextChunkCreateOrConnectWithoutFileInput[]
    createMany?: TextChunkCreateManyFileInputEnvelope
    connect?: TextChunkWhereUniqueInput | TextChunkWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type KnowledgeUpdateOneRequiredWithoutFilesNestedInput = {
    create?: XOR<KnowledgeCreateWithoutFilesInput, KnowledgeUncheckedCreateWithoutFilesInput>
    connectOrCreate?: KnowledgeCreateOrConnectWithoutFilesInput
    upsert?: KnowledgeUpsertWithoutFilesInput
    connect?: KnowledgeWhereUniqueInput
    update?: XOR<XOR<KnowledgeUpdateToOneWithWhereWithoutFilesInput, KnowledgeUpdateWithoutFilesInput>, KnowledgeUncheckedUpdateWithoutFilesInput>
  }

  export type FileParsingTaskUpdateManyWithoutFileNestedInput = {
    create?: XOR<FileParsingTaskCreateWithoutFileInput, FileParsingTaskUncheckedCreateWithoutFileInput> | FileParsingTaskCreateWithoutFileInput[] | FileParsingTaskUncheckedCreateWithoutFileInput[]
    connectOrCreate?: FileParsingTaskCreateOrConnectWithoutFileInput | FileParsingTaskCreateOrConnectWithoutFileInput[]
    upsert?: FileParsingTaskUpsertWithWhereUniqueWithoutFileInput | FileParsingTaskUpsertWithWhereUniqueWithoutFileInput[]
    createMany?: FileParsingTaskCreateManyFileInputEnvelope
    set?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
    disconnect?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
    delete?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
    connect?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
    update?: FileParsingTaskUpdateWithWhereUniqueWithoutFileInput | FileParsingTaskUpdateWithWhereUniqueWithoutFileInput[]
    updateMany?: FileParsingTaskUpdateManyWithWhereWithoutFileInput | FileParsingTaskUpdateManyWithWhereWithoutFileInput[]
    deleteMany?: FileParsingTaskScalarWhereInput | FileParsingTaskScalarWhereInput[]
  }

  export type TextChunkUpdateManyWithoutFileNestedInput = {
    create?: XOR<TextChunkCreateWithoutFileInput, TextChunkUncheckedCreateWithoutFileInput> | TextChunkCreateWithoutFileInput[] | TextChunkUncheckedCreateWithoutFileInput[]
    connectOrCreate?: TextChunkCreateOrConnectWithoutFileInput | TextChunkCreateOrConnectWithoutFileInput[]
    upsert?: TextChunkUpsertWithWhereUniqueWithoutFileInput | TextChunkUpsertWithWhereUniqueWithoutFileInput[]
    createMany?: TextChunkCreateManyFileInputEnvelope
    set?: TextChunkWhereUniqueInput | TextChunkWhereUniqueInput[]
    disconnect?: TextChunkWhereUniqueInput | TextChunkWhereUniqueInput[]
    delete?: TextChunkWhereUniqueInput | TextChunkWhereUniqueInput[]
    connect?: TextChunkWhereUniqueInput | TextChunkWhereUniqueInput[]
    update?: TextChunkUpdateWithWhereUniqueWithoutFileInput | TextChunkUpdateWithWhereUniqueWithoutFileInput[]
    updateMany?: TextChunkUpdateManyWithWhereWithoutFileInput | TextChunkUpdateManyWithWhereWithoutFileInput[]
    deleteMany?: TextChunkScalarWhereInput | TextChunkScalarWhereInput[]
  }

  export type FileParsingTaskUncheckedUpdateManyWithoutFileNestedInput = {
    create?: XOR<FileParsingTaskCreateWithoutFileInput, FileParsingTaskUncheckedCreateWithoutFileInput> | FileParsingTaskCreateWithoutFileInput[] | FileParsingTaskUncheckedCreateWithoutFileInput[]
    connectOrCreate?: FileParsingTaskCreateOrConnectWithoutFileInput | FileParsingTaskCreateOrConnectWithoutFileInput[]
    upsert?: FileParsingTaskUpsertWithWhereUniqueWithoutFileInput | FileParsingTaskUpsertWithWhereUniqueWithoutFileInput[]
    createMany?: FileParsingTaskCreateManyFileInputEnvelope
    set?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
    disconnect?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
    delete?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
    connect?: FileParsingTaskWhereUniqueInput | FileParsingTaskWhereUniqueInput[]
    update?: FileParsingTaskUpdateWithWhereUniqueWithoutFileInput | FileParsingTaskUpdateWithWhereUniqueWithoutFileInput[]
    updateMany?: FileParsingTaskUpdateManyWithWhereWithoutFileInput | FileParsingTaskUpdateManyWithWhereWithoutFileInput[]
    deleteMany?: FileParsingTaskScalarWhereInput | FileParsingTaskScalarWhereInput[]
  }

  export type TextChunkUncheckedUpdateManyWithoutFileNestedInput = {
    create?: XOR<TextChunkCreateWithoutFileInput, TextChunkUncheckedCreateWithoutFileInput> | TextChunkCreateWithoutFileInput[] | TextChunkUncheckedCreateWithoutFileInput[]
    connectOrCreate?: TextChunkCreateOrConnectWithoutFileInput | TextChunkCreateOrConnectWithoutFileInput[]
    upsert?: TextChunkUpsertWithWhereUniqueWithoutFileInput | TextChunkUpsertWithWhereUniqueWithoutFileInput[]
    createMany?: TextChunkCreateManyFileInputEnvelope
    set?: TextChunkWhereUniqueInput | TextChunkWhereUniqueInput[]
    disconnect?: TextChunkWhereUniqueInput | TextChunkWhereUniqueInput[]
    delete?: TextChunkWhereUniqueInput | TextChunkWhereUniqueInput[]
    connect?: TextChunkWhereUniqueInput | TextChunkWhereUniqueInput[]
    update?: TextChunkUpdateWithWhereUniqueWithoutFileInput | TextChunkUpdateWithWhereUniqueWithoutFileInput[]
    updateMany?: TextChunkUpdateManyWithWhereWithoutFileInput | TextChunkUpdateManyWithWhereWithoutFileInput[]
    deleteMany?: TextChunkScalarWhereInput | TextChunkScalarWhereInput[]
  }

  export type FileCreateNestedOneWithoutParsingTasksInput = {
    create?: XOR<FileCreateWithoutParsingTasksInput, FileUncheckedCreateWithoutParsingTasksInput>
    connectOrCreate?: FileCreateOrConnectWithoutParsingTasksInput
    connect?: FileWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutFileParsingTaskInput = {
    create?: XOR<UserCreateWithoutFileParsingTaskInput, UserUncheckedCreateWithoutFileParsingTaskInput>
    connectOrCreate?: UserCreateOrConnectWithoutFileParsingTaskInput
    connect?: UserWhereUniqueInput
  }

  export type FileUpdateOneRequiredWithoutParsingTasksNestedInput = {
    create?: XOR<FileCreateWithoutParsingTasksInput, FileUncheckedCreateWithoutParsingTasksInput>
    connectOrCreate?: FileCreateOrConnectWithoutParsingTasksInput
    upsert?: FileUpsertWithoutParsingTasksInput
    connect?: FileWhereUniqueInput
    update?: XOR<XOR<FileUpdateToOneWithWhereWithoutParsingTasksInput, FileUpdateWithoutParsingTasksInput>, FileUncheckedUpdateWithoutParsingTasksInput>
  }

  export type UserUpdateOneRequiredWithoutFileParsingTaskNestedInput = {
    create?: XOR<UserCreateWithoutFileParsingTaskInput, UserUncheckedCreateWithoutFileParsingTaskInput>
    connectOrCreate?: UserCreateOrConnectWithoutFileParsingTaskInput
    upsert?: UserUpsertWithoutFileParsingTaskInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutFileParsingTaskInput, UserUpdateWithoutFileParsingTaskInput>, UserUncheckedUpdateWithoutFileParsingTaskInput>
  }

  export type UserCreateNestedOneWithoutCreatedAgentsInput = {
    create?: XOR<UserCreateWithoutCreatedAgentsInput, UserUncheckedCreateWithoutCreatedAgentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedAgentsInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutOwnedAgentsInput = {
    create?: XOR<UserCreateWithoutOwnedAgentsInput, UserUncheckedCreateWithoutOwnedAgentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutOwnedAgentsInput
    connect?: UserWhereUniqueInput
  }

  export type TeamCreateNestedOneWithoutOwnedAgentsInput = {
    create?: XOR<TeamCreateWithoutOwnedAgentsInput, TeamUncheckedCreateWithoutOwnedAgentsInput>
    connectOrCreate?: TeamCreateOrConnectWithoutOwnedAgentsInput
    connect?: TeamWhereUniqueInput
  }

  export type ConversationCreateNestedManyWithoutAgentInput = {
    create?: XOR<ConversationCreateWithoutAgentInput, ConversationUncheckedCreateWithoutAgentInput> | ConversationCreateWithoutAgentInput[] | ConversationUncheckedCreateWithoutAgentInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutAgentInput | ConversationCreateOrConnectWithoutAgentInput[]
    createMany?: ConversationCreateManyAgentInputEnvelope
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
  }

  export type ConversationUncheckedCreateNestedManyWithoutAgentInput = {
    create?: XOR<ConversationCreateWithoutAgentInput, ConversationUncheckedCreateWithoutAgentInput> | ConversationCreateWithoutAgentInput[] | ConversationUncheckedCreateWithoutAgentInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutAgentInput | ConversationCreateOrConnectWithoutAgentInput[]
    createMany?: ConversationCreateManyAgentInputEnvelope
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutCreatedAgentsNestedInput = {
    create?: XOR<UserCreateWithoutCreatedAgentsInput, UserUncheckedCreateWithoutCreatedAgentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedAgentsInput
    upsert?: UserUpsertWithoutCreatedAgentsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCreatedAgentsInput, UserUpdateWithoutCreatedAgentsInput>, UserUncheckedUpdateWithoutCreatedAgentsInput>
  }

  export type UserUpdateOneWithoutOwnedAgentsNestedInput = {
    create?: XOR<UserCreateWithoutOwnedAgentsInput, UserUncheckedCreateWithoutOwnedAgentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutOwnedAgentsInput
    upsert?: UserUpsertWithoutOwnedAgentsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOwnedAgentsInput, UserUpdateWithoutOwnedAgentsInput>, UserUncheckedUpdateWithoutOwnedAgentsInput>
  }

  export type TeamUpdateOneWithoutOwnedAgentsNestedInput = {
    create?: XOR<TeamCreateWithoutOwnedAgentsInput, TeamUncheckedCreateWithoutOwnedAgentsInput>
    connectOrCreate?: TeamCreateOrConnectWithoutOwnedAgentsInput
    upsert?: TeamUpsertWithoutOwnedAgentsInput
    disconnect?: TeamWhereInput | boolean
    delete?: TeamWhereInput | boolean
    connect?: TeamWhereUniqueInput
    update?: XOR<XOR<TeamUpdateToOneWithWhereWithoutOwnedAgentsInput, TeamUpdateWithoutOwnedAgentsInput>, TeamUncheckedUpdateWithoutOwnedAgentsInput>
  }

  export type ConversationUpdateManyWithoutAgentNestedInput = {
    create?: XOR<ConversationCreateWithoutAgentInput, ConversationUncheckedCreateWithoutAgentInput> | ConversationCreateWithoutAgentInput[] | ConversationUncheckedCreateWithoutAgentInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutAgentInput | ConversationCreateOrConnectWithoutAgentInput[]
    upsert?: ConversationUpsertWithWhereUniqueWithoutAgentInput | ConversationUpsertWithWhereUniqueWithoutAgentInput[]
    createMany?: ConversationCreateManyAgentInputEnvelope
    set?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    disconnect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    delete?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    update?: ConversationUpdateWithWhereUniqueWithoutAgentInput | ConversationUpdateWithWhereUniqueWithoutAgentInput[]
    updateMany?: ConversationUpdateManyWithWhereWithoutAgentInput | ConversationUpdateManyWithWhereWithoutAgentInput[]
    deleteMany?: ConversationScalarWhereInput | ConversationScalarWhereInput[]
  }

  export type ConversationUncheckedUpdateManyWithoutAgentNestedInput = {
    create?: XOR<ConversationCreateWithoutAgentInput, ConversationUncheckedCreateWithoutAgentInput> | ConversationCreateWithoutAgentInput[] | ConversationUncheckedCreateWithoutAgentInput[]
    connectOrCreate?: ConversationCreateOrConnectWithoutAgentInput | ConversationCreateOrConnectWithoutAgentInput[]
    upsert?: ConversationUpsertWithWhereUniqueWithoutAgentInput | ConversationUpsertWithWhereUniqueWithoutAgentInput[]
    createMany?: ConversationCreateManyAgentInputEnvelope
    set?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    disconnect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    delete?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    connect?: ConversationWhereUniqueInput | ConversationWhereUniqueInput[]
    update?: ConversationUpdateWithWhereUniqueWithoutAgentInput | ConversationUpdateWithWhereUniqueWithoutAgentInput[]
    updateMany?: ConversationUpdateManyWithWhereWithoutAgentInput | ConversationUpdateManyWithWhereWithoutAgentInput[]
    deleteMany?: ConversationScalarWhereInput | ConversationScalarWhereInput[]
  }

  export type FileCreateNestedOneWithoutTextChunkInput = {
    create?: XOR<FileCreateWithoutTextChunkInput, FileUncheckedCreateWithoutTextChunkInput>
    connectOrCreate?: FileCreateOrConnectWithoutTextChunkInput
    connect?: FileWhereUniqueInput
  }

  export type FileUpdateOneRequiredWithoutTextChunkNestedInput = {
    create?: XOR<FileCreateWithoutTextChunkInput, FileUncheckedCreateWithoutTextChunkInput>
    connectOrCreate?: FileCreateOrConnectWithoutTextChunkInput
    upsert?: FileUpsertWithoutTextChunkInput
    connect?: FileWhereUniqueInput
    update?: XOR<XOR<FileUpdateToOneWithWhereWithoutTextChunkInput, FileUpdateWithoutTextChunkInput>, FileUncheckedUpdateWithoutTextChunkInput>
  }

  export type LLMModelCreateNestedManyWithoutProviderInput = {
    create?: XOR<LLMModelCreateWithoutProviderInput, LLMModelUncheckedCreateWithoutProviderInput> | LLMModelCreateWithoutProviderInput[] | LLMModelUncheckedCreateWithoutProviderInput[]
    connectOrCreate?: LLMModelCreateOrConnectWithoutProviderInput | LLMModelCreateOrConnectWithoutProviderInput[]
    createMany?: LLMModelCreateManyProviderInputEnvelope
    connect?: LLMModelWhereUniqueInput | LLMModelWhereUniqueInput[]
  }

  export type UserCreateNestedManyWithoutDefaultLLMProviderInput = {
    create?: XOR<UserCreateWithoutDefaultLLMProviderInput, UserUncheckedCreateWithoutDefaultLLMProviderInput> | UserCreateWithoutDefaultLLMProviderInput[] | UserUncheckedCreateWithoutDefaultLLMProviderInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDefaultLLMProviderInput | UserCreateOrConnectWithoutDefaultLLMProviderInput[]
    createMany?: UserCreateManyDefaultLLMProviderInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type UserCreateNestedOneWithoutOwnedLLMProvidersInput = {
    create?: XOR<UserCreateWithoutOwnedLLMProvidersInput, UserUncheckedCreateWithoutOwnedLLMProvidersInput>
    connectOrCreate?: UserCreateOrConnectWithoutOwnedLLMProvidersInput
    connect?: UserWhereUniqueInput
  }

  export type TeamCreateNestedOneWithoutOwnedLLMProvidersInput = {
    create?: XOR<TeamCreateWithoutOwnedLLMProvidersInput, TeamUncheckedCreateWithoutOwnedLLMProvidersInput>
    connectOrCreate?: TeamCreateOrConnectWithoutOwnedLLMProvidersInput
    connect?: TeamWhereUniqueInput
  }

  export type LLMModelUncheckedCreateNestedManyWithoutProviderInput = {
    create?: XOR<LLMModelCreateWithoutProviderInput, LLMModelUncheckedCreateWithoutProviderInput> | LLMModelCreateWithoutProviderInput[] | LLMModelUncheckedCreateWithoutProviderInput[]
    connectOrCreate?: LLMModelCreateOrConnectWithoutProviderInput | LLMModelCreateOrConnectWithoutProviderInput[]
    createMany?: LLMModelCreateManyProviderInputEnvelope
    connect?: LLMModelWhereUniqueInput | LLMModelWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutDefaultLLMProviderInput = {
    create?: XOR<UserCreateWithoutDefaultLLMProviderInput, UserUncheckedCreateWithoutDefaultLLMProviderInput> | UserCreateWithoutDefaultLLMProviderInput[] | UserUncheckedCreateWithoutDefaultLLMProviderInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDefaultLLMProviderInput | UserCreateOrConnectWithoutDefaultLLMProviderInput[]
    createMany?: UserCreateManyDefaultLLMProviderInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type LLMModelUpdateManyWithoutProviderNestedInput = {
    create?: XOR<LLMModelCreateWithoutProviderInput, LLMModelUncheckedCreateWithoutProviderInput> | LLMModelCreateWithoutProviderInput[] | LLMModelUncheckedCreateWithoutProviderInput[]
    connectOrCreate?: LLMModelCreateOrConnectWithoutProviderInput | LLMModelCreateOrConnectWithoutProviderInput[]
    upsert?: LLMModelUpsertWithWhereUniqueWithoutProviderInput | LLMModelUpsertWithWhereUniqueWithoutProviderInput[]
    createMany?: LLMModelCreateManyProviderInputEnvelope
    set?: LLMModelWhereUniqueInput | LLMModelWhereUniqueInput[]
    disconnect?: LLMModelWhereUniqueInput | LLMModelWhereUniqueInput[]
    delete?: LLMModelWhereUniqueInput | LLMModelWhereUniqueInput[]
    connect?: LLMModelWhereUniqueInput | LLMModelWhereUniqueInput[]
    update?: LLMModelUpdateWithWhereUniqueWithoutProviderInput | LLMModelUpdateWithWhereUniqueWithoutProviderInput[]
    updateMany?: LLMModelUpdateManyWithWhereWithoutProviderInput | LLMModelUpdateManyWithWhereWithoutProviderInput[]
    deleteMany?: LLMModelScalarWhereInput | LLMModelScalarWhereInput[]
  }

  export type UserUpdateManyWithoutDefaultLLMProviderNestedInput = {
    create?: XOR<UserCreateWithoutDefaultLLMProviderInput, UserUncheckedCreateWithoutDefaultLLMProviderInput> | UserCreateWithoutDefaultLLMProviderInput[] | UserUncheckedCreateWithoutDefaultLLMProviderInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDefaultLLMProviderInput | UserCreateOrConnectWithoutDefaultLLMProviderInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutDefaultLLMProviderInput | UserUpsertWithWhereUniqueWithoutDefaultLLMProviderInput[]
    createMany?: UserCreateManyDefaultLLMProviderInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutDefaultLLMProviderInput | UserUpdateWithWhereUniqueWithoutDefaultLLMProviderInput[]
    updateMany?: UserUpdateManyWithWhereWithoutDefaultLLMProviderInput | UserUpdateManyWithWhereWithoutDefaultLLMProviderInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserUpdateOneWithoutOwnedLLMProvidersNestedInput = {
    create?: XOR<UserCreateWithoutOwnedLLMProvidersInput, UserUncheckedCreateWithoutOwnedLLMProvidersInput>
    connectOrCreate?: UserCreateOrConnectWithoutOwnedLLMProvidersInput
    upsert?: UserUpsertWithoutOwnedLLMProvidersInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOwnedLLMProvidersInput, UserUpdateWithoutOwnedLLMProvidersInput>, UserUncheckedUpdateWithoutOwnedLLMProvidersInput>
  }

  export type TeamUpdateOneWithoutOwnedLLMProvidersNestedInput = {
    create?: XOR<TeamCreateWithoutOwnedLLMProvidersInput, TeamUncheckedCreateWithoutOwnedLLMProvidersInput>
    connectOrCreate?: TeamCreateOrConnectWithoutOwnedLLMProvidersInput
    upsert?: TeamUpsertWithoutOwnedLLMProvidersInput
    disconnect?: TeamWhereInput | boolean
    delete?: TeamWhereInput | boolean
    connect?: TeamWhereUniqueInput
    update?: XOR<XOR<TeamUpdateToOneWithWhereWithoutOwnedLLMProvidersInput, TeamUpdateWithoutOwnedLLMProvidersInput>, TeamUncheckedUpdateWithoutOwnedLLMProvidersInput>
  }

  export type LLMModelUncheckedUpdateManyWithoutProviderNestedInput = {
    create?: XOR<LLMModelCreateWithoutProviderInput, LLMModelUncheckedCreateWithoutProviderInput> | LLMModelCreateWithoutProviderInput[] | LLMModelUncheckedCreateWithoutProviderInput[]
    connectOrCreate?: LLMModelCreateOrConnectWithoutProviderInput | LLMModelCreateOrConnectWithoutProviderInput[]
    upsert?: LLMModelUpsertWithWhereUniqueWithoutProviderInput | LLMModelUpsertWithWhereUniqueWithoutProviderInput[]
    createMany?: LLMModelCreateManyProviderInputEnvelope
    set?: LLMModelWhereUniqueInput | LLMModelWhereUniqueInput[]
    disconnect?: LLMModelWhereUniqueInput | LLMModelWhereUniqueInput[]
    delete?: LLMModelWhereUniqueInput | LLMModelWhereUniqueInput[]
    connect?: LLMModelWhereUniqueInput | LLMModelWhereUniqueInput[]
    update?: LLMModelUpdateWithWhereUniqueWithoutProviderInput | LLMModelUpdateWithWhereUniqueWithoutProviderInput[]
    updateMany?: LLMModelUpdateManyWithWhereWithoutProviderInput | LLMModelUpdateManyWithWhereWithoutProviderInput[]
    deleteMany?: LLMModelScalarWhereInput | LLMModelScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutDefaultLLMProviderNestedInput = {
    create?: XOR<UserCreateWithoutDefaultLLMProviderInput, UserUncheckedCreateWithoutDefaultLLMProviderInput> | UserCreateWithoutDefaultLLMProviderInput[] | UserUncheckedCreateWithoutDefaultLLMProviderInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDefaultLLMProviderInput | UserCreateOrConnectWithoutDefaultLLMProviderInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutDefaultLLMProviderInput | UserUpsertWithWhereUniqueWithoutDefaultLLMProviderInput[]
    createMany?: UserCreateManyDefaultLLMProviderInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutDefaultLLMProviderInput | UserUpdateWithWhereUniqueWithoutDefaultLLMProviderInput[]
    updateMany?: UserUpdateManyWithWhereWithoutDefaultLLMProviderInput | UserUpdateManyWithWhereWithoutDefaultLLMProviderInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type LLMProviderCreateNestedOneWithoutModelsInput = {
    create?: XOR<LLMProviderCreateWithoutModelsInput, LLMProviderUncheckedCreateWithoutModelsInput>
    connectOrCreate?: LLMProviderCreateOrConnectWithoutModelsInput
    connect?: LLMProviderWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type LLMProviderUpdateOneRequiredWithoutModelsNestedInput = {
    create?: XOR<LLMProviderCreateWithoutModelsInput, LLMProviderUncheckedCreateWithoutModelsInput>
    connectOrCreate?: LLMProviderCreateOrConnectWithoutModelsInput
    upsert?: LLMProviderUpsertWithoutModelsInput
    connect?: LLMProviderWhereUniqueInput
    update?: XOR<XOR<LLMProviderUpdateToOneWithWhereWithoutModelsInput, LLMProviderUpdateWithoutModelsInput>, LLMProviderUncheckedUpdateWithoutModelsInput>
  }

  export type AgentCreateNestedOneWithoutConversationsInput = {
    create?: XOR<AgentCreateWithoutConversationsInput, AgentUncheckedCreateWithoutConversationsInput>
    connectOrCreate?: AgentCreateOrConnectWithoutConversationsInput
    connect?: AgentWhereUniqueInput
  }

  export type ConversationMessageCreateNestedManyWithoutConversationInput = {
    create?: XOR<ConversationMessageCreateWithoutConversationInput, ConversationMessageUncheckedCreateWithoutConversationInput> | ConversationMessageCreateWithoutConversationInput[] | ConversationMessageUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: ConversationMessageCreateOrConnectWithoutConversationInput | ConversationMessageCreateOrConnectWithoutConversationInput[]
    createMany?: ConversationMessageCreateManyConversationInputEnvelope
    connect?: ConversationMessageWhereUniqueInput | ConversationMessageWhereUniqueInput[]
  }

  export type ConversationMessageUncheckedCreateNestedManyWithoutConversationInput = {
    create?: XOR<ConversationMessageCreateWithoutConversationInput, ConversationMessageUncheckedCreateWithoutConversationInput> | ConversationMessageCreateWithoutConversationInput[] | ConversationMessageUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: ConversationMessageCreateOrConnectWithoutConversationInput | ConversationMessageCreateOrConnectWithoutConversationInput[]
    createMany?: ConversationMessageCreateManyConversationInputEnvelope
    connect?: ConversationMessageWhereUniqueInput | ConversationMessageWhereUniqueInput[]
  }

  export type AgentUpdateOneRequiredWithoutConversationsNestedInput = {
    create?: XOR<AgentCreateWithoutConversationsInput, AgentUncheckedCreateWithoutConversationsInput>
    connectOrCreate?: AgentCreateOrConnectWithoutConversationsInput
    upsert?: AgentUpsertWithoutConversationsInput
    connect?: AgentWhereUniqueInput
    update?: XOR<XOR<AgentUpdateToOneWithWhereWithoutConversationsInput, AgentUpdateWithoutConversationsInput>, AgentUncheckedUpdateWithoutConversationsInput>
  }

  export type ConversationMessageUpdateManyWithoutConversationNestedInput = {
    create?: XOR<ConversationMessageCreateWithoutConversationInput, ConversationMessageUncheckedCreateWithoutConversationInput> | ConversationMessageCreateWithoutConversationInput[] | ConversationMessageUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: ConversationMessageCreateOrConnectWithoutConversationInput | ConversationMessageCreateOrConnectWithoutConversationInput[]
    upsert?: ConversationMessageUpsertWithWhereUniqueWithoutConversationInput | ConversationMessageUpsertWithWhereUniqueWithoutConversationInput[]
    createMany?: ConversationMessageCreateManyConversationInputEnvelope
    set?: ConversationMessageWhereUniqueInput | ConversationMessageWhereUniqueInput[]
    disconnect?: ConversationMessageWhereUniqueInput | ConversationMessageWhereUniqueInput[]
    delete?: ConversationMessageWhereUniqueInput | ConversationMessageWhereUniqueInput[]
    connect?: ConversationMessageWhereUniqueInput | ConversationMessageWhereUniqueInput[]
    update?: ConversationMessageUpdateWithWhereUniqueWithoutConversationInput | ConversationMessageUpdateWithWhereUniqueWithoutConversationInput[]
    updateMany?: ConversationMessageUpdateManyWithWhereWithoutConversationInput | ConversationMessageUpdateManyWithWhereWithoutConversationInput[]
    deleteMany?: ConversationMessageScalarWhereInput | ConversationMessageScalarWhereInput[]
  }

  export type ConversationMessageUncheckedUpdateManyWithoutConversationNestedInput = {
    create?: XOR<ConversationMessageCreateWithoutConversationInput, ConversationMessageUncheckedCreateWithoutConversationInput> | ConversationMessageCreateWithoutConversationInput[] | ConversationMessageUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: ConversationMessageCreateOrConnectWithoutConversationInput | ConversationMessageCreateOrConnectWithoutConversationInput[]
    upsert?: ConversationMessageUpsertWithWhereUniqueWithoutConversationInput | ConversationMessageUpsertWithWhereUniqueWithoutConversationInput[]
    createMany?: ConversationMessageCreateManyConversationInputEnvelope
    set?: ConversationMessageWhereUniqueInput | ConversationMessageWhereUniqueInput[]
    disconnect?: ConversationMessageWhereUniqueInput | ConversationMessageWhereUniqueInput[]
    delete?: ConversationMessageWhereUniqueInput | ConversationMessageWhereUniqueInput[]
    connect?: ConversationMessageWhereUniqueInput | ConversationMessageWhereUniqueInput[]
    update?: ConversationMessageUpdateWithWhereUniqueWithoutConversationInput | ConversationMessageUpdateWithWhereUniqueWithoutConversationInput[]
    updateMany?: ConversationMessageUpdateManyWithWhereWithoutConversationInput | ConversationMessageUpdateManyWithWhereWithoutConversationInput[]
    deleteMany?: ConversationMessageScalarWhereInput | ConversationMessageScalarWhereInput[]
  }

  export type ConversationCreateNestedOneWithoutMessagesInput = {
    create?: XOR<ConversationCreateWithoutMessagesInput, ConversationUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: ConversationCreateOrConnectWithoutMessagesInput
    connect?: ConversationWhereUniqueInput
  }

  export type ConversationUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: XOR<ConversationCreateWithoutMessagesInput, ConversationUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: ConversationCreateOrConnectWithoutMessagesInput
    upsert?: ConversationUpsertWithoutMessagesInput
    connect?: ConversationWhereUniqueInput
    update?: XOR<XOR<ConversationUpdateToOneWithWhereWithoutMessagesInput, ConversationUpdateWithoutMessagesInput>, ConversationUncheckedUpdateWithoutMessagesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
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
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
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
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
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

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type UserCreateWithoutCreatedTeamsInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    teamMemberships?: MemberTeamCreateNestedManyWithoutUserInput
    teams?: TeamCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentCreateNestedManyWithoutUserInput
    createdAgents?: AgentCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskCreateNestedManyWithoutCreatedByInput
    defaultLLMProvider?: LLMProviderCreateNestedOneWithoutUsersWithDefaultInput
    ownedLLMProviders?: LLMProviderCreateNestedManyWithoutUserOwnerInput
  }

  export type UserUncheckedCreateWithoutCreatedTeamsInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    defaultLLMProviderId?: string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    teamMemberships?: MemberTeamUncheckedCreateNestedManyWithoutUserInput
    teams?: TeamUncheckedCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeUncheckedCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeUncheckedCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentUncheckedCreateNestedManyWithoutUserInput
    createdAgents?: AgentUncheckedCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskUncheckedCreateNestedManyWithoutCreatedByInput
    ownedLLMProviders?: LLMProviderUncheckedCreateNestedManyWithoutUserOwnerInput
  }

  export type UserCreateOrConnectWithoutCreatedTeamsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCreatedTeamsInput, UserUncheckedCreateWithoutCreatedTeamsInput>
  }

  export type MemberTeamCreateWithoutTeamInput = {
    id?: string
    permission?: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    user: UserCreateNestedOneWithoutTeamMembershipsInput
  }

  export type MemberTeamUncheckedCreateWithoutTeamInput = {
    id?: string
    permission?: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    userId: string
  }

  export type MemberTeamCreateOrConnectWithoutTeamInput = {
    where: MemberTeamWhereUniqueInput
    create: XOR<MemberTeamCreateWithoutTeamInput, MemberTeamUncheckedCreateWithoutTeamInput>
  }

  export type MemberTeamCreateManyTeamInputEnvelope = {
    data: MemberTeamCreateManyTeamInput | MemberTeamCreateManyTeamInput[]
  }

  export type UserCreateWithoutTeamsInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamCreateNestedManyWithoutUserInput
    createdKnowledge?: KnowledgeCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentCreateNestedManyWithoutUserInput
    createdAgents?: AgentCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskCreateNestedManyWithoutCreatedByInput
    defaultLLMProvider?: LLMProviderCreateNestedOneWithoutUsersWithDefaultInput
    ownedLLMProviders?: LLMProviderCreateNestedManyWithoutUserOwnerInput
  }

  export type UserUncheckedCreateWithoutTeamsInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    defaultLLMProviderId?: string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamUncheckedCreateNestedManyWithoutUserInput
    createdKnowledge?: KnowledgeUncheckedCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeUncheckedCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentUncheckedCreateNestedManyWithoutUserInput
    createdAgents?: AgentUncheckedCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskUncheckedCreateNestedManyWithoutCreatedByInput
    ownedLLMProviders?: LLMProviderUncheckedCreateNestedManyWithoutUserOwnerInput
  }

  export type UserCreateOrConnectWithoutTeamsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTeamsInput, UserUncheckedCreateWithoutTeamsInput>
  }

  export type KnowledgeCreateWithoutTeamsInput = {
    id?: string
    name: string
    description: string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedKnowledgeInput
    users?: UserCreateNestedManyWithoutKnowledgeInput
    files?: FileCreateNestedManyWithoutKnowledgeInput
  }

  export type KnowledgeUncheckedCreateWithoutTeamsInput = {
    id?: string
    name: string
    description: string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    users?: UserUncheckedCreateNestedManyWithoutKnowledgeInput
    files?: FileUncheckedCreateNestedManyWithoutKnowledgeInput
  }

  export type KnowledgeCreateOrConnectWithoutTeamsInput = {
    where: KnowledgeWhereUniqueInput
    create: XOR<KnowledgeCreateWithoutTeamsInput, KnowledgeUncheckedCreateWithoutTeamsInput>
  }

  export type AgentCreateWithoutTeamInput = {
    id?: string
    name: string
    description: string
    flowConfig: string
    isActive?: boolean
    ownerType: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedAgentsInput
    user?: UserCreateNestedOneWithoutOwnedAgentsInput
    conversations?: ConversationCreateNestedManyWithoutAgentInput
  }

  export type AgentUncheckedCreateWithoutTeamInput = {
    id?: string
    name: string
    description: string
    flowConfig: string
    isActive?: boolean
    ownerType: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    userId?: string | null
    conversations?: ConversationUncheckedCreateNestedManyWithoutAgentInput
  }

  export type AgentCreateOrConnectWithoutTeamInput = {
    where: AgentWhereUniqueInput
    create: XOR<AgentCreateWithoutTeamInput, AgentUncheckedCreateWithoutTeamInput>
  }

  export type AgentCreateManyTeamInputEnvelope = {
    data: AgentCreateManyTeamInput | AgentCreateManyTeamInput[]
  }

  export type LLMProviderCreateWithoutTeamOwnerInput = {
    id?: string
    name?: string
    description?: string | null
    providerType: string
    endpointUrl: string
    isActive?: boolean
    isDefault?: boolean
    apiKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerType?: string
    config?: NullableJsonNullValueInput | InputJsonValue
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    models?: LLMModelCreateNestedManyWithoutProviderInput
    usersWithDefault?: UserCreateNestedManyWithoutDefaultLLMProviderInput
    userOwner?: UserCreateNestedOneWithoutOwnedLLMProvidersInput
  }

  export type LLMProviderUncheckedCreateWithoutTeamOwnerInput = {
    id?: string
    name?: string
    description?: string | null
    providerType: string
    endpointUrl: string
    isActive?: boolean
    isDefault?: boolean
    apiKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerType?: string
    config?: NullableJsonNullValueInput | InputJsonValue
    userOwnerId?: string | null
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    models?: LLMModelUncheckedCreateNestedManyWithoutProviderInput
    usersWithDefault?: UserUncheckedCreateNestedManyWithoutDefaultLLMProviderInput
  }

  export type LLMProviderCreateOrConnectWithoutTeamOwnerInput = {
    where: LLMProviderWhereUniqueInput
    create: XOR<LLMProviderCreateWithoutTeamOwnerInput, LLMProviderUncheckedCreateWithoutTeamOwnerInput>
  }

  export type LLMProviderCreateManyTeamOwnerInputEnvelope = {
    data: LLMProviderCreateManyTeamOwnerInput | LLMProviderCreateManyTeamOwnerInput[]
  }

  export type UserUpsertWithoutCreatedTeamsInput = {
    update: XOR<UserUpdateWithoutCreatedTeamsInput, UserUncheckedUpdateWithoutCreatedTeamsInput>
    create: XOR<UserCreateWithoutCreatedTeamsInput, UserUncheckedCreateWithoutCreatedTeamsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCreatedTeamsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCreatedTeamsInput, UserUncheckedUpdateWithoutCreatedTeamsInput>
  }

  export type UserUpdateWithoutCreatedTeamsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    teamMemberships?: MemberTeamUpdateManyWithoutUserNestedInput
    teams?: TeamUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUpdateManyWithoutCreatedByNestedInput
    defaultLLMProvider?: LLMProviderUpdateOneWithoutUsersWithDefaultNestedInput
    ownedLLMProviders?: LLMProviderUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserUncheckedUpdateWithoutCreatedTeamsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    defaultLLMProviderId?: NullableStringFieldUpdateOperationsInput | string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    teamMemberships?: MemberTeamUncheckedUpdateManyWithoutUserNestedInput
    teams?: TeamUncheckedUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUncheckedUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUncheckedUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUncheckedUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUncheckedUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUncheckedUpdateManyWithoutCreatedByNestedInput
    ownedLLMProviders?: LLMProviderUncheckedUpdateManyWithoutUserOwnerNestedInput
  }

  export type MemberTeamUpsertWithWhereUniqueWithoutTeamInput = {
    where: MemberTeamWhereUniqueInput
    update: XOR<MemberTeamUpdateWithoutTeamInput, MemberTeamUncheckedUpdateWithoutTeamInput>
    create: XOR<MemberTeamCreateWithoutTeamInput, MemberTeamUncheckedCreateWithoutTeamInput>
  }

  export type MemberTeamUpdateWithWhereUniqueWithoutTeamInput = {
    where: MemberTeamWhereUniqueInput
    data: XOR<MemberTeamUpdateWithoutTeamInput, MemberTeamUncheckedUpdateWithoutTeamInput>
  }

  export type MemberTeamUpdateManyWithWhereWithoutTeamInput = {
    where: MemberTeamScalarWhereInput
    data: XOR<MemberTeamUpdateManyMutationInput, MemberTeamUncheckedUpdateManyWithoutTeamInput>
  }

  export type MemberTeamScalarWhereInput = {
    AND?: MemberTeamScalarWhereInput | MemberTeamScalarWhereInput[]
    OR?: MemberTeamScalarWhereInput[]
    NOT?: MemberTeamScalarWhereInput | MemberTeamScalarWhereInput[]
    id?: StringFilter<"MemberTeam"> | string
    permission?: StringFilter<"MemberTeam"> | string
    joinedAt?: DateTimeFilter<"MemberTeam"> | Date | string
    leftAt?: DateTimeNullableFilter<"MemberTeam"> | Date | string | null
    teamId?: StringFilter<"MemberTeam"> | string
    userId?: StringFilter<"MemberTeam"> | string
  }

  export type UserUpsertWithWhereUniqueWithoutTeamsInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutTeamsInput, UserUncheckedUpdateWithoutTeamsInput>
    create: XOR<UserCreateWithoutTeamsInput, UserUncheckedCreateWithoutTeamsInput>
  }

  export type UserUpdateWithWhereUniqueWithoutTeamsInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutTeamsInput, UserUncheckedUpdateWithoutTeamsInput>
  }

  export type UserUpdateManyWithWhereWithoutTeamsInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutTeamsInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    code?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    description?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    permission?: StringFilter<"User"> | string
    defaultLLMProviderId?: StringNullableFilter<"User"> | string | null
    llmPreferences?: JsonNullableFilter<"User">
  }

  export type KnowledgeUpsertWithWhereUniqueWithoutTeamsInput = {
    where: KnowledgeWhereUniqueInput
    update: XOR<KnowledgeUpdateWithoutTeamsInput, KnowledgeUncheckedUpdateWithoutTeamsInput>
    create: XOR<KnowledgeCreateWithoutTeamsInput, KnowledgeUncheckedCreateWithoutTeamsInput>
  }

  export type KnowledgeUpdateWithWhereUniqueWithoutTeamsInput = {
    where: KnowledgeWhereUniqueInput
    data: XOR<KnowledgeUpdateWithoutTeamsInput, KnowledgeUncheckedUpdateWithoutTeamsInput>
  }

  export type KnowledgeUpdateManyWithWhereWithoutTeamsInput = {
    where: KnowledgeScalarWhereInput
    data: XOR<KnowledgeUpdateManyMutationInput, KnowledgeUncheckedUpdateManyWithoutTeamsInput>
  }

  export type KnowledgeScalarWhereInput = {
    AND?: KnowledgeScalarWhereInput | KnowledgeScalarWhereInput[]
    OR?: KnowledgeScalarWhereInput[]
    NOT?: KnowledgeScalarWhereInput | KnowledgeScalarWhereInput[]
    id?: StringFilter<"Knowledge"> | string
    name?: StringFilter<"Knowledge"> | string
    description?: StringFilter<"Knowledge"> | string
    config?: JsonNullableFilter<"Knowledge">
    createdAt?: DateTimeFilter<"Knowledge"> | Date | string
    updatedAt?: DateTimeFilter<"Knowledge"> | Date | string
    userId?: StringFilter<"Knowledge"> | string
  }

  export type AgentUpsertWithWhereUniqueWithoutTeamInput = {
    where: AgentWhereUniqueInput
    update: XOR<AgentUpdateWithoutTeamInput, AgentUncheckedUpdateWithoutTeamInput>
    create: XOR<AgentCreateWithoutTeamInput, AgentUncheckedCreateWithoutTeamInput>
  }

  export type AgentUpdateWithWhereUniqueWithoutTeamInput = {
    where: AgentWhereUniqueInput
    data: XOR<AgentUpdateWithoutTeamInput, AgentUncheckedUpdateWithoutTeamInput>
  }

  export type AgentUpdateManyWithWhereWithoutTeamInput = {
    where: AgentScalarWhereInput
    data: XOR<AgentUpdateManyMutationInput, AgentUncheckedUpdateManyWithoutTeamInput>
  }

  export type AgentScalarWhereInput = {
    AND?: AgentScalarWhereInput | AgentScalarWhereInput[]
    OR?: AgentScalarWhereInput[]
    NOT?: AgentScalarWhereInput | AgentScalarWhereInput[]
    id?: StringFilter<"Agent"> | string
    name?: StringFilter<"Agent"> | string
    description?: StringFilter<"Agent"> | string
    flowConfig?: StringFilter<"Agent"> | string
    isActive?: BoolFilter<"Agent"> | boolean
    ownerType?: StringFilter<"Agent"> | string
    createdAt?: DateTimeFilter<"Agent"> | Date | string
    updatedAt?: DateTimeFilter<"Agent"> | Date | string
    createdById?: StringFilter<"Agent"> | string
    userId?: StringNullableFilter<"Agent"> | string | null
    teamId?: StringNullableFilter<"Agent"> | string | null
  }

  export type LLMProviderUpsertWithWhereUniqueWithoutTeamOwnerInput = {
    where: LLMProviderWhereUniqueInput
    update: XOR<LLMProviderUpdateWithoutTeamOwnerInput, LLMProviderUncheckedUpdateWithoutTeamOwnerInput>
    create: XOR<LLMProviderCreateWithoutTeamOwnerInput, LLMProviderUncheckedCreateWithoutTeamOwnerInput>
  }

  export type LLMProviderUpdateWithWhereUniqueWithoutTeamOwnerInput = {
    where: LLMProviderWhereUniqueInput
    data: XOR<LLMProviderUpdateWithoutTeamOwnerInput, LLMProviderUncheckedUpdateWithoutTeamOwnerInput>
  }

  export type LLMProviderUpdateManyWithWhereWithoutTeamOwnerInput = {
    where: LLMProviderScalarWhereInput
    data: XOR<LLMProviderUpdateManyMutationInput, LLMProviderUncheckedUpdateManyWithoutTeamOwnerInput>
  }

  export type LLMProviderScalarWhereInput = {
    AND?: LLMProviderScalarWhereInput | LLMProviderScalarWhereInput[]
    OR?: LLMProviderScalarWhereInput[]
    NOT?: LLMProviderScalarWhereInput | LLMProviderScalarWhereInput[]
    id?: StringFilter<"LLMProvider"> | string
    name?: StringFilter<"LLMProvider"> | string
    description?: StringNullableFilter<"LLMProvider"> | string | null
    providerType?: StringFilter<"LLMProvider"> | string
    endpointUrl?: StringFilter<"LLMProvider"> | string
    isActive?: BoolFilter<"LLMProvider"> | boolean
    isDefault?: BoolFilter<"LLMProvider"> | boolean
    apiKey?: StringNullableFilter<"LLMProvider"> | string | null
    createdAt?: DateTimeFilter<"LLMProvider"> | Date | string
    updatedAt?: DateTimeFilter<"LLMProvider"> | Date | string
    ownerType?: StringFilter<"LLMProvider"> | string
    config?: JsonNullableFilter<"LLMProvider">
    userOwnerId?: StringNullableFilter<"LLMProvider"> | string | null
    teamOwnerId?: StringNullableFilter<"LLMProvider"> | string | null
    permissionSettings?: JsonNullableFilter<"LLMProvider">
  }

  export type TeamCreateWithoutMembersInput = {
    id?: string
    name: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedTeamsInput
    users?: UserCreateNestedManyWithoutTeamsInput
    knowledge?: KnowledgeCreateNestedManyWithoutTeamsInput
    ownedAgents?: AgentCreateNestedManyWithoutTeamInput
    ownedLLMProviders?: LLMProviderCreateNestedManyWithoutTeamOwnerInput
  }

  export type TeamUncheckedCreateWithoutMembersInput = {
    id?: string
    name: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    users?: UserUncheckedCreateNestedManyWithoutTeamsInput
    knowledge?: KnowledgeUncheckedCreateNestedManyWithoutTeamsInput
    ownedAgents?: AgentUncheckedCreateNestedManyWithoutTeamInput
    ownedLLMProviders?: LLMProviderUncheckedCreateNestedManyWithoutTeamOwnerInput
  }

  export type TeamCreateOrConnectWithoutMembersInput = {
    where: TeamWhereUniqueInput
    create: XOR<TeamCreateWithoutMembersInput, TeamUncheckedCreateWithoutMembersInput>
  }

  export type UserCreateWithoutTeamMembershipsInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamCreateNestedManyWithoutCreatedByInput
    teams?: TeamCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentCreateNestedManyWithoutUserInput
    createdAgents?: AgentCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskCreateNestedManyWithoutCreatedByInput
    defaultLLMProvider?: LLMProviderCreateNestedOneWithoutUsersWithDefaultInput
    ownedLLMProviders?: LLMProviderCreateNestedManyWithoutUserOwnerInput
  }

  export type UserUncheckedCreateWithoutTeamMembershipsInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    defaultLLMProviderId?: string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedCreateNestedManyWithoutCreatedByInput
    teams?: TeamUncheckedCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeUncheckedCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeUncheckedCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentUncheckedCreateNestedManyWithoutUserInput
    createdAgents?: AgentUncheckedCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskUncheckedCreateNestedManyWithoutCreatedByInput
    ownedLLMProviders?: LLMProviderUncheckedCreateNestedManyWithoutUserOwnerInput
  }

  export type UserCreateOrConnectWithoutTeamMembershipsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTeamMembershipsInput, UserUncheckedCreateWithoutTeamMembershipsInput>
  }

  export type TeamUpsertWithoutMembersInput = {
    update: XOR<TeamUpdateWithoutMembersInput, TeamUncheckedUpdateWithoutMembersInput>
    create: XOR<TeamCreateWithoutMembersInput, TeamUncheckedCreateWithoutMembersInput>
    where?: TeamWhereInput
  }

  export type TeamUpdateToOneWithWhereWithoutMembersInput = {
    where?: TeamWhereInput
    data: XOR<TeamUpdateWithoutMembersInput, TeamUncheckedUpdateWithoutMembersInput>
  }

  export type TeamUpdateWithoutMembersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedTeamsNestedInput
    users?: UserUpdateManyWithoutTeamsNestedInput
    knowledge?: KnowledgeUpdateManyWithoutTeamsNestedInput
    ownedAgents?: AgentUpdateManyWithoutTeamNestedInput
    ownedLLMProviders?: LLMProviderUpdateManyWithoutTeamOwnerNestedInput
  }

  export type TeamUncheckedUpdateWithoutMembersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    users?: UserUncheckedUpdateManyWithoutTeamsNestedInput
    knowledge?: KnowledgeUncheckedUpdateManyWithoutTeamsNestedInput
    ownedAgents?: AgentUncheckedUpdateManyWithoutTeamNestedInput
    ownedLLMProviders?: LLMProviderUncheckedUpdateManyWithoutTeamOwnerNestedInput
  }

  export type UserUpsertWithoutTeamMembershipsInput = {
    update: XOR<UserUpdateWithoutTeamMembershipsInput, UserUncheckedUpdateWithoutTeamMembershipsInput>
    create: XOR<UserCreateWithoutTeamMembershipsInput, UserUncheckedCreateWithoutTeamMembershipsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTeamMembershipsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTeamMembershipsInput, UserUncheckedUpdateWithoutTeamMembershipsInput>
  }

  export type UserUpdateWithoutTeamMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUpdateManyWithoutCreatedByNestedInput
    teams?: TeamUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUpdateManyWithoutCreatedByNestedInput
    defaultLLMProvider?: LLMProviderUpdateOneWithoutUsersWithDefaultNestedInput
    ownedLLMProviders?: LLMProviderUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserUncheckedUpdateWithoutTeamMembershipsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    defaultLLMProviderId?: NullableStringFieldUpdateOperationsInput | string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedUpdateManyWithoutCreatedByNestedInput
    teams?: TeamUncheckedUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUncheckedUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUncheckedUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUncheckedUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUncheckedUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUncheckedUpdateManyWithoutCreatedByNestedInput
    ownedLLMProviders?: LLMProviderUncheckedUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserCreateWithoutCreatedKnowledgeInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamCreateNestedManyWithoutUserInput
    teams?: TeamCreateNestedManyWithoutUsersInput
    knowledge?: KnowledgeCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentCreateNestedManyWithoutUserInput
    createdAgents?: AgentCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskCreateNestedManyWithoutCreatedByInput
    defaultLLMProvider?: LLMProviderCreateNestedOneWithoutUsersWithDefaultInput
    ownedLLMProviders?: LLMProviderCreateNestedManyWithoutUserOwnerInput
  }

  export type UserUncheckedCreateWithoutCreatedKnowledgeInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    defaultLLMProviderId?: string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamUncheckedCreateNestedManyWithoutUserInput
    teams?: TeamUncheckedCreateNestedManyWithoutUsersInput
    knowledge?: KnowledgeUncheckedCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentUncheckedCreateNestedManyWithoutUserInput
    createdAgents?: AgentUncheckedCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskUncheckedCreateNestedManyWithoutCreatedByInput
    ownedLLMProviders?: LLMProviderUncheckedCreateNestedManyWithoutUserOwnerInput
  }

  export type UserCreateOrConnectWithoutCreatedKnowledgeInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCreatedKnowledgeInput, UserUncheckedCreateWithoutCreatedKnowledgeInput>
  }

  export type UserCreateWithoutKnowledgeInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamCreateNestedManyWithoutUserInput
    teams?: TeamCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeCreateNestedManyWithoutCreatedByInput
    ownedAgents?: AgentCreateNestedManyWithoutUserInput
    createdAgents?: AgentCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskCreateNestedManyWithoutCreatedByInput
    defaultLLMProvider?: LLMProviderCreateNestedOneWithoutUsersWithDefaultInput
    ownedLLMProviders?: LLMProviderCreateNestedManyWithoutUserOwnerInput
  }

  export type UserUncheckedCreateWithoutKnowledgeInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    defaultLLMProviderId?: string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamUncheckedCreateNestedManyWithoutUserInput
    teams?: TeamUncheckedCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeUncheckedCreateNestedManyWithoutCreatedByInput
    ownedAgents?: AgentUncheckedCreateNestedManyWithoutUserInput
    createdAgents?: AgentUncheckedCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskUncheckedCreateNestedManyWithoutCreatedByInput
    ownedLLMProviders?: LLMProviderUncheckedCreateNestedManyWithoutUserOwnerInput
  }

  export type UserCreateOrConnectWithoutKnowledgeInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutKnowledgeInput, UserUncheckedCreateWithoutKnowledgeInput>
  }

  export type TeamCreateWithoutKnowledgeInput = {
    id?: string
    name: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedTeamsInput
    members?: MemberTeamCreateNestedManyWithoutTeamInput
    users?: UserCreateNestedManyWithoutTeamsInput
    ownedAgents?: AgentCreateNestedManyWithoutTeamInput
    ownedLLMProviders?: LLMProviderCreateNestedManyWithoutTeamOwnerInput
  }

  export type TeamUncheckedCreateWithoutKnowledgeInput = {
    id?: string
    name: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    members?: MemberTeamUncheckedCreateNestedManyWithoutTeamInput
    users?: UserUncheckedCreateNestedManyWithoutTeamsInput
    ownedAgents?: AgentUncheckedCreateNestedManyWithoutTeamInput
    ownedLLMProviders?: LLMProviderUncheckedCreateNestedManyWithoutTeamOwnerInput
  }

  export type TeamCreateOrConnectWithoutKnowledgeInput = {
    where: TeamWhereUniqueInput
    create: XOR<TeamCreateWithoutKnowledgeInput, TeamUncheckedCreateWithoutKnowledgeInput>
  }

  export type FileCreateWithoutKnowledgeInput = {
    id?: string
    filename: string
    originalName: string
    path: string
    mimetype: string
    size: number
    content?: string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    parsingStatus?: string | null
    parsingTasks?: FileParsingTaskCreateNestedManyWithoutFileInput
    TextChunk?: TextChunkCreateNestedManyWithoutFileInput
  }

  export type FileUncheckedCreateWithoutKnowledgeInput = {
    id?: string
    filename: string
    originalName: string
    path: string
    mimetype: string
    size: number
    content?: string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    parsingStatus?: string | null
    parsingTasks?: FileParsingTaskUncheckedCreateNestedManyWithoutFileInput
    TextChunk?: TextChunkUncheckedCreateNestedManyWithoutFileInput
  }

  export type FileCreateOrConnectWithoutKnowledgeInput = {
    where: FileWhereUniqueInput
    create: XOR<FileCreateWithoutKnowledgeInput, FileUncheckedCreateWithoutKnowledgeInput>
  }

  export type FileCreateManyKnowledgeInputEnvelope = {
    data: FileCreateManyKnowledgeInput | FileCreateManyKnowledgeInput[]
  }

  export type UserUpsertWithoutCreatedKnowledgeInput = {
    update: XOR<UserUpdateWithoutCreatedKnowledgeInput, UserUncheckedUpdateWithoutCreatedKnowledgeInput>
    create: XOR<UserCreateWithoutCreatedKnowledgeInput, UserUncheckedCreateWithoutCreatedKnowledgeInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCreatedKnowledgeInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCreatedKnowledgeInput, UserUncheckedUpdateWithoutCreatedKnowledgeInput>
  }

  export type UserUpdateWithoutCreatedKnowledgeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUpdateManyWithoutUserNestedInput
    teams?: TeamUpdateManyWithoutUsersNestedInput
    knowledge?: KnowledgeUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUpdateManyWithoutCreatedByNestedInput
    defaultLLMProvider?: LLMProviderUpdateOneWithoutUsersWithDefaultNestedInput
    ownedLLMProviders?: LLMProviderUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserUncheckedUpdateWithoutCreatedKnowledgeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    defaultLLMProviderId?: NullableStringFieldUpdateOperationsInput | string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUncheckedUpdateManyWithoutUserNestedInput
    teams?: TeamUncheckedUpdateManyWithoutUsersNestedInput
    knowledge?: KnowledgeUncheckedUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUncheckedUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUncheckedUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUncheckedUpdateManyWithoutCreatedByNestedInput
    ownedLLMProviders?: LLMProviderUncheckedUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserUpsertWithWhereUniqueWithoutKnowledgeInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutKnowledgeInput, UserUncheckedUpdateWithoutKnowledgeInput>
    create: XOR<UserCreateWithoutKnowledgeInput, UserUncheckedCreateWithoutKnowledgeInput>
  }

  export type UserUpdateWithWhereUniqueWithoutKnowledgeInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutKnowledgeInput, UserUncheckedUpdateWithoutKnowledgeInput>
  }

  export type UserUpdateManyWithWhereWithoutKnowledgeInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutKnowledgeInput>
  }

  export type TeamUpsertWithWhereUniqueWithoutKnowledgeInput = {
    where: TeamWhereUniqueInput
    update: XOR<TeamUpdateWithoutKnowledgeInput, TeamUncheckedUpdateWithoutKnowledgeInput>
    create: XOR<TeamCreateWithoutKnowledgeInput, TeamUncheckedCreateWithoutKnowledgeInput>
  }

  export type TeamUpdateWithWhereUniqueWithoutKnowledgeInput = {
    where: TeamWhereUniqueInput
    data: XOR<TeamUpdateWithoutKnowledgeInput, TeamUncheckedUpdateWithoutKnowledgeInput>
  }

  export type TeamUpdateManyWithWhereWithoutKnowledgeInput = {
    where: TeamScalarWhereInput
    data: XOR<TeamUpdateManyMutationInput, TeamUncheckedUpdateManyWithoutKnowledgeInput>
  }

  export type TeamScalarWhereInput = {
    AND?: TeamScalarWhereInput | TeamScalarWhereInput[]
    OR?: TeamScalarWhereInput[]
    NOT?: TeamScalarWhereInput | TeamScalarWhereInput[]
    id?: StringFilter<"Team"> | string
    name?: StringFilter<"Team"> | string
    description?: StringFilter<"Team"> | string
    createdAt?: DateTimeFilter<"Team"> | Date | string
    updatedAt?: DateTimeFilter<"Team"> | Date | string
    createdById?: StringFilter<"Team"> | string
  }

  export type FileUpsertWithWhereUniqueWithoutKnowledgeInput = {
    where: FileWhereUniqueInput
    update: XOR<FileUpdateWithoutKnowledgeInput, FileUncheckedUpdateWithoutKnowledgeInput>
    create: XOR<FileCreateWithoutKnowledgeInput, FileUncheckedCreateWithoutKnowledgeInput>
  }

  export type FileUpdateWithWhereUniqueWithoutKnowledgeInput = {
    where: FileWhereUniqueInput
    data: XOR<FileUpdateWithoutKnowledgeInput, FileUncheckedUpdateWithoutKnowledgeInput>
  }

  export type FileUpdateManyWithWhereWithoutKnowledgeInput = {
    where: FileScalarWhereInput
    data: XOR<FileUpdateManyMutationInput, FileUncheckedUpdateManyWithoutKnowledgeInput>
  }

  export type FileScalarWhereInput = {
    AND?: FileScalarWhereInput | FileScalarWhereInput[]
    OR?: FileScalarWhereInput[]
    NOT?: FileScalarWhereInput | FileScalarWhereInput[]
    id?: StringFilter<"File"> | string
    filename?: StringFilter<"File"> | string
    originalName?: StringFilter<"File"> | string
    path?: StringFilter<"File"> | string
    mimetype?: StringFilter<"File"> | string
    size?: IntFilter<"File"> | number
    content?: StringNullableFilter<"File"> | string | null
    config?: JsonNullableFilter<"File">
    createdAt?: DateTimeFilter<"File"> | Date | string
    parsingStatus?: StringNullableFilter<"File"> | string | null
    knowledgeId?: StringFilter<"File"> | string
  }

  export type TeamCreateWithoutCreatedByInput = {
    id?: string
    name: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: MemberTeamCreateNestedManyWithoutTeamInput
    users?: UserCreateNestedManyWithoutTeamsInput
    knowledge?: KnowledgeCreateNestedManyWithoutTeamsInput
    ownedAgents?: AgentCreateNestedManyWithoutTeamInput
    ownedLLMProviders?: LLMProviderCreateNestedManyWithoutTeamOwnerInput
  }

  export type TeamUncheckedCreateWithoutCreatedByInput = {
    id?: string
    name: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: MemberTeamUncheckedCreateNestedManyWithoutTeamInput
    users?: UserUncheckedCreateNestedManyWithoutTeamsInput
    knowledge?: KnowledgeUncheckedCreateNestedManyWithoutTeamsInput
    ownedAgents?: AgentUncheckedCreateNestedManyWithoutTeamInput
    ownedLLMProviders?: LLMProviderUncheckedCreateNestedManyWithoutTeamOwnerInput
  }

  export type TeamCreateOrConnectWithoutCreatedByInput = {
    where: TeamWhereUniqueInput
    create: XOR<TeamCreateWithoutCreatedByInput, TeamUncheckedCreateWithoutCreatedByInput>
  }

  export type TeamCreateManyCreatedByInputEnvelope = {
    data: TeamCreateManyCreatedByInput | TeamCreateManyCreatedByInput[]
  }

  export type MemberTeamCreateWithoutUserInput = {
    id?: string
    permission?: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    team: TeamCreateNestedOneWithoutMembersInput
  }

  export type MemberTeamUncheckedCreateWithoutUserInput = {
    id?: string
    permission?: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    teamId: string
  }

  export type MemberTeamCreateOrConnectWithoutUserInput = {
    where: MemberTeamWhereUniqueInput
    create: XOR<MemberTeamCreateWithoutUserInput, MemberTeamUncheckedCreateWithoutUserInput>
  }

  export type MemberTeamCreateManyUserInputEnvelope = {
    data: MemberTeamCreateManyUserInput | MemberTeamCreateManyUserInput[]
  }

  export type TeamCreateWithoutUsersInput = {
    id?: string
    name: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedTeamsInput
    members?: MemberTeamCreateNestedManyWithoutTeamInput
    knowledge?: KnowledgeCreateNestedManyWithoutTeamsInput
    ownedAgents?: AgentCreateNestedManyWithoutTeamInput
    ownedLLMProviders?: LLMProviderCreateNestedManyWithoutTeamOwnerInput
  }

  export type TeamUncheckedCreateWithoutUsersInput = {
    id?: string
    name: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    members?: MemberTeamUncheckedCreateNestedManyWithoutTeamInput
    knowledge?: KnowledgeUncheckedCreateNestedManyWithoutTeamsInput
    ownedAgents?: AgentUncheckedCreateNestedManyWithoutTeamInput
    ownedLLMProviders?: LLMProviderUncheckedCreateNestedManyWithoutTeamOwnerInput
  }

  export type TeamCreateOrConnectWithoutUsersInput = {
    where: TeamWhereUniqueInput
    create: XOR<TeamCreateWithoutUsersInput, TeamUncheckedCreateWithoutUsersInput>
  }

  export type KnowledgeCreateWithoutCreatedByInput = {
    id?: string
    name: string
    description: string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutKnowledgeInput
    teams?: TeamCreateNestedManyWithoutKnowledgeInput
    files?: FileCreateNestedManyWithoutKnowledgeInput
  }

  export type KnowledgeUncheckedCreateWithoutCreatedByInput = {
    id?: string
    name: string
    description: string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutKnowledgeInput
    teams?: TeamUncheckedCreateNestedManyWithoutKnowledgeInput
    files?: FileUncheckedCreateNestedManyWithoutKnowledgeInput
  }

  export type KnowledgeCreateOrConnectWithoutCreatedByInput = {
    where: KnowledgeWhereUniqueInput
    create: XOR<KnowledgeCreateWithoutCreatedByInput, KnowledgeUncheckedCreateWithoutCreatedByInput>
  }

  export type KnowledgeCreateManyCreatedByInputEnvelope = {
    data: KnowledgeCreateManyCreatedByInput | KnowledgeCreateManyCreatedByInput[]
  }

  export type KnowledgeCreateWithoutUsersInput = {
    id?: string
    name: string
    description: string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedKnowledgeInput
    teams?: TeamCreateNestedManyWithoutKnowledgeInput
    files?: FileCreateNestedManyWithoutKnowledgeInput
  }

  export type KnowledgeUncheckedCreateWithoutUsersInput = {
    id?: string
    name: string
    description: string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    teams?: TeamUncheckedCreateNestedManyWithoutKnowledgeInput
    files?: FileUncheckedCreateNestedManyWithoutKnowledgeInput
  }

  export type KnowledgeCreateOrConnectWithoutUsersInput = {
    where: KnowledgeWhereUniqueInput
    create: XOR<KnowledgeCreateWithoutUsersInput, KnowledgeUncheckedCreateWithoutUsersInput>
  }

  export type AgentCreateWithoutUserInput = {
    id?: string
    name: string
    description: string
    flowConfig: string
    isActive?: boolean
    ownerType: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedAgentsInput
    team?: TeamCreateNestedOneWithoutOwnedAgentsInput
    conversations?: ConversationCreateNestedManyWithoutAgentInput
  }

  export type AgentUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    description: string
    flowConfig: string
    isActive?: boolean
    ownerType: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    teamId?: string | null
    conversations?: ConversationUncheckedCreateNestedManyWithoutAgentInput
  }

  export type AgentCreateOrConnectWithoutUserInput = {
    where: AgentWhereUniqueInput
    create: XOR<AgentCreateWithoutUserInput, AgentUncheckedCreateWithoutUserInput>
  }

  export type AgentCreateManyUserInputEnvelope = {
    data: AgentCreateManyUserInput | AgentCreateManyUserInput[]
  }

  export type AgentCreateWithoutCreatedByInput = {
    id?: string
    name: string
    description: string
    flowConfig: string
    isActive?: boolean
    ownerType: string
    createdAt?: Date | string
    updatedAt?: Date | string
    user?: UserCreateNestedOneWithoutOwnedAgentsInput
    team?: TeamCreateNestedOneWithoutOwnedAgentsInput
    conversations?: ConversationCreateNestedManyWithoutAgentInput
  }

  export type AgentUncheckedCreateWithoutCreatedByInput = {
    id?: string
    name: string
    description: string
    flowConfig: string
    isActive?: boolean
    ownerType: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId?: string | null
    teamId?: string | null
    conversations?: ConversationUncheckedCreateNestedManyWithoutAgentInput
  }

  export type AgentCreateOrConnectWithoutCreatedByInput = {
    where: AgentWhereUniqueInput
    create: XOR<AgentCreateWithoutCreatedByInput, AgentUncheckedCreateWithoutCreatedByInput>
  }

  export type AgentCreateManyCreatedByInputEnvelope = {
    data: AgentCreateManyCreatedByInput | AgentCreateManyCreatedByInput[]
  }

  export type FileParsingTaskCreateWithoutCreatedByInput = {
    id?: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    message?: string | null
    file: FileCreateNestedOneWithoutParsingTasksInput
  }

  export type FileParsingTaskUncheckedCreateWithoutCreatedByInput = {
    id?: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    message?: string | null
    fileId: string
  }

  export type FileParsingTaskCreateOrConnectWithoutCreatedByInput = {
    where: FileParsingTaskWhereUniqueInput
    create: XOR<FileParsingTaskCreateWithoutCreatedByInput, FileParsingTaskUncheckedCreateWithoutCreatedByInput>
  }

  export type FileParsingTaskCreateManyCreatedByInputEnvelope = {
    data: FileParsingTaskCreateManyCreatedByInput | FileParsingTaskCreateManyCreatedByInput[]
  }

  export type LLMProviderCreateWithoutUsersWithDefaultInput = {
    id?: string
    name?: string
    description?: string | null
    providerType: string
    endpointUrl: string
    isActive?: boolean
    isDefault?: boolean
    apiKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerType?: string
    config?: NullableJsonNullValueInput | InputJsonValue
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    models?: LLMModelCreateNestedManyWithoutProviderInput
    userOwner?: UserCreateNestedOneWithoutOwnedLLMProvidersInput
    teamOwner?: TeamCreateNestedOneWithoutOwnedLLMProvidersInput
  }

  export type LLMProviderUncheckedCreateWithoutUsersWithDefaultInput = {
    id?: string
    name?: string
    description?: string | null
    providerType: string
    endpointUrl: string
    isActive?: boolean
    isDefault?: boolean
    apiKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerType?: string
    config?: NullableJsonNullValueInput | InputJsonValue
    userOwnerId?: string | null
    teamOwnerId?: string | null
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    models?: LLMModelUncheckedCreateNestedManyWithoutProviderInput
  }

  export type LLMProviderCreateOrConnectWithoutUsersWithDefaultInput = {
    where: LLMProviderWhereUniqueInput
    create: XOR<LLMProviderCreateWithoutUsersWithDefaultInput, LLMProviderUncheckedCreateWithoutUsersWithDefaultInput>
  }

  export type LLMProviderCreateWithoutUserOwnerInput = {
    id?: string
    name?: string
    description?: string | null
    providerType: string
    endpointUrl: string
    isActive?: boolean
    isDefault?: boolean
    apiKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerType?: string
    config?: NullableJsonNullValueInput | InputJsonValue
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    models?: LLMModelCreateNestedManyWithoutProviderInput
    usersWithDefault?: UserCreateNestedManyWithoutDefaultLLMProviderInput
    teamOwner?: TeamCreateNestedOneWithoutOwnedLLMProvidersInput
  }

  export type LLMProviderUncheckedCreateWithoutUserOwnerInput = {
    id?: string
    name?: string
    description?: string | null
    providerType: string
    endpointUrl: string
    isActive?: boolean
    isDefault?: boolean
    apiKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerType?: string
    config?: NullableJsonNullValueInput | InputJsonValue
    teamOwnerId?: string | null
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    models?: LLMModelUncheckedCreateNestedManyWithoutProviderInput
    usersWithDefault?: UserUncheckedCreateNestedManyWithoutDefaultLLMProviderInput
  }

  export type LLMProviderCreateOrConnectWithoutUserOwnerInput = {
    where: LLMProviderWhereUniqueInput
    create: XOR<LLMProviderCreateWithoutUserOwnerInput, LLMProviderUncheckedCreateWithoutUserOwnerInput>
  }

  export type LLMProviderCreateManyUserOwnerInputEnvelope = {
    data: LLMProviderCreateManyUserOwnerInput | LLMProviderCreateManyUserOwnerInput[]
  }

  export type TeamUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: TeamWhereUniqueInput
    update: XOR<TeamUpdateWithoutCreatedByInput, TeamUncheckedUpdateWithoutCreatedByInput>
    create: XOR<TeamCreateWithoutCreatedByInput, TeamUncheckedCreateWithoutCreatedByInput>
  }

  export type TeamUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: TeamWhereUniqueInput
    data: XOR<TeamUpdateWithoutCreatedByInput, TeamUncheckedUpdateWithoutCreatedByInput>
  }

  export type TeamUpdateManyWithWhereWithoutCreatedByInput = {
    where: TeamScalarWhereInput
    data: XOR<TeamUpdateManyMutationInput, TeamUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type MemberTeamUpsertWithWhereUniqueWithoutUserInput = {
    where: MemberTeamWhereUniqueInput
    update: XOR<MemberTeamUpdateWithoutUserInput, MemberTeamUncheckedUpdateWithoutUserInput>
    create: XOR<MemberTeamCreateWithoutUserInput, MemberTeamUncheckedCreateWithoutUserInput>
  }

  export type MemberTeamUpdateWithWhereUniqueWithoutUserInput = {
    where: MemberTeamWhereUniqueInput
    data: XOR<MemberTeamUpdateWithoutUserInput, MemberTeamUncheckedUpdateWithoutUserInput>
  }

  export type MemberTeamUpdateManyWithWhereWithoutUserInput = {
    where: MemberTeamScalarWhereInput
    data: XOR<MemberTeamUpdateManyMutationInput, MemberTeamUncheckedUpdateManyWithoutUserInput>
  }

  export type TeamUpsertWithWhereUniqueWithoutUsersInput = {
    where: TeamWhereUniqueInput
    update: XOR<TeamUpdateWithoutUsersInput, TeamUncheckedUpdateWithoutUsersInput>
    create: XOR<TeamCreateWithoutUsersInput, TeamUncheckedCreateWithoutUsersInput>
  }

  export type TeamUpdateWithWhereUniqueWithoutUsersInput = {
    where: TeamWhereUniqueInput
    data: XOR<TeamUpdateWithoutUsersInput, TeamUncheckedUpdateWithoutUsersInput>
  }

  export type TeamUpdateManyWithWhereWithoutUsersInput = {
    where: TeamScalarWhereInput
    data: XOR<TeamUpdateManyMutationInput, TeamUncheckedUpdateManyWithoutUsersInput>
  }

  export type KnowledgeUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: KnowledgeWhereUniqueInput
    update: XOR<KnowledgeUpdateWithoutCreatedByInput, KnowledgeUncheckedUpdateWithoutCreatedByInput>
    create: XOR<KnowledgeCreateWithoutCreatedByInput, KnowledgeUncheckedCreateWithoutCreatedByInput>
  }

  export type KnowledgeUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: KnowledgeWhereUniqueInput
    data: XOR<KnowledgeUpdateWithoutCreatedByInput, KnowledgeUncheckedUpdateWithoutCreatedByInput>
  }

  export type KnowledgeUpdateManyWithWhereWithoutCreatedByInput = {
    where: KnowledgeScalarWhereInput
    data: XOR<KnowledgeUpdateManyMutationInput, KnowledgeUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type KnowledgeUpsertWithWhereUniqueWithoutUsersInput = {
    where: KnowledgeWhereUniqueInput
    update: XOR<KnowledgeUpdateWithoutUsersInput, KnowledgeUncheckedUpdateWithoutUsersInput>
    create: XOR<KnowledgeCreateWithoutUsersInput, KnowledgeUncheckedCreateWithoutUsersInput>
  }

  export type KnowledgeUpdateWithWhereUniqueWithoutUsersInput = {
    where: KnowledgeWhereUniqueInput
    data: XOR<KnowledgeUpdateWithoutUsersInput, KnowledgeUncheckedUpdateWithoutUsersInput>
  }

  export type KnowledgeUpdateManyWithWhereWithoutUsersInput = {
    where: KnowledgeScalarWhereInput
    data: XOR<KnowledgeUpdateManyMutationInput, KnowledgeUncheckedUpdateManyWithoutUsersInput>
  }

  export type AgentUpsertWithWhereUniqueWithoutUserInput = {
    where: AgentWhereUniqueInput
    update: XOR<AgentUpdateWithoutUserInput, AgentUncheckedUpdateWithoutUserInput>
    create: XOR<AgentCreateWithoutUserInput, AgentUncheckedCreateWithoutUserInput>
  }

  export type AgentUpdateWithWhereUniqueWithoutUserInput = {
    where: AgentWhereUniqueInput
    data: XOR<AgentUpdateWithoutUserInput, AgentUncheckedUpdateWithoutUserInput>
  }

  export type AgentUpdateManyWithWhereWithoutUserInput = {
    where: AgentScalarWhereInput
    data: XOR<AgentUpdateManyMutationInput, AgentUncheckedUpdateManyWithoutUserInput>
  }

  export type AgentUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: AgentWhereUniqueInput
    update: XOR<AgentUpdateWithoutCreatedByInput, AgentUncheckedUpdateWithoutCreatedByInput>
    create: XOR<AgentCreateWithoutCreatedByInput, AgentUncheckedCreateWithoutCreatedByInput>
  }

  export type AgentUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: AgentWhereUniqueInput
    data: XOR<AgentUpdateWithoutCreatedByInput, AgentUncheckedUpdateWithoutCreatedByInput>
  }

  export type AgentUpdateManyWithWhereWithoutCreatedByInput = {
    where: AgentScalarWhereInput
    data: XOR<AgentUpdateManyMutationInput, AgentUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type FileParsingTaskUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: FileParsingTaskWhereUniqueInput
    update: XOR<FileParsingTaskUpdateWithoutCreatedByInput, FileParsingTaskUncheckedUpdateWithoutCreatedByInput>
    create: XOR<FileParsingTaskCreateWithoutCreatedByInput, FileParsingTaskUncheckedCreateWithoutCreatedByInput>
  }

  export type FileParsingTaskUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: FileParsingTaskWhereUniqueInput
    data: XOR<FileParsingTaskUpdateWithoutCreatedByInput, FileParsingTaskUncheckedUpdateWithoutCreatedByInput>
  }

  export type FileParsingTaskUpdateManyWithWhereWithoutCreatedByInput = {
    where: FileParsingTaskScalarWhereInput
    data: XOR<FileParsingTaskUpdateManyMutationInput, FileParsingTaskUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type FileParsingTaskScalarWhereInput = {
    AND?: FileParsingTaskScalarWhereInput | FileParsingTaskScalarWhereInput[]
    OR?: FileParsingTaskScalarWhereInput[]
    NOT?: FileParsingTaskScalarWhereInput | FileParsingTaskScalarWhereInput[]
    id?: StringFilter<"FileParsingTask"> | string
    status?: StringFilter<"FileParsingTask"> | string
    createdAt?: DateTimeFilter<"FileParsingTask"> | Date | string
    updatedAt?: DateTimeFilter<"FileParsingTask"> | Date | string
    completedAt?: DateTimeNullableFilter<"FileParsingTask"> | Date | string | null
    message?: StringNullableFilter<"FileParsingTask"> | string | null
    fileId?: StringFilter<"FileParsingTask"> | string
    createdById?: StringFilter<"FileParsingTask"> | string
  }

  export type LLMProviderUpsertWithoutUsersWithDefaultInput = {
    update: XOR<LLMProviderUpdateWithoutUsersWithDefaultInput, LLMProviderUncheckedUpdateWithoutUsersWithDefaultInput>
    create: XOR<LLMProviderCreateWithoutUsersWithDefaultInput, LLMProviderUncheckedCreateWithoutUsersWithDefaultInput>
    where?: LLMProviderWhereInput
  }

  export type LLMProviderUpdateToOneWithWhereWithoutUsersWithDefaultInput = {
    where?: LLMProviderWhereInput
    data: XOR<LLMProviderUpdateWithoutUsersWithDefaultInput, LLMProviderUncheckedUpdateWithoutUsersWithDefaultInput>
  }

  export type LLMProviderUpdateWithoutUsersWithDefaultInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    providerType?: StringFieldUpdateOperationsInput | string
    endpointUrl?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerType?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    models?: LLMModelUpdateManyWithoutProviderNestedInput
    userOwner?: UserUpdateOneWithoutOwnedLLMProvidersNestedInput
    teamOwner?: TeamUpdateOneWithoutOwnedLLMProvidersNestedInput
  }

  export type LLMProviderUncheckedUpdateWithoutUsersWithDefaultInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    providerType?: StringFieldUpdateOperationsInput | string
    endpointUrl?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerType?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    userOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    teamOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    models?: LLMModelUncheckedUpdateManyWithoutProviderNestedInput
  }

  export type LLMProviderUpsertWithWhereUniqueWithoutUserOwnerInput = {
    where: LLMProviderWhereUniqueInput
    update: XOR<LLMProviderUpdateWithoutUserOwnerInput, LLMProviderUncheckedUpdateWithoutUserOwnerInput>
    create: XOR<LLMProviderCreateWithoutUserOwnerInput, LLMProviderUncheckedCreateWithoutUserOwnerInput>
  }

  export type LLMProviderUpdateWithWhereUniqueWithoutUserOwnerInput = {
    where: LLMProviderWhereUniqueInput
    data: XOR<LLMProviderUpdateWithoutUserOwnerInput, LLMProviderUncheckedUpdateWithoutUserOwnerInput>
  }

  export type LLMProviderUpdateManyWithWhereWithoutUserOwnerInput = {
    where: LLMProviderScalarWhereInput
    data: XOR<LLMProviderUpdateManyMutationInput, LLMProviderUncheckedUpdateManyWithoutUserOwnerInput>
  }

  export type KnowledgeCreateWithoutFilesInput = {
    id?: string
    name: string
    description: string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedKnowledgeInput
    users?: UserCreateNestedManyWithoutKnowledgeInput
    teams?: TeamCreateNestedManyWithoutKnowledgeInput
  }

  export type KnowledgeUncheckedCreateWithoutFilesInput = {
    id?: string
    name: string
    description: string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    users?: UserUncheckedCreateNestedManyWithoutKnowledgeInput
    teams?: TeamUncheckedCreateNestedManyWithoutKnowledgeInput
  }

  export type KnowledgeCreateOrConnectWithoutFilesInput = {
    where: KnowledgeWhereUniqueInput
    create: XOR<KnowledgeCreateWithoutFilesInput, KnowledgeUncheckedCreateWithoutFilesInput>
  }

  export type FileParsingTaskCreateWithoutFileInput = {
    id?: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    message?: string | null
    createdBy: UserCreateNestedOneWithoutFileParsingTaskInput
  }

  export type FileParsingTaskUncheckedCreateWithoutFileInput = {
    id?: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    message?: string | null
    createdById: string
  }

  export type FileParsingTaskCreateOrConnectWithoutFileInput = {
    where: FileParsingTaskWhereUniqueInput
    create: XOR<FileParsingTaskCreateWithoutFileInput, FileParsingTaskUncheckedCreateWithoutFileInput>
  }

  export type FileParsingTaskCreateManyFileInputEnvelope = {
    data: FileParsingTaskCreateManyFileInput | FileParsingTaskCreateManyFileInput[]
  }

  export type TextChunkCreateWithoutFileInput = {
    id?: string
    content: string
    chunkIndex: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    vectorData?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TextChunkUncheckedCreateWithoutFileInput = {
    id?: string
    content: string
    chunkIndex: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    vectorData?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TextChunkCreateOrConnectWithoutFileInput = {
    where: TextChunkWhereUniqueInput
    create: XOR<TextChunkCreateWithoutFileInput, TextChunkUncheckedCreateWithoutFileInput>
  }

  export type TextChunkCreateManyFileInputEnvelope = {
    data: TextChunkCreateManyFileInput | TextChunkCreateManyFileInput[]
  }

  export type KnowledgeUpsertWithoutFilesInput = {
    update: XOR<KnowledgeUpdateWithoutFilesInput, KnowledgeUncheckedUpdateWithoutFilesInput>
    create: XOR<KnowledgeCreateWithoutFilesInput, KnowledgeUncheckedCreateWithoutFilesInput>
    where?: KnowledgeWhereInput
  }

  export type KnowledgeUpdateToOneWithWhereWithoutFilesInput = {
    where?: KnowledgeWhereInput
    data: XOR<KnowledgeUpdateWithoutFilesInput, KnowledgeUncheckedUpdateWithoutFilesInput>
  }

  export type KnowledgeUpdateWithoutFilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedKnowledgeNestedInput
    users?: UserUpdateManyWithoutKnowledgeNestedInput
    teams?: TeamUpdateManyWithoutKnowledgeNestedInput
  }

  export type KnowledgeUncheckedUpdateWithoutFilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    users?: UserUncheckedUpdateManyWithoutKnowledgeNestedInput
    teams?: TeamUncheckedUpdateManyWithoutKnowledgeNestedInput
  }

  export type FileParsingTaskUpsertWithWhereUniqueWithoutFileInput = {
    where: FileParsingTaskWhereUniqueInput
    update: XOR<FileParsingTaskUpdateWithoutFileInput, FileParsingTaskUncheckedUpdateWithoutFileInput>
    create: XOR<FileParsingTaskCreateWithoutFileInput, FileParsingTaskUncheckedCreateWithoutFileInput>
  }

  export type FileParsingTaskUpdateWithWhereUniqueWithoutFileInput = {
    where: FileParsingTaskWhereUniqueInput
    data: XOR<FileParsingTaskUpdateWithoutFileInput, FileParsingTaskUncheckedUpdateWithoutFileInput>
  }

  export type FileParsingTaskUpdateManyWithWhereWithoutFileInput = {
    where: FileParsingTaskScalarWhereInput
    data: XOR<FileParsingTaskUpdateManyMutationInput, FileParsingTaskUncheckedUpdateManyWithoutFileInput>
  }

  export type TextChunkUpsertWithWhereUniqueWithoutFileInput = {
    where: TextChunkWhereUniqueInput
    update: XOR<TextChunkUpdateWithoutFileInput, TextChunkUncheckedUpdateWithoutFileInput>
    create: XOR<TextChunkCreateWithoutFileInput, TextChunkUncheckedCreateWithoutFileInput>
  }

  export type TextChunkUpdateWithWhereUniqueWithoutFileInput = {
    where: TextChunkWhereUniqueInput
    data: XOR<TextChunkUpdateWithoutFileInput, TextChunkUncheckedUpdateWithoutFileInput>
  }

  export type TextChunkUpdateManyWithWhereWithoutFileInput = {
    where: TextChunkScalarWhereInput
    data: XOR<TextChunkUpdateManyMutationInput, TextChunkUncheckedUpdateManyWithoutFileInput>
  }

  export type TextChunkScalarWhereInput = {
    AND?: TextChunkScalarWhereInput | TextChunkScalarWhereInput[]
    OR?: TextChunkScalarWhereInput[]
    NOT?: TextChunkScalarWhereInput | TextChunkScalarWhereInput[]
    id?: StringFilter<"TextChunk"> | string
    fileId?: StringFilter<"TextChunk"> | string
    content?: StringFilter<"TextChunk"> | string
    chunkIndex?: IntFilter<"TextChunk"> | number
    metadata?: JsonNullableFilter<"TextChunk">
    vectorData?: StringNullableFilter<"TextChunk"> | string | null
    createdAt?: DateTimeFilter<"TextChunk"> | Date | string
    updatedAt?: DateTimeFilter<"TextChunk"> | Date | string
  }

  export type FileCreateWithoutParsingTasksInput = {
    id?: string
    filename: string
    originalName: string
    path: string
    mimetype: string
    size: number
    content?: string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    parsingStatus?: string | null
    knowledge: KnowledgeCreateNestedOneWithoutFilesInput
    TextChunk?: TextChunkCreateNestedManyWithoutFileInput
  }

  export type FileUncheckedCreateWithoutParsingTasksInput = {
    id?: string
    filename: string
    originalName: string
    path: string
    mimetype: string
    size: number
    content?: string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    parsingStatus?: string | null
    knowledgeId: string
    TextChunk?: TextChunkUncheckedCreateNestedManyWithoutFileInput
  }

  export type FileCreateOrConnectWithoutParsingTasksInput = {
    where: FileWhereUniqueInput
    create: XOR<FileCreateWithoutParsingTasksInput, FileUncheckedCreateWithoutParsingTasksInput>
  }

  export type UserCreateWithoutFileParsingTaskInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamCreateNestedManyWithoutUserInput
    teams?: TeamCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentCreateNestedManyWithoutUserInput
    createdAgents?: AgentCreateNestedManyWithoutCreatedByInput
    defaultLLMProvider?: LLMProviderCreateNestedOneWithoutUsersWithDefaultInput
    ownedLLMProviders?: LLMProviderCreateNestedManyWithoutUserOwnerInput
  }

  export type UserUncheckedCreateWithoutFileParsingTaskInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    defaultLLMProviderId?: string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamUncheckedCreateNestedManyWithoutUserInput
    teams?: TeamUncheckedCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeUncheckedCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeUncheckedCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentUncheckedCreateNestedManyWithoutUserInput
    createdAgents?: AgentUncheckedCreateNestedManyWithoutCreatedByInput
    ownedLLMProviders?: LLMProviderUncheckedCreateNestedManyWithoutUserOwnerInput
  }

  export type UserCreateOrConnectWithoutFileParsingTaskInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutFileParsingTaskInput, UserUncheckedCreateWithoutFileParsingTaskInput>
  }

  export type FileUpsertWithoutParsingTasksInput = {
    update: XOR<FileUpdateWithoutParsingTasksInput, FileUncheckedUpdateWithoutParsingTasksInput>
    create: XOR<FileCreateWithoutParsingTasksInput, FileUncheckedCreateWithoutParsingTasksInput>
    where?: FileWhereInput
  }

  export type FileUpdateToOneWithWhereWithoutParsingTasksInput = {
    where?: FileWhereInput
    data: XOR<FileUpdateWithoutParsingTasksInput, FileUncheckedUpdateWithoutParsingTasksInput>
  }

  export type FileUpdateWithoutParsingTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    mimetype?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    content?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsingStatus?: NullableStringFieldUpdateOperationsInput | string | null
    knowledge?: KnowledgeUpdateOneRequiredWithoutFilesNestedInput
    TextChunk?: TextChunkUpdateManyWithoutFileNestedInput
  }

  export type FileUncheckedUpdateWithoutParsingTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    mimetype?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    content?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsingStatus?: NullableStringFieldUpdateOperationsInput | string | null
    knowledgeId?: StringFieldUpdateOperationsInput | string
    TextChunk?: TextChunkUncheckedUpdateManyWithoutFileNestedInput
  }

  export type UserUpsertWithoutFileParsingTaskInput = {
    update: XOR<UserUpdateWithoutFileParsingTaskInput, UserUncheckedUpdateWithoutFileParsingTaskInput>
    create: XOR<UserCreateWithoutFileParsingTaskInput, UserUncheckedCreateWithoutFileParsingTaskInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutFileParsingTaskInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutFileParsingTaskInput, UserUncheckedUpdateWithoutFileParsingTaskInput>
  }

  export type UserUpdateWithoutFileParsingTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUpdateManyWithoutUserNestedInput
    teams?: TeamUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUpdateManyWithoutCreatedByNestedInput
    defaultLLMProvider?: LLMProviderUpdateOneWithoutUsersWithDefaultNestedInput
    ownedLLMProviders?: LLMProviderUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserUncheckedUpdateWithoutFileParsingTaskInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    defaultLLMProviderId?: NullableStringFieldUpdateOperationsInput | string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUncheckedUpdateManyWithoutUserNestedInput
    teams?: TeamUncheckedUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUncheckedUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUncheckedUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUncheckedUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUncheckedUpdateManyWithoutCreatedByNestedInput
    ownedLLMProviders?: LLMProviderUncheckedUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserCreateWithoutCreatedAgentsInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamCreateNestedManyWithoutUserInput
    teams?: TeamCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentCreateNestedManyWithoutUserInput
    FileParsingTask?: FileParsingTaskCreateNestedManyWithoutCreatedByInput
    defaultLLMProvider?: LLMProviderCreateNestedOneWithoutUsersWithDefaultInput
    ownedLLMProviders?: LLMProviderCreateNestedManyWithoutUserOwnerInput
  }

  export type UserUncheckedCreateWithoutCreatedAgentsInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    defaultLLMProviderId?: string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamUncheckedCreateNestedManyWithoutUserInput
    teams?: TeamUncheckedCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeUncheckedCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeUncheckedCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentUncheckedCreateNestedManyWithoutUserInput
    FileParsingTask?: FileParsingTaskUncheckedCreateNestedManyWithoutCreatedByInput
    ownedLLMProviders?: LLMProviderUncheckedCreateNestedManyWithoutUserOwnerInput
  }

  export type UserCreateOrConnectWithoutCreatedAgentsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCreatedAgentsInput, UserUncheckedCreateWithoutCreatedAgentsInput>
  }

  export type UserCreateWithoutOwnedAgentsInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamCreateNestedManyWithoutUserInput
    teams?: TeamCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeCreateNestedManyWithoutUsersInput
    createdAgents?: AgentCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskCreateNestedManyWithoutCreatedByInput
    defaultLLMProvider?: LLMProviderCreateNestedOneWithoutUsersWithDefaultInput
    ownedLLMProviders?: LLMProviderCreateNestedManyWithoutUserOwnerInput
  }

  export type UserUncheckedCreateWithoutOwnedAgentsInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    defaultLLMProviderId?: string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamUncheckedCreateNestedManyWithoutUserInput
    teams?: TeamUncheckedCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeUncheckedCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeUncheckedCreateNestedManyWithoutUsersInput
    createdAgents?: AgentUncheckedCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskUncheckedCreateNestedManyWithoutCreatedByInput
    ownedLLMProviders?: LLMProviderUncheckedCreateNestedManyWithoutUserOwnerInput
  }

  export type UserCreateOrConnectWithoutOwnedAgentsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOwnedAgentsInput, UserUncheckedCreateWithoutOwnedAgentsInput>
  }

  export type TeamCreateWithoutOwnedAgentsInput = {
    id?: string
    name: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedTeamsInput
    members?: MemberTeamCreateNestedManyWithoutTeamInput
    users?: UserCreateNestedManyWithoutTeamsInput
    knowledge?: KnowledgeCreateNestedManyWithoutTeamsInput
    ownedLLMProviders?: LLMProviderCreateNestedManyWithoutTeamOwnerInput
  }

  export type TeamUncheckedCreateWithoutOwnedAgentsInput = {
    id?: string
    name: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    members?: MemberTeamUncheckedCreateNestedManyWithoutTeamInput
    users?: UserUncheckedCreateNestedManyWithoutTeamsInput
    knowledge?: KnowledgeUncheckedCreateNestedManyWithoutTeamsInput
    ownedLLMProviders?: LLMProviderUncheckedCreateNestedManyWithoutTeamOwnerInput
  }

  export type TeamCreateOrConnectWithoutOwnedAgentsInput = {
    where: TeamWhereUniqueInput
    create: XOR<TeamCreateWithoutOwnedAgentsInput, TeamUncheckedCreateWithoutOwnedAgentsInput>
  }

  export type ConversationCreateWithoutAgentInput = {
    id?: string
    title?: string | null
    flowState: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastMessageAt?: Date | string
    messages?: ConversationMessageCreateNestedManyWithoutConversationInput
  }

  export type ConversationUncheckedCreateWithoutAgentInput = {
    id?: string
    title?: string | null
    flowState: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastMessageAt?: Date | string
    messages?: ConversationMessageUncheckedCreateNestedManyWithoutConversationInput
  }

  export type ConversationCreateOrConnectWithoutAgentInput = {
    where: ConversationWhereUniqueInput
    create: XOR<ConversationCreateWithoutAgentInput, ConversationUncheckedCreateWithoutAgentInput>
  }

  export type ConversationCreateManyAgentInputEnvelope = {
    data: ConversationCreateManyAgentInput | ConversationCreateManyAgentInput[]
  }

  export type UserUpsertWithoutCreatedAgentsInput = {
    update: XOR<UserUpdateWithoutCreatedAgentsInput, UserUncheckedUpdateWithoutCreatedAgentsInput>
    create: XOR<UserCreateWithoutCreatedAgentsInput, UserUncheckedCreateWithoutCreatedAgentsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCreatedAgentsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCreatedAgentsInput, UserUncheckedUpdateWithoutCreatedAgentsInput>
  }

  export type UserUpdateWithoutCreatedAgentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUpdateManyWithoutUserNestedInput
    teams?: TeamUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUpdateManyWithoutUserNestedInput
    FileParsingTask?: FileParsingTaskUpdateManyWithoutCreatedByNestedInput
    defaultLLMProvider?: LLMProviderUpdateOneWithoutUsersWithDefaultNestedInput
    ownedLLMProviders?: LLMProviderUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserUncheckedUpdateWithoutCreatedAgentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    defaultLLMProviderId?: NullableStringFieldUpdateOperationsInput | string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUncheckedUpdateManyWithoutUserNestedInput
    teams?: TeamUncheckedUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUncheckedUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUncheckedUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUncheckedUpdateManyWithoutUserNestedInput
    FileParsingTask?: FileParsingTaskUncheckedUpdateManyWithoutCreatedByNestedInput
    ownedLLMProviders?: LLMProviderUncheckedUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserUpsertWithoutOwnedAgentsInput = {
    update: XOR<UserUpdateWithoutOwnedAgentsInput, UserUncheckedUpdateWithoutOwnedAgentsInput>
    create: XOR<UserCreateWithoutOwnedAgentsInput, UserUncheckedCreateWithoutOwnedAgentsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOwnedAgentsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOwnedAgentsInput, UserUncheckedUpdateWithoutOwnedAgentsInput>
  }

  export type UserUpdateWithoutOwnedAgentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUpdateManyWithoutUserNestedInput
    teams?: TeamUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUpdateManyWithoutUsersNestedInput
    createdAgents?: AgentUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUpdateManyWithoutCreatedByNestedInput
    defaultLLMProvider?: LLMProviderUpdateOneWithoutUsersWithDefaultNestedInput
    ownedLLMProviders?: LLMProviderUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserUncheckedUpdateWithoutOwnedAgentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    defaultLLMProviderId?: NullableStringFieldUpdateOperationsInput | string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUncheckedUpdateManyWithoutUserNestedInput
    teams?: TeamUncheckedUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUncheckedUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUncheckedUpdateManyWithoutUsersNestedInput
    createdAgents?: AgentUncheckedUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUncheckedUpdateManyWithoutCreatedByNestedInput
    ownedLLMProviders?: LLMProviderUncheckedUpdateManyWithoutUserOwnerNestedInput
  }

  export type TeamUpsertWithoutOwnedAgentsInput = {
    update: XOR<TeamUpdateWithoutOwnedAgentsInput, TeamUncheckedUpdateWithoutOwnedAgentsInput>
    create: XOR<TeamCreateWithoutOwnedAgentsInput, TeamUncheckedCreateWithoutOwnedAgentsInput>
    where?: TeamWhereInput
  }

  export type TeamUpdateToOneWithWhereWithoutOwnedAgentsInput = {
    where?: TeamWhereInput
    data: XOR<TeamUpdateWithoutOwnedAgentsInput, TeamUncheckedUpdateWithoutOwnedAgentsInput>
  }

  export type TeamUpdateWithoutOwnedAgentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedTeamsNestedInput
    members?: MemberTeamUpdateManyWithoutTeamNestedInput
    users?: UserUpdateManyWithoutTeamsNestedInput
    knowledge?: KnowledgeUpdateManyWithoutTeamsNestedInput
    ownedLLMProviders?: LLMProviderUpdateManyWithoutTeamOwnerNestedInput
  }

  export type TeamUncheckedUpdateWithoutOwnedAgentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    members?: MemberTeamUncheckedUpdateManyWithoutTeamNestedInput
    users?: UserUncheckedUpdateManyWithoutTeamsNestedInput
    knowledge?: KnowledgeUncheckedUpdateManyWithoutTeamsNestedInput
    ownedLLMProviders?: LLMProviderUncheckedUpdateManyWithoutTeamOwnerNestedInput
  }

  export type ConversationUpsertWithWhereUniqueWithoutAgentInput = {
    where: ConversationWhereUniqueInput
    update: XOR<ConversationUpdateWithoutAgentInput, ConversationUncheckedUpdateWithoutAgentInput>
    create: XOR<ConversationCreateWithoutAgentInput, ConversationUncheckedCreateWithoutAgentInput>
  }

  export type ConversationUpdateWithWhereUniqueWithoutAgentInput = {
    where: ConversationWhereUniqueInput
    data: XOR<ConversationUpdateWithoutAgentInput, ConversationUncheckedUpdateWithoutAgentInput>
  }

  export type ConversationUpdateManyWithWhereWithoutAgentInput = {
    where: ConversationScalarWhereInput
    data: XOR<ConversationUpdateManyMutationInput, ConversationUncheckedUpdateManyWithoutAgentInput>
  }

  export type ConversationScalarWhereInput = {
    AND?: ConversationScalarWhereInput | ConversationScalarWhereInput[]
    OR?: ConversationScalarWhereInput[]
    NOT?: ConversationScalarWhereInput | ConversationScalarWhereInput[]
    id?: StringFilter<"Conversation"> | string
    title?: StringNullableFilter<"Conversation"> | string | null
    agentId?: StringFilter<"Conversation"> | string
    flowState?: StringFilter<"Conversation"> | string
    status?: StringFilter<"Conversation"> | string
    createdAt?: DateTimeFilter<"Conversation"> | Date | string
    updatedAt?: DateTimeFilter<"Conversation"> | Date | string
    lastMessageAt?: DateTimeFilter<"Conversation"> | Date | string
  }

  export type FileCreateWithoutTextChunkInput = {
    id?: string
    filename: string
    originalName: string
    path: string
    mimetype: string
    size: number
    content?: string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    parsingStatus?: string | null
    knowledge: KnowledgeCreateNestedOneWithoutFilesInput
    parsingTasks?: FileParsingTaskCreateNestedManyWithoutFileInput
  }

  export type FileUncheckedCreateWithoutTextChunkInput = {
    id?: string
    filename: string
    originalName: string
    path: string
    mimetype: string
    size: number
    content?: string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    parsingStatus?: string | null
    knowledgeId: string
    parsingTasks?: FileParsingTaskUncheckedCreateNestedManyWithoutFileInput
  }

  export type FileCreateOrConnectWithoutTextChunkInput = {
    where: FileWhereUniqueInput
    create: XOR<FileCreateWithoutTextChunkInput, FileUncheckedCreateWithoutTextChunkInput>
  }

  export type FileUpsertWithoutTextChunkInput = {
    update: XOR<FileUpdateWithoutTextChunkInput, FileUncheckedUpdateWithoutTextChunkInput>
    create: XOR<FileCreateWithoutTextChunkInput, FileUncheckedCreateWithoutTextChunkInput>
    where?: FileWhereInput
  }

  export type FileUpdateToOneWithWhereWithoutTextChunkInput = {
    where?: FileWhereInput
    data: XOR<FileUpdateWithoutTextChunkInput, FileUncheckedUpdateWithoutTextChunkInput>
  }

  export type FileUpdateWithoutTextChunkInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    mimetype?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    content?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsingStatus?: NullableStringFieldUpdateOperationsInput | string | null
    knowledge?: KnowledgeUpdateOneRequiredWithoutFilesNestedInput
    parsingTasks?: FileParsingTaskUpdateManyWithoutFileNestedInput
  }

  export type FileUncheckedUpdateWithoutTextChunkInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    mimetype?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    content?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsingStatus?: NullableStringFieldUpdateOperationsInput | string | null
    knowledgeId?: StringFieldUpdateOperationsInput | string
    parsingTasks?: FileParsingTaskUncheckedUpdateManyWithoutFileNestedInput
  }

  export type LLMModelCreateWithoutProviderInput = {
    id?: string
    name: string
    displayName?: string | null
    description?: string | null
    modelType: string
    contextWindow?: number | null
    isActive?: boolean
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type LLMModelUncheckedCreateWithoutProviderInput = {
    id?: string
    name: string
    displayName?: string | null
    description?: string | null
    modelType: string
    contextWindow?: number | null
    isActive?: boolean
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type LLMModelCreateOrConnectWithoutProviderInput = {
    where: LLMModelWhereUniqueInput
    create: XOR<LLMModelCreateWithoutProviderInput, LLMModelUncheckedCreateWithoutProviderInput>
  }

  export type LLMModelCreateManyProviderInputEnvelope = {
    data: LLMModelCreateManyProviderInput | LLMModelCreateManyProviderInput[]
  }

  export type UserCreateWithoutDefaultLLMProviderInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamCreateNestedManyWithoutUserInput
    teams?: TeamCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentCreateNestedManyWithoutUserInput
    createdAgents?: AgentCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskCreateNestedManyWithoutCreatedByInput
    ownedLLMProviders?: LLMProviderCreateNestedManyWithoutUserOwnerInput
  }

  export type UserUncheckedCreateWithoutDefaultLLMProviderInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamUncheckedCreateNestedManyWithoutUserInput
    teams?: TeamUncheckedCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeUncheckedCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeUncheckedCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentUncheckedCreateNestedManyWithoutUserInput
    createdAgents?: AgentUncheckedCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskUncheckedCreateNestedManyWithoutCreatedByInput
    ownedLLMProviders?: LLMProviderUncheckedCreateNestedManyWithoutUserOwnerInput
  }

  export type UserCreateOrConnectWithoutDefaultLLMProviderInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDefaultLLMProviderInput, UserUncheckedCreateWithoutDefaultLLMProviderInput>
  }

  export type UserCreateManyDefaultLLMProviderInputEnvelope = {
    data: UserCreateManyDefaultLLMProviderInput | UserCreateManyDefaultLLMProviderInput[]
  }

  export type UserCreateWithoutOwnedLLMProvidersInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamCreateNestedManyWithoutUserInput
    teams?: TeamCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentCreateNestedManyWithoutUserInput
    createdAgents?: AgentCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskCreateNestedManyWithoutCreatedByInput
    defaultLLMProvider?: LLMProviderCreateNestedOneWithoutUsersWithDefaultInput
  }

  export type UserUncheckedCreateWithoutOwnedLLMProvidersInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    defaultLLMProviderId?: string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedCreateNestedManyWithoutCreatedByInput
    teamMemberships?: MemberTeamUncheckedCreateNestedManyWithoutUserInput
    teams?: TeamUncheckedCreateNestedManyWithoutUsersInput
    createdKnowledge?: KnowledgeUncheckedCreateNestedManyWithoutCreatedByInput
    knowledge?: KnowledgeUncheckedCreateNestedManyWithoutUsersInput
    ownedAgents?: AgentUncheckedCreateNestedManyWithoutUserInput
    createdAgents?: AgentUncheckedCreateNestedManyWithoutCreatedByInput
    FileParsingTask?: FileParsingTaskUncheckedCreateNestedManyWithoutCreatedByInput
  }

  export type UserCreateOrConnectWithoutOwnedLLMProvidersInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOwnedLLMProvidersInput, UserUncheckedCreateWithoutOwnedLLMProvidersInput>
  }

  export type TeamCreateWithoutOwnedLLMProvidersInput = {
    id?: string
    name: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedTeamsInput
    members?: MemberTeamCreateNestedManyWithoutTeamInput
    users?: UserCreateNestedManyWithoutTeamsInput
    knowledge?: KnowledgeCreateNestedManyWithoutTeamsInput
    ownedAgents?: AgentCreateNestedManyWithoutTeamInput
  }

  export type TeamUncheckedCreateWithoutOwnedLLMProvidersInput = {
    id?: string
    name: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    members?: MemberTeamUncheckedCreateNestedManyWithoutTeamInput
    users?: UserUncheckedCreateNestedManyWithoutTeamsInput
    knowledge?: KnowledgeUncheckedCreateNestedManyWithoutTeamsInput
    ownedAgents?: AgentUncheckedCreateNestedManyWithoutTeamInput
  }

  export type TeamCreateOrConnectWithoutOwnedLLMProvidersInput = {
    where: TeamWhereUniqueInput
    create: XOR<TeamCreateWithoutOwnedLLMProvidersInput, TeamUncheckedCreateWithoutOwnedLLMProvidersInput>
  }

  export type LLMModelUpsertWithWhereUniqueWithoutProviderInput = {
    where: LLMModelWhereUniqueInput
    update: XOR<LLMModelUpdateWithoutProviderInput, LLMModelUncheckedUpdateWithoutProviderInput>
    create: XOR<LLMModelCreateWithoutProviderInput, LLMModelUncheckedCreateWithoutProviderInput>
  }

  export type LLMModelUpdateWithWhereUniqueWithoutProviderInput = {
    where: LLMModelWhereUniqueInput
    data: XOR<LLMModelUpdateWithoutProviderInput, LLMModelUncheckedUpdateWithoutProviderInput>
  }

  export type LLMModelUpdateManyWithWhereWithoutProviderInput = {
    where: LLMModelScalarWhereInput
    data: XOR<LLMModelUpdateManyMutationInput, LLMModelUncheckedUpdateManyWithoutProviderInput>
  }

  export type LLMModelScalarWhereInput = {
    AND?: LLMModelScalarWhereInput | LLMModelScalarWhereInput[]
    OR?: LLMModelScalarWhereInput[]
    NOT?: LLMModelScalarWhereInput | LLMModelScalarWhereInput[]
    id?: StringFilter<"LLMModel"> | string
    name?: StringFilter<"LLMModel"> | string
    displayName?: StringNullableFilter<"LLMModel"> | string | null
    description?: StringNullableFilter<"LLMModel"> | string | null
    modelType?: StringFilter<"LLMModel"> | string
    contextWindow?: IntNullableFilter<"LLMModel"> | number | null
    isActive?: BoolFilter<"LLMModel"> | boolean
    isDefault?: BoolFilter<"LLMModel"> | boolean
    createdAt?: DateTimeFilter<"LLMModel"> | Date | string
    updatedAt?: DateTimeFilter<"LLMModel"> | Date | string
    config?: JsonNullableFilter<"LLMModel">
    providerId?: StringFilter<"LLMModel"> | string
  }

  export type UserUpsertWithWhereUniqueWithoutDefaultLLMProviderInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutDefaultLLMProviderInput, UserUncheckedUpdateWithoutDefaultLLMProviderInput>
    create: XOR<UserCreateWithoutDefaultLLMProviderInput, UserUncheckedCreateWithoutDefaultLLMProviderInput>
  }

  export type UserUpdateWithWhereUniqueWithoutDefaultLLMProviderInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutDefaultLLMProviderInput, UserUncheckedUpdateWithoutDefaultLLMProviderInput>
  }

  export type UserUpdateManyWithWhereWithoutDefaultLLMProviderInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutDefaultLLMProviderInput>
  }

  export type UserUpsertWithoutOwnedLLMProvidersInput = {
    update: XOR<UserUpdateWithoutOwnedLLMProvidersInput, UserUncheckedUpdateWithoutOwnedLLMProvidersInput>
    create: XOR<UserCreateWithoutOwnedLLMProvidersInput, UserUncheckedCreateWithoutOwnedLLMProvidersInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOwnedLLMProvidersInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOwnedLLMProvidersInput, UserUncheckedUpdateWithoutOwnedLLMProvidersInput>
  }

  export type UserUpdateWithoutOwnedLLMProvidersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUpdateManyWithoutUserNestedInput
    teams?: TeamUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUpdateManyWithoutCreatedByNestedInput
    defaultLLMProvider?: LLMProviderUpdateOneWithoutUsersWithDefaultNestedInput
  }

  export type UserUncheckedUpdateWithoutOwnedLLMProvidersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    defaultLLMProviderId?: NullableStringFieldUpdateOperationsInput | string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUncheckedUpdateManyWithoutUserNestedInput
    teams?: TeamUncheckedUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUncheckedUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUncheckedUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUncheckedUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUncheckedUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUncheckedUpdateManyWithoutCreatedByNestedInput
  }

  export type TeamUpsertWithoutOwnedLLMProvidersInput = {
    update: XOR<TeamUpdateWithoutOwnedLLMProvidersInput, TeamUncheckedUpdateWithoutOwnedLLMProvidersInput>
    create: XOR<TeamCreateWithoutOwnedLLMProvidersInput, TeamUncheckedCreateWithoutOwnedLLMProvidersInput>
    where?: TeamWhereInput
  }

  export type TeamUpdateToOneWithWhereWithoutOwnedLLMProvidersInput = {
    where?: TeamWhereInput
    data: XOR<TeamUpdateWithoutOwnedLLMProvidersInput, TeamUncheckedUpdateWithoutOwnedLLMProvidersInput>
  }

  export type TeamUpdateWithoutOwnedLLMProvidersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedTeamsNestedInput
    members?: MemberTeamUpdateManyWithoutTeamNestedInput
    users?: UserUpdateManyWithoutTeamsNestedInput
    knowledge?: KnowledgeUpdateManyWithoutTeamsNestedInput
    ownedAgents?: AgentUpdateManyWithoutTeamNestedInput
  }

  export type TeamUncheckedUpdateWithoutOwnedLLMProvidersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    members?: MemberTeamUncheckedUpdateManyWithoutTeamNestedInput
    users?: UserUncheckedUpdateManyWithoutTeamsNestedInput
    knowledge?: KnowledgeUncheckedUpdateManyWithoutTeamsNestedInput
    ownedAgents?: AgentUncheckedUpdateManyWithoutTeamNestedInput
  }

  export type LLMProviderCreateWithoutModelsInput = {
    id?: string
    name?: string
    description?: string | null
    providerType: string
    endpointUrl: string
    isActive?: boolean
    isDefault?: boolean
    apiKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerType?: string
    config?: NullableJsonNullValueInput | InputJsonValue
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    usersWithDefault?: UserCreateNestedManyWithoutDefaultLLMProviderInput
    userOwner?: UserCreateNestedOneWithoutOwnedLLMProvidersInput
    teamOwner?: TeamCreateNestedOneWithoutOwnedLLMProvidersInput
  }

  export type LLMProviderUncheckedCreateWithoutModelsInput = {
    id?: string
    name?: string
    description?: string | null
    providerType: string
    endpointUrl: string
    isActive?: boolean
    isDefault?: boolean
    apiKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerType?: string
    config?: NullableJsonNullValueInput | InputJsonValue
    userOwnerId?: string | null
    teamOwnerId?: string | null
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    usersWithDefault?: UserUncheckedCreateNestedManyWithoutDefaultLLMProviderInput
  }

  export type LLMProviderCreateOrConnectWithoutModelsInput = {
    where: LLMProviderWhereUniqueInput
    create: XOR<LLMProviderCreateWithoutModelsInput, LLMProviderUncheckedCreateWithoutModelsInput>
  }

  export type LLMProviderUpsertWithoutModelsInput = {
    update: XOR<LLMProviderUpdateWithoutModelsInput, LLMProviderUncheckedUpdateWithoutModelsInput>
    create: XOR<LLMProviderCreateWithoutModelsInput, LLMProviderUncheckedCreateWithoutModelsInput>
    where?: LLMProviderWhereInput
  }

  export type LLMProviderUpdateToOneWithWhereWithoutModelsInput = {
    where?: LLMProviderWhereInput
    data: XOR<LLMProviderUpdateWithoutModelsInput, LLMProviderUncheckedUpdateWithoutModelsInput>
  }

  export type LLMProviderUpdateWithoutModelsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    providerType?: StringFieldUpdateOperationsInput | string
    endpointUrl?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerType?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    usersWithDefault?: UserUpdateManyWithoutDefaultLLMProviderNestedInput
    userOwner?: UserUpdateOneWithoutOwnedLLMProvidersNestedInput
    teamOwner?: TeamUpdateOneWithoutOwnedLLMProvidersNestedInput
  }

  export type LLMProviderUncheckedUpdateWithoutModelsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    providerType?: StringFieldUpdateOperationsInput | string
    endpointUrl?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerType?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    userOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    teamOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    usersWithDefault?: UserUncheckedUpdateManyWithoutDefaultLLMProviderNestedInput
  }

  export type AgentCreateWithoutConversationsInput = {
    id?: string
    name: string
    description: string
    flowConfig: string
    isActive?: boolean
    ownerType: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: UserCreateNestedOneWithoutCreatedAgentsInput
    user?: UserCreateNestedOneWithoutOwnedAgentsInput
    team?: TeamCreateNestedOneWithoutOwnedAgentsInput
  }

  export type AgentUncheckedCreateWithoutConversationsInput = {
    id?: string
    name: string
    description: string
    flowConfig: string
    isActive?: boolean
    ownerType: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    userId?: string | null
    teamId?: string | null
  }

  export type AgentCreateOrConnectWithoutConversationsInput = {
    where: AgentWhereUniqueInput
    create: XOR<AgentCreateWithoutConversationsInput, AgentUncheckedCreateWithoutConversationsInput>
  }

  export type ConversationMessageCreateWithoutConversationInput = {
    id?: string
    content: string
    role: string
    timestamp?: Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    nodeId?: string | null
    nodeType?: string | null
  }

  export type ConversationMessageUncheckedCreateWithoutConversationInput = {
    id?: string
    content: string
    role: string
    timestamp?: Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    nodeId?: string | null
    nodeType?: string | null
  }

  export type ConversationMessageCreateOrConnectWithoutConversationInput = {
    where: ConversationMessageWhereUniqueInput
    create: XOR<ConversationMessageCreateWithoutConversationInput, ConversationMessageUncheckedCreateWithoutConversationInput>
  }

  export type ConversationMessageCreateManyConversationInputEnvelope = {
    data: ConversationMessageCreateManyConversationInput | ConversationMessageCreateManyConversationInput[]
  }

  export type AgentUpsertWithoutConversationsInput = {
    update: XOR<AgentUpdateWithoutConversationsInput, AgentUncheckedUpdateWithoutConversationsInput>
    create: XOR<AgentCreateWithoutConversationsInput, AgentUncheckedCreateWithoutConversationsInput>
    where?: AgentWhereInput
  }

  export type AgentUpdateToOneWithWhereWithoutConversationsInput = {
    where?: AgentWhereInput
    data: XOR<AgentUpdateWithoutConversationsInput, AgentUncheckedUpdateWithoutConversationsInput>
  }

  export type AgentUpdateWithoutConversationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    flowConfig?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    ownerType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedAgentsNestedInput
    user?: UserUpdateOneWithoutOwnedAgentsNestedInput
    team?: TeamUpdateOneWithoutOwnedAgentsNestedInput
  }

  export type AgentUncheckedUpdateWithoutConversationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    flowConfig?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    ownerType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    teamId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ConversationMessageUpsertWithWhereUniqueWithoutConversationInput = {
    where: ConversationMessageWhereUniqueInput
    update: XOR<ConversationMessageUpdateWithoutConversationInput, ConversationMessageUncheckedUpdateWithoutConversationInput>
    create: XOR<ConversationMessageCreateWithoutConversationInput, ConversationMessageUncheckedCreateWithoutConversationInput>
  }

  export type ConversationMessageUpdateWithWhereUniqueWithoutConversationInput = {
    where: ConversationMessageWhereUniqueInput
    data: XOR<ConversationMessageUpdateWithoutConversationInput, ConversationMessageUncheckedUpdateWithoutConversationInput>
  }

  export type ConversationMessageUpdateManyWithWhereWithoutConversationInput = {
    where: ConversationMessageScalarWhereInput
    data: XOR<ConversationMessageUpdateManyMutationInput, ConversationMessageUncheckedUpdateManyWithoutConversationInput>
  }

  export type ConversationMessageScalarWhereInput = {
    AND?: ConversationMessageScalarWhereInput | ConversationMessageScalarWhereInput[]
    OR?: ConversationMessageScalarWhereInput[]
    NOT?: ConversationMessageScalarWhereInput | ConversationMessageScalarWhereInput[]
    id?: StringFilter<"ConversationMessage"> | string
    conversationId?: StringFilter<"ConversationMessage"> | string
    content?: StringFilter<"ConversationMessage"> | string
    role?: StringFilter<"ConversationMessage"> | string
    timestamp?: DateTimeFilter<"ConversationMessage"> | Date | string
    metadata?: JsonNullableFilter<"ConversationMessage">
    nodeId?: StringNullableFilter<"ConversationMessage"> | string | null
    nodeType?: StringNullableFilter<"ConversationMessage"> | string | null
  }

  export type ConversationCreateWithoutMessagesInput = {
    id?: string
    title?: string | null
    flowState: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastMessageAt?: Date | string
    agent: AgentCreateNestedOneWithoutConversationsInput
  }

  export type ConversationUncheckedCreateWithoutMessagesInput = {
    id?: string
    title?: string | null
    agentId: string
    flowState: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastMessageAt?: Date | string
  }

  export type ConversationCreateOrConnectWithoutMessagesInput = {
    where: ConversationWhereUniqueInput
    create: XOR<ConversationCreateWithoutMessagesInput, ConversationUncheckedCreateWithoutMessagesInput>
  }

  export type ConversationUpsertWithoutMessagesInput = {
    update: XOR<ConversationUpdateWithoutMessagesInput, ConversationUncheckedUpdateWithoutMessagesInput>
    create: XOR<ConversationCreateWithoutMessagesInput, ConversationUncheckedCreateWithoutMessagesInput>
    where?: ConversationWhereInput
  }

  export type ConversationUpdateToOneWithWhereWithoutMessagesInput = {
    where?: ConversationWhereInput
    data: XOR<ConversationUpdateWithoutMessagesInput, ConversationUncheckedUpdateWithoutMessagesInput>
  }

  export type ConversationUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    flowState?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastMessageAt?: DateTimeFieldUpdateOperationsInput | Date | string
    agent?: AgentUpdateOneRequiredWithoutConversationsNestedInput
  }

  export type ConversationUncheckedUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    agentId?: StringFieldUpdateOperationsInput | string
    flowState?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastMessageAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemberTeamCreateManyTeamInput = {
    id?: string
    permission?: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    userId: string
  }

  export type AgentCreateManyTeamInput = {
    id?: string
    name: string
    description: string
    flowConfig: string
    isActive?: boolean
    ownerType: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    userId?: string | null
  }

  export type LLMProviderCreateManyTeamOwnerInput = {
    id?: string
    name?: string
    description?: string | null
    providerType: string
    endpointUrl: string
    isActive?: boolean
    isDefault?: boolean
    apiKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerType?: string
    config?: NullableJsonNullValueInput | InputJsonValue
    userOwnerId?: string | null
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MemberTeamUpdateWithoutTeamInput = {
    id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutTeamMembershipsNestedInput
  }

  export type MemberTeamUncheckedUpdateWithoutTeamInput = {
    id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type MemberTeamUncheckedUpdateManyWithoutTeamInput = {
    id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type UserUpdateWithoutTeamsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUpdateManyWithoutUserNestedInput
    createdKnowledge?: KnowledgeUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUpdateManyWithoutCreatedByNestedInput
    defaultLLMProvider?: LLMProviderUpdateOneWithoutUsersWithDefaultNestedInput
    ownedLLMProviders?: LLMProviderUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserUncheckedUpdateWithoutTeamsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    defaultLLMProviderId?: NullableStringFieldUpdateOperationsInput | string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUncheckedUpdateManyWithoutUserNestedInput
    createdKnowledge?: KnowledgeUncheckedUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUncheckedUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUncheckedUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUncheckedUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUncheckedUpdateManyWithoutCreatedByNestedInput
    ownedLLMProviders?: LLMProviderUncheckedUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserUncheckedUpdateManyWithoutTeamsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    defaultLLMProviderId?: NullableStringFieldUpdateOperationsInput | string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
  }

  export type KnowledgeUpdateWithoutTeamsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedKnowledgeNestedInput
    users?: UserUpdateManyWithoutKnowledgeNestedInput
    files?: FileUpdateManyWithoutKnowledgeNestedInput
  }

  export type KnowledgeUncheckedUpdateWithoutTeamsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    users?: UserUncheckedUpdateManyWithoutKnowledgeNestedInput
    files?: FileUncheckedUpdateManyWithoutKnowledgeNestedInput
  }

  export type KnowledgeUncheckedUpdateManyWithoutTeamsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type AgentUpdateWithoutTeamInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    flowConfig?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    ownerType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedAgentsNestedInput
    user?: UserUpdateOneWithoutOwnedAgentsNestedInput
    conversations?: ConversationUpdateManyWithoutAgentNestedInput
  }

  export type AgentUncheckedUpdateWithoutTeamInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    flowConfig?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    ownerType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    conversations?: ConversationUncheckedUpdateManyWithoutAgentNestedInput
  }

  export type AgentUncheckedUpdateManyWithoutTeamInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    flowConfig?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    ownerType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type LLMProviderUpdateWithoutTeamOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    providerType?: StringFieldUpdateOperationsInput | string
    endpointUrl?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerType?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    models?: LLMModelUpdateManyWithoutProviderNestedInput
    usersWithDefault?: UserUpdateManyWithoutDefaultLLMProviderNestedInput
    userOwner?: UserUpdateOneWithoutOwnedLLMProvidersNestedInput
  }

  export type LLMProviderUncheckedUpdateWithoutTeamOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    providerType?: StringFieldUpdateOperationsInput | string
    endpointUrl?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerType?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    userOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    models?: LLMModelUncheckedUpdateManyWithoutProviderNestedInput
    usersWithDefault?: UserUncheckedUpdateManyWithoutDefaultLLMProviderNestedInput
  }

  export type LLMProviderUncheckedUpdateManyWithoutTeamOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    providerType?: StringFieldUpdateOperationsInput | string
    endpointUrl?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerType?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    userOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
  }

  export type FileCreateManyKnowledgeInput = {
    id?: string
    filename: string
    originalName: string
    path: string
    mimetype: string
    size: number
    content?: string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    parsingStatus?: string | null
  }

  export type UserUpdateWithoutKnowledgeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUpdateManyWithoutUserNestedInput
    teams?: TeamUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUpdateManyWithoutCreatedByNestedInput
    ownedAgents?: AgentUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUpdateManyWithoutCreatedByNestedInput
    defaultLLMProvider?: LLMProviderUpdateOneWithoutUsersWithDefaultNestedInput
    ownedLLMProviders?: LLMProviderUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserUncheckedUpdateWithoutKnowledgeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    defaultLLMProviderId?: NullableStringFieldUpdateOperationsInput | string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUncheckedUpdateManyWithoutUserNestedInput
    teams?: TeamUncheckedUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUncheckedUpdateManyWithoutCreatedByNestedInput
    ownedAgents?: AgentUncheckedUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUncheckedUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUncheckedUpdateManyWithoutCreatedByNestedInput
    ownedLLMProviders?: LLMProviderUncheckedUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserUncheckedUpdateManyWithoutKnowledgeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    defaultLLMProviderId?: NullableStringFieldUpdateOperationsInput | string | null
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
  }

  export type TeamUpdateWithoutKnowledgeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedTeamsNestedInput
    members?: MemberTeamUpdateManyWithoutTeamNestedInput
    users?: UserUpdateManyWithoutTeamsNestedInput
    ownedAgents?: AgentUpdateManyWithoutTeamNestedInput
    ownedLLMProviders?: LLMProviderUpdateManyWithoutTeamOwnerNestedInput
  }

  export type TeamUncheckedUpdateWithoutKnowledgeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    members?: MemberTeamUncheckedUpdateManyWithoutTeamNestedInput
    users?: UserUncheckedUpdateManyWithoutTeamsNestedInput
    ownedAgents?: AgentUncheckedUpdateManyWithoutTeamNestedInput
    ownedLLMProviders?: LLMProviderUncheckedUpdateManyWithoutTeamOwnerNestedInput
  }

  export type TeamUncheckedUpdateManyWithoutKnowledgeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
  }

  export type FileUpdateWithoutKnowledgeInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    mimetype?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    content?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsingStatus?: NullableStringFieldUpdateOperationsInput | string | null
    parsingTasks?: FileParsingTaskUpdateManyWithoutFileNestedInput
    TextChunk?: TextChunkUpdateManyWithoutFileNestedInput
  }

  export type FileUncheckedUpdateWithoutKnowledgeInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    mimetype?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    content?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsingStatus?: NullableStringFieldUpdateOperationsInput | string | null
    parsingTasks?: FileParsingTaskUncheckedUpdateManyWithoutFileNestedInput
    TextChunk?: TextChunkUncheckedUpdateManyWithoutFileNestedInput
  }

  export type FileUncheckedUpdateManyWithoutKnowledgeInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    originalName?: StringFieldUpdateOperationsInput | string
    path?: StringFieldUpdateOperationsInput | string
    mimetype?: StringFieldUpdateOperationsInput | string
    size?: IntFieldUpdateOperationsInput | number
    content?: NullableStringFieldUpdateOperationsInput | string | null
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsingStatus?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TeamCreateManyCreatedByInput = {
    id?: string
    name: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MemberTeamCreateManyUserInput = {
    id?: string
    permission?: string
    joinedAt?: Date | string
    leftAt?: Date | string | null
    teamId: string
  }

  export type KnowledgeCreateManyCreatedByInput = {
    id?: string
    name: string
    description: string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgentCreateManyUserInput = {
    id?: string
    name: string
    description: string
    flowConfig: string
    isActive?: boolean
    ownerType: string
    createdAt?: Date | string
    updatedAt?: Date | string
    createdById: string
    teamId?: string | null
  }

  export type AgentCreateManyCreatedByInput = {
    id?: string
    name: string
    description: string
    flowConfig: string
    isActive?: boolean
    ownerType: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId?: string | null
    teamId?: string | null
  }

  export type FileParsingTaskCreateManyCreatedByInput = {
    id?: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    message?: string | null
    fileId: string
  }

  export type LLMProviderCreateManyUserOwnerInput = {
    id?: string
    name?: string
    description?: string | null
    providerType: string
    endpointUrl: string
    isActive?: boolean
    isDefault?: boolean
    apiKey?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ownerType?: string
    config?: NullableJsonNullValueInput | InputJsonValue
    teamOwnerId?: string | null
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
  }

  export type TeamUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: MemberTeamUpdateManyWithoutTeamNestedInput
    users?: UserUpdateManyWithoutTeamsNestedInput
    knowledge?: KnowledgeUpdateManyWithoutTeamsNestedInput
    ownedAgents?: AgentUpdateManyWithoutTeamNestedInput
    ownedLLMProviders?: LLMProviderUpdateManyWithoutTeamOwnerNestedInput
  }

  export type TeamUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: MemberTeamUncheckedUpdateManyWithoutTeamNestedInput
    users?: UserUncheckedUpdateManyWithoutTeamsNestedInput
    knowledge?: KnowledgeUncheckedUpdateManyWithoutTeamsNestedInput
    ownedAgents?: AgentUncheckedUpdateManyWithoutTeamNestedInput
    ownedLLMProviders?: LLMProviderUncheckedUpdateManyWithoutTeamOwnerNestedInput
  }

  export type TeamUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MemberTeamUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    team?: TeamUpdateOneRequiredWithoutMembersNestedInput
  }

  export type MemberTeamUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teamId?: StringFieldUpdateOperationsInput | string
  }

  export type MemberTeamUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    permission?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    leftAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teamId?: StringFieldUpdateOperationsInput | string
  }

  export type TeamUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedTeamsNestedInput
    members?: MemberTeamUpdateManyWithoutTeamNestedInput
    knowledge?: KnowledgeUpdateManyWithoutTeamsNestedInput
    ownedAgents?: AgentUpdateManyWithoutTeamNestedInput
    ownedLLMProviders?: LLMProviderUpdateManyWithoutTeamOwnerNestedInput
  }

  export type TeamUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    members?: MemberTeamUncheckedUpdateManyWithoutTeamNestedInput
    knowledge?: KnowledgeUncheckedUpdateManyWithoutTeamsNestedInput
    ownedAgents?: AgentUncheckedUpdateManyWithoutTeamNestedInput
    ownedLLMProviders?: LLMProviderUncheckedUpdateManyWithoutTeamOwnerNestedInput
  }

  export type TeamUncheckedUpdateManyWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
  }

  export type KnowledgeUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutKnowledgeNestedInput
    teams?: TeamUpdateManyWithoutKnowledgeNestedInput
    files?: FileUpdateManyWithoutKnowledgeNestedInput
  }

  export type KnowledgeUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutKnowledgeNestedInput
    teams?: TeamUncheckedUpdateManyWithoutKnowledgeNestedInput
    files?: FileUncheckedUpdateManyWithoutKnowledgeNestedInput
  }

  export type KnowledgeUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedKnowledgeNestedInput
    teams?: TeamUpdateManyWithoutKnowledgeNestedInput
    files?: FileUpdateManyWithoutKnowledgeNestedInput
  }

  export type KnowledgeUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    teams?: TeamUncheckedUpdateManyWithoutKnowledgeNestedInput
    files?: FileUncheckedUpdateManyWithoutKnowledgeNestedInput
  }

  export type KnowledgeUncheckedUpdateManyWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type AgentUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    flowConfig?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    ownerType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: UserUpdateOneRequiredWithoutCreatedAgentsNestedInput
    team?: TeamUpdateOneWithoutOwnedAgentsNestedInput
    conversations?: ConversationUpdateManyWithoutAgentNestedInput
  }

  export type AgentUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    flowConfig?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    ownerType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    teamId?: NullableStringFieldUpdateOperationsInput | string | null
    conversations?: ConversationUncheckedUpdateManyWithoutAgentNestedInput
  }

  export type AgentUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    flowConfig?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    ownerType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdById?: StringFieldUpdateOperationsInput | string
    teamId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AgentUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    flowConfig?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    ownerType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneWithoutOwnedAgentsNestedInput
    team?: TeamUpdateOneWithoutOwnedAgentsNestedInput
    conversations?: ConversationUpdateManyWithoutAgentNestedInput
  }

  export type AgentUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    flowConfig?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    ownerType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    teamId?: NullableStringFieldUpdateOperationsInput | string | null
    conversations?: ConversationUncheckedUpdateManyWithoutAgentNestedInput
  }

  export type AgentUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    flowConfig?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    ownerType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    teamId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FileParsingTaskUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    file?: FileUpdateOneRequiredWithoutParsingTasksNestedInput
  }

  export type FileParsingTaskUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    fileId?: StringFieldUpdateOperationsInput | string
  }

  export type FileParsingTaskUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    fileId?: StringFieldUpdateOperationsInput | string
  }

  export type LLMProviderUpdateWithoutUserOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    providerType?: StringFieldUpdateOperationsInput | string
    endpointUrl?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerType?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    models?: LLMModelUpdateManyWithoutProviderNestedInput
    usersWithDefault?: UserUpdateManyWithoutDefaultLLMProviderNestedInput
    teamOwner?: TeamUpdateOneWithoutOwnedLLMProvidersNestedInput
  }

  export type LLMProviderUncheckedUpdateWithoutUserOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    providerType?: StringFieldUpdateOperationsInput | string
    endpointUrl?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerType?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    teamOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
    models?: LLMModelUncheckedUpdateManyWithoutProviderNestedInput
    usersWithDefault?: UserUncheckedUpdateManyWithoutDefaultLLMProviderNestedInput
  }

  export type LLMProviderUncheckedUpdateManyWithoutUserOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    providerType?: StringFieldUpdateOperationsInput | string
    endpointUrl?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ownerType?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    teamOwnerId?: NullableStringFieldUpdateOperationsInput | string | null
    permissionSettings?: NullableJsonNullValueInput | InputJsonValue
  }

  export type FileParsingTaskCreateManyFileInput = {
    id?: string
    status: string
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
    message?: string | null
    createdById: string
  }

  export type TextChunkCreateManyFileInput = {
    id?: string
    content: string
    chunkIndex: number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    vectorData?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FileParsingTaskUpdateWithoutFileInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: UserUpdateOneRequiredWithoutFileParsingTaskNestedInput
  }

  export type FileParsingTaskUncheckedUpdateWithoutFileInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
  }

  export type FileParsingTaskUncheckedUpdateManyWithoutFileInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
  }

  export type TextChunkUpdateWithoutFileInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    vectorData?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TextChunkUncheckedUpdateWithoutFileInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    vectorData?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TextChunkUncheckedUpdateManyWithoutFileInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    chunkIndex?: IntFieldUpdateOperationsInput | number
    metadata?: NullableJsonNullValueInput | InputJsonValue
    vectorData?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConversationCreateManyAgentInput = {
    id?: string
    title?: string | null
    flowState: string
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastMessageAt?: Date | string
  }

  export type ConversationUpdateWithoutAgentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    flowState?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastMessageAt?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: ConversationMessageUpdateManyWithoutConversationNestedInput
  }

  export type ConversationUncheckedUpdateWithoutAgentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    flowState?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastMessageAt?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: ConversationMessageUncheckedUpdateManyWithoutConversationNestedInput
  }

  export type ConversationUncheckedUpdateManyWithoutAgentInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    flowState?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastMessageAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LLMModelCreateManyProviderInput = {
    id?: string
    name: string
    displayName?: string | null
    description?: string | null
    modelType: string
    contextWindow?: number | null
    isActive?: boolean
    isDefault?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type UserCreateManyDefaultLLMProviderInput = {
    id?: string
    name: string
    code: string
    password: string
    email: string
    description: string
    createdAt?: Date | string
    updatedAt?: Date | string
    permission?: string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
  }

  export type LLMModelUpdateWithoutProviderInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    modelType?: StringFieldUpdateOperationsInput | string
    contextWindow?: NullableIntFieldUpdateOperationsInput | number | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type LLMModelUncheckedUpdateWithoutProviderInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    modelType?: StringFieldUpdateOperationsInput | string
    contextWindow?: NullableIntFieldUpdateOperationsInput | number | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type LLMModelUncheckedUpdateManyWithoutProviderInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    displayName?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    modelType?: StringFieldUpdateOperationsInput | string
    contextWindow?: NullableIntFieldUpdateOperationsInput | number | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type UserUpdateWithoutDefaultLLMProviderInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUpdateManyWithoutUserNestedInput
    teams?: TeamUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUpdateManyWithoutCreatedByNestedInput
    ownedLLMProviders?: LLMProviderUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserUncheckedUpdateWithoutDefaultLLMProviderInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
    createdTeams?: TeamUncheckedUpdateManyWithoutCreatedByNestedInput
    teamMemberships?: MemberTeamUncheckedUpdateManyWithoutUserNestedInput
    teams?: TeamUncheckedUpdateManyWithoutUsersNestedInput
    createdKnowledge?: KnowledgeUncheckedUpdateManyWithoutCreatedByNestedInput
    knowledge?: KnowledgeUncheckedUpdateManyWithoutUsersNestedInput
    ownedAgents?: AgentUncheckedUpdateManyWithoutUserNestedInput
    createdAgents?: AgentUncheckedUpdateManyWithoutCreatedByNestedInput
    FileParsingTask?: FileParsingTaskUncheckedUpdateManyWithoutCreatedByNestedInput
    ownedLLMProviders?: LLMProviderUncheckedUpdateManyWithoutUserOwnerNestedInput
  }

  export type UserUncheckedUpdateManyWithoutDefaultLLMProviderInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: StringFieldUpdateOperationsInput | string
    llmPreferences?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ConversationMessageCreateManyConversationInput = {
    id?: string
    content: string
    role: string
    timestamp?: Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    nodeId?: string | null
    nodeType?: string | null
  }

  export type ConversationMessageUpdateWithoutConversationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    nodeId?: NullableStringFieldUpdateOperationsInput | string | null
    nodeType?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ConversationMessageUncheckedUpdateWithoutConversationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    nodeId?: NullableStringFieldUpdateOperationsInput | string | null
    nodeType?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ConversationMessageUncheckedUpdateManyWithoutConversationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    nodeId?: NullableStringFieldUpdateOperationsInput | string | null
    nodeType?: NullableStringFieldUpdateOperationsInput | string | null
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