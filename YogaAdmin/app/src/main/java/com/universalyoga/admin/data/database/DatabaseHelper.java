// YogaAdmin/app/src/main/java/com.universalyoga.admin.data.database/DatabaseHelper.java
package com.universalyoga.admin.data.database;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

public class DatabaseHelper extends SQLiteOpenHelper {

    private static final String DATABASE_NAME = "yoga_admin_db";
    private static final int DATABASE_VERSION = 2;
    private static final String TAG = "DatabaseHelper";

    // Table names
    public static final String TABLE_YOGA_COURSES = "yoga_courses";
    public static final String TABLE_SCHEDULES = "schedules";

    // YogaCourse table columns
    public static final String COLUMN_ID = "id";
    public static final String COLUMN_DAY_OF_WEEK = "dayOfWeek";
    public static final String COLUMN_TIME = "time";
    public static final String COLUMN_CAPACITY = "capacity";
    public static final String COLUMN_DURATION = "duration";
    public static final String COLUMN_PRICE = "price";
    public static final String COLUMN_TYPE = "type";
    public static final String COLUMN_DESCRIPTION = "description";

    // Schedule table columns
    public static final String COLUMN_COURSE_ID = "courseId";
    public static final String COLUMN_DATE = "date";
    public static final String COLUMN_TEACHER = "teacher";
    public static final String COLUMN_COMMENTS = "comments";

    // Create table statements
    private static final String CREATE_TABLE_YOGA_COURSES =
            "CREATE TABLE " + TABLE_YOGA_COURSES + " (" +
                    COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    COLUMN_DAY_OF_WEEK + " TEXT NOT NULL, " +
                    COLUMN_TIME + " TEXT NOT NULL, " +
                    COLUMN_CAPACITY + " INTEGER NOT NULL, " +
                    COLUMN_DURATION + " INTEGER NOT NULL, " +
                    COLUMN_PRICE + " REAL NOT NULL, " +
                    COLUMN_TYPE + " TEXT NOT NULL, " +
                    COLUMN_DESCRIPTION + " TEXT" +
                    ")";

    private static final String CREATE_TABLE_SCHEDULES =
            "CREATE TABLE " + TABLE_SCHEDULES + " (" +
                    COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    COLUMN_COURSE_ID + " INTEGER NOT NULL, " +
                    COLUMN_DATE + " TEXT NOT NULL, " +
                    COLUMN_TEACHER + " TEXT, " +
                    COLUMN_COMMENTS + " TEXT, " +
                    "FOREIGN KEY(" + COLUMN_COURSE_ID + ") REFERENCES " +
                    TABLE_YOGA_COURSES + "(" + COLUMN_ID + ") ON DELETE CASCADE" +
                    ")";

    // Create index for foreign key
    private static final String CREATE_INDEX_SCHEDULES_COURSE_ID =
            "CREATE INDEX idx_schedules_course_id ON " + TABLE_SCHEDULES + "(" + COLUMN_COURSE_ID + ")";

    private static volatile DatabaseHelper INSTANCE;

    private DatabaseHelper(Context context) {
        super(context.getApplicationContext(), DATABASE_NAME, null, DATABASE_VERSION);
    }

    public static DatabaseHelper getInstance(Context context) {
        if (INSTANCE == null) {
            synchronized (DatabaseHelper.class) {
                if (INSTANCE == null) {
                    INSTANCE = new DatabaseHelper(context);
                }
            }
        }
        return INSTANCE;
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        Log.d(TAG, "Creating database tables");

        db.execSQL(CREATE_TABLE_YOGA_COURSES);
        db.execSQL(CREATE_TABLE_SCHEDULES);
        db.execSQL(CREATE_INDEX_SCHEDULES_COURSE_ID);

        Log.d(TAG, "Database tables created successfully");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        Log.d(TAG, "Upgrading database from version " + oldVersion + " to " + newVersion);

        // Drop existing tables
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_SCHEDULES);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_YOGA_COURSES);

        // Recreate tables
        onCreate(db);
    }

    @Override
    public void onConfigure(SQLiteDatabase db) {
        super.onConfigure(db);
        // Enable foreign key constraints
        db.setForeignKeyConstraintsEnabled(true);
    }

    public static void destroyInstance() {
        if (INSTANCE != null) {
            INSTANCE.close();
            INSTANCE = null;
        }
    }
}