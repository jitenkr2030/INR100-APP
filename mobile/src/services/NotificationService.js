/**
 * Notification Service for INR100 Mobile App
 * Handles push notifications, local notifications, and real-time updates
 */

import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';

class NotificationService {
  static instance = null;

  static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    try {
      // Configure push notifications
      PushNotification.configure({
        onRegister: (token) => {
          console.log('FCM Token:', token);
          this.registerToken(token);
        },
        onNotification: (notification) => {
          console.log('Notification received:', notification);
          this.handleNotification(notification);
        },
        onAction: (notification) => {
          console.log('Notification action:', notification.action);
        },
        onRegistrationError: (err) => {
          console.error('Notification registration error:', err.message);
        },
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
        popInitialNotification: true,
        requestPermissions: Platform.OS === 'ios',
      });

      // Create notification channel for Android
      if (Platform.OS === 'android') {
        PushNotification.createChannel(
          {
            channelId: 'inr100-notifications',
            channelName: 'INR100 Notifications',
            channelDescription: 'Notifications for INR100 Mobile App',
            playSound: true,
            soundName: 'default',
            importance: 4,
            vibrate: true,
          },
          (created) => console.log(`Channel created: ${created}`)
        );
      }

      // Request permission for notifications
      await this.requestPermission();

      // Setup FCM messaging
      await this.setupFCM();

      console.log('✅ Notification Service initialized');
    } catch (error) {
      console.error('❌ Notification Service initialization error:', error);
    }
  }

  async requestPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ Notification permission granted');
        return true;
      } else {
        console.log('❌ Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  }

  async setupFCM() {
    try {
      // Get FCM token
      const token = await messaging().getToken();
      console.log('FCM Token:', token);

      // Listen for token refresh
      messaging().onTokenRefresh((newToken) => {
        console.log('FCM Token refreshed:', newToken);
        this.registerToken(newToken);
      });

      // Handle background messages
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Background message:', remoteMessage);
        this.handleNotification(remoteMessage);
      });

      // Handle foreground messages
      messaging().onMessage(async (remoteMessage) => {
        console.log('Foreground message:', remoteMessage);
        this.handleNotification(remoteMessage);
      });

      // Handle notification opened from quit state
      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            console.log('Notification opened from quit state:', remoteMessage);
            this.handleNotification(remoteMessage);
          }
        });

      // Handle notification opened from background state
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('Notification opened from background:', remoteMessage);
        this.handleNotification(remoteMessage);
      });

    } catch (error) {
      console.error('FCM setup error:', error);
    }
  }

  async registerToken(token) {
    try {
      // Send token to backend
      const { APIService } = await import('./APIService');
      await APIService.registerFCMToken(token);
    } catch (error) {
      console.error('Token registration error:', error);
    }
  }

  handleNotification(notification) {
    try {
      const { data, title, body, userInteraction } = notification;

      // Handle specific notification types
      if (data?.type) {
        switch (data.type) {
          case 'portfolio_update':
            this.handlePortfolioUpdate(data);
            break;
          case 'price_alert':
            this.handlePriceAlert(data);
            break;
          case 'kyc_status':
            this.handleKYCStatus(data);
            break;
          case 'order_executed':
            this.handleOrderExecuted(data);
            break;
          case 'payment_success':
            this.handlePaymentSuccess(data);
            break;
          case 'learning_reminder':
            this.handleLearningReminder(data);
            break;
          case 'social_activity':
            this.handleSocialActivity(data);
            break;
          default:
            console.log('Unknown notification type:', data.type);
        }
      }

      // Show local notification
      if (!userInteraction) {
        this.showLocalNotification(title, body, data);
      }
    } catch (error) {
      console.error('Notification handling error:', error);
    }
  }

  handlePortfolioUpdate(data) {
    console.log('Portfolio update:', data);
    // Update portfolio data in store
    // Navigate to portfolio screen if app is open
  }

  handlePriceAlert(data) {
    console.log('Price alert:', data);
    // Show price alert
    PushNotification.localNotification({
      title: 'Price Alert!',
      message: `${data.symbol} reached ₹${data.targetPrice}`,
      channelId: 'inr100-notifications',
    });
  }

  handleKYCStatus(data) {
    console.log('KYC status:', data);
    PushNotification.localNotification({
      title: 'KYC Status Update',
      message: data.status === 'approved' ? 'Your KYC has been approved!' : 'KYC verification pending',
      channelId: 'inr100-notifications',
    });
  }

  handleOrderExecuted(data) {
    console.log('Order executed:', data);
    PushNotification.localNotification({
      title: 'Order Executed!',
      message: `Your ${data.orderType} order for ${data.symbol} has been executed`,
      channelId: 'inr100-notifications',
    });
  }

  handlePaymentSuccess(data) {
    console.log('Payment success:', data);
    PushNotification.localNotification({
      title: 'Payment Successful!',
      message: `₹${data.amount} has been added to your wallet`,
      channelId: 'inr100-notifications',
    });
  }

  handleLearningReminder(data) {
    console.log('Learning reminder:', data);
    PushNotification.localNotification({
      title: 'Time to Learn!',
      message: 'Complete your daily learning goal to earn XP',
      channelId: 'inr100-notifications',
    });
  }

  handleSocialActivity(data) {
    console.log('Social activity:', data);
    PushNotification.localNotification({
      title: 'New Activity',
      message: data.message,
      channelId: 'inr100-notifications',
    });
  }

  showLocalNotification(title, message, data = {}) {
    PushNotification.localNotification({
      title,
      message,
      channelId: 'inr100-notifications',
      userInfo: data,
      playSound: true,
      soundName: 'default',
    });
  }

  // Schedule notifications
  scheduleLearningReminder() {
    PushNotification.localNotificationSchedule({
      title: 'Learning Reminder',
      message: 'Complete your daily learning goal to earn XP and badges!',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      channelId: 'inr100-notifications',
      repeatType: 'day',
    });
  }

  schedulePriceAlerts(alerts) {
    alerts.forEach((alert) => {
      PushNotification.localNotificationSchedule({
        title: 'Price Alert',
        message: `${alert.symbol} has reached ₹${alert.targetPrice}`,
        date: new Date(alert.scheduledTime),
        channelId: 'inr100-notifications',
        userInfo: { type: 'price_alert', ...alert },
      });
    });
  }

  // Cancel all notifications
  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  // Cancel specific notification
  cancelNotification(id) {
    PushNotification.cancelLocalNotification(id);
  }

  // Get badge count
  async getBadgeCount() {
    if (Platform.OS === 'ios') {
      return await PushNotificationIOS.getApplicationIconBadgeNumber();
    }
    return 0;
  }

  // Set badge count
  async setBadgeCount(count) {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(count);
    }
  }
}

export default NotificationService;