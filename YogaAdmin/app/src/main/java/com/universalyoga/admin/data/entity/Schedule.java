// YogaAdmin/app/src/main/java/com.universalyoga.admin.data.entity/Schedule.java
package com.universalyoga.admin.data.entity;

public class Schedule {

    private int id;
    private int courseId;
    private String date;        // ISO format yyyy-MM-dd
    private String teacher;
    private String comments;

    // Default constructor
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