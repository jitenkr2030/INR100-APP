/**
 * Social Learning Screen for INR100 Mobile App
 * Displays discussions, study groups, and progress sharing
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
  Dimensions,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

// Services
import APIService from '../../services/APIService';
import AnalyticsService from '../../services/AnalyticsService';

// Styles
import { Colors, Typography, Spacing, BorderRadius, GlobalStyles } from '../../styles/GlobalStyles';

const { width } = Dimensions.get('window');

const SocialLearningScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userId = 'demo-user', currentCourse, currentLesson } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('discussions');
  const [discussions, setDiscussions] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [progressShares, setProgressShares] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    loadSocialData();
    trackScreenView();
  }, []);

  const loadSocialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadDiscussions(),
        loadStudyGroups(),
        loadProgressShares()
      ]);
    } catch (error) {
      console.error('Error loading social data:', error);
      Alert.alert('Error', 'Failed to load social learning data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadDiscussions = async () => {
    try {
      const params = new URLSearchParams();
      if (currentCourse) params.append('course', currentCourse);
      if (currentLesson) params.append('lesson', currentLesson);
      
      const response = await APIService.get(`/learn/social/discussions?${params.toString()}`);
      if (response.success) {
        setDiscussions(response.data.discussions || []);
      }
    } catch (error) {
      console.error('Error loading discussions:', error);
    }
  };

  const loadStudyGroups = async () => {
    try {
      const params = new URLSearchParams();
      if (currentCourse) params.append('course', currentCourse);
      
      const response = await APIService.get(`/learn/social/groups?${params.toString()}`);
      if (response.success) {
        setStudyGroups(response.data.groups || []);
      }
    } catch (error) {
      console.error('Error loading study groups:', error);
    }
  };

  const loadProgressShares = async () => {
    try {
      const params = new URLSearchParams();
      if (currentCourse) params.append('course', currentCourse);
      
      const response = await APIService.get(`/learn/social/shares?${params.toString()}`);
      if (response.success) {
        setProgressShares(response.data.shares || []);
      }
    } catch (error) {
      console.error('Error loading progress shares:', error);
    }
  };

  const handlePostMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await APIService.post('/learn/social/discussions', {
        userId,
        content: newMessage,
        course: currentCourse,
        lesson: currentLesson
      });

      if (response.success) {
        setDiscussions(prev => [response.data, ...prev]);
        setNewMessage('');
        setShowPostModal(false);
        Alert.alert('Success', 'Discussion posted successfully!');
      }
    } catch (error) {
      console.error('Error posting message:', error);
      Alert.alert('Error', 'Failed to post discussion');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await APIService.post(`/learn/social/groups/${groupId}/join`, { userId });
      
      if (response.success) {
        setStudyGroups(prev => prev.map(group => 
          group.id === groupId 
            ? { ...group, isJoined: true, members: group.members + 1 }
            : group
        ));
        Alert.alert('Success', 'Successfully joined the study group!');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', 'Failed to join study group');
    }
  };

  const handleLike = async (type, id) => {
    try {
      const response = await APIService.post(`/learn/social/${type}/${id}/like`, { userId });
      
      if (response.success) {
        if (type === 'discussion') {
          setDiscussions(prev => prev.map(discussion => 
            discussion.id === id 
              ? { 
                  ...discussion, 
                  isLiked: !discussion.isLiked, 
                  likes: discussion.isLiked ? discussion.likes - 1 : discussion.likes + 1 
                }
              : discussion
          ));
        } else {
          setProgressShares(prev => prev.map(share => 
            share.id === id 
              ? { ...share, likes: share.likes + 1 }
              : share
          ));
        }
      }
    } catch (error) {
      console.error('Error liking content:', error);
    }
  };

  const trackScreenView = () => {
    AnalyticsService.trackScreen('SocialLearningScreen');
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSocialData();
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderTabButton = (tabKey, label, icon) => (
    <TouchableOpacity
      key={tabKey}
      style={[
        styles.tabButton,
        activeTab === tabKey && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tabKey)}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={activeTab === tabKey ? Colors.white : Colors.textSecondary} 
      />
      <Text style={[
        styles.tabButtonText,
        activeTab === tabKey && styles.activeTabButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderDiscussion = ({ item }) => (
    <TouchableOpacity style={styles.discussionCard}>
      <View style={styles.discussionHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.userName?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.timestamp}>{formatTimeAgo(item.timestamp)}</Text>
          </View>
        </View>
        {item.course && (
          <View style={styles.courseBadge}>
            <Text style={styles.courseBadgeText}>{item.course}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.discussionContent}>{item.content}</Text>
      
      <View style={styles.discussionActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike('discussion', item.id)}
        >
          <Ionicons 
            name={item.isLiked ? "heart" : "heart-outline"} 
            size={16} 
            color={item.isLiked ? Colors.error : Colors.textSecondary} 
          />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.actionText}>{item.replies} replies</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderStudyGroup = ({ item }) => (
    <TouchableOpacity style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={styles.groupIcon}>
          <Ionicons name="people" size={24} color={Colors.primary} />
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.groupMeta}>
            <Text style={styles.groupMetaText}>
              {item.members} members • Active {formatTimeAgo(item.lastActivity)}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.joinButton,
          item.isJoined && styles.joinedButton
        ]}
        onPress={() => handleJoinGroup(item.id)}
        disabled={item.isJoined}
      >
        <Text style={[
          styles.joinButtonText,
          item.isJoined && styles.joinedButtonText
        ]}>
          {item.isJoined ? 'Joined' : 'Join Group'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderProgressShare = ({ item }) => (
    <TouchableOpacity style={styles.shareCard}>
      <View style={styles.shareHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.userName?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.shareCourse}>{item.course}</Text>
          </View>
        </View>
        <View style={styles.achievementBadge}>
          <Ionicons name="trophy" size={16} color={Colors.warning} />
          <Text style={styles.achievementText}>{item.achievement}</Text>
        </View>
      </View>
      
      <Text style={styles.shareContent}>
        Just completed {item.course} course
      </Text>
      
      <View style={styles.shareActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike('share', item.id)}
        >
          <Ionicons name="heart-outline" size={16} color={Colors.error} />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.actionText}>{item.comments} comments</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'discussions':
        return (
          <FlatList
            data={discussions}
            renderItem={renderDiscussion}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.emptyStateText}>No discussions yet</Text>
                <Text style={styles.emptyStateSubtext}>Be the first to start a conversation!</Text>
              </View>
            }
          />
        );
      case 'groups':
        return (
          <FlatList
            data={studyGroups}
            renderItem={renderStudyGroup}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.emptyStateText}>No study groups available</Text>
                <Text style={styles.emptyStateSubtext}>Check back later for new groups</Text>
              </View>
            }
          />
        );
      case 'achievements':
        return (
          <FlatList
            data={progressShares}
            renderItem={renderProgressShare}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.emptyStateText}>No recent achievements</Text>
                <Text style={styles.emptyStateSubtext}>Share your progress when you complete lessons!</Text>
              </View>
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Social Learning</Text>
        <TouchableOpacity
          style={styles.postButton}
          onPress={() => setShowPostModal(true)}
        >
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('discussions', 'Discussions', 'chatbubbles')}
        {renderTabButton('groups', 'Groups', 'people')}
        {renderTabButton('achievements', 'Achievements', 'trophy')}
      </View>

      {renderContent()}

      {/* Post Message Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPostModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Discussion</Text>
            <TouchableOpacity onPress={handlePostMessage}>
              <Text style={[
                styles.modalPost,
                !newMessage.trim() && styles.modalPostDisabled
              ]}>
                Post
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.modalUserInfo}>
              <View style={styles.modalAvatar}>
                <Text style={styles.modalAvatarText}>Y</Text>
              </View>
              <View style={styles.modalCourseInfo}>
                {currentCourse && (
                  <View style={styles.modalCourseBadge}>
                    <Text style={styles.modalCourseText}>{currentCourse}</Text>
                  </View>
                )}
                {currentLesson && (
                  <View style={styles.modalLessonBadge}>
                    <Text style={styles.modalLessonText}>Lesson: {currentLesson}</Text>
                  </View>
                )}
              </View>
            </View>
            
            <TextInput
              style={styles.messageInput}
              placeholder="Share your thoughts or ask a question..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              textAlignVertical="top"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  postButton: {
    padding: Spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  activeTabButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  discussionCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...GlobalStyles.shadow,
  },
  discussionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  courseBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  courseBadgeText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '500',
  },
  discussionContent: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  discussionActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  groupCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...GlobalStyles.shadow,
  },
  groupHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    ...Typography.h5,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  groupDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  groupMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupMetaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: Colors.secondary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  categoryBadgeText: {
    ...Typography.caption,
    color: Colors.secondary,
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  joinedButton: {
    backgroundColor: Colors.success,
  },
  joinButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  joinedButtonText: {
    color: Colors.white,
  },
  shareCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...GlobalStyles.shadow,
  },
  shareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  shareCourse: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  achievementText: {
    ...Typography.caption,
    color: Colors.warning,
    fontWeight: '500',
  },
  shareContent: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  shareActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyStateText: {
    ...Typography.h5,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptyStateSubtext: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCancel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  modalTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
  },
  modalPost: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalPostDisabled: {
    color: Colors.textSecondary,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.md,
  },
  modalUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  modalAvatarText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  modalCourseInfo: {
    flex: 1,
  },
  modalCourseBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  modalCourseText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '500',
  },
  modalLessonBadge: {
    backgroundColor: Colors.secondary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  modalLessonText: {
    ...Typography.caption,
    color: Colors.secondary,
    fontWeight: '500',
  },
  messageInput: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 120,
    textAlignVertical: 'top',
    ...GlobalStyles.shadow,
  },
});

export default SocialLearningScreen;