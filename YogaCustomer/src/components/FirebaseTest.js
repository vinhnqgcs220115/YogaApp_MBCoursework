import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const FirebaseTest = () => {
  const [status, setStatus] = useState('🔄 Testing connection...');
  const [coursesCount, setCoursesCount] = useState('Loading...');
  const { user, loading } = useAuth();

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('Starting Firebase test...');

      // Test Firestore connection
      const coursesRef = collection(db, 'yoga_courses');
      const snapshot = await getDocs(coursesRef);

      setCoursesCount(snapshot.size);
      setStatus('✅ Firebase connected!');

      console.log('Firebase test successful, courses found:', snapshot.size);
    } catch (error) {
      console.error('Firebase test failed:', error);
      setStatus('❌ Connection failed');
      setCoursesCount('Error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧘‍♀️ Universal Yoga Customer</Text>

      <View style={styles.statusBox}>
        <Text style={styles.statusTitle}>Firebase Status:</Text>
        <Text style={styles.statusText}>{status}</Text>

        <Text style={styles.statusTitle}>Courses Available:</Text>
        <Text style={styles.statusText}>{coursesCount}</Text>

        <Text style={styles.statusTitle}>Authentication:</Text>
        <Text style={styles.statusText}>
          {loading
            ? 'Loading...'
            : user
            ? `✅ ${user.email}`
            : '❌ Not signed in'}
        </Text>
      </View>

      <Text style={styles.readyText}>Ready for Step 2! 🚀</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  statusBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 10,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  readyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
  },
});

export default FirebaseTest;
