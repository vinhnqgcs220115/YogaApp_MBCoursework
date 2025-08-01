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
import com.universalyoga.admin.data.dao.YogaCourseDao;
import com.universalyoga.admin.data.dao.ScheduleDao;
import com.universalyoga.admin.data.entity.YogaCourse;
import com.universalyoga.admin.data.entity.Schedule;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class CourseDetailActivity extends AppCompatActivity {

    private TextView tvCourseType, tvDayTime, tvCapacity, tvDuration, tvPrice, tvDescription;
    private TextView tvScheduleCount, tvNoSchedules;
    private MaterialButton btnEditCourse, btnViewSchedules, btnGenerateQR;
    private MaterialCardView cardScheduleInfo;

    private YogaCourseDao courseDao;
    private ScheduleDao scheduleDao;
    private ExecutorService executor;

    private int courseId;
    private YogaCourse course;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_course_detail);

        courseId = getIntent().getIntExtra("course_id", -1);
        if (courseId == -1) {
            Toast.makeText(this, "Invalid course ID", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        initViews();
        initDatabase();
        loadCourseDetails();
        setupClickListeners();

        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
    }

    private void initViews() {
        tvCourseType = findViewById(R.id.tvCourseType);
        tvDayTime = findViewById(R.id.tvDayTime);
        tvCapacity = findViewById(R.id.tvCapacity);
        tvDuration = findViewById(R.id.tvDuration);
        tvPrice = findViewById(R.id.tvPrice);
        tvDescription = findViewById(R.id.tvDescription);
        tvScheduleCount = findViewById(R.id.tvScheduleCount);
        tvNoSchedules = findViewById(R.id.tvNoSchedules);

        btnEditCourse = findViewById(R.id.btnEditCourse);
        btnViewSchedules = findViewById(R.id.btnViewSchedules);
        btnGenerateQR = findViewById(R.id.btnGenerateQR);

        cardScheduleInfo = findViewById(R.id.cardScheduleInfo);
    }

    private void initDatabase() {
        AppDatabase database = AppDatabase.getInstance(this);
        courseDao = database.yogaCourseDao();
        scheduleDao = database.scheduleDao();
        executor = Executors.newSingleThreadExecutor();
    }

    private void loadCourseDetails() {
        executor.execute(() -> {
            course = courseDao.getCourseById(courseId);
            List<Schedule> schedules = scheduleDao.getSchedulesForCourse(courseId);

            runOnUiThread(() -> {
                if (course != null) {
                    populateCourseDetails();
                    updateScheduleInfo(schedules);
                } else {
                    Toast.makeText(this, "Course not found", Toast.LENGTH_SHORT).show();
                    finish();
                }
            });
        });
    }

    private void populateCourseDetails() {
        setTitle(course.getType());

        tvCourseType.setText(course.getType());
        tvDayTime.setText(course.getDayOfWeek() + " at " + course.getTime());
        tvCapacity.setText("Capacity: " + course.getCapacity() + " persons");
        tvDuration.setText("Duration: " + course.getDuration() + " minutes");
        tvPrice.setText("Price: £" + String.format("%.2f", course.getPrice()));

        if (course.getDescription() != null && !course.getDescription().trim().isEmpty()) {
            tvDescription.setText(course.getDescription());
        } else {
            tvDescription.setText("No description available");
        }
    }

    private void updateScheduleInfo(List<Schedule> schedules) {
        if (schedules != null && !schedules.isEmpty()) {
            tvScheduleCount.setText(schedules.size() + " class instance(s) scheduled");
            tvNoSchedules.setVisibility(TextView.GONE);
            cardScheduleInfo.setVisibility(MaterialCardView.VISIBLE);
        } else {
            tvNoSchedules.setVisibility(TextView.VISIBLE);
            cardScheduleInfo.setVisibility(MaterialCardView.GONE);
        }
    }

    private void setupClickListeners() {
        btnEditCourse.setOnClickListener(v -> {
            Intent intent = new Intent(this, AddEditCourseActivity.class);
            intent.putExtra("course_id", courseId);
            startActivity(intent);
        });

        btnViewSchedules.setOnClickListener(v -> {
            Intent intent = new Intent(this, ScheduleActivity.class);
            intent.putExtra("course_id", courseId); // Pass course ID to filter schedules
            startActivity(intent);
        });

        btnGenerateQR.setOnClickListener(v -> generateQRCode());
    }

    private void generateQRCode() {
        if (course != null) {
            // QR Code content with course details
            String qrContent = String.format(
                    "Universal Yoga Course\n" +
                            "Type: %s\n" +
                            "Day: %s\n" +
                            "Time: %s\n" +
                            "Price: £%.2f\n" +
                            "Duration: %d min\n" +
                            "Capacity: %d",
                    course.getType(),
                    course.getDayOfWeek(),
                    course.getTime(),
                    course.getPrice(),
                    course.getDuration(),
                    course.getCapacity()
            );

            // [Inference] This would typically use a QR code library like ZXing
            Intent intent = new Intent(this, QRCodeActivity.class);
            intent.putExtra("qr_content", qrContent);
            intent.putExtra("title", course.getType() + " - QR Code");
            startActivity(intent);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadCourseDetails(); // Refresh data when returning from other activities
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.course_detail_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();

        if (id == android.R.id.home) {
            finish();
            return true;
        } else if (id == R.id.action_delete_course) {
            showDeleteConfirmation();
            return true;
        } else if (id == R.id.action_share_course) {
            shareCourse();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    private void showDeleteConfirmation() {
        if (course == null) return;

        new AlertDialog.Builder(this)
                .setTitle("Delete Course")
                .setMessage("Are you sure you want to delete this course: " + course.getType() +
                        "?\n\nThis will also delete all associated schedules.")
                .setPositiveButton("Delete", (dialog, which) -> deleteCourse())
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void deleteCourse() {
        executor.execute(() -> {
            courseDao.delete(course);
            runOnUiThread(() -> {
                Toast.makeText(this, "Course deleted successfully", Toast.LENGTH_SHORT).show();
                finish();
            });
        });
    }

    private void shareCourse() {
        if (course == null) return;

        String shareText = String.format(
                "Check out this yoga course at Universal Yoga!\n\n" +
                        "🧘‍♀️ %s\n" +
                        "📅 %s at %s\n" +
                        "💰 £%.2f\n" +
                        "⏰ %d minutes\n" +
                        "👥 Max %d people\n\n" +
                        "%s",
                course.getType(),
                course.getDayOfWeek(),
                course.getTime(),
                course.getPrice(),
                course.getDuration(),
                course.getCapacity(),
                course.getDescription() != null ? course.getDescription() : "Join us for this amazing yoga experience!"
        );

        Intent shareIntent = new Intent(Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_TEXT, shareText);
        shareIntent.putExtra(Intent.EXTRA_SUBJECT, "Universal Yoga - " + course.getType());

        startActivity(Intent.createChooser(shareIntent, "Share Course"));
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (executor != null && !executor.isShutdown()) {
            executor.shutdown();
        }
    }
}