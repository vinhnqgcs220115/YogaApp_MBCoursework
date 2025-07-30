package com.universalyoga.admin.utils;

import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.util.Log;

import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.WriteBatch;
import com.universalyoga.admin.data.entity.YogaCourse;
import com.universalyoga.admin.data.entity.Schedule;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FirebaseSync {

    private static final String TAG = "FirebaseSync";
    private static final String COURSES_COLLECTION = "yoga_courses";
    private static final String SCHEDULES_COLLECTION = "schedules";

    private FirebaseFirestore db;

    public interface SyncCallback {
        void onSuccess();
        void onError(String error);
    }

    public FirebaseSync() {
        db = FirebaseFirestore.getInstance();
    }

    /**
     * Sync all yoga courses to Firestore
     */
    public void syncCoursesToFirestore(List<YogaCourse> courses, SyncCallback callback) {
        if (courses == null || courses.isEmpty()) {
            callback.onError("No courses to sync");
            return;
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
                        callback.onError("Failed to sync courses: " + e.getMessage());
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
                        callback.onError("Failed to sync schedules: " + e.getMessage());
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
        db.collection(COURSES_COLLECTION)
                .document(String.valueOf(courseId))
                .delete()
                .addOnSuccessListener(aVoid -> {
                    Log.d(TAG, "Course " + courseId + " deleted from Firestore");
                    callback.onSuccess();
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Error deleting course from Firestore", e);
                    callback.onError("Failed to delete course: " + e.getMessage());
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
     * Sync individual course (for real-time updates)
     */
    public void syncSingleCourse(YogaCourse course, SyncCallback callback) {
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
                    callback.onError("Failed to sync course: " + e.getMessage());
                });
    }
}