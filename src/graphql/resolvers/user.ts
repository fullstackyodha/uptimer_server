import { IUserDocument } from '@app/interfaces/user.interface';
import { AppContext } from '@app/server/server';
import {
	createUser,
	getUserByUsernameOrEmail,
} from '@app/services/user.service';
import { GraphQLError } from 'graphql';
import { toLower, upperFirst } from 'lodash';

export const userResolver = {
	Mutation: {
		async registerUser(
			_: undefined,
			args: { user: IUserDocument },
			// CONTAINS REQUEST AND RESPONSE
			contextValue: AppContext
		) {
			const { req } = contextValue;
			const { user } = args;

			const { username, email, password } = user;

			const checkIfUserExists: IUserDocument | undefined =
				await getUserByUsernameOrEmail(username!, email!);

			if (checkIfUserExists) {
				throw new GraphQLError('User already exists!!');
			}

			const authData: IUserDocument = {
				username: upperFirst(username!),
				email: toLower(email!),
				password,
			} as IUserDocument;

			const result: IUserDocument | undefined =
				await createUser(authData);

			return result;
		},
	},
};
