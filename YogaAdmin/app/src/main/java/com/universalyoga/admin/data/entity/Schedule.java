package com.universalyoga.admin.data.entity;

import androidx.room.Entity;
import androidx.room.ForeignKey;
import androidx.room.Index;
import androidx.room.PrimaryKey;

@Entity(
        tableName = "schedules",
        foreignKeys = @ForeignKey(
                entity = YogaCourse.class,
                parentColumns = "id",
                childColumns = "courseId",
                onDelete = ForeignKey.CASCADE
        ),
        indices = {@Index("courseId")}
)
public class Schedule {

    @PrimaryKey(autoGenerate = true)
    private int id;

    private int courseId;
    private String date;        // ISO format yyyy-MM-dd
    private String teacher;
    private String comments;

    // Default constructor (required by Room)
    public Schedule() {}

    // Constructor
    public Schedule(int courseId, String date, String teacher, String comments) {
        this.courseId = courseId;
        this.date = date;
        this.teacher = teacher;
        this.comments = comments;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getCourseId() {
        return courseId;
    }

    public void setCourseId(int courseId) {
        this.courseId = courseId;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTeacher() {
        return teacher;
    }

    public void setTeacher(String teacher) {
        this.teacher = teacher;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    @Override
    public String toString() {
        return "Schedule{" +
                "id=" + id +
                ", courseId=" + courseId +
                ", date='" + date + '\'' +
                ", teacher='" + teacher + '\'' +
                ", comments='" + comments + '\'' +
                '}';
    }
}