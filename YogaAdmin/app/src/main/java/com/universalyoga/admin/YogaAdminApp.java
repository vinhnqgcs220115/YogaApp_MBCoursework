package com.universalyoga.admin;

import android.app.Application;
import android.util.Log;
import com.google.firebase.FirebaseApp;
import com.universalyoga.admin.data.database.AppDatabase;

public class YogaAdminApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        // Initialize Firebase SDK
        FirebaseApp.initializeApp(this);

        // Initialize Room database instance
        AppDatabase.getInstance(this);

        Log.d("YogaAdminApp", "Firebase & Room initialized");
    }
}