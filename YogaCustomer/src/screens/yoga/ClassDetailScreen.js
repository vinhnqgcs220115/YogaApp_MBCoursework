import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

// Import services
import {
  yogaClassService,
  classInstanceService,
} from '../../services/yogaService';
import {
  shoppingCartService,
  integrationHelpers,
} from '../../services/bookingService';

// Import contexts
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

// Import components
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

// Import utils
import { colors } from '../../utils/colors';

const { width: screenWidth } = Dimensions.get('window');

const ClassDetailScreen = ({ route, navigation }) => {
  const { classId } = route.params;
  const { user } = useAuth();
  const { addToCart } = useCart();

  // State
  const [classData, setClassData] = useState(null);
  const [availableInstances, setAvailableInstances] = useState([]);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch class details and available instances
  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch class data
      const classInfo = await yogaClassService.getClassById(classId);
      setClassData(classInfo);

      // Fetch available instances for this class
      const instances = await classInstanceService.getInstancesForClass(
        classId
      );

      // Filter for future instances only
      const today = new Date().toISOString().split('T')[0];
      const futureInstances = instances.filter(
        (instance) => instance.date && instance.date > today
      );

      setAvailableInstances(futureInstances);

      // Auto-select first available instance if exists
      if (futureInstances.length > 0) {
        setSelectedInstance(futureInstances[0]);
      }
    } catch (err) {
      console.error('Error fetching class details:', err);
      setError(err.message);
      Alert.alert('Error', 'Failed to load class details. Please try again.', [
        { text: 'Retry', onPress: fetchClassDetails },
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClassDetails();
    setRefreshing(false);
  };

  // Handle booking
  const handleBookNow = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to book classes.', [
        { text: 'Cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('Auth') },
      ]);
      return;
    }

    if (!selectedInstance) {
      Alert.alert('Select Session', 'Please select a session to book.');
      return;
    }

    try {
      setBookingLoading(true);

      // Check availability first
      const availability = await integrationHelpers.checkClassAvailability(
        classData.id,
        selectedInstance.id
      );

      if (!availability.available) {
        Alert.alert(
          'Session Full',
          `This session is fully booked. Available spots: ${availability.availableSpots}`,
          [{ text: 'OK' }]
        );
        return;
      }

      // Create cart item
      const cartItem = integrationHelpers.createCartItemFromClassAndSchedule(
        classData,
        selectedInstance,
        1 // quantity
      );

      // Add to cart (Firebase)
      const cartResult = await shoppingCartService.addToCart(
        user.uid,
        cartItem
      );

      // Also add to local cart context for immediate UI feedback
      addToCart(classData, selectedInstance, 1);

      // Show success message
      Alert.alert(
        'Added to Cart! 🎉',
        `${classData.type} session on ${formatDate(
          selectedInstance.date
        )} has been added to your cart.`,
        [
          { text: 'Continue Shopping', onPress: () => navigation.goBack() },
          { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
        ]
      );
    } catch (err) {
      console.error('Booking error:', err);
      Alert.alert(
        'Booking Failed',
        err.message || 'Failed to add class to cart. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // Handle instance selection
  const handleInstanceSelect = (instance) => {
    setSelectedInstance(instance);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (err) {
      return dateString;
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (err) {
      return timeString;
    }
  };

  // Get days until session
  const getDaysUntil = (dateString) => {
    if (!dateString) return null;
    try {
      const sessionDate = new Date(dateString + 'T00:00:00');
      const today = new Date();
      const timeDiff = sessionDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff === 0) return 'Today';
      if (daysDiff === 1) return 'Tomorrow';
      return `${daysDiff} days away`;
    } catch (err) {
      return null;
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  // Show loading screen
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading
          message="Loading class details..."
          variant="default"
          size="large"
        />
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !classData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button
            title="Try Again"
            onPress={fetchClassDetails}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Class Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {classData && (
          <>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.classTypeContainer}>
                <Text style={styles.classType}>{classData.type}</Text>
                <View style={styles.priceTag}>
                  <Text style={styles.price}>
                    £{classData.price?.toFixed(2)}
                  </Text>
                </View>
              </View>

              <Text style={styles.classSchedule}>
                {classData.dayOfWeek} • {formatTime(classData.time)}
              </Text>

              {classData.description && (
                <Text style={styles.description}>{classData.description}</Text>
              )}
            </View>

            {/* Class Details */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Class Information</Text>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Icon name="clock" size={20} color={colors.primary[500]} />
                  <Text style={styles.detailLabel}>Duration</Text>
                  <Text style={styles.detailValue}>
                    {classData.duration} minutes
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Icon name="users" size={20} color={colors.primary[500]} />
                  <Text style={styles.detailLabel}>Capacity</Text>
                  <Text style={styles.detailValue}>
                    {classData.capacity} people
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Icon name="calendar" size={20} color={colors.primary[500]} />
                  <Text style={styles.detailLabel}>Schedule</Text>
                  <Text style={styles.detailValue}>
                    Weekly on {classData.dayOfWeek}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Icon name="tag" size={20} color={colors.primary[500]} />
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>{classData.type}</Text>
                </View>
              </View>
            </View>

            {/* Available Sessions */}
            <View style={styles.sessionsSection}>
              <Text style={styles.sectionTitle}>Available Sessions</Text>

              {availableInstances.length === 0 ? (
                <View style={styles.noSessionsContainer}>
                  <Icon
                    name="calendar-x"
                    size={32}
                    color={colors.text.secondary}
                  />
                  <Text style={styles.noSessionsTitle}>
                    No Upcoming Sessions
                  </Text>
                  <Text style={styles.noSessionsMessage}>
                    There are currently no upcoming sessions for this class.
                    Please check back later.
                  </Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.sessionsScroll}
                  contentContainerStyle={styles.sessionsScrollContent}
                >
                  {availableInstances.map((instance) => {
                    const isSelected = selectedInstance?.id === instance.id;
                    const daysUntil = getDaysUntil(instance.date);

                    return (
                      <TouchableOpacity
                        key={instance.id}
                        style={[
                          styles.sessionCard,
                          isSelected && styles.sessionCardSelected,
                        ]}
                        onPress={() => handleInstanceSelect(instance)}
                      >
                        <View style={styles.sessionDate}>
                          <Text
                            style={[
                              styles.sessionDay,
                              isSelected && styles.sessionTextSelected,
                            ]}
                          >
                            {formatDate(instance.date).split(',')[0]}
                          </Text>
                          <Text
                            style={[
                              styles.sessionDateText,
                              isSelected && styles.sessionTextSelected,
                            ]}
                          >
                            {new Date(instance.date + 'T00:00:00').getDate()}
                          </Text>
                        </View>

                        {daysUntil && (
                          <Text
                            style={[
                              styles.sessionDaysUntil,
                              isSelected && styles.sessionTextSelected,
                            ]}
                          >
                            {daysUntil}
                          </Text>
                        )}

                        {instance.teacher && (
                          <Text
                            style={[
                              styles.sessionTeacher,
                              isSelected && styles.sessionTextSelected,
                            ]}
                          >
                            with {instance.teacher}
                          </Text>
                        )}

                        {instance.comments && (
                          <Text
                            style={[
                              styles.sessionComments,
                              isSelected && styles.sessionTextSelected,
                            ]}
                            numberOfLines={2}
                          >
                            {instance.comments}
                          </Text>
                        )}

                        {isSelected && (
                          <View style={styles.selectedIndicator}>
                            <Icon
                              name="check"
                              size={16}
                              color={colors.neutral[0]}
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* What to Expect Section */}
            <View style={styles.expectSection}>
              <Text style={styles.sectionTitle}>What to Expect</Text>

              <View style={styles.expectItems}>
                <View style={styles.expectItem}>
                  <Icon name="heart" size={20} color={colors.secondary[500]} />
                  <Text style={styles.expectText}>
                    Mindful movement and breathing
                  </Text>
                </View>

                <View style={styles.expectItem}>
                  <Icon name="users" size={20} color={colors.secondary[500]} />
                  <Text style={styles.expectText}>
                    Welcoming community atmosphere
                  </Text>
                </View>

                <View style={styles.expectItem}>
                  <Icon name="smile" size={20} color={colors.secondary[500]} />
                  <Text style={styles.expectText}>All levels welcome</Text>
                </View>

                <View style={styles.expectItem}>
                  <Icon name="shield" size={20} color={colors.secondary[500]} />
                  <Text style={styles.expectText}>
                    Safe and supportive environment
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      {classData && availableInstances.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.priceInfo}>
            <Text style={styles.bottomPrice}>
              £{classData.price?.toFixed(2)}
            </Text>
            {selectedInstance && (
              <Text style={styles.bottomDate}>
                {formatDate(selectedInstance.date)}
              </Text>
            )}
          </View>

          <Button
            title={selectedInstance ? 'Add to Cart' : 'Select Session'}
            onPress={handleBookNow}
            disabled={!selectedInstance || bookingLoading}
            loading={bookingLoading}
            style={[
              styles.bookButton,
              !selectedInstance && styles.bookButtonDisabled,
            ]}
            size="large"
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    padding: 20,
    paddingBottom: 24,
  },
  classTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  classType: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    marginRight: 16,
  },
  priceTag: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary[600],
  },
  classSchedule: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.secondary,
  },

  // Details Section
  detailsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },

  // Sessions Section
  sessionsSection: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  sessionsScroll: {
    marginTop: 8,
  },
  sessionsScrollContent: {
    paddingHorizontal: 20,
  },
  sessionCard: {
    backgroundColor: colors.card.background,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    minWidth: 160,
    borderWidth: 2,
    borderColor: colors.border.light,
    position: 'relative',
  },
  sessionCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
  },
  sessionDate: {
    marginBottom: 8,
  },
  sessionDay: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  sessionDateText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  sessionTextSelected: {
    color: colors.neutral[0],
  },
  sessionDaysUntil: {
    fontSize: 12,
    color: colors.primary[600],
    fontWeight: '500',
    marginBottom: 8,
  },
  sessionTeacher: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  sessionComments: {
    fontSize: 12,
    color: colors.text.tertiary,
    lineHeight: 16,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.success[500],
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // No Sessions
  noSessionsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noSessionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  noSessionsMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // What to Expect Section
  expectSection: {
    padding: 20,
    paddingTop: 0,
  },
  expectItems: {
    gap: 16,
  },
  expectItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expectText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginLeft: 16,
  },

  // Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  priceInfo: {
    flex: 1,
    marginRight: 16,
  },
  bottomPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  bottomDate: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  bookButton: {
    minWidth: 140,
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },

  // Error State
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    minWidth: 120,
  },
});

export default ClassDetailScreen;
