import { IUserDocument } from '@app/interfaces/user.interface';
import { sequelize } from '@app/server/database';
import { compare, hash } from 'bcryptjs';
import { DataTypes, Model, ModelDefined, Optional } from 'sequelize';

const SALT_ROUND = 10;

interface UserModelInstanceMethods extends Model {
	prototype: {
		comparePassword(
			password: string,
			hashedPassword: string
		): Promise<boolean>;

		hashPassword(password: string): Promise<string>;
	};
}

type UserCreationAttributes = Optional<IUserDocument, 'id' | 'createdAt'>;

const UserModel: ModelDefined<IUserDocument, UserCreationAttributes> &
	UserModelInstanceMethods = sequelize.define(
	'users',
	// FIELDS
	{
		username: { type: DataTypes.STRING, allowNull: false, unique: true },
		email: { type: DataTypes.STRING, allowNull: false, unique: true },
		password: { type: DataTypes.STRING, allowNull: true },

		googleId: { type: DataTypes.STRING, allowNull: true },
		facebookId: { type: DataTypes.STRING, allowNull: true },
		createdAt: { type: DataTypes.DATE, defaultValue: Date.now() },
	},
	// INDEXES
	{
		indexes: [{ fields: ['username'] }, { fields: ['email'] }],
	}
) as ModelDefined<IUserDocument, UserCreationAttributes> &
	UserModelInstanceMethods;

UserModel.addHook('beforeCreate', async (auth: Model) => {
	let { dataValues } = auth;

	if (dataValues.password !== undefined) {
		// Asynchronously generates a hash for the given string.
		const hashedPassword: string = await hash(
			dataValues.password,
			SALT_ROUND
		);

		// SET Hashed Password
		dataValues = { ...dataValues, password: hashedPassword };

		auth.dataValues = dataValues;
	}
});

UserModel.prototype.comparePassword = async function (
	password: string,
	hashedPassword: string
): Promise<boolean> {
	return await compare(password, hashedPassword);
};

UserModel.prototype.hashPassword = async function (
	password: string
): Promise<string> {
	return await hash(password, SALT_ROUND);
};

export { UserModel };
