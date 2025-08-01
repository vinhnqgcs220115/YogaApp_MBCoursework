package com.universalyoga.admin;

import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.card.MaterialCardView;
import com.universalyoga.admin.data.database.AppDatabase;
import com.universalyoga.admin.data.dao.ScheduleDao;
import com.universalyoga.admin.data.dao.YogaCourseDao;
import com.universalyoga.admin.data.entity.Schedule;
import com.universalyoga.admin.data.entity.YogaCourse;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ScheduleDetailActivity extends AppCompatActivity {

    private TextView tvScheduleTitle, tvCourseInfo, tvScheduleDate, tvTeacher, tvComments;
    private TextView tvCourseDetails, tvNoComments;
    private MaterialButton btnEditSchedule, btnViewCourse;
    private MaterialCardView cardCourseInfo, cardComments;

    private ScheduleDao scheduleDao;
    private YogaCourseDao courseDao;
    private ExecutorService executor;

    private int scheduleId;
    private Schedule schedule;
    private YogaCourse course;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_schedule_detail);

        scheduleId = getIntent().getIntExtra("schedule_id", -1);
        if (scheduleId == -1) {
            Toast.makeText(this, "Invalid schedule ID", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        initViews();
        initDatabase();
        loadScheduleDetails();
        setupClickListeners();

        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
    }

    private void initViews() {
        tvScheduleTitle = findViewById(R.id.tvScheduleTitle);
        tvCourseInfo = findViewById(R.id.tvCourseInfo);
        tvScheduleDate = findViewById(R.id.tvScheduleDate);
        tvTeacher = findViewById(R.id.tvTeacher);
        tvComments = findViewById(R.id.tvComments);
        tvCourseDetails = findViewById(R.id.tvCourseDetails);
        tvNoComments = findViewById(R.id.tvNoComments);

        btnEditSchedule = findViewById(R.id.btnEditSchedule);
        btnViewCourse = findViewById(R.id.btnViewCourse);

        cardCourseInfo = findViewById(R.id.cardCourseInfo);
        cardComments = findViewById(R.id.cardComments);
    }

    private void initDatabase() {
        AppDatabase database = AppDatabase.getInstance(this);
        scheduleDao = database.scheduleDao();
        courseDao = database.yogaCourseDao();
        executor = Executors.newSingleThreadExecutor();
    }

    private void loadScheduleDetails() {
        executor.execute(() -> {
            schedule = scheduleDao.getScheduleById(scheduleId);
            if (schedule != null) {
                course = courseDao.getCourseById(schedule.getCourseId());
            }

            runOnUiThread(() -> {
                if (schedule != null) {
                    populateScheduleDetails();
                } else {
                    Toast.makeText(this, "Schedule not found", Toast.LENGTH_SHORT).show();
                    finish();
                }
            });
        });
    }

    private void populateScheduleDetails() {
        // Set title based on course type or generic title
        String title = course != null ? course.getType() + " Class" : "Class Schedule";
        setTitle(title);
        tvScheduleTitle.setText(title);

        // Format and display date
        String formattedDate = formatScheduleDate(schedule.getDate());
        tvScheduleDate.setText(formattedDate);

        // Display teacher
        tvTeacher.setText("Instructor: " + schedule.getTeacher());

        // Display course information
        if (course != null) {
            String courseInfo = String.format("%s\n%s at %s",
                    course.getType(),
                    course.getDayOfWeek(),
                    course.getTime()
            );
            tvCourseInfo.setText(courseInfo);

            String courseDetails = String.format(
                    "Duration: %d minutes\nCapacity: %d persons\nPrice: £%.2f",
                    course.getDuration(),
                    course.getCapacity(),
                    course.getPrice()
            );
            tvCourseDetails.setText(courseDetails);

            cardCourseInfo.setVisibility(MaterialCardView.VISIBLE);
        } else {
            tvCourseInfo.setText("Course information not available");
            cardCourseInfo.setVisibility(MaterialCardView.GONE);
        }

        // Display comments
        if (schedule.getComments() != null && !schedule.getComments().trim().isEmpty()) {
            tvComments.setText(schedule.getComments());
            cardComments.setVisibility(MaterialCardView.VISIBLE);
            tvNoComments.setVisibility(TextView.GONE);
        } else {
            cardComments.setVisibility(MaterialCardView.GONE);
            tvNoComments.setVisibility(TextView.VISIBLE);
        }
    }

    private String formatScheduleDate(String dateString) {
        try {
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            SimpleDateFormat outputFormat = new SimpleDateFormat("EEEE, MMMM dd, yyyy", Locale.getDefault());
            Date date = inputFormat.parse(dateString);

            // Add day suffix (1st, 2nd, 3rd, etc.)
            SimpleDateFormat dayFormat = new SimpleDateFormat("d", Locale.getDefault());
            int day = Integer.parseInt(dayFormat.format(date));
            String suffix = getDayOfMonthSuffix(day);

            SimpleDateFormat finalFormat = new SimpleDateFormat("EEEE, MMMM d'" + suffix + "', yyyy", Locale.getDefault());
            return finalFormat.format(date);
        } catch (ParseException e) {
            return dateString; // Return original if parsing fails
        }
    }

    private String getDayOfMonthSuffix(int day) {
        if (day >= 11 && day <= 13) {
            return "th";
        }
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    }

    private void setupClickListeners() {
        btnEditSchedule.setOnClickListener(v -> {
            Intent intent = new Intent(this, AddEditScheduleActivity.class);
            intent.putExtra("schedule_id", scheduleId);
            startActivity(intent);
        });

        btnViewCourse.setOnClickListener(v -> {
            if (course != null) {
                Intent intent = new Intent(this, CourseDetailActivity.class);
                intent.putExtra("course_id", course.getId());
                startActivity(intent);
            } else {
                Toast.makeText(this, "Course information not available", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadScheduleDetails(); // Refresh data when returning from other activities
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.schedule_detail_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();

        if (id == android.R.id.home) {
            finish();
            return true;
        } else if (id == R.id.action_delete_schedule) {
            showDeleteConfirmation();
            return true;
        } else if (id == R.id.action_share_schedule) {
            shareSchedule();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    private void showDeleteConfirmation() {
        if (schedule == null) return;

        String courseName = course != null ? course.getType() : "Unknown Course";

        new AlertDialog.Builder(this)
                .setTitle("Delete Schedule")
                .setMessage("Are you sure you want to delete this class schedule?\n\n" +
                        "Course: " + courseName + "\n" +
                        "Date: " + formatScheduleDate(schedule.getDate()) + "\n" +
                        "Teacher: " + schedule.getTeacher())
                .setPositiveButton("Delete", (dialog, which) -> deleteSchedule())
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void deleteSchedule() {
        executor.execute(() -> {
            scheduleDao.delete(schedule);
            runOnUiThread(() -> {
                Toast.makeText(this, "Schedule deleted successfully", Toast.LENGTH_SHORT).show();
                finish();
            });
        });
    }

    private void shareSchedule() {
        if (schedule == null) return;

        String courseName = course != null ? course.getType() : "Yoga Class";
        String courseDetails = course != null ?
                String.format(" (£%.2f, %d min)", course.getPrice(), course.getDuration()) : "";

        String shareText = String.format(
                "Yoga Class Schedule 🧘‍♀️\n\n" +
                        "Class: %s%s\n" +
                        "Date: %s\n" +
                        "Instructor: %s\n\n" +
                        "%s\n\n" +
                        "Join us at Universal Yoga!",
                courseName,
                courseDetails,
                formatScheduleDate(schedule.getDate()),
                schedule.getTeacher(),
                schedule.getComments() != null && !schedule.getComments().trim().isEmpty()
                        ? schedule.getComments()
                        : "Don't miss this amazing yoga session!"
        );

        Intent shareIntent = new Intent(Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_TEXT, shareText);
        shareIntent.putExtra(Intent.EXTRA_SUBJECT, "Universal Yoga - " + courseName);

        startActivity(Intent.createChooser(shareIntent, "Share Schedule"));
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (executor != null && !executor.isShutdown()) {
            executor.shutdown();
        }
    }
}