import {
  Database, Constructor, Model, Repository,
} from '@vuex-orm/core';

declare module 'vuex/types/index' {
  interface Store<S> {
      /**
       * The default database instance.
       */
      $database: Database;
      /**
       * Mapping of databases keyed on connection
       */
      $databases: {
          [key: string]: Database;
      };
      /**
       * Get a new Repository instance for the given model.
       */
      $repo<M extends Model>(model: Constructor<M>, connection?: string): Repository<M>;
      $repo<R extends Repository>(repository: Constructor<R>, connection?: string): R;
  }
}
