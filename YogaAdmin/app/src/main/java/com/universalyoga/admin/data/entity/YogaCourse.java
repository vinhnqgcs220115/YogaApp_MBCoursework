package com.universalyoga.admin.data.entity;

public class YogaCourse {

    private int id;
    private String dayOfWeek;    // Required: Monday, Tuesday, etc.
    private String time;         // Required: 10:00, 11:00, etc.
    private int capacity;        // Required: number of persons
    private int duration;        // Required: duration in minutes
    private double price;        // Required: price per class
    private String type;         // Required: Flow Yoga, Aerial Yoga, etc.
    private String description;  // Optional: additional description

    // Default constructor
    public YogaCourse() {}

    // Constructor with required fields
    public YogaCourse(String dayOfWeek, String time, int capacity, int duration,
                      double price, String type, String description) {
        this.dayOfWeek = dayOfWeek;
        this.time = time;
        this.capacity = capacity;
        this.duration = duration;
        this.price = price;
        this.type = type;
        this.description = description;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "YogaCourse{" +
                "id=" + id +
                ", dayOfWeek='" + dayOfWeek + '\'' +
                ", time='" + time + '\'' +
                ", capacity=" + capacity +
                ", duration=" + duration +
                ", price=" + price +
                ", type='" + type + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}