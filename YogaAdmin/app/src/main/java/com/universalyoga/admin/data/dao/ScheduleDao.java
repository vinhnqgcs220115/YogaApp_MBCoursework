package com.universalyoga.admin.data.dao;

import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;

import com.universalyoga.admin.data.entity.Schedule;

import java.util.List;

@Dao
public interface ScheduleDao {

    @Insert
    long insert(Schedule schedule);

    @Update
    void update(Schedule schedule);

    @Delete
    void delete(Schedule schedule);

    @Query("SELECT * FROM schedules WHERE courseId = :courseId ORDER BY date ASC")
    List<Schedule> getSchedulesForCourse(int courseId);

    @Query("SELECT * FROM schedules WHERE id = :id")
    Schedule getScheduleById(int id);

    @Query("SELECT * FROM schedules ORDER BY date ASC")
    List<Schedule> getAllSchedules();

    @Query("SELECT * FROM schedules WHERE date = :date ORDER BY courseId ASC")
    List<Schedule> getSchedulesForDate(String date);

    @Query("SELECT * FROM schedules WHERE teacher LIKE '%' || :teacher || '%' ORDER BY date ASC")
    List<Schedule> getSchedulesByTeacher(String teacher);

    @Query("DELETE FROM schedules WHERE courseId = :courseId")
    void deleteSchedulesForCourse(int courseId);

    @Query("DELETE FROM schedules")
    void deleteAllSchedules();

    @Query("SELECT COUNT(*) FROM schedules")
    int getSchedulesCount();
}