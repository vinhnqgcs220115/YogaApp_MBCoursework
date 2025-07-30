package com.universalyoga.admin.data.database;

import android.content.Context;

import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;

import com.universalyoga.admin.data.dao.ScheduleDao;
import com.universalyoga.admin.data.dao.YogaCourseDao;
import com.universalyoga.admin.data.entity.Schedule;
import com.universalyoga.admin.data.entity.YogaCourse;

@Database(
        entities = {YogaCourse.class, Schedule.class},
        version = 2, // Incremented version due to schema change
        exportSchema = false
)
public abstract class AppDatabase extends RoomDatabase {

    private static final String DATABASE_NAME = "yoga_admin_db";
    private static volatile AppDatabase INSTANCE;

    public abstract YogaCourseDao yogaCourseDao();
    public abstract ScheduleDao scheduleDao();

    public static AppDatabase getInstance(Context context) {
        if (INSTANCE == null) {
            synchronized (AppDatabase.class) {
                if (INSTANCE == null) {
                    INSTANCE = Room.databaseBuilder(
                                    context.getApplicationContext(),
                                    AppDatabase.class,
                                    DATABASE_NAME
                            )
                            .fallbackToDestructiveMigration()
                            .build();
                }
            }
        }
        return INSTANCE;
    }

    public static void destroyInstance() {
        INSTANCE = null;
    }
}