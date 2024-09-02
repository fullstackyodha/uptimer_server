import { Model } from 'sequelize';
import { INotificationDocument } from '@app/interfaces/notifications.interface';
import { NotificationModel } from '@app/models/notification.mode';

export async function createNotificationGroup(
	data: INotificationDocument
): Promise<INotificationDocument> {
	try {
		// Builds a new model instance and calls save on it.
		const result: Model = await NotificationModel.create(data);

		return result.dataValues as INotificationDocument;
	} catch (err) {
		throw new Error(err);
	}
}

export async function getSingleNotificationGroup(
	notificationId: number
): Promise<INotificationDocument> {
	try {
		// Search for a single instance.
		const notification: INotificationDocument =
			(await NotificationModel.findOne({
				raw: true,
				where: {
					id: notificationId,
				},
				order: [['createdAt', 'DESC']],
			})) as unknown as INotificationDocument;

		return notification;
	} catch (err) {
		throw new Error(err);
	}
}

export async function getAllNotificationGroups(
	userId: number
): Promise<INotificationDocument[]> {
	try {
		const notification: INotificationDocument[] =
			(await NotificationModel.findAll({
				raw: true,
				where: {
					userId,
				},
				order: [['createdAt', 'DESC']],
			})) as unknown as INotificationDocument[];

		return notification;
	} catch (err) {
		throw new Error(err);
	}
}

export async function updateNotificationGroups(
	notificationId: number,
	data: INotificationDocument
): Promise<void> {
	try {
		await NotificationModel.update(data, {
			where: {
				id: notificationId,
			},
		});
	} catch (err) {
		throw new Error(err);
	}
}

export async function deleteNotificationGroups(
	notificationId: number
): Promise<void> {
	try {
		await NotificationModel.destroy({
			where: {
				id: notificationId,
			},
		});
	} catch (err) {
		throw new Error(err);
	}
}
