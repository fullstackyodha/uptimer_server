import { IUserDocument } from '@app/interfaces/user.interface';
import { UserModel } from '@app/models/user.model';
import { Model, Op } from 'sequelize';
import { omit, toLower, upperFirst } from 'lodash';

export async function createUser(data: IUserDocument): Promise<IUserDocument> {
	try {
		// Builds a new model instance and calls save on it.
		const result: Model = await UserModel.create(data);

		const userData: IUserDocument = omit(result.dataValues, [
			'password',
		]) as IUserDocument;

		return userData as IUserDocument;
	} catch (err) {
		throw new Error(err);
	}
}

export async function getUserByUsernameOrEmail(
	username: string,
	email: string
): Promise<IUserDocument | undefined> {
	try {
		// Search for a single instance.
		const user: IUserDocument | undefined = (await UserModel.findOne({
			raw: true,
			where: {
				[Op.or]: [
					{ username: upperFirst(username) },
					{ email: toLower(email) },
				],
			},
		})) as unknown as IUserDocument | undefined;

		return user;
	} catch (err) {
		throw new Error(err);
	}
}

export async function getUserBySocialId(
	socialId: string,
	email: string,
	type: string
): Promise<IUserDocument | undefined> {
	try {
		// Search for a single instance.
		const user: IUserDocument | undefined = (await UserModel.findOne({
			raw: true,
			where: {
				[Op.or]: [
					{ ...(type === 'facebook' && { facebookId: socialId }) },
					{ ...(type === 'google' && { googleId: socialId }) },
					{ email: toLower(email) },
				],
			},
		})) as unknown as IUserDocument | undefined;

		return user;
	} catch (err) {
		throw new Error(err);
	}
}

export async function getUserByUsername(
	value: string,
	type: string
): Promise<IUserDocument | undefined> {
	try {
		// Search for a single instance.
		const user: IUserDocument | undefined = (await UserModel.findOne({
			raw: true,
			where: {
				...(type === 'username' && { username: upperFirst(value) }),
				...(type === 'email' && { email: toLower(value) }),
			},
		})) as unknown as IUserDocument | undefined;

		return user;
	} catch (err) {
		throw new Error(err);
	}
}
