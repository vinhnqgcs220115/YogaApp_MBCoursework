// YogaAdmin/app/src/main/java/com.universalyoga.admin.data.dao/YogaCourseDao.java
package com.universalyoga.admin.data.dao;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.universalyoga.admin.data.database.DatabaseHelper;
import com.universalyoga.admin.data.entity.YogaCourse;

import java.util.ArrayList;
import java.util.List;

public class YogaCourseDao {

    private static final String TAG = "YogaCourseDao";
    private DatabaseHelper dbHelper;

    public YogaCourseDao(DatabaseHelper dbHelper) {
        this.dbHelper = dbHelper;
    }

    public long insert(YogaCourse course) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();

        values.put(DatabaseHelper.COLUMN_DAY_OF_WEEK, course.getDayOfWeek());
        values.put(DatabaseHelper.COLUMN_TIME, course.getTime());
        values.put(DatabaseHelper.COLUMN_CAPACITY, course.getCapacity());
        values.put(DatabaseHelper.COLUMN_DURATION, course.getDuration());
        values.put(DatabaseHelper.COLUMN_PRICE, course.getPrice());
        values.put(DatabaseHelper.COLUMN_TYPE, course.getType());
        values.put(DatabaseHelper.COLUMN_DESCRIPTION, course.getDescription());

        long id = db.insert(DatabaseHelper.TABLE_YOGA_COURSES, null, values);
        Log.d(TAG, "Inserted course with ID: " + id);
        return id;
    }

    public void update(YogaCourse course) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();

        values.put(DatabaseHelper.COLUMN_DAY_OF_WEEK, course.getDayOfWeek());
        values.put(DatabaseHelper.COLUMN_TIME, course.getTime());
        values.put(DatabaseHelper.COLUMN_CAPACITY, course.getCapacity());
        values.put(DatabaseHelper.COLUMN_DURATION, course.getDuration());
        values.put(DatabaseHelper.COLUMN_PRICE, course.getPrice());
        values.put(DatabaseHelper.COLUMN_TYPE, course.getType());
        values.put(DatabaseHelper.COLUMN_DESCRIPTION, course.getDescription());

        int rowsAffected = db.update(DatabaseHelper.TABLE_YOGA_COURSES, values,
                DatabaseHelper.COLUMN_ID + " = ?",
                new String[]{String.valueOf(course.getId())});

        Log.d(TAG, "Updated course. Rows affected: " + rowsAffected);
    }

    public void delete(YogaCourse course) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        int rowsAffected = db.delete(DatabaseHelper.TABLE_YOGA_COURSES,
                DatabaseHelper.COLUMN_ID + " = ?",
                new String[]{String.valueOf(course.getId())});

        Log.d(TAG, "Deleted course. Rows affected: " + rowsAffected);
    }

    public List<YogaCourse> getAllCourses() {
        List<YogaCourse> courses = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        String query = "SELECT * FROM " + DatabaseHelper.TABLE_YOGA_COURSES +
                " ORDER BY " + DatabaseHelper.COLUMN_DAY_OF_WEEK + ", " +
                DatabaseHelper.COLUMN_TIME;

        Cursor cursor = db.rawQuery(query, null);

        if (cursor.moveToFirst()) {
            do {
                courses.add(cursorToCourse(cursor));
            } while (cursor.moveToNext());
        }

        cursor.close();
        Log.d(TAG, "Retrieved " + courses.size() + " courses");
        return courses;
    }

    public YogaCourse getCourseById(int id) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        YogaCourse course = null;

        Cursor cursor = db.query(DatabaseHelper.TABLE_YOGA_COURSES, null,
                DatabaseHelper.COLUMN_ID + " = ?",
                new String[]{String.valueOf(id)}, null, null, null);

        if (cursor.moveToFirst()) {
            course = cursorToCourse(cursor);
        }

        cursor.close();
        return course;
    }

    public List<YogaCourse> getCoursesByType(String type) {
        List<YogaCourse> courses = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        String query = "SELECT * FROM " + DatabaseHelper.TABLE_YOGA_COURSES +
                " WHERE " + DatabaseHelper.COLUMN_TYPE + " LIKE ? " +
                " ORDER BY " + DatabaseHelper.COLUMN_DAY_OF_WEEK + ", " +
                DatabaseHelper.COLUMN_TIME;

        Cursor cursor = db.rawQuery(query, new String[]{"%" + type + "%"});

        if (cursor.moveToFirst()) {
            do {
                courses.add(cursorToCourse(cursor));
            } while (cursor.moveToNext());
        }

        cursor.close();
        return courses;
    }

    public List<YogaCourse> getCoursesByDay(String dayOfWeek) {
        List<YogaCourse> courses = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        String query = "SELECT * FROM " + DatabaseHelper.TABLE_YOGA_COURSES +
                " WHERE " + DatabaseHelper.COLUMN_DAY_OF_WEEK + " = ? " +
                " ORDER BY " + DatabaseHelper.COLUMN_TIME;

        Cursor cursor = db.rawQuery(query, new String[]{dayOfWeek});

        if (cursor.moveToFirst()) {
            do {
                courses.add(cursorToCourse(cursor));
            } while (cursor.moveToNext());
        }

        cursor.close();
        return courses;
    }

    public List<YogaCourse> searchCourses(String searchQuery) {
        List<YogaCourse> courses = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        String query = "SELECT * FROM " + DatabaseHelper.TABLE_YOGA_COURSES +
                " WHERE " + DatabaseHelper.COLUMN_TYPE + " LIKE ? OR " +
                DatabaseHelper.COLUMN_DAY_OF_WEEK + " LIKE ? OR " +
                DatabaseHelper.COLUMN_DESCRIPTION + " LIKE ? " +
                " ORDER BY " + DatabaseHelper.COLUMN_DAY_OF_WEEK + ", " +
                DatabaseHelper.COLUMN_TIME;

        String searchPattern = "%" + searchQuery + "%";
        Cursor cursor = db.rawQuery(query, new String[]{searchPattern, searchPattern, searchPattern});

        if (cursor.moveToFirst()) {
            do {
                courses.add(cursorToCourse(cursor));
            } while (cursor.moveToNext());
        }

        cursor.close();
        return courses;
    }

    public List<YogaCourse> getCoursesByPriceRange(double minPrice, double maxPrice) {
        List<YogaCourse> courses = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        String query = "SELECT * FROM " + DatabaseHelper.TABLE_YOGA_COURSES +
                " WHERE " + DatabaseHelper.COLUMN_PRICE + " BETWEEN ? AND ? " +
                " ORDER BY " + DatabaseHelper.COLUMN_PRICE;

        Cursor cursor = db.rawQuery(query, new String[]{
                String.valueOf(minPrice), String.valueOf(maxPrice)});

        if (cursor.moveToFirst()) {
            do {
                courses.add(cursorToCourse(cursor));
            } while (cursor.moveToNext());
        }

        cursor.close();
        return courses;
    }

    public void deleteAllCourses() {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        int rowsAffected = db.delete(DatabaseHelper.TABLE_YOGA_COURSES, null, null);
        Log.d(TAG, "Deleted all courses. Rows affected: " + rowsAffected);
    }

    public int getCoursesCount() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        Cursor cursor = db.rawQuery("SELECT COUNT(*) FROM " +
                DatabaseHelper.TABLE_YOGA_COURSES, null);

        int count = 0;
        if (cursor.moveToFirst()) {
            count = cursor.getInt(0);
        }

        cursor.close();
        return count;
    }

    public List<String> getAllYogaTypes() {
        List<String> types = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        String query = "SELECT DISTINCT " + DatabaseHelper.COLUMN_TYPE +
                " FROM " + DatabaseHelper.TABLE_YOGA_COURSES +
                " ORDER BY " + DatabaseHelper.COLUMN_TYPE;

        Cursor cursor = db.rawQuery(query, null);

        if (cursor.moveToFirst()) {
            do {
                types.add(cursor.getString(0));
            } while (cursor.moveToNext());
        }

        cursor.close();
        return types;
    }

    public List<String> getAllDaysWithCourses() {
        List<String> days = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        String query = "SELECT DISTINCT " + DatabaseHelper.COLUMN_DAY_OF_WEEK +
                " FROM " + DatabaseHelper.TABLE_YOGA_COURSES +
                " ORDER BY " +
                "CASE " + DatabaseHelper.COLUMN_DAY_OF_WEEK + " " +
                "WHEN 'Monday' THEN 1 " +
                "WHEN 'Tuesday' THEN 2 " +
                "WHEN 'Wednesday' THEN 3 " +
                "WHEN 'Thursday' THEN 4 " +
                "WHEN 'Friday' THEN 5 " +
                "WHEN 'Saturday' THEN 6 " +
                "WHEN 'Sunday' THEN 7 " +
                "END";

        Cursor cursor = db.rawQuery(query, null);

        if (cursor.moveToFirst()) {
            do {
                days.add(cursor.getString(0));
            } while (cursor.moveToNext());
        }

        cursor.close();
        return days;
    }

    private YogaCourse cursorToCourse(Cursor cursor) {
        YogaCourse course = new YogaCourse();

        course.setId(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_ID)));
        course.setDayOfWeek(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_DAY_OF_WEEK)));
        course.setTime(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_TIME)));
        course.setCapacity(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_CAPACITY)));
        course.setDuration(cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_DURATION)));
        course.setPrice(cursor.getDouble(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_PRICE)));
        course.setType(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_TYPE)));
        course.setDescription(cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COLUMN_DESCRIPTION)));

        return course;
    }
}