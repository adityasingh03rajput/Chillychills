import { LocalNotifications } from '@capacitor/local-notifications';

// PushNotifications disabled due to missing google-services.json and Firebase crash
// import { PushNotifications } from '@capacitor/push-notifications';

export const initNotifications = async () => {
    try {
        // Request permissions for local notifications only
        await LocalNotifications.requestPermissions();
        console.log('Local notifications permission requested');
    } catch (e) {
        console.warn('Notification permission request failed', e);
    }
};

export const sendLocalNotification = async (title: string, body: string, id: number = 1) => {
    try {
        await LocalNotifications.schedule({
            notifications: [
                {
                    title,
                    body,
                    id,
                    schedule: { at: new Date(Date.now() + 1000) }, // Send after 1 second
                    sound: 'default',
                    actionTypeId: '',
                    extra: null,
                },
            ],
        });
    } catch (error) {
        console.error('Error sending local notification:', error);
    }
};
