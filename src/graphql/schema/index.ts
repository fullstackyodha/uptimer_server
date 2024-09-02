import { mergeTypeDefs } from '@graphql-tools/merge';
import { userSchema } from './user';

// Merges multiple type definitions into a single DocumentNode
export const mergeGraphQLSchema = mergeTypeDefs([userSchema]);
