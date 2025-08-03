package com.universalyoga.admin.data.dao;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.universalyoga.admin.data.database.DatabaseHelper;
import com.universalyoga.admin.data.entity.Schedule;

import java.util.ArrayList;
import java.util.List;

public class ScheduleDao {

    private static final String TAG = "ScheduleDao";
    private DatabaseHelper dbHelper;

    public ScheduleDao(DatabaseHelper dbHelper) {
        this.dbHelper = dbHelper;
    }

    public long insert(Schedule schedule) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();

        values.put(DatabaseHelper.COLUMN_COURSE_ID, schedule.getCourseId());
        values.put(DatabaseHelper.COLUMN_DATE, schedule.getDate());
        values.put(DatabaseHelper.COLUMN_TEACHER, schedule.getTeacher());
        values.put(DatabaseHelper.COLUMN_COMMENTS, schedule.getComments());

        long id = db.insert(DatabaseHelper.TABLE_SCHEDULES, null, values);
        Log.d(TAG, "Inserted schedule with ID: " + id);
        return id;
    }

    public void update(Schedule schedule) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();

        values.put(DatabaseHelper.COLUMN_COURSE_ID, schedule.getCourseId());
        values.put(DatabaseHelper.COLUMN_DATE, schedule.getDate());
        values.put(DatabaseHelper.COLUMN_TEACHER, schedule.getTeacher());
        values.put(DatabaseHelper.COLUMN_COMMENTS, schedule.getComments());

        int rowsAffected = db.update(DatabaseHelper.TABLE_SCHEDULES, values,
                DatabaseHelper.COLUMN_ID + " = ?",
                new String[]{String.valueOf(schedule.getId())});

        Log.d(TAG, "Updated schedule. Rows affected: " + rowsAffected);
    }

    public void delete(Schedule schedule) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        int rowsAffected = db.delete(DatabaseHelper.TABLE_SCHEDULES,
                DatabaseHelper.COLUMN_ID + " = ?",
                new String[]{String.valueOf(schedule.getId())});

        Log.d(TAG, "Deleted schedule. Rows affected: " + rowsAffected);
    }

    public List<Schedule> getSchedulesForCourse(int courseId) {
        List<Schedule> schedules = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        String query = "SELECT * FROM " + DatabaseHelper.TABLE_SCHEDULES +
                " WHERE " + DatabaseHelper.COLUMN_COURSE_ID + " = ? " +
                " ORDER BY " + DatabaseHelper.COLUMN_DATE + " ASC";

        Cursor cursor = db.rawQuery(query, new String[]{String.valueOf(courseId)});

        if (cursor.moveToFirst()) {
            do {
                schedules.add(cursorToSchedule(cursor));
            } while (cursor.moveToNext());
        }

        cursor.close();
        return schedules;
    }

    public Schedule getScheduleById(int id) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Schedule schedule = null;

        Cursor cursor = db.query(DatabaseHelper.TABLE_SCHEDULES, null,
                DatabaseHelper.COLUMN_ID + " = ?",
                new String[]{String.valueOf(id)}, null, null, null);

        if (cursor.moveToFirst()) {
            schedule = cursorToSchedule(cursor);
        }

        cursor.close();
        return schedule;
    }

    public List<Schedule> getAllSchedules() {
        List<Schedule> schedules = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        String query = "SELECT * FROM " + DatabaseHelper.TABLE_SCHEDULES +
                " ORDER BY " + DatabaseHelper.COLUMN_DATE + " ASC";

        Cursor cursor = db.rawQuery(query, null);

        if (cursor.moveToFirst()) {
            do {
                schedules.add(cursorToSchedule(cursor));
            } while (cursor.moveToNext());
        }

        cursor.close();
        return schedules;
    }

    public List<Schedule> getSchedulesForDate(String date) {
        List<Schedule> schedules = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        String query = "SELECT * FROM " + DatabaseHelper.TABLE_SCHEDULES +
                " WHERE " + DatabaseHelper.COLUMN_DATE + " = ? " +
                " ORDER BY " + DatabaseHelper.COLUMN_COURSE_ID + " ASC";

        Cursor cursor = db.rawQuery(query, new String[]{date});

        if (cursor.moveToFirst()) {
            do {
                schedules.add(cursorToSchedule(cursor));
            } while (cursor.moveToNext());
        }

        cursor.close();
        return schedules;
    }

    public List<Schedule> getSchedulesByTeacher(String teacher) {
        List<Schedule> schedules = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        String query = "SELECT * FROM " + DatabaseHelper.TABLE_SCHEDULES +
                " WHERE " + DatabaseHelper.COLUMN_TEACHER + " LIKE ? " +
                " ORDER BY " + DatabaseHelper.COLUMN_DATE + " ASC";

        Cursor cursor = db.rawQuery(query, new String[]{"%" + teacher + "%"});

        if (cursor.moveToFirst()) {
            do {
                schedules.add(cursorToSchedule(cursor));
            } while (cursor.moveToNext());
        }

        cursor.close();
        return schedules;
    }

    public void deleteSchedulesForCourse(int courseId) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        int rowsAffected = db.delete(DatabaseHelper.TABLE_SCHEDULES,
                DatabaseHelper.COLUMN_COURSE_ID + " = ?",
                new String[]{String.valueOf(courseId)});

        Log.d(TAG, "Deleted schedules for course " + courseId + ". Rows affected: " + rowsAffected);
    }

    public void deleteAllSchedules() {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        int rowsAffected = db.delete(DatabaseHelper.TABLE_SCHEDULES, null, null);
        Log.d(TAG, "Deleted all schedules. Rows affected: " + rowsAffected);
    }

    public int getSchedulesCount() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        Cursor cursor = db.rawQuery("SELECT COUNT(*) FROM " +
                DatabaseHelper.TABLE_SCHEDULES, null);

        int count = 0;
        if (cursor.moveToFirst()) {
            count = cursor.getInt(0);
        }

        cursor.close();
        return count;
    }

    private Schedule cursorToSchedule(Cursor cursor) {
        Schedule schedule = new Schedule();

        schedule.setId(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_ID)));
        schedule.setCourseId(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_COURSE_ID)));
        schedule.setDate(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_DATE)));
        schedule.setTeacher(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_TEACHER)));
        schedule.setComments(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_COMMENTS)));

        return schedule;
    }
}