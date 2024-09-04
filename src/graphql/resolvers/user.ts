import { INotificationDocument } from '@app/interfaces/notifications.interface';
import { IUserDocument, IUserResponse } from '@app/interfaces/user.interface';
import { AppContext } from '@app/server/server';
import {
	createNotificationGroup,
	getAllNotificationGroups,
} from '@app/services/notification.service';
import {
	createUser,
	getUserByUsernameOrEmail,
} from '@app/services/user.service';
import { GraphQLError } from 'graphql';
import { toLower, upperFirst } from 'lodash';
import { sign } from 'jsonwebtoken';
import { JWT_TOKEN } from '@app/server/config';
import { Request } from 'express';

export const UserResolver = {
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

			const response = await userReturnValue(req, result, 'register');

			return response;
		},
	},
};

async function userReturnValue(
	req: Request,
	result: IUserDocument,
	type: string
): Promise<IUserResponse> {
	let notifications: INotificationDocument[] = [];

	if (type === 'register' && result && result.id && result.email) {
		const notification = await createNotificationGroup({
			userId: `${result.id}`,
			groupName: 'Default Contact',
			emails: JSON.stringify([result.email]),
		});

		notifications.push(notification);
	} else if (type === 'login' && result && result.id && result.email) {
		notifications = await getAllNotificationGroups(result.id);
	}

	// Synchronously sign the given payload into a JSON Web Token string payload
	const userJWT: string = sign(
		{
			id: result.id,
			email: result.email,
			username: result.username,
		},
		JWT_TOKEN
	);

	// Represents the session for the given request.
	req.session = { jwt: userJWT, enableAutomaticRefresh: false };

	const user: IUserDocument = {
		id: result.id,
		username: result.username,
		email: result.email,
	} as IUserDocument;

	return {
		user,
		notifications,
	};
}
