package com.universalyoga.admin.utils;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.util.Log;

import com.google.firebase.FirebaseApp;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreSettings;
import com.google.firebase.firestore.WriteBatch;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.universalyoga.admin.data.entity.YogaCourse;
import com.universalyoga.admin.data.entity.Schedule;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class FirebaseSync {

    private static final String TAG = "FirebaseSync";
    private static final String COURSES_COLLECTION = "yoga_courses";
    private static final String SCHEDULES_COLLECTION = "schedules";

    private FirebaseFirestore db;
    private Context context;

    public interface SyncCallback {
        void onSuccess();
        void onError(String error);
    }

    public FirebaseSync() {
        initializeFirestore();
    }

    public FirebaseSync(Context context) {
        this.context = context;
        initializeFirestore();
    }

    private void initializeFirestore() {
        try {
            // Simply try to get Firestore instance - it will throw if not configured
            db = FirebaseFirestore.getInstance();

            // Enable offline persistence (optional - helps with offline sync)
            FirebaseFirestoreSettings settings = new FirebaseFirestoreSettings.Builder()
                    .setPersistenceEnabled(true)
                    .build();
            db.setFirestoreSettings(settings);

            Log.d(TAG, "Firestore initialized successfully");

        } catch (Exception e) {
            Log.e(TAG, "Error initializing Firestore - Firebase may not be configured", e);
        }
    }

    /**
     * Check if Firebase and Firestore are properly configured
     */
    public boolean isFirebaseConfigured() {
        try {
            return db != null;
        } catch (Exception e) {
            Log.e(TAG, "Error checking Firebase configuration", e);
            return false;
        }
    }

    /**
     * Sync all yoga courses to Firestore
     */
    public void syncCoursesToFirestore(List<YogaCourse> courses, SyncCallback callback) {
        if (!isFirebaseConfigured()) {
            callback.onError("Firebase is not properly configured. Please check your setup.");
            return;
        }

        if (courses == null || courses.isEmpty()) {
            callback.onError("No courses to sync");
            return;
        }

        // Check network connectivity if context is available
        if (context != null) {
            ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
            if (!isNetworkAvailable(cm)) {
                callback.onError("No internet connection available");
                return;
            }
        }

        // Use batch write for better performance and atomicity
        WriteBatch batch = db.batch();

        try {
            for (YogaCourse course : courses) {
                Map<String, Object> courseData = new HashMap<>();
                courseData.put("id", course.getId());
                courseData.put("dayOfWeek", course.getDayOfWeek());
                courseData.put("time", course.getTime());
                courseData.put("capacity", course.getCapacity());
                courseData.put("duration", course.getDuration());
                courseData.put("price", course.getPrice());
                courseData.put("type", course.getType());
                courseData.put("description", course.getDescription());
                courseData.put("lastUpdated", System.currentTimeMillis());

                // Use course ID as document ID for easy reference
                batch.set(db.collection(COURSES_COLLECTION).document(String.valueOf(course.getId())), courseData);
            }

            // Commit the batch
            batch.commit()
                    .addOnSuccessListener(aVoid -> {
                        Log.d(TAG, "Successfully synced " + courses.size() + " courses to Firestore");
                        callback.onSuccess();
                    })
                    .addOnFailureListener(e -> {
                        Log.e(TAG, "Error syncing courses to Firestore", e);
                        String errorMsg = getErrorMessage(e);
                        callback.onError("Failed to sync courses: " + errorMsg);
                    });

        } catch (Exception e) {
            Log.e(TAG, "Exception during course sync", e);
            callback.onError("Exception during sync: " + e.getMessage());
        }
    }

    /**
     * Sync schedules to Firestore
     */
    public void syncSchedulesToFirestore(List<Schedule> schedules, SyncCallback callback) {
        if (!isFirebaseConfigured()) {
            callback.onError("Firebase is not properly configured. Please check your setup.");
            return;
        }

        if (schedules == null || schedules.isEmpty()) {
            callback.onError("No schedules to sync");
            return;
        }

        WriteBatch batch = db.batch();

        try {
            for (Schedule schedule : schedules) {
                Map<String, Object> scheduleData = new HashMap<>();
                scheduleData.put("id", schedule.getId());
                scheduleData.put("courseId", schedule.getCourseId());
                scheduleData.put("date", schedule.getDate());
                scheduleData.put("teacher", schedule.getTeacher());
                scheduleData.put("comments", schedule.getComments());
                scheduleData.put("lastUpdated", System.currentTimeMillis());

                batch.set(db.collection(SCHEDULES_COLLECTION).document(String.valueOf(schedule.getId())), scheduleData);
            }

            batch.commit()
                    .addOnSuccessListener(aVoid -> {
                        Log.d(TAG, "Successfully synced " + schedules.size() + " schedules to Firestore");
                        callback.onSuccess();
                    })
                    .addOnFailureListener(e -> {
                        Log.e(TAG, "Error syncing schedules to Firestore", e);
                        String errorMsg = getErrorMessage(e);
                        callback.onError("Failed to sync schedules: " + errorMsg);
                    });

        } catch (Exception e) {
            Log.e(TAG, "Exception during schedule sync", e);
            callback.onError("Exception during sync: " + e.getMessage());
        }
    }

    /**
     * Delete a course from Firestore
     */
    public void deleteCourseFromFirestore(int courseId, SyncCallback callback) {
        if (!isFirebaseConfigured()) {
            callback.onError("Firebase is not properly configured.");
            return;
        }

        db.collection(COURSES_COLLECTION)
                .document(String.valueOf(courseId))
                .delete()
                .addOnSuccessListener(aVoid -> {
                    Log.d(TAG, "Course " + courseId + " deleted from Firestore");
                    callback.onSuccess();
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Error deleting course from Firestore", e);
                    String errorMsg = getErrorMessage(e);
                    callback.onError("Failed to delete course: " + errorMsg);
                });
    }

    /**
     * Sync individual course (for real-time updates)
     */
    public void syncSingleCourse(YogaCourse course, SyncCallback callback) {
        if (!isFirebaseConfigured()) {
            callback.onError("Firebase is not properly configured.");
            return;
        }

        Map<String, Object> courseData = new HashMap<>();
        courseData.put("id", course.getId());
        courseData.put("dayOfWeek", course.getDayOfWeek());
        courseData.put("time", course.getTime());
        courseData.put("capacity", course.getCapacity());
        courseData.put("duration", course.getDuration());
        courseData.put("price", course.getPrice());
        courseData.put("type", course.getType());
        courseData.put("description", course.getDescription());
        courseData.put("lastUpdated", System.currentTimeMillis());

        db.collection(COURSES_COLLECTION)
                .document(String.valueOf(course.getId()))
                .set(courseData)
                .addOnSuccessListener(aVoid -> {
                    Log.d(TAG, "Course " + course.getId() + " synced successfully");
                    callback.onSuccess();
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Error syncing single course", e);
                    String errorMsg = getErrorMessage(e);
                    callback.onError("Failed to sync course: " + errorMsg);
                });
    }

    /**
     * Clear all courses from Firestore
     */
    public void clearAllCoursesFromFirestore(SyncCallback callback) {
        if (!isFirebaseConfigured()) {
            callback.onError("Firebase is not properly configured.");
            return;
        }

        db.collection(COURSES_COLLECTION)
                .get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    if (queryDocumentSnapshots.isEmpty()) {
                        Log.d(TAG, "No courses to delete");
                        callback.onSuccess();
                        return;
                    }

                    WriteBatch batch = db.batch();
                    for (QueryDocumentSnapshot document : queryDocumentSnapshots) {
                        batch.delete(document.getReference());
                    }

                    batch.commit()
                            .addOnSuccessListener(aVoid -> {
                                Log.d(TAG, "Successfully cleared all courses from Firestore");
                                callback.onSuccess();
                            })
                            .addOnFailureListener(e -> {
                                Log.e(TAG, "Error clearing courses from Firestore", e);
                                callback.onError("Failed to clear courses: " + getErrorMessage(e));
                            });
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Error getting courses to clear", e);
                    callback.onError("Failed to get courses for clearing: " + getErrorMessage(e));
                });
    }

    /**
     * Clear all schedules from Firestore
     */
    public void clearAllSchedulesFromFirestore(SyncCallback callback) {
        if (!isFirebaseConfigured()) {
            callback.onError("Firebase is not properly configured.");
            return;
        }

        db.collection(SCHEDULES_COLLECTION)
                .get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    if (queryDocumentSnapshots.isEmpty()) {
                        Log.d(TAG, "No schedules to delete");
                        callback.onSuccess();
                        return;
                    }

                    WriteBatch batch = db.batch();
                    for (QueryDocumentSnapshot document : queryDocumentSnapshots) {
                        batch.delete(document.getReference());
                    }

                    batch.commit()
                            .addOnSuccessListener(aVoid -> {
                                Log.d(TAG, "Successfully cleared all schedules from Firestore");
                                callback.onSuccess();
                            })
                            .addOnFailureListener(e -> {
                                Log.e(TAG, "Error clearing schedules from Firestore", e);
                                callback.onError("Failed to clear schedules: " + getErrorMessage(e));
                            });
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Error getting schedules to clear", e);
                    callback.onError("Failed to get schedules for clearing: " + getErrorMessage(e));
                });
    }

    /**
     * Full sync - clears Firestore data and then syncs local data
     */
    public void fullSyncCoursesToFirestore(List<YogaCourse> courses, SyncCallback callback) {
        clearAllCoursesFromFirestore(new SyncCallback() {
            @Override
            public void onSuccess() {
                // After clearing, sync the new data
                if (courses != null && !courses.isEmpty()) {
                    syncCoursesToFirestore(courses, callback);
                } else {
                    Log.d(TAG, "No courses to sync after clearing");
                    callback.onSuccess();
                }
            }

            @Override
            public void onError(String error) {
                callback.onError("Failed to clear courses before sync: " + error);
            }
        });
    }

    /**
     * Full sync for schedules
     */
    public void fullSyncSchedulesToFirestore(List<Schedule> schedules, SyncCallback callback) {
        clearAllSchedulesFromFirestore(new SyncCallback() {
            @Override
            public void onSuccess() {
                // After clearing, sync the new data
                if (schedules != null && !schedules.isEmpty()) {
                    syncSchedulesToFirestore(schedules, callback);
                } else {
                    Log.d(TAG, "No schedules to sync after clearing");
                    callback.onSuccess();
                }
            }

            @Override
            public void onError(String error) {
                callback.onError("Failed to clear schedules before sync: " + error);
            }
        });
    }

    /**
     * Complete database reset - clears both courses and schedules
     */
    public void resetFirestoreDatabase(SyncCallback callback) {
        clearAllCoursesFromFirestore(new SyncCallback() {
            @Override
            public void onSuccess() {
                clearAllSchedulesFromFirestore(new SyncCallback() {
                    @Override
                    public void onSuccess() {
                        Log.d(TAG, "Firestore database reset complete");
                        callback.onSuccess();
                    }

                    @Override
                    public void onError(String error) {
                        callback.onError("Failed to clear schedules: " + error);
                    }
                });
            }

            @Override
            public void onError(String error) {
                callback.onError("Failed to clear courses: " + error);
            }
        });
    }

    /**
     * Smart sync that handles additions, updates, and deletions for courses
     */
    public void smartSyncCoursesToFirestore(List<YogaCourse> courses, SyncCallback callback) {
        if (!isFirebaseConfigured()) {
            callback.onError("Firebase is not properly configured.");
            return;
        }

        // First, get all existing courses from Firestore
        db.collection(COURSES_COLLECTION)
                .get()
                .addOnSuccessListener(queryDocumentSnapshots -> {

                    // Get all existing course IDs from Firestore
                    Set<String> existingIds = new HashSet<>();
                    for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                        existingIds.add(doc.getId());
                    }

                    // Get current course IDs from local data
                    Set<String> currentIds = new HashSet<>();
                    if (courses != null) {
                        for (YogaCourse course : courses) {
                            currentIds.add(String.valueOf(course.getId()));
                        }
                    }

                    // Find IDs to delete (exist in Firestore but not in local data)
                    Set<String> idsToDelete = new HashSet<>(existingIds);
                    idsToDelete.removeAll(currentIds);

                    WriteBatch batch = db.batch();

                    // Add/Update current courses
                    if (courses != null) {
                        for (YogaCourse course : courses) {
                            Map<String, Object> courseData = new HashMap<>();
                            courseData.put("id", course.getId());
                            courseData.put("dayOfWeek", course.getDayOfWeek());
                            courseData.put("time", course.getTime());
                            courseData.put("capacity", course.getCapacity());
                            courseData.put("duration", course.getDuration());
                            courseData.put("price", course.getPrice());
                            courseData.put("type", course.getType());
                            courseData.put("description", course.getDescription());
                            courseData.put("lastUpdated", System.currentTimeMillis());

                            batch.set(db.collection(COURSES_COLLECTION)
                                    .document(String.valueOf(course.getId())), courseData);
                        }
                    }

                    // Delete courses that no longer exist locally
                    for (String idToDelete : idsToDelete) {
                        batch.delete(db.collection(COURSES_COLLECTION).document(idToDelete));
                    }

                    // Commit the batch
                    batch.commit()
                            .addOnSuccessListener(aVoid -> {
                                Log.d(TAG, "Smart sync completed - " +
                                        (courses != null ? courses.size() : 0) + " courses synced, " +
                                        idsToDelete.size() + " courses deleted");
                                callback.onSuccess();
                            })
                            .addOnFailureListener(e -> {
                                Log.e(TAG, "Error in smart sync", e);
                                callback.onError("Smart sync failed: " + getErrorMessage(e));
                            });
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Error getting existing courses for smart sync", e);
                    callback.onError("Failed to get existing courses: " + getErrorMessage(e));
                });
    }

    /**
     * Smart sync for schedules
     */
    public void smartSyncSchedulesToFirestore(List<Schedule> schedules, SyncCallback callback) {
        if (!isFirebaseConfigured()) {
            callback.onError("Firebase is not properly configured.");
            return;
        }

        db.collection(SCHEDULES_COLLECTION)
                .get()
                .addOnSuccessListener(queryDocumentSnapshots -> {

                    Set<String> existingIds = new HashSet<>();
                    for (QueryDocumentSnapshot doc : queryDocumentSnapshots) {
                        existingIds.add(doc.getId());
                    }

                    Set<String> currentIds = new HashSet<>();
                    if (schedules != null) {
                        for (Schedule schedule : schedules) {
                            currentIds.add(String.valueOf(schedule.getId()));
                        }
                    }

                    Set<String> idsToDelete = new HashSet<>(existingIds);
                    idsToDelete.removeAll(currentIds);

                    WriteBatch batch = db.batch();

                    // Add/Update current schedules
                    if (schedules != null) {
                        for (Schedule schedule : schedules) {
                            Map<String, Object> scheduleData = new HashMap<>();
                            scheduleData.put("id", schedule.getId());
                            scheduleData.put("courseId", schedule.getCourseId());
                            scheduleData.put("date", schedule.getDate());
                            scheduleData.put("teacher", schedule.getTeacher());
                            scheduleData.put("comments", schedule.getComments());
                            scheduleData.put("lastUpdated", System.currentTimeMillis());

                            batch.set(db.collection(SCHEDULES_COLLECTION)
                                    .document(String.valueOf(schedule.getId())), scheduleData);
                        }
                    }

                    // Delete schedules that no longer exist locally
                    for (String idToDelete : idsToDelete) {
                        batch.delete(db.collection(SCHEDULES_COLLECTION).document(idToDelete));
                    }

                    batch.commit()
                            .addOnSuccessListener(aVoid -> {
                                Log.d(TAG, "Smart sync completed - " +
                                        (schedules != null ? schedules.size() : 0) + " schedules synced, " +
                                        idsToDelete.size() + " schedules deleted");
                                callback.onSuccess();
                            })
                            .addOnFailureListener(e -> {
                                Log.e(TAG, "Error in smart sync", e);
                                callback.onError("Smart sync failed: " + getErrorMessage(e));
                            });
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Error getting existing schedules for smart sync", e);
                    callback.onError("Failed to get existing schedules: " + getErrorMessage(e));
                });
    }

    /**
     * Check if device has internet connectivity
     */
    public static boolean isNetworkAvailable(ConnectivityManager connectivityManager) {
        if (connectivityManager != null) {
            NetworkInfo activeNetwork = connectivityManager.getActiveNetworkInfo();
            return activeNetwork != null && activeNetwork.isConnectedOrConnecting();
        }
        return false;
    }

    /**
     * Get user-friendly error message
     */
    private String getErrorMessage(Exception e) {
        String message = e.getMessage();
        if (message != null) {
            if (message.contains("PERMISSION_DENIED")) {
                return "Permission denied. Please enable Firestore database in Firebase Console.";
            } else if (message.contains("Cloud Firestore API has not been used")) {
                return "Firestore API not enabled. Please enable it in Firebase Console.";
            } else if (message.contains("UNAUTHENTICATED")) {
                return "Authentication required. Please set up Firebase Auth.";
            } else if (message.contains("UNAVAILABLE")) {
                return "Firestore service unavailable. Please try again later.";
            }
        }
        return message != null ? message : "Unknown error occurred";
    }

    /**
     * Test Firebase connection
     */
    public void testConnection(SyncCallback callback) {
        if (!isFirebaseConfigured()) {
            callback.onError("Firebase is not properly configured.");
            return;
        }

        // Try to read a small document to test connection
        db.collection(COURSES_COLLECTION)
                .limit(1)
                .get()
                .addOnSuccessListener(queryDocumentSnapshots -> {
                    Log.d(TAG, "Firebase connection test successful");
                    callback.onSuccess();
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Firebase connection test failed", e);
                    String errorMsg = getErrorMessage(e);
                    callback.onError("Connection test failed: " + errorMsg);
                });
    }
}