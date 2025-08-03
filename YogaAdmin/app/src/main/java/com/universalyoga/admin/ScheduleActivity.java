package com.universalyoga.admin;

import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.SearchView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.universalyoga.admin.adapter.ScheduleAdapter;
import com.universalyoga.admin.data.database.AppDatabase;
import com.universalyoga.admin.data.dao.ScheduleDao;
import com.universalyoga.admin.data.dao.YogaCourseDao;
import com.universalyoga.admin.data.entity.Schedule;
import com.universalyoga.admin.data.entity.YogaCourse;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ScheduleActivity extends AppCompatActivity implements ScheduleAdapter.OnScheduleClickListener {

    private RecyclerView recyclerSchedules;
    private ConstraintLayout tvEmptyState;
    private TextView emptyStateTitle;
    private FloatingActionButton fabAddSchedule;
    private SwipeRefreshLayout swipeRefreshLayout;
    private Spinner spinnerCourseFilter;
    private SearchView searchView;

    private ScheduleAdapter adapter;
    private ScheduleDao scheduleDao;
    private YogaCourseDao courseDao;
    private ExecutorService executor;

    private List<YogaCourse> allCourses = new ArrayList<>();
    private int selectedCourseId = -1; // -1 means show all courses

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_schedule);

        setTitle("Manage Class Schedules");
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        initViews();
        initDatabase();
        setupRecyclerView();
        setupClickListeners();
        setupSwipeRefresh();
        loadCourses();
        loadSchedules();
    }

    private void initViews() {
        recyclerSchedules = findViewById(R.id.recyclerSchedules);
        tvEmptyState = findViewById(R.id.tvEmptyState);
        emptyStateTitle = findViewById(R.id.emptyStateTitle);
        fabAddSchedule = findViewById(R.id.fabAddSchedule);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);
        spinnerCourseFilter = findViewById(R.id.spinnerCourseFilter);
        searchView = findViewById(R.id.searchView);
    }

    private void initDatabase() {
        AppDatabase database = AppDatabase.getInstance(this);
        scheduleDao = database.scheduleDao();
        courseDao = database.yogaCourseDao();
        executor = Executors.newSingleThreadExecutor();
    }

    private void setupRecyclerView() {
        recyclerSchedules.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ScheduleAdapter(this, this);
        recyclerSchedules.setAdapter(adapter);
    }

    private void setupClickListeners() {
        fabAddSchedule.setOnClickListener(v -> {
            if (allCourses.isEmpty()) {
                Toast.makeText(this, "Please create yoga courses first", Toast.LENGTH_LONG).show();
                return;
            }
            Intent intent = new Intent(ScheduleActivity.this, AddEditScheduleActivity.class);
            startActivity(intent);
        });

        // Course filter spinner
        spinnerCourseFilter.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (position == 0) {
                    selectedCourseId = -1; // Show all
                } else {
                    YogaCourse selectedCourse = allCourses.get(position - 1);
                    selectedCourseId = selectedCourse.getId();
                }
                loadSchedules();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });

        // Search functionality
        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                searchSchedules(query);
                return true;
            }

            @Override
            public boolean onQueryTextChange(String newText) {
                if (newText.trim().isEmpty()) {
                    loadSchedules();
                } else {
                    searchSchedules(newText);
                }
                return true;
            }
        });
    }

    private void setupSwipeRefresh() {
        swipeRefreshLayout.setOnRefreshListener(() -> {
            loadCourses();
            loadSchedules();
        });
        swipeRefreshLayout.setColorSchemeResources(
                android.R.color.holo_blue_bright,
                android.R.color.holo_green_light,
                android.R.color.holo_orange_light,
                android.R.color.holo_red_light
        );
    }

    private void loadCourses() {
        executor.execute(() -> {
            List<YogaCourse> courses = courseDao.getAllCourses();
            runOnUiThread(() -> {
                allCourses.clear();
                if (courses != null) {
                    allCourses.addAll(courses);
                }
                setupCourseFilterSpinner();
            });
        });
    }

    private void setupCourseFilterSpinner() {
        List<String> courseNames = new ArrayList<>();
        courseNames.add("All Courses"); // First option to show all

        for (YogaCourse course : allCourses) {
            courseNames.add(course.getType() + " - " + course.getDayOfWeek() + " " + course.getTime());
        }

        ArrayAdapter<String> adapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_item, courseNames);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerCourseFilter.setAdapter(adapter);
    }

    private void loadSchedules() {
        swipeRefreshLayout.setRefreshing(true);

        executor.execute(() -> {
            List<Schedule> schedules;

            if (selectedCourseId == -1) {
                schedules = scheduleDao.getAllSchedules();
            } else {
                schedules = scheduleDao.getSchedulesForCourse(selectedCourseId);
            }

            runOnUiThread(() -> {
                updateUI(schedules);
                swipeRefreshLayout.setRefreshing(false);
            });
        });
    }

    private void searchSchedules(String query) {
        swipeRefreshLayout.setRefreshing(true);

        executor.execute(() -> {
            List<Schedule> schedules = scheduleDao.getSchedulesByTeacher(query.trim());
            runOnUiThread(() -> {
                updateUI(schedules);
                swipeRefreshLayout.setRefreshing(false);
            });
        });
    }

    private void updateUI(List<Schedule> schedules) {
        if (schedules != null && !schedules.isEmpty()) {
            adapter.setSchedules(schedules, allCourses);
            recyclerSchedules.setVisibility(View.VISIBLE);
            tvEmptyState.setVisibility(View.GONE);
        } else {
            recyclerSchedules.setVisibility(View.GONE);
            tvEmptyState.setVisibility(View.VISIBLE);

            String emptyMessage = selectedCourseId == -1 ?
                    "No schedules found" :
                    "No schedules found for selected course";
            emptyStateTitle.setText(emptyMessage);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadCourses();
        loadSchedules();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.schedule_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();

        if (id == android.R.id.home) {
            finish();
            return true;
        } else if (id == R.id.action_clear_all_schedules) {
            showClearAllSchedulesDialog();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    private void showClearAllSchedulesDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Clear All Schedules")
                .setMessage("Are you sure you want to delete all schedules? This action cannot be undone.")
                .setPositiveButton("Yes, Clear All", (dialog, which) -> clearAllSchedules())
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void clearAllSchedules() {
        executor.execute(() -> {
            scheduleDao.deleteAllSchedules();
            runOnUiThread(() -> {
                Toast.makeText(this, "All schedules cleared", Toast.LENGTH_SHORT).show();
                loadSchedules();
            });
        });
    }

    // ScheduleAdapter.OnScheduleClickListener implementation
    @Override
    public void onScheduleClick(Schedule schedule) {
        Intent intent = new Intent(this, ScheduleDetailActivity.class);
        intent.putExtra("schedule_id", schedule.getId());
        startActivity(intent);
    }

    @Override
    public void onScheduleEdit(Schedule schedule) {
        Intent intent = new Intent(this, AddEditScheduleActivity.class);
        intent.putExtra("schedule_id", schedule.getId());
        startActivity(intent);
    }

    @Override
    public void onScheduleDelete(Schedule schedule) {
        // Find course name for better user experience
        String courseName = "Unknown Course";
        for (YogaCourse course : allCourses) {
            if (course.getId() == schedule.getCourseId()) {
                courseName = course.getType() + " - " + course.getDayOfWeek();
                break;
            }
        }

        new AlertDialog.Builder(this)
                .setTitle("Delete Schedule")
                .setMessage("Are you sure you want to delete this schedule?\n\n" +
                        "Course: " + courseName + "\n" +
                        "Date: " + schedule.getDate() + "\n" +
                        "Teacher: " + schedule.getTeacher())
                .setPositiveButton("Delete", (dialog, which) -> deleteSchedule(schedule))
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void deleteSchedule(Schedule schedule) {
        executor.execute(() -> {
            scheduleDao.delete(schedule);
            runOnUiThread(() -> {
                Toast.makeText(this, "Schedule deleted successfully", Toast.LENGTH_SHORT).show();
                loadSchedules();
            });
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (executor != null && !executor.isShutdown()) {
            executor.shutdown();
        }
    }
}