package com.universalyoga.admin.data.dao;

import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;

import com.universalyoga.admin.data.entity.YogaCourse;

import java.util.List;

@Dao
public interface YogaCourseDao {

    @Insert
    long insert(YogaCourse course);

    @Update
    void update(YogaCourse course);

    @Delete
    void delete(YogaCourse course);

    @Query("SELECT * FROM yoga_courses ORDER BY dayOfWeek, time")
    List<YogaCourse> getAllCourses();

    @Query("SELECT * FROM yoga_courses WHERE id = :id")
    YogaCourse getCourseById(int id);

    @Query("SELECT * FROM yoga_courses WHERE type LIKE '%' || :type || '%' ORDER BY dayOfWeek, time")
    List<YogaCourse> getCoursesByType(String type);

    @Query("SELECT * FROM yoga_courses WHERE dayOfWeek = :dayOfWeek ORDER BY time")
    List<YogaCourse> getCoursesByDay(String dayOfWeek);

    @Query("SELECT * FROM yoga_courses WHERE " +
            "type LIKE '%' || :searchQuery || '%' OR " +
            "dayOfWeek LIKE '%' || :searchQuery || '%' OR " +
            "description LIKE '%' || :searchQuery || '%' " +
            "ORDER BY dayOfWeek, time")
    List<YogaCourse> searchCourses(String searchQuery);

    @Query("SELECT * FROM yoga_courses WHERE price BETWEEN :minPrice AND :maxPrice ORDER BY price")
    List<YogaCourse> getCoursesByPriceRange(double minPrice, double maxPrice);

    @Query("DELETE FROM yoga_courses")
    void deleteAllCourses();

    @Query("SELECT COUNT(*) FROM yoga_courses")
    int getCoursesCount();

    @Query("SELECT DISTINCT type FROM yoga_courses ORDER BY type")
    List<String> getAllYogaTypes();

    @Query("SELECT DISTINCT dayOfWeek FROM yoga_courses ORDER BY " +
            "CASE dayOfWeek " +
            "WHEN 'Monday' THEN 1 " +
            "WHEN 'Tuesday' THEN 2 " +
            "WHEN 'Wednesday' THEN 3 " +
            "WHEN 'Thursday' THEN 4 " +
            "WHEN 'Friday' THEN 5 " +
            "WHEN 'Saturday' THEN 6 " +
            "WHEN 'Sunday' THEN 7 " +
            "END")
    List<String> getAllDaysWithCourses();
}