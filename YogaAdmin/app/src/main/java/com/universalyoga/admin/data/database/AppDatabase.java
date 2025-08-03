package com.universalyoga.admin.data.database;

import android.content.Context;

import com.universalyoga.admin.data.dao.ScheduleDao;
import com.universalyoga.admin.data.dao.YogaCourseDao;

public class AppDatabase {

    private static volatile AppDatabase INSTANCE;
    private DatabaseHelper dbHelper;
    private YogaCourseDao yogaCourseDao;
    private ScheduleDao scheduleDao;

    private AppDatabase(Context context) {
        dbHelper = DatabaseHelper.getInstance(context);
        yogaCourseDao = new YogaCourseDao(dbHelper);
        scheduleDao = new ScheduleDao(dbHelper);
    }

    public static AppDatabase getInstance(Context context) {
        if (INSTANCE == null) {
            synchronized (AppDatabase.class) {
                if (INSTANCE == null) {
                    INSTANCE = new AppDatabase(context);
                }
            }
        }
        return INSTANCE;
    }

    public YogaCourseDao yogaCourseDao() {
        return yogaCourseDao;
    }

    public ScheduleDao scheduleDao() {
        return scheduleDao;
    }

    public static void destroyInstance() {
        if (INSTANCE != null) {
            DatabaseHelper.destroyInstance();
            INSTANCE = null;
        }
    }
}